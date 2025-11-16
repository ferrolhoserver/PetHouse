/**
 * Gerenciador de Consentimento LGPD - VERSÃO SIMPLIFICADA PARA iOS
 * Solução otimizada para iOS Safari sem overlay complexo
 */

const ConsentManager = {
    STORAGE_KEY: 'pethouse_consent',
    CURRENT_VERSION: '1.0.0',
    
    /**
     * Verifica se o usuário já aceitou os termos
     */
    hasConsent() {
        const consent = this.getConsent();
        return consent && consent.version === this.CURRENT_VERSION && consent.accepted;
    },
    
    /**
     * Obtém dados de consentimento armazenados
     */
    getConsent() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Erro ao ler consentimento:', e);
            return null;
        }
    },
    
    /**
     * Registra o aceite do usuário
     */
    recordConsent() {
        const consent = {
            version: this.CURRENT_VERSION,
            accepted: true,
            timestamp: new Date().toISOString(),
            termsVersion: window.TermsOfService?.version || '1.0.0',
            privacyVersion: window.PrivacyPolicy?.version || '1.0.0',
            userAgent: navigator.userAgent,
            language: navigator.language
        };
        
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
            
            // Salvar no Supabase se disponível
            if (window.SupabaseSync && window.SupabaseSync.supabase) {
                this.saveConsentToSupabase(consent).catch(err => {
                    console.error('Erro ao salvar consentimento no Supabase:', err);
                });
            }
            
            return true;
        } catch (e) {
            console.error('Erro ao salvar consentimento:', e);
            return false;
        }
    },
    
    /**
     * Salva consentimento no Supabase
     */
    async saveConsentToSupabase(consent) {
        if (!window.SupabaseSync || !window.SupabaseSync.supabase) {
            return;
        }
        
        const familyId = localStorage.getItem('familyId') || 'temp_' + Date.now();
        
        try {
            const { error } = await window.SupabaseSync.supabase
                .from('user_consents')
                .upsert({
                    family_id: familyId,
                    terms_version: consent.termsVersion,
                    privacy_version: consent.privacyVersion,
                    consent_version: consent.version,
                    accepted: true,
                    accepted_at: consent.timestamp,
                    user_agent: consent.userAgent,
                    language: consent.language
                }, {
                    onConflict: 'family_id'
                });
            
            if (error) {
                console.error('Erro ao salvar no Supabase:', error);
            }
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
        }
    },
    
    /**
     * Registra a recusa do usuário
     */
    recordDecline() {
        const decline = {
            version: this.CURRENT_VERSION,
            accepted: false,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(decline));
            return true;
        } catch (e) {
            console.error('Erro ao salvar recusa:', e);
            return false;
        }
    },
    
    /**
     * Exibe a tela de consentimento - VERSÃO SIMPLIFICADA PARA iOS
     */
    showConsentScreen(onAccept) {
        // Limpar body e criar página full-screen
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'auto';
        document.body.style.background = '#f5f5f5';
        
        // Container principal
        const container = document.createElement('div');
        container.style.cssText = `
            min-height: 100vh;
            background: white;
            padding: 0;
            margin: 0;
        `;
        
        container.innerHTML = `
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                
                .consent-header {
                    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                    color: white;
                    padding: 1.5rem 1rem;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .consent-header h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                }
                
                .prototype-badge {
                    display: inline-block;
                    background: #ff9800;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-top: 0.5rem;
                }
                
                .consent-subtitle {
                    margin: 1rem 0 0 0;
                    font-size: 0.95rem;
                    opacity: 0.95;
                }
                
                .consent-tabs {
                    display: flex;
                    background: #f5f5f5;
                    border-bottom: 2px solid #e0e0e0;
                    position: relative;
                }
                
                .consent-tab {
                    flex: 1;
                    padding: 1rem;
                    background: transparent;
                    border: none;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .consent-tab.active {
                    background: white;
                    color: #2196F3;
                    border-bottom: 3px solid #2196F3;
                }
                
                .consent-content {
                    padding: 1.5rem;
                    line-height: 1.6;
                    color: #333;
                }
                
                .consent-tab-content {
                    display: none;
                }
                
                .consent-tab-content.active {
                    display: block;
                }
                
                .consent-footer {
                    background: white;
                    padding: 1rem;
                    border-top: 2px solid #e0e0e0;
                    box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
                }
                
                .consent-checkbox {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                    cursor: pointer;
                }
                
                .consent-checkbox input {
                    margin-right: 0.75rem;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                
                .consent-checkbox span {
                    font-size: 0.9rem;
                    color: #333;
                }
                
                .consent-buttons {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1rem;
                }
                
                .btn {
                    flex: 1;
                    padding: 1rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .btn-primary {
                    background: #2196F3;
                    color: white;
                }
                
                .btn-primary:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                
                .btn-secondary {
                    background: #f44336;
                    color: white;
                }
                
                .consent-note {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: #fff3cd;
                    border-radius: 4px;
                    border-left: 4px solid #ff9800;
                }
                
                h2 { color: #2196F3; margin-top: 1.5rem; }
                h3 { color: #1976D2; margin-top: 1.25rem; }
                ul { padding-left: 1.5rem; }
                li { margin-bottom: 0.5rem; }
            </style>
            
            <div class="consent-header">
                <div class="consent-icon">🐾</div>
                <h1>Bem-vindo ao PetHouse</h1>
                <div class="prototype-badge">⚠️ PROTÓTIPO - VAGAS LIMITADAS (20 famílias)</div>
                <p class="consent-subtitle">
                    Antes de começar, precisamos do seu consentimento para coletar e processar seus dados.
                </p>
            </div>
            
            <div class="consent-tabs">
                <button class="consent-tab active" data-tab="terms">
                    📋 Termos de Uso
                </button>
                <button class="consent-tab" data-tab="privacy">
                    🔒 Política de Privacidade
                </button>
            </div>
            
            <div class="consent-content">
                <div class="consent-tab-content active" id="terms-content">
                    ${window.TermsOfService?.getTermsHTML() || '<p>Carregando...</p>'}
                </div>
                <div class="consent-tab-content" id="privacy-content">
                    ${window.PrivacyPolicy?.getPolicyHTML() || '<p>Carregando...</p>'}
                </div>
            </div>
            
            <div class="consent-footer">
                <label class="consent-checkbox">
                    <input type="checkbox" id="accept-terms">
                    <span>Li e aceito os <strong>Termos de Uso</strong></span>
                </label>
                <label class="consent-checkbox">
                    <input type="checkbox" id="accept-privacy">
                    <span>Li e aceito a <strong>Política de Privacidade</strong></span>
                </label>
                <label class="consent-checkbox">
                    <input type="checkbox" id="accept-data-collection">
                    <span>Concordo com a <strong>coleta e análise de dados</strong> para fins de 
                    pesquisa, desenvolvimento e melhoria do aplicativo</span>
                </label>
                
                <div class="consent-buttons">
                    <button class="btn btn-secondary" id="decline-btn">
                        ❌ Não Aceito
                    </button>
                    <button class="btn btn-primary" id="accept-btn" disabled>
                        ✅ Aceito os Termos
                    </button>
                </div>
                
                <p class="consent-note">
                    <strong>Importante:</strong> Ao aceitar, você concorda com a coleta de dados agregados 
                    e anonimizados sobre uso do aplicativo, espécies e raças de pets, padrões de saúde e 
                    outras estatísticas para fins de pesquisa, desenvolvimento de novos produtos e 
                    estratégias comerciais. Seus dados pessoais serão protegidos conforme a LGPD.
                </p>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Elementos
        const tabButtons = container.querySelectorAll('.consent-tab');
        const tabContents = container.querySelectorAll('.consent-tab-content');
        const acceptTermsCheckbox = container.querySelector('#accept-terms');
        const acceptPrivacyCheckbox = container.querySelector('#accept-privacy');
        const acceptDataCheckbox = container.querySelector('#accept-data-collection');
        const acceptBtn = container.querySelector('#accept-btn');
        const declineBtn = container.querySelector('#decline-btn');
        
        // Função para atualizar botão
        const updateButton = () => {
            const allChecked = acceptTermsCheckbox.checked && 
                              acceptPrivacyCheckbox.checked && 
                              acceptDataCheckbox.checked;
            acceptBtn.disabled = !allChecked;
        };
        
        // Listeners de checkbox
        acceptTermsCheckbox.addEventListener('change', updateButton);
        acceptPrivacyCheckbox.addEventListener('change', updateButton);
        acceptDataCheckbox.addEventListener('change', updateButton);
        
        // Troca de abas
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                button.classList.add('active');
                container.querySelector(`#${tab}-content`).classList.add('active');
            });
        });
        
        // Botão Aceitar
        acceptBtn.addEventListener('click', () => {
            if (this.recordConsent()) {
                // Recarregar a página para iniciar o app
                window.location.reload();
            } else {
                alert('Erro ao salvar consentimento. Tente novamente.');
            }
        });
        
        // Botão Recusar
        declineBtn.addEventListener('click', () => {
            if (confirm('Você tem certeza que deseja recusar? Sem aceitar os termos, você não poderá usar o PetHouse.')) {
                this.recordDecline();
                document.body.innerHTML = `
                    <div style="padding: 2rem; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                        <h1 style="color: #f44336;">❌ Acesso Negado</h1>
                        <p>Você recusou os Termos de Uso. Para usar o PetHouse, é necessário aceitar os termos.</p>
                        <button onclick="location.reload()" style="padding: 1rem 2rem; background: #2196F3; color: white; border: none; border-radius: 8px; font-size: 1rem; margin-top: 1rem; cursor: pointer;">
                            Voltar e Aceitar
                        </button>
                    </div>
                `;
            }
        });
    },
    
    /**
     * Verifica e exibe consentimento se necessário
     */
    checkAndShow(onAccept) {
        if (!this.hasConsent()) {
            this.showConsentScreen(onAccept);
            return false;
        }
        return true;
    }
};

// Exportar para uso global
window.ConsentManager = ConsentManager;
