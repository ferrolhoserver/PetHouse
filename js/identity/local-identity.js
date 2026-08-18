/*
 * PetHouse V2 — Identidade local e sessão de cofre
 *
 * Mantém a chave do cofre apenas em memória enquanto o perfil está desbloqueado.
 * Senhas, códigos de recuperação e conteúdo clínico jamais são gravados em texto.
 */
(function () {
    'use strict';

    const SESSION_TIMEOUT_MS = 10 * 60 * 1000;
    let activeSession = null;
    let lockTimer = null;
    const listeners = new Set();

    function emptyVault(displayName) {
        return {
            schemaVersion: 2,
            casaNome: displayName ? `Casa ${displayName}` : '',
            pets: [],
            membros: [],
            meta: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'secure-v2'
            }
        };
    }

    function clone(value) {
        return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
    }

    function emit(type, detail = {}) {
        const event = { type, profileId: activeSession?.profileId || detail.profileId || null, ...detail };
        listeners.forEach(listener => {
            try { listener(event); } catch (error) { console.error('Erro em observador de identidade:', error); }
        });
    }

    function clearLockTimer() {
        if (lockTimer) window.clearTimeout(lockTimer);
        lockTimer = null;
    }

    function scheduleLock() {
        clearLockTimer();
        if (!activeSession) return;
        lockTimer = window.setTimeout(() => lock('inactivity'), SESSION_TIMEOUT_MS);
    }

    function assertUnlocked() {
        if (!activeSession) throw new Error('O perfil está bloqueado. Desbloqueie-o para continuar.');
    }

    async function createProfile({ displayName, password, confirmation, initialVault, migration }) {
        const validation = window.PetHouseCrypto.validatePassword(password, confirmation);
        if (!validation.valid) throw new Error(validation.issues.join(' '));
        const normalizedName = String(displayName || '').trim();
        if (normalizedName.length < 2) throw new Error('Informe um nome de perfil com pelo menos 2 caracteres.');

        const profileId = window.PetHouseCrypto.createId('profile');
        const passwordSalt = window.PetHouseCrypto.randomBytes(window.PetHouseCrypto.SALT_BYTES);
        const dataKey = window.PetHouseCrypto.randomBytes(window.PetHouseCrypto.DATA_KEY_BYTES);
        const wrappedDataKey = await window.PetHouseCrypto.wrapDataKey(dataKey, password, passwordSalt, profileId);
        const recovery = await window.PetHouseCrypto.generateRecoveryKit(dataKey, profileId);
        const vaultData = clone(initialVault || emptyVault(normalizedName));
        vaultData.meta = { ...(vaultData.meta || {}), updatedAt: new Date().toISOString(), source: migration ? 'legacy-migration' : 'secure-v2' };
        const vaultEnvelope = await window.PetHouseCrypto.encryptJson(dataKey, profileId, vaultData);

        const profile = {
            profileId,
            displayName: normalizedName,
            passwordSalt: window.PetHouseCrypto.bytesToBase64Url(passwordSalt),
            passwordIterations: window.PetHouseCrypto.ITERATIONS,
            wrappedDataKey,
            recoveryEnvelope: recovery.envelope,
            recoveryChecksum: recovery.checksum,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastUnlockedAt: null,
            remote: { status: 'not-linked', userId: null, emailMasked: null, mfaRequired: true },
            migration: migration || null,
            schemaVersion: 2
        };

        await window.PetHouseSecureStore.saveProfile(profile);
        await window.PetHouseSecureStore.saveVault(profileId, vaultEnvelope, { sourceChecksum: migration?.sourceChecksum || null });
        await window.PetHouseSecureStore.appendAudit({ profileId, type: 'profile_created', severity: 'info' });
        return { profile: sanitizeProfile(profile), recoveryCode: recovery.code };
    }

    function sanitizeProfile(profile) {
        if (!profile) return null;
        const { passwordSalt, wrappedDataKey, recoveryEnvelope, ...safe } = profile;
        return safe;
    }

    function deviceFactorSupported() {
        return Boolean(window.PublicKeyCredential && navigator.credentials?.create && navigator.credentials?.get);
    }

    function deviceFactorUserId(profileId) {
        return new TextEncoder().encode(`pethouse:${profileId}`).slice(0, 64);
    }

    async function enableDeviceFactor() {
        assertUnlocked();
        if (!deviceFactorSupported()) throw new Error('Este navegador não oferece confirmação biométrica ou de código do dispositivo.');
        const profile = activeSession.profile;
        let credential;
        try {
            credential = await navigator.credentials.create({
                publicKey: {
                    challenge: window.PetHouseCrypto.randomBytes(32),
                    // Sem rp.id explícito: o navegador vincula a credencial ao domínio seguro atual (produção ou app instalado).
                    rp: { name: 'PetHouse' },
                    user: {
                        id: deviceFactorUserId(profile.profileId),
                        name: `pethouse-${profile.profileId.slice(-12)}`,
                        displayName: profile.displayName
                    },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
                    authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'preferred', userVerification: 'required' },
                    timeout: 60000,
                    attestation: 'none'
                }
            });
        } catch (error) {
            if (error?.name === 'NotAllowedError') throw new Error('A confirmação do dispositivo foi cancelada ou expirou.');
            if (error?.name === 'SecurityError' || /invalid domain/i.test(error?.message || '')) {
                throw new Error('A confirmação do dispositivo precisa ser ativada no aplicativo publicado com HTTPS ou no app instalado.');
            }
            throw new Error('Não foi possível configurar a confirmação deste dispositivo.');
        }
        if (!credential?.rawId) throw new Error('A confirmação por dispositivo foi cancelada ou não foi concluída.');
        profile.localMfa = {
            credentialId: window.PetHouseCrypto.bytesToBase64Url(new Uint8Array(credential.rawId)),
            enrolledAt: new Date().toISOString(),
            label: 'Este dispositivo'
        };
        await window.PetHouseSecureStore.saveProfile(profile);
        await window.PetHouseSecureStore.appendAudit({ profileId: profile.profileId, type: 'device_factor_enabled', severity: 'warning' });
        emit('device_factor_enabled');
        return sanitizeProfile(profile);
    }

    async function verifyDeviceFactor(profile) {
        if (!profile?.localMfa?.credentialId) return { required: false, verified: true };
        if (!deviceFactorSupported()) throw new Error('Este perfil exige a confirmação do dispositivo configurado anteriormente.');
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: window.PetHouseCrypto.randomBytes(32),
                allowCredentials: [{ type: 'public-key', id: window.PetHouseCrypto.base64UrlToBytes(profile.localMfa.credentialId), transports: ['internal'] }],
                userVerification: 'required',
                timeout: 60000
            }
        });
        if (!assertion) throw new Error('A confirmação do dispositivo não foi concluída.');
        return { required: true, verified: true };
    }

    async function disableDeviceFactor() {
        assertUnlocked();
        const profile = activeSession.profile;
        if (!profile.localMfa) return sanitizeProfile(profile);
        delete profile.localMfa;
        await window.PetHouseSecureStore.saveProfile(profile);
        await window.PetHouseSecureStore.appendAudit({ profileId: profile.profileId, type: 'device_factor_disabled', severity: 'warning' });
        emit('device_factor_disabled');
        return sanitizeProfile(profile);
    }

    async function unlock(profileId, password) {
        const profile = await window.PetHouseSecureStore.getProfile(profileId);
        if (!profile) throw new Error('Perfil não encontrado neste dispositivo.');
        const vault = await window.PetHouseSecureStore.getVault(profileId);
        if (!vault) throw new Error('Cofre do perfil não encontrado.');
        const salt = window.PetHouseCrypto.base64UrlToBytes(profile.passwordSalt);
        let dataKey;
        try {
            dataKey = await window.PetHouseCrypto.unwrapDataKey(profile.wrappedDataKey, password, salt, profileId, profile.passwordIterations);
        } catch (_) {
            throw new Error('Senha incorreta ou cofre indisponível.');
        }
        try {
            await verifyDeviceFactor(profile);
        } catch (_) {
            dataKey.fill(0);
            throw new Error('A senha foi aceita, mas a confirmação do dispositivo não foi concluída.');
        }
        let data;
        try {
            data = await window.PetHouseCrypto.decryptJson(dataKey, profileId, vault.envelope);
        } catch (_) {
            throw new Error('Não foi possível abrir o cofre. Verifique a senha e a integridade dos dados.');
        }
        activeSession = { profileId, profile, dataKey, data, unlockedAt: Date.now(), lastActivityAt: Date.now() };
        profile.lastUnlockedAt = new Date().toISOString();
        await window.PetHouseSecureStore.saveProfile(profile);
        await window.PetHouseSecureStore.appendAudit({ profileId, type: 'profile_unlocked', severity: 'info' });
        scheduleLock();
        emit('unlocked', { profile: sanitizeProfile(profile) });
        return { profile: sanitizeProfile(profile), data: clone(data) };
    }

    async function saveVault(data) {
        assertUnlocked();
        const next = clone(data);
        next.meta = { ...(next.meta || {}), updatedAt: new Date().toISOString(), schemaVersion: 2 };
        const envelope = await window.PetHouseCrypto.encryptJson(activeSession.dataKey, activeSession.profileId, next);
        await window.PetHouseSecureStore.saveVault(activeSession.profileId, envelope);
        activeSession.data = next;
        activeSession.lastActivityAt = Date.now();
        scheduleLock();
        await window.PetHouseSecureStore.appendAudit({ profileId: activeSession.profileId, type: 'vault_saved', severity: 'info' });
        emit('saved');
        return clone(next);
    }

    function getData() {
        assertUnlocked();
        activeSession.lastActivityAt = Date.now();
        scheduleLock();
        return clone(activeSession.data);
    }

    function getSession() {
        if (!activeSession) return null;
        return { profile: sanitizeProfile(activeSession.profile), data: clone(activeSession.data), isUnlocked: true };
    }

    async function changePassword(currentPassword, newPassword, confirmation) {
        assertUnlocked();
        const validation = window.PetHouseCrypto.validatePassword(newPassword, confirmation);
        if (!validation.valid) throw new Error(validation.issues.join(' '));
        const profile = activeSession.profile;
        const oldSalt = window.PetHouseCrypto.base64UrlToBytes(profile.passwordSalt);
        await window.PetHouseCrypto.unwrapDataKey(profile.wrappedDataKey, currentPassword, oldSalt, profile.profileId, profile.passwordIterations);
        const newSalt = window.PetHouseCrypto.randomBytes(window.PetHouseCrypto.SALT_BYTES);
        profile.passwordSalt = window.PetHouseCrypto.bytesToBase64Url(newSalt);
        profile.passwordIterations = window.PetHouseCrypto.ITERATIONS;
        profile.wrappedDataKey = await window.PetHouseCrypto.wrapDataKey(activeSession.dataKey, newPassword, newSalt, profile.profileId);
        await window.PetHouseSecureStore.saveProfile(profile);
        await window.PetHouseSecureStore.appendAudit({ profileId: profile.profileId, type: 'local_password_changed', severity: 'warning' });
        emit('password_changed');
    }

    async function restorePasswordWithRecovery(profileId, recoveryCode, newPassword, confirmation) {
        const validation = window.PetHouseCrypto.validatePassword(newPassword, confirmation);
        if (!validation.valid) throw new Error(validation.issues.join(' '));
        const profile = await window.PetHouseSecureStore.getProfile(profileId);
        if (!profile) throw new Error('Perfil não encontrado.');
        let dataKey;
        try {
            dataKey = await window.PetHouseCrypto.recoverDataKey(recoveryCode, profile.recoveryEnvelope, profileId);
        } catch (_) {
            throw new Error('Kit de recuperação inválido.');
        }
        const newSalt = window.PetHouseCrypto.randomBytes(window.PetHouseCrypto.SALT_BYTES);
        profile.passwordSalt = window.PetHouseCrypto.bytesToBase64Url(newSalt);
        profile.passwordIterations = window.PetHouseCrypto.ITERATIONS;
        profile.wrappedDataKey = await window.PetHouseCrypto.wrapDataKey(dataKey, newPassword, newSalt, profileId);
        await window.PetHouseSecureStore.saveProfile(profile);
        await window.PetHouseSecureStore.appendAudit({ profileId, type: 'local_password_recovered', severity: 'warning' });
        return { profile: sanitizeProfile(profile) };
    }

    function lock(reason = 'manual') {
        if (!activeSession) return;
        const profileId = activeSession.profileId;
        activeSession.dataKey.fill(0);
        activeSession = null;
        clearLockTimer();
        emit('locked', { profileId, reason });
    }

    async function deleteCurrentProfile() {
        assertUnlocked();
        const profile = activeSession.profile;
        const profileId = profile.profileId;
        lock('profile-deleted');
        await window.PetHouseSecureStore.deleteProfile(profileId);
        if (profile.migration?.sourceKey) {
            localStorage.removeItem(profile.migration.sourceKey);
            await window.PetHouseSecureStore.setSetting(`migration:${profile.migration.sourceChecksum}`, null);
        }
        return { deleted: true, profileId };
    }

    function touch() {
        if (!activeSession) return;
        activeSession.lastActivityAt = Date.now();
        scheduleLock();
    }

    function onEvent(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    async function hasProfiles() {
        const profiles = await window.PetHouseSecureStore.listProfiles();
        return profiles.length > 0;
    }

    async function listProfiles() {
        const profiles = await window.PetHouseSecureStore.listProfiles();
        return profiles.map(sanitizeProfile).sort((a, b) => (b.lastUnlockedAt || '').localeCompare(a.lastUnlockedAt || ''));
    }

    window.PetHouseIdentity = Object.freeze({
        SESSION_TIMEOUT_MS,
        createProfile,
        unlock,
        saveVault,
        getData,
        getSession,
        changePassword,
        restorePasswordWithRecovery,
        deviceFactorSupported,
        enableDeviceFactor,
        disableDeviceFactor,
        deleteCurrentProfile,
        lock,
        touch,
        onEvent,
        hasProfiles,
        listProfiles,
        sanitizeProfile
    });
}());
