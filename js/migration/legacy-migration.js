/*
 * PetHouse V2 — Detector e migrador não destrutivo de dados legados.
 *
 * Nunca remove chaves antigas. A migração cria uma cópia cifrada, registra
 * checksum/origem e preserva o formato anterior para reversão e exportação.
 */
(function () {
    'use strict';

    const LEGACY_KEYS = ['pethouse_data', 'petHouseData'];

    function isPetHousePayload(value) {
        return value && typeof value === 'object' && Array.isArray(value.pets);
    }

    async function checksum(value) {
        const bytes = new TextEncoder().encode(JSON.stringify(value));
        const hash = await crypto.subtle.digest('SHA-256', bytes);
        return window.PetHouseCrypto.bytesToBase64Url(new Uint8Array(hash));
    }

    function getCandidateKeys() {
        const keys = new Set(LEGACY_KEYS);
        const userId = localStorage.getItem('pethouse_userId');
        if (userId) keys.add(`pethouse_data_${userId}`);
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key && key.startsWith('pethouse_data_')) keys.add(key);
        }
        return Array.from(keys);
    }

    async function discover() {
        const candidates = [];
        for (const key of getCandidateKeys()) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            try {
                const data = JSON.parse(raw);
                if (!isPetHousePayload(data)) continue;
                candidates.push({
                    key,
                    data,
                    pets: data.pets.length,
                    casaNome: String(data.casaNome || 'Casa sem nome'),
                    checksum: await checksum(data),
                    size: new Blob([raw]).size
                });
            } catch (_) {
                // Dados que não seguem JSON não devem bloquear o onboarding; são ignorados e jamais apagados.
            }
        }
        return candidates.sort((a, b) => b.pets - a.pets || b.size - a.size);
    }

    function normalize(data) {
        const payload = JSON.parse(JSON.stringify(data || {}));
        payload.pets = Array.isArray(payload.pets) ? payload.pets : [];
        payload.membros = Array.isArray(payload.membros) ? payload.membros : [];
        payload.casaNome = String(payload.casaNome || '').trim();
        payload.meta = {
            ...(payload.meta || {}),
            schemaVersion: 2,
            migratedAt: new Date().toISOString(),
            source: 'legacy-localstorage'
        };
        return payload;
    }

    function migrationSettingKey(checksumValue) {
        return `migration:${checksumValue}`;
    }

    async function migrate(candidate, credentials) {
        if (!candidate?.key || !isPetHousePayload(candidate.data)) throw new Error('Origem de migração inválida.');
        const existingProfileId = await window.PetHouseSecureStore.getSetting(migrationSettingKey(candidate.checksum));
        if (existingProfileId) throw new Error('Estes dados já foram migrados para um perfil protegido neste aparelho.');
        const normalized = normalize(candidate.data);
        const migration = {
            version: 1,
            sourceKey: candidate.key,
            sourceChecksum: candidate.checksum,
            sourcePets: candidate.pets,
            migratedAt: new Date().toISOString(),
            rollbackAvailable: true
        };
        const result = await window.PetHouseIdentity.createProfile({
            ...credentials,
            initialVault: normalized,
            migration
        });
        await window.PetHouseSecureStore.setSetting(migrationSettingKey(candidate.checksum), result.profile.profileId);
        return result;
    }

    async function rollback(profileId) {
        const profile = await window.PetHouseSecureStore.getProfile(profileId);
        if (!profile?.migration?.rollbackAvailable) throw new Error('Este perfil não foi criado por uma migração reversível.');
        const raw = localStorage.getItem(profile.migration.sourceKey);
        if (!raw) throw new Error('A cópia legada original não foi encontrada; não é seguro concluir a reversão.');
        let original;
        try { original = JSON.parse(raw); } catch (_) { throw new Error('A cópia legada original está inválida; a reversão foi interrompida.'); }
        const originalChecksum = await checksum(original);
        if (originalChecksum !== profile.migration.sourceChecksum) {
            throw new Error('A cópia legada mudou desde a migração. A reversão foi interrompida para evitar perda de dados.');
        }
        window.PetHouseIdentity.lock('migration-rollback');
        await window.PetHouseSecureStore.deleteProfile(profileId);
        await window.PetHouseSecureStore.setSetting(migrationSettingKey(profile.migration.sourceChecksum), null);
        return { rolledBack: true, sourceKey: profile.migration.sourceKey, sourcePets: profile.migration.sourcePets };
    }

    function exportCandidate(candidate) {
        if (!candidate?.data) throw new Error('Dados de origem não encontrados.');
        const content = JSON.stringify(candidate.data, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `pethouse-backup-legado-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    window.PetHouseLegacyMigration = Object.freeze({ discover, normalize, migrate, rollback, exportCandidate });
}());
