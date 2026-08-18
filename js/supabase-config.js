/*
 * PetHouse — integração remota legada desativada.
 *
 * O PetHouse V2 opera com cofre local criptografado e não inicializa clientes
 * de terceiros automaticamente. Uma integração remota futura só poderá ser
 * ativada por configuração explícita de servidor e vínculo consentido.
 */
(function () {
    'use strict';

    const config = Object.freeze({
        enabled: false,
        provider: null,
        reason: 'Modo privado/offline ativo; sincronização legada desativada.'
    });

    function initSupabase() {
        console.info('[PetHouse] Integração remota legada permanece desativada.');
        return false;
    }

    window.SUPABASE_CONFIG = config;
    window.supabaseClient = null;
    window.initSupabase = initSupabase;
}());
