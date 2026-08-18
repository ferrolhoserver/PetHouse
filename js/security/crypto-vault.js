/*
 * PetHouse V2 — Cofre criptográfico local
 *
 * Este módulo não armazena senhas. Ele cria uma chave de cofre aleatória e
 * a protege por senha (PBKDF2 + AES-GCM), mantendo os dados de cada perfil
 * cifrados antes de gravá-los no dispositivo.
 */
(function () {
    'use strict';

    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    const ITERATIONS = 210000;
    const SALT_BYTES = 16;
    const IV_BYTES = 12;
    const DATA_KEY_BYTES = 32;

    function assertCrypto() {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('Este navegador não oferece os recursos de segurança necessários. Atualize o navegador para continuar.');
        }
    }

    function bytesToBase64Url(bytes) {
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    function base64UrlToBytes(value) {
        if (typeof value !== 'string' || !value) throw new Error('Material criptográfico inválido.');
        const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
        const binary = atob(normalized + padding);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    function randomBytes(size) {
        assertCrypto();
        const bytes = new Uint8Array(size);
        crypto.getRandomValues(bytes);
        return bytes;
    }

    function createId(prefix) {
        assertCrypto();
        if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
        return `${prefix}_${bytesToBase64Url(randomBytes(16))}`;
    }

    async function derivePasswordKey(password, salt, iterations = ITERATIONS) {
        assertCrypto();
        if (typeof password !== 'string' || password.length < 1) throw new Error('Senha inválida.');
        const material = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveKey']);
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
            material,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function importAesKey(rawBytes, usages) {
        assertCrypto();
        return crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, usages);
    }

    async function encryptBytes(key, bytes, additionalData) {
        assertCrypto();
        const iv = randomBytes(IV_BYTES);
        const params = { name: 'AES-GCM', iv };
        if (additionalData) params.additionalData = textEncoder.encode(additionalData);
        const encrypted = await crypto.subtle.encrypt(params, key, bytes);
        return { iv: bytesToBase64Url(iv), ciphertext: bytesToBase64Url(new Uint8Array(encrypted)) };
    }

    async function decryptBytes(key, envelope, additionalData) {
        assertCrypto();
        if (!envelope || !envelope.iv || !envelope.ciphertext) throw new Error('Cofre criptografado inválido.');
        const params = { name: 'AES-GCM', iv: base64UrlToBytes(envelope.iv) };
        if (additionalData) params.additionalData = textEncoder.encode(additionalData);
        const result = await crypto.subtle.decrypt(params, key, base64UrlToBytes(envelope.ciphertext));
        return new Uint8Array(result);
    }

    async function wrapDataKey(dataKeyBytes, password, salt, profileId, iterations = ITERATIONS) {
        const key = await derivePasswordKey(password, salt, iterations);
        return encryptBytes(key, dataKeyBytes, `pethouse-v2:key:${profileId}`);
    }

    async function unwrapDataKey(wrappedKey, password, salt, profileId, iterations = ITERATIONS) {
        const key = await derivePasswordKey(password, salt, iterations);
        return decryptBytes(key, wrappedKey, `pethouse-v2:key:${profileId}`);
    }

    async function encryptJson(dataKeyBytes, profileId, value) {
        const key = await importAesKey(dataKeyBytes, ['encrypt']);
        return encryptBytes(key, textEncoder.encode(JSON.stringify(value)), `pethouse-v2:vault:${profileId}`);
    }

    async function decryptJson(dataKeyBytes, profileId, envelope) {
        const key = await importAesKey(dataKeyBytes, ['decrypt']);
        const bytes = await decryptBytes(key, envelope, `pethouse-v2:vault:${profileId}`);
        return JSON.parse(textDecoder.decode(bytes));
    }

    async function generateRecoveryKit(dataKeyBytes, profileId) {
        const recoveryBytes = randomBytes(DATA_KEY_BYTES);
        const recoveryKey = await importAesKey(recoveryBytes, ['encrypt']);
        const wrappedKey = await encryptBytes(recoveryKey, dataKeyBytes, `pethouse-v2:recovery:${profileId}`);
        return {
            code: bytesToBase64Url(recoveryBytes),
            envelope: wrappedKey,
            checksum: bytesToBase64Url(await crypto.subtle.digest('SHA-256', recoveryBytes)).slice(0, 12)
        };
    }

    async function recoverDataKey(recoveryCode, recoveryEnvelope, profileId) {
        const recoveryKey = await importAesKey(base64UrlToBytes(recoveryCode.trim()), ['decrypt']);
        return decryptBytes(recoveryKey, recoveryEnvelope, `pethouse-v2:recovery:${profileId}`);
    }

    function validatePassword(password, confirmation) {
        const issues = [];
        if (typeof password !== 'string' || password.length < 12) issues.push('Use pelo menos 12 caracteres.');
        if (!/[a-z]/.test(password || '')) issues.push('Inclua uma letra minúscula.');
        if (!/[A-Z]/.test(password || '')) issues.push('Inclua uma letra maiúscula.');
        if (!/\d/.test(password || '')) issues.push('Inclua um número.');
        if (!/[^A-Za-z0-9\s]/.test(password || '')) issues.push('Inclua um símbolo.');
        if (/\s/.test(password || '')) issues.push('Não use espaços.');
        if (confirmation !== undefined && password !== confirmation) issues.push('As senhas não conferem.');
        return { valid: issues.length === 0, issues };
    }

    window.PetHouseCrypto = Object.freeze({
        VERSION: 'v1',
        ITERATIONS,
        SALT_BYTES,
        DATA_KEY_BYTES,
        randomBytes,
        createId,
        bytesToBase64Url,
        base64UrlToBytes,
        wrapDataKey,
        unwrapDataKey,
        encryptJson,
        decryptJson,
        generateRecoveryKit,
        recoverDataKey,
        validatePassword
    });
}());
