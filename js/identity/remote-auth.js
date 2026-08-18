/*
 * PetHouse V2 — Cliente de identidade remota.
 * Tokens ficam exclusivamente em cookies HttpOnly emitidos pelas rotas /api.
 */
(function () {
    'use strict';

    async function request(path, options = {}) {
        const response = await fetch(path, {
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(body.error || 'Não foi possível concluir a operação de segurança.');
            error.status = response.status;
            throw error;
        }
        return body;
    }

    function post(path, body) {
        return request(path, { method: 'POST', body: JSON.stringify(body || {}) });
    }

    function getSession() { return request('/api/auth/session'); }
    function signUp(email, password) { return post('/api/auth/signup', { email, password }); }
    function signIn(email, password) { return post('/api/auth/signin', { email, password }); }
    function requestPasswordReset(email) { return post('/api/auth/reset-request', { email }); }
    function updatePassword(password) { return post('/api/auth/update-password', { password }); }
    function signOut() { return request('/api/auth/session', { method: 'DELETE' }); }
    function mfaStatus() { return post('/api/auth/mfa', { action: 'status' }); }
    function mfaEnroll(friendlyName) { return post('/api/auth/mfa', { action: 'enroll', friendlyName }); }
    function mfaChallenge(factorId) { return post('/api/auth/mfa', { action: 'challenge', factorId }); }
    function mfaVerify(factorId, challengeId, code) { return post('/api/auth/mfa', { action: 'verify', factorId, challengeId, code }); }
    function mfaUnenroll(factorId) { return post('/api/auth/mfa', { action: 'unenroll', factorId }); }

    window.PetHouseRemoteAuth = Object.freeze({
        getSession, signUp, signIn, requestPasswordReset, updatePassword, signOut,
        mfaStatus, mfaEnroll, mfaChallenge, mfaVerify, mfaUnenroll
    });
}());
