/**
 * Módulo de Autenticação com Supabase
 * Sistema de login com email para recuperação de acesso
 */

class PetHouseAuth {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
    }

    async init() {
        // Inicializar Supabase
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.key
            );
            
            // Verificar sessão existente
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                return true;
            }
        }
        return false;
    }

    async signUp(email, password, familyName) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        family_name: familyName
                    }
                }
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro no cadastro:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            return { success: true };
        } catch (error) {
            console.error('Erro no logout:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Erro ao recuperar senha:', error);
            return { success: false, error: error.message };
        }
    }

    async updatePassword(newPassword) {
        try {
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            return { success: false, error: error.message };
        }
    }

    async getFamilyCode() {
        if (!this.currentUser) return null;

        try {
            // Buscar código da família do usuário no Supabase
            const { data, error } = await this.supabase
                .from('pethouse_data')
                .select('family_id')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) throw error;

            return data?.family_id || null;
        } catch (error) {
            console.error('Erro ao buscar código da família:', error);
            return null;
        }
    }

    async linkFamilyCode(familyCode) {
        if (!this.currentUser) return { success: false, error: 'Usuário não autenticado' };

        try {
            // Vincular código da família ao usuário
            const { error } = await this.supabase
                .from('pethouse_data')
                .upsert({
                    user_id: this.currentUser.id,
                    family_id: familyCode,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Erro ao vincular código da família:', error);
            return { success: false, error: error.message };
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }
}

// Exportar para uso global
window.PetHouseAuth = PetHouseAuth;
