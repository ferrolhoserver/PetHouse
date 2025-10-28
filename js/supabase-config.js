/**
 * Configuração do Supabase
 * Backend para sincronização multi-usuário em tempo real
 */

const SUPABASE_CONFIG = {
    url: 'https://vaylmepocuppvfkixeoj.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWxtZXBvY3VwcHZma2l4ZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzYxNzgsImV4cCI6MjA3NzI1MjE3OH0.6rnAnhN_cEacUdb6RAvQiyiFI3-_ZVmh84QRueQT3HU'
};

// Cliente Supabase global
let supabaseClient = null;

// Inicializar cliente Supabase
function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        console.log('✅ Supabase inicializado com sucesso');
        return true;
    } else {
        console.warn('⚠️ Biblioteca Supabase não carregada. Usando modo offline.');
        return false;
    }
}

// Exportar para uso global
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.supabaseClient = supabaseClient;
window.initSupabase = initSupabase;
