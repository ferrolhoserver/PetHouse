/**
 * Gerenciador de Consentimento LGPD
 * Controla a exibição e aceite dos Termos de Uso e Política de Privacidade
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
            
            // Log para analytics
            if (window.ErrorLogger) {
                ErrorLogger.logAction('Consentimento Aceito', {
                    version: consent.version,
                    timestamp: consent.timestamp
                });
            }
            
            return true;
        } catch (e) {
            console.error('Erro ao salvar consentimento:', e);
            return false;
        }
    },
    
    /**
     * Revoga o consentimento
     */
    revokeConsent() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            
            // Log para analytics
            if (window.ErrorLogger) {
                ErrorLogger.logAction('Consentimento Revogado', {
                    timestamp: new Date().toISOString()
                });
            }
            
            return true;
        } catch (e) {
            console.error('Erro ao revogar consentimento:', e);
            return false;
        }
    },
    
    /**
     * Exibe a tela de consentimento
     */
    showConsentScreen(onAccept) {
        const overlay = document.createElement('div');
        overlay.id = 'consent-overlay';
        overlay.className = 'consent-overlay';
        
        overlay.innerHTML = `
            <div class="consent-container">
                <div class="consent-header">
                    <div class="consent-logo">
                        <span class="consent-icon">🐾</span>
                        <h1>Bem-vindo ao PetHouse</h1>
                        <div class="prototype-badge">⚠️ PROTÓTIPO - VAGAS LIMITADAS (20 famílias)</div>
                    </div>
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
                
                <div class="consent-scroll-indicator" id="scroll-indicator">
                    <span class="scroll-icon">👇</span>
                    <p>Role até o final para continuar</p>
                </div>
                
                <div class="consent-footer">
                    <div class="consent-checkboxes">
                        <label class="consent-checkbox">
                            <input type="checkbox" id="accept-terms" disabled>
                            <span>Li e aceito os <strong>Termos de Uso</strong></span>
                        </label>
                        <label class="consent-checkbox">
                            <input type="checkbox" id="accept-privacy" disabled>
                            <span>Li e aceito a <strong>Política de Privacidade</strong></span>
                        </label>
                        <label class="consent-checkbox">
                            <input type="checkbox" id="accept-data-collection" disabled>
                            <span>Concordo com a <strong>coleta e análise de dados</strong> para fins de 
                            pesquisa, desenvolvimento e melhoria do aplicativo</span>
                        </label>
                    </div>
                    
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
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Elementos
        const tabButtons = overlay.querySelectorAll('.consent-tab');
        const tabContents = overlay.querySelectorAll('.consent-tab-content');
        const termsContent = overlay.querySelector('#terms-content');
        const privacyContent = overlay.querySelector('#privacy-content');
        const scrollIndicator = overlay.querySelector('#scroll-indicator');
        const acceptTermsCheckbox = overlay.querySelector('#accept-terms');
        const acceptPrivacyCheckbox = overlay.querySelector('#accept-privacy');
        const acceptDataCheckbox = overlay.querySelector('#accept-data-collection');
        const acceptBtn = overlay.querySelector('#accept-btn');
        const declineBtn = overlay.querySelector('#decline-btn');
        
        // Estado de scroll
        let termsScrolled = false;
        let privacyScrolled = false;
        
        // Função para verificar se rolou até o final
        const checkScroll = (element, callback) => {
            const scrollTop = element.scrollTop;
            const scrollHeight = element.scrollHeight;
            const clientHeight = element.clientHeight;
            
            // Considera "final" quando está a 50px do fim
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                callback();
            }
        };
        
        // Listener de scroll para Termos
        termsContent.addEventListener('scroll', () => {
            checkScroll(termsContent, () => {
                if (!termsScrolled) {
                    termsScrolled = true;
                    acceptTermsCheckbox.disabled = false;
                    updateScrollIndicator();
                }
            });
        });
        
        // Listener de scroll para Privacidade
        privacyContent.addEventListener('scroll', () => {
            checkScroll(privacyContent, () => {
                if (!privacyScrolled) {
                    privacyScrolled = true;
                    acceptPrivacyCheckbox.disabled = false;
                    updateScrollIndicator();
                }
            });
        });
        
        // Atualizar indicador de scroll
        const updateScrollIndicator = () => {
            const activeContent = overlay.querySelector('.consent-tab-content.active');
            const isTermsActive = activeContent.id === 'terms-content';
            const scrolled = isTermsActive ? termsScrolled : privacyScrolled;
            
            if (scrolled) {
                scrollIndicator.style.display = 'none';
            } else {
                scrollIndicator.style.display = 'flex';
            }
        };
        
        // Troca de abas
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Atualizar botões
                tabButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Atualizar conteúdo
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetContent = overlay.querySelector(`#${tabName}-content`);
                targetContent.classList.add('active');
                
                updateScrollIndicator();
            });
        });
        
        // Checkboxes
        const updateAcceptButton = () => {
            const allChecked = acceptTermsCheckbox.checked && 
                              acceptPrivacyCheckbox.checked && 
                              acceptDataCheckbox.checked;
            acceptBtn.disabled = !allChecked;
        };
        
        acceptTermsCheckbox.addEventListener('change', () => {
            if (acceptTermsCheckbox.checked) {
                acceptDataCheckbox.disabled = false;
            }
            updateAcceptButton();
        });
        
        acceptPrivacyCheckbox.addEventListener('change', updateAcceptButton);
        acceptDataCheckbox.addEventListener('change', updateAcceptButton);
        
        // Botão Aceitar
        acceptBtn.addEventListener('click', () => {
            if (this.recordConsent()) {
                overlay.remove();
                if (onAccept) onAccept();
            } else {
                alert('❌ Erro ao salvar consentimento. Tente novamente.');
            }
        });
        
        // Botão Recusar
        declineBtn.addEventListener('click', () => {
            if (confirm('Se você não aceitar os Termos de Uso e Política de Privacidade, não poderá usar o PetHouse.\n\nTem certeza que deseja recusar?')) {
                overlay.remove();
                document.body.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 2rem; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <h1 style="font-size: 3rem; margin-bottom: 1rem;">🐾</h1>
                        <h2 style="color: #333; margin-bottom: 1rem;">Acesso Negado</h2>
                        <p style="color: #666; max-width: 500px; margin-bottom: 2rem;">
                            Você optou por não aceitar os Termos de Uso e Política de Privacidade. 
                            Sem o seu consentimento, não podemos fornecer acesso ao PetHouse.
                        </p>
                        <button onclick="location.reload()" style="padding: 0.75rem 2rem; background: #2196F3; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">
                            🔄 Recarregar e Tentar Novamente
                        </button>
                    </div>
                `;
            }
        });
        
        // Inicializar indicador
        updateScrollIndicator();
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
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
