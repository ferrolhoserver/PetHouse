/**
 * Módulo de Sincronização com Supabase
 * Gerencia upload/download de dados e sincronização em tempo real
 */

const SupabaseSync = {
    enabled: false,
    familyId: null,
    
    /**
     * Inicializa a sincronização
     */
    async init() {
        // Tentar inicializar Supabase
        this.enabled = initSupabase();
        
        if (!this.enabled) {
            console.log('📴 Modo offline ativado');
            return false;
        }
        
        // Obter ou criar ID da família
        this.familyId = localStorage.getItem('pethouse_familyId');
        if (!this.familyId) {
            this.familyId = 'family_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('pethouse_familyId', this.familyId);
        }
        
        console.log('🔄 Sincronização ativada para família:', this.familyId);
        return true;
    },
    
    /**
     * Salva dados no Supabase
     */
    async saveToCloud(data) {
        if (!this.enabled || !supabaseClient) {
            console.log('💾 Salvando apenas localmente (offline)');
            return { success: false, offline: true };
        }
        
        try {
            const { data: result, error } = await supabaseClient
                .from('pethouse_data')
                .upsert({
                    family_id: this.familyId,
                    data: data,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'family_id'
                });
            
            if (error) throw error;
            
            console.log('☁️ Dados salvos na nuvem');
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Erro ao salvar na nuvem:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Carrega dados do Supabase
     */
    async loadFromCloud() {
        if (!this.enabled || !supabaseClient) {
            return { success: false, offline: true };
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('pethouse_data')
                .select('*')
                .eq('family_id', this.familyId)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    // Nenhum dado encontrado (primeira vez)
                    return { success: true, data: null, firstTime: true };
                }
                throw error;
            }
            
            console.log('☁️ Dados carregados da nuvem');
            return { success: true, data: data.data };
        } catch (error) {
            console.error('❌ Erro ao carregar da nuvem:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Obtém código de compartilhamento da família
     */
    getFamilyCode() {
        return this.familyId;
    },
    
    /**
     * Entra em uma família usando código
     */
    async joinFamily(familyCode) {
        if (!familyCode) return false;
        
        this.familyId = familyCode;
        localStorage.setItem('pethouse_familyId', familyCode);
        
        console.log('👥 Entrou na família:', familyCode);
        return true;
    }
};

// Exportar para uso global
window.SupabaseSync = SupabaseSync;
