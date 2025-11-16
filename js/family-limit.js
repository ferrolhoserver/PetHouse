/**
 * Sistema de Limite de Famílias (Protótipo)
 * Controla acesso limitado às primeiras 20 famílias
 */

window.FamilyLimit = {
    MAX_FAMILIES: 20,
    SUPABASE_TABLE: 'families',
    
    /**
     * Verifica se ainda há vagas disponíveis
     * @returns {Promise<{available: boolean, current: number, max: number}>}
     */
    async checkAvailability() {
        try {
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase não disponível, permitindo acesso');
                return { available: true, current: 0, max: this.MAX_FAMILIES };
            }
            
            // Contar famílias existentes
            const { count, error } = await window.supabaseClient
                .from(this.SUPABASE_TABLE)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Erro ao contar famílias:', error);
                // Em caso de erro, permitir acesso (fail-open)
                return { available: true, current: 0, max: this.MAX_FAMILIES };
            }
            
            const currentCount = count || 0;
            const available = currentCount < this.MAX_FAMILIES;
            
            console.log(`📊 Famílias: ${currentCount}/${this.MAX_FAMILIES} (${available ? 'Disponível' : 'Esgotado'})`);
            
            return {
                available,
                current: currentCount,
                max: this.MAX_FAMILIES
            };
        } catch (e) {
            console.error('❌ Erro ao verificar disponibilidade:', e);
            // Em caso de erro, permitir acesso
            return { available: true, current: 0, max: this.MAX_FAMILIES };
        }
    },
    
    /**
     * Verifica se pode criar nova família
     * @returns {Promise<boolean>}
     */
    async canCreateFamily() {
        const { available } = await this.checkAvailability();
        return available;
    },
    
    /**
     * Exibe tela de vagas esgotadas
     * @param {number} current - Número atual de famílias
     */
    showFullScreen(current) {
        const overlay = document.createElement('div');
        overlay.className = 'family-limit-overlay';
        overlay.innerHTML = `
            <div class="family-limit-modal">
                <div class="family-limit-header">
                    <div class="family-limit-icon">🚀</div>
                    <h1>Protótipo Esgotado!</h1>
                    <p>Todas as ${this.MAX_FAMILIES} vagas do protótipo foram preenchidas</p>
                </div>
                
                <div class="family-limit-body">
                    <div class="family-limit-stats">
                        <div class="stat-item">
                            <div class="stat-number">${current}</div>
                            <div class="stat-label">Famílias Cadastradas</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.MAX_FAMILIES}</div>
                            <div class="stat-label">Vagas Totais</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">0</div>
                            <div class="stat-label">Vagas Disponíveis</div>
                        </div>
                    </div>
                    
                    <div class="family-limit-info">
                        <h2>🎯 O que acontece agora?</h2>
                        <p>
                            O PetHouse está em fase de <strong>protótipo limitado</strong> para validar 
                            funcionalidades e coletar feedback dos primeiros usuários.
                        </p>
                        
                        <h3>✨ Próximos Passos:</h3>
                        <ul>
                            <li><strong>Versão Comercial:</strong> Em breve lançaremos a versão paga com acesso ilimitado</li>
                            <li><strong>Condições Especiais:</strong> Usuários do protótipo terão descontos exclusivos</li>
                            <li><strong>Novos Recursos:</strong> App nativo iOS/Android, integrações com veterinários, e muito mais</li>
                        </ul>
                        
                        <h3>📝 Entre na Lista de Espera:</h3>
                        <p>
                            Deixe seu contato para ser notificado quando o PetHouse estiver disponível!
                        </p>
                    </div>
                    
                    <div class="family-limit-form">
                        <input type="text" id="waitlist-name" placeholder="Seu nome" required>
                        <input type="email" id="waitlist-email" placeholder="Seu e-mail" required>
                        <textarea id="waitlist-message" placeholder="Conte-nos sobre seus pets (opcional)" rows="3"></textarea>
                        <button id="waitlist-submit" class="btn-waitlist">
                            📧 Entrar na Lista de Espera
                        </button>
                    </div>
                </div>
                
                <div class="family-limit-footer">
                    <p>
                        <strong>Contato:</strong> rodrigorochalima@gmail.com<br>
                        Obrigado pelo interesse no PetHouse! 🐾
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        // Event listener para enviar para lista de espera
        document.getElementById('waitlist-submit').addEventListener('click', () => {
            this.submitWaitlist();
        });
    },
    
    /**
     * Envia dados para lista de espera
     */
    async submitWaitlist() {
        const name = document.getElementById('waitlist-name').value.trim();
        const email = document.getElementById('waitlist-email').value.trim();
        const message = document.getElementById('waitlist-message').value.trim();
        
        if (!name || !email) {
            alert('❌ Por favor, preencha seu nome e e-mail.');
            return;
        }
        
        // Validar e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Por favor, insira um e-mail válido.');
            return;
        }
        
        const button = document.getElementById('waitlist-submit');
        button.disabled = true;
        button.textContent = '⏳ Enviando...';
        
        try {
            // Salvar no Supabase (se disponível)
            if (window.supabaseClient) {
                const { error } = await window.supabaseClient
                    .from('waitlist')
                    .insert([{
                        name,
                        email,
                        message,
                        created_at: new Date().toISOString(),
                        user_agent: navigator.userAgent
                    }]);
                
                if (error) {
                    console.error('❌ Erro ao salvar na waitlist:', error);
                }
            }
            
            // Enviar e-mail
            const subject = encodeURIComponent('PetHouse - Nova Inscrição na Lista de Espera');
            const body = encodeURIComponent(
                `Nova inscrição na lista de espera do PetHouse!\n\n` +
                `Nome: ${name}\n` +
                `E-mail: ${email}\n` +
                `Mensagem: ${message || '(nenhuma)'}\n\n` +
                `Data: ${new Date().toLocaleString('pt-BR')}\n` +
                `Navegador: ${navigator.userAgent}`
            );
            
            window.location.href = `mailto:rodrigorochalima@gmail.com?subject=${subject}&body=${body}`;
            
            // Mostrar mensagem de sucesso
            button.textContent = '✅ Inscrito!';
            button.style.background = '#4CAF50';
            
            setTimeout(() => {
                alert(
                    '✅ Inscrição realizada com sucesso!\n\n' +
                    'Você receberá um e-mail quando o PetHouse estiver disponível.\n\n' +
                    'Obrigado pelo interesse! 🐾'
                );
            }, 500);
            
        } catch (e) {
            console.error('❌ Erro ao enviar waitlist:', e);
            alert('❌ Erro ao enviar inscrição. Tente novamente.');
            button.disabled = false;
            button.textContent = '📧 Entrar na Lista de Espera';
        }
    },
    
    /**
     * Adiciona CSS para telas de limite
     */
    injectStyles() {
        if (document.getElementById('family-limit-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'family-limit-styles';
        style.textContent = `
            .family-limit-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10002;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                padding: 1rem;
            }
            
            .family-limit-modal {
                background: white;
                border-radius: 16px;
                max-width: 700px;
                margin: 2rem auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .family-limit-header {
                padding: 2rem;
                background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
                color: white;
                text-align: center;
                border-radius: 16px 16px 0 0;
            }
            
            .family-limit-icon {
                font-size: 4rem;
                margin-bottom: 0.5rem;
            }
            
            .family-limit-header h1 {
                font-size: 2rem;
                margin: 0 0 0.5rem 0;
            }
            
            .family-limit-header p {
                margin: 0;
                opacity: 0.95;
            }
            
            .family-limit-body {
                padding: 2rem;
            }
            
            .family-limit-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .stat-item {
                text-align: center;
                padding: 1rem;
                background: #f5f5f5;
                border-radius: 8px;
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: 700;
                color: #FF6B6B;
                margin-bottom: 0.25rem;
            }
            
            .stat-label {
                font-size: 0.85rem;
                color: #666;
            }
            
            .family-limit-info h2 {
                color: #2196F3;
                margin: 0 0 0.75rem 0;
            }
            
            .family-limit-info h3 {
                color: #333;
                margin: 1.5rem 0 0.75rem 0;
            }
            
            .family-limit-info ul {
                margin: 0 0 1rem 0;
                padding-left: 1.5rem;
            }
            
            .family-limit-info li {
                margin-bottom: 0.5rem;
                line-height: 1.5;
            }
            
            .family-limit-form {
                background: #f9f9f9;
                padding: 1.5rem;
                border-radius: 8px;
                margin-top: 1.5rem;
            }
            
            .family-limit-form input,
            .family-limit-form textarea {
                width: 100%;
                padding: 0.75rem;
                margin-bottom: 1rem;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 1rem;
                box-sizing: border-box;
            }
            
            .btn-waitlist {
                width: 100%;
                padding: 1rem;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-waitlist:hover {
                background: #1976D2;
            }
            
            .btn-waitlist:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .family-limit-footer {
                padding: 1.5rem 2rem;
                background: #f9f9f9;
                border-radius: 0 0 16px 16px;
                text-align: center;
                font-size: 0.9rem;
                color: #666;
            }
            
            @media (max-width: 768px) {
                .family-limit-overlay {
                    padding: 0;
                }
                
                .family-limit-modal {
                    margin: 0;
                    border-radius: 0;
                    min-height: 100vh;
                }
                
                .family-limit-header {
                    border-radius: 0;
                }
                
                .family-limit-stats {
                    grid-template-columns: 1fr;
                }
                
                .family-limit-footer {
                    border-radius: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
};

// Injetar estilos ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.FamilyLimit.injectStyles();
    });
} else {
    window.FamilyLimit.injectStyles();
}
