/*
 * PetHouse V2 — Persistência local transacional
 *
 * IndexedDB substitui a dependência de localStorage para dados confidenciais.
 * Todo cofre é cifrado antes de chegar a esta camada.
 */
(function () {
    'use strict';

    const DB_NAME = 'pethouse_secure_v2';
    const DB_VERSION = 1;
    const STORES = Object.freeze({
        PROFILES: 'profiles',
        VAULTS: 'vaults',
        SETTINGS: 'settings',
        AUDIT: 'audit',
        OUTBOX: 'outbox'
    });

    let dbPromise = null;

    function ensureIndexedDb() {
        if (!window.indexedDB) throw new Error('Este navegador não oferece armazenamento local seguro. Atualize o navegador para continuar.');
    }

    function openDatabase() {
        ensureIndexedDb();
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error || new Error('Não foi possível abrir o armazenamento local.'));
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORES.PROFILES)) db.createObjectStore(STORES.PROFILES, { keyPath: 'profileId' });
                if (!db.objectStoreNames.contains(STORES.VAULTS)) db.createObjectStore(STORES.VAULTS, { keyPath: 'profileId' });
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                if (!db.objectStoreNames.contains(STORES.AUDIT)) {
                    const audit = db.createObjectStore(STORES.AUDIT, { keyPath: 'id' });
                    audit.createIndex('profileId', 'profileId', { unique: false });
                    audit.createIndex('createdAt', 'createdAt', { unique: false });
                }
                if (!db.objectStoreNames.contains(STORES.OUTBOX)) {
                    const outbox = db.createObjectStore(STORES.OUTBOX, { keyPath: 'id' });
                    outbox.createIndex('profileId', 'profileId', { unique: false });
                    outbox.createIndex('status', 'status', { unique: false });
                }
            };
            request.onsuccess = () => resolve(request.result);
        });
        return dbPromise;
    }

    async function transaction(storeNames, mode, operation) {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeNames, mode);
            let result;
            tx.oncomplete = () => resolve(result);
            tx.onerror = () => reject(tx.error || new Error('Falha na transação local.'));
            tx.onabort = () => reject(tx.error || new Error('A transação local foi interrompida.'));
            try {
                const values = storeNames.map(name => tx.objectStore(name));
                result = operation(...values, tx);
            } catch (error) {
                tx.abort();
                reject(error);
            }
        });
    }

    function requestValue(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Falha ao ler dados locais.'));
        });
    }

    async function getProfile(profileId) {
        return transaction([STORES.PROFILES], 'readonly', store => requestValue(store.get(profileId)));
    }

    async function listProfiles() {
        return transaction([STORES.PROFILES], 'readonly', store => requestValue(store.getAll()));
    }

    async function saveProfile(profile) {
        if (!profile?.profileId) throw new Error('Perfil inválido.');
        const sanitized = { ...profile, updatedAt: new Date().toISOString() };
        await transaction([STORES.PROFILES], 'readwrite', store => store.put(sanitized));
        return sanitized;
    }

    async function deleteProfile(profileId) {
        await transaction([STORES.PROFILES, STORES.VAULTS, STORES.OUTBOX, STORES.AUDIT], 'readwrite', (profiles, vaults, outbox, audit) => {
            profiles.delete(profileId);
            vaults.delete(profileId);
            const outboxIndex = outbox.index('profileId');
            const auditIndex = audit.index('profileId');
            deleteByCursor(outboxIndex.openCursor(IDBKeyRange.only(profileId)));
            deleteByCursor(auditIndex.openCursor(IDBKeyRange.only(profileId)));
        });
    }

    function deleteByCursor(cursorRequest) {
        cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (!cursor) return;
            cursor.delete();
            cursor.continue();
        };
    }

    async function getVault(profileId) {
        return transaction([STORES.VAULTS], 'readonly', store => requestValue(store.get(profileId)));
    }

    async function saveVault(profileId, envelope, metadata = {}) {
        if (!profileId || !envelope) throw new Error('Cofre inválido.');
        const record = {
            profileId,
            schemaVersion: 2,
            envelope,
            updatedAt: new Date().toISOString(),
            ...metadata
        };
        await transaction([STORES.VAULTS], 'readwrite', store => store.put(record));
        return record;
    }

    async function getSetting(key) {
        const value = await transaction([STORES.SETTINGS], 'readonly', store => requestValue(store.get(key)));
        return value?.value;
    }

    async function setSetting(key, value) {
        await transaction([STORES.SETTINGS], 'readwrite', store => store.put({ key, value, updatedAt: new Date().toISOString() }));
    }

    async function appendAudit(event) {
        const record = {
            id: window.PetHouseCrypto.createId('audit'),
            createdAt: new Date().toISOString(),
            ...event
        };
        await transaction([STORES.AUDIT], 'readwrite', store => store.put(record));
        return record;
    }

    async function queueOperation(operation) {
        const record = {
            id: window.PetHouseCrypto.createId('outbox'),
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...operation
        };
        await transaction([STORES.OUTBOX], 'readwrite', store => store.put(record));
        return record;
    }

    async function exportSecureProfile(profileId) {
        const [profile, vault] = await Promise.all([getProfile(profileId), getVault(profileId)]);
        if (!profile || !vault) throw new Error('Perfil seguro não encontrado.');
        return {
            format: 'pethouse-secure-backup',
            version: 2,
            exportedAt: new Date().toISOString(),
            profile,
            vault
        };
    }

    window.PetHouseSecureStore = Object.freeze({
        DB_NAME,
        STORES,
        openDatabase,
        getProfile,
        listProfiles,
        saveProfile,
        deleteProfile,
        getVault,
        saveVault,
        getSetting,
        setSetting,
        appendAudit,
        queueOperation,
        exportSecureProfile
    });
}());
