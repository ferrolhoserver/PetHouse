/**
 * Sistema de Conhecimento Colaborativo
 * Permite que usuários contribuam com informações sobre:
 * - Vacinas 💉
 * - Vermífugos 🐛
 * - Medicamentos/Tratamentos 💊
 * - Procedimentos 🏥
 * - Exames 🔬
 * - Outros 📋
 */

const ConhecimentoColaborativo = {
    supabaseUrl: 'https://vaylmepocuppvfkixeoj.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWxtZXBvY3VwcHZma2l4ZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NjQ1NTIsImV4cCI6MjA0ODE0MDU1Mn0.gKwWnHx5fqTa3aPxYdaGGlLJKJXVZUcALZlhH_Jz0Ek',
    
    cache: {
        vacinas: [],
        vermifugos: [],
        medicamentos: [],
        procedimentos: [],
        exames: [],
        outros: [],
        lastUpdate: null
    },
    
    cacheExpiry: 5 * 60 * 1000, // 5 minutos

    /**
     * Inicializa o sistema
     */
    async init() {
        console.log('🎓 [Conhecimento Colaborativo] Inicializando...');
        
        // Carregar conhecimento do Supabase
        await this.carregarTodos();
        
        // Sincronizar a cada 5 minutos
        setInterval(() => this.carregarTodos(), 5 * 60 * 1000);
    },

    /**
     * Carrega todos os tipos de conhecimento
     */
    async carregarTodos() {
        const tipos = ['vacinas', 'vermifugos', 'medicamentos', 'procedimentos', 'exames', 'outros'];
        
        for (const tipo of tipos) {
            await this.carregarPorTipo(tipo);
        }
    },

    /**
     * Carrega conhecimento por tipo do Supabase
     */
    async carregarPorTipo(tipo) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/conhecimento_colaborativo?tipo=eq.${tipo}&status=eq.aprovado&select=*`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (!response.ok) {
                console.error(`❌ [Conhecimento] Erro ao carregar ${tipo}`);
                return;
            }

            const dados = await response.json();
            this.cache[tipo] = dados;
            this.cache.lastUpdate = Date.now();

            if (dados && dados.length > 0) {
                console.log(`✅ [Conhecimento] ${dados.length} ${tipo} carregados`);
                
                // Se for vacina, adicionar ao OCR
                if (tipo === 'vacinas' && typeof OCRCartaoV2 !== 'undefined') {
                    dados.forEach(item => {
                        const chave = item.nome.toLowerCase().replace(/\s+/g, '');
                        
                        if (!OCRCartaoV2.vacinasConhecidas[chave]) {
                            OCRCartaoV2.vacinasConhecidas[chave] = {
                                nome: item.nome,
                                tipo: item.metadados?.tipo_vacina || 'Desconhecido',
                                laboratorio: item.fabricante || '',
                                aliases: item.aliases || [item.nome.toLowerCase()],
                                keywords: item.keywords || [item.nome.toLowerCase()],
                                fonte: 'colaborativa'
                            };
                        }
                    });
                }
            }
        } catch (error) {
            console.error(`❌ [Conhecimento] Erro ao carregar ${tipo}:`, error);
        }
    },

    /**
     * Busca conhecimento por texto (para OCR)
     */
    async buscarPorTexto(texto, tipo = null) {
        const textoLimpo = texto.toLowerCase().trim();
        
        try {
            let url = `${this.supabaseUrl}/rest/v1/conhecimento_colaborativo?status=eq.aprovado&select=*`;
            
            if (tipo) {
                url += `&tipo=eq.${tipo}`;
            }

            const response = await fetch(url, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (!response.ok) {
                return [];
            }

            const dados = await response.json();

            // Busca por nome, aliases ou keywords
            return dados.filter(item => {
                const nome = item.nome.toLowerCase();
                const aliases = item.aliases || [];
                const keywords = item.keywords || [];

                // Verifica nome exato
                if (nome.includes(textoLimpo) || textoLimpo.includes(nome)) {
                    return true;
                }

                // Verifica aliases
                if (aliases.some(alias => 
                    alias.toLowerCase().includes(textoLimpo) || 
                    textoLimpo.includes(alias.toLowerCase())
                )) {
                    return true;
                }

                // Verifica keywords
                if (keywords.some(keyword => 
                    textoLimpo.includes(keyword.toLowerCase())
                )) {
                    return true;
                }

                return false;
            });
        } catch (error) {
            console.error('❌ [Conhecimento] Erro ao buscar por texto:', error);
            return [];
        }
    },

    /**
     * Contribui com novo conhecimento
     */
    async contribuir(dados) {
        const {
            tipo,
            nome,
            fabricante,
            descricao,
            aliases,
            keywords,
            metadados
        } = dados;

        // Validação
        if (!tipo || !nome) {
            throw new Error('Tipo e nome são obrigatórios');
        }

        const tiposValidos = ['vacinas', 'vermifugos', 'medicamentos', 'procedimentos', 'exames', 'outros'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error('Tipo inválido');
        }

        try {
            const contribuicao = {
                tipo,
                nome: nome.trim(),
                fabricante: fabricante?.trim() || null,
                descricao: descricao?.trim() || null,
                aliases: aliases || [],
                keywords: keywords || [],
                metadados: metadados || {},
                status: 'pendente',
                contribuidor_id: this.getContribuidorId(),
                votos_positivos: 0,
                votos_negativos: 0,
                created_at: new Date().toISOString()
            };

            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/conhecimento_colaborativo`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(contribuicao)
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao enviar contribuição');
            }

            const resultado = await response.json();

            // Limpa cache
            this.cache[tipo] = [];
            this.cache.lastUpdate = null;

            // Se for vacina, adicionar ao OCR imediatamente (local)
            if (tipo === 'vacinas' && typeof OCRCartaoV2 !== 'undefined') {
                const chave = nome.toLowerCase().replace(/\s+/g, '');
                OCRCartaoV2.vacinasConhecidas[chave] = {
                    nome: nome,
                    tipo: metadados?.tipo_vacina || 'Desconhecido',
                    laboratorio: fabricante || '',
                    aliases: aliases || [nome.toLowerCase()],
                    keywords: keywords || [nome.toLowerCase()],
                    fonte: 'usuario'
                };
            }

            // Registra analytics
            this.registrarAnalytics('contribuicao_enviada', {
                tipo,
                nome,
                status: 'pendente'
            });

            return resultado[0];
        } catch (error) {
            console.error('❌ [Conhecimento] Erro ao contribuir:', error);
            throw error;
        }
    },

    /**
     * Mostra modal de contribuição
     */
    mostrarModalContribuicao(tipo = 'vacinas', textoReconhecido = '') {
        const tipoConfig = this.getTipoConfig(tipo);
        
        const modal = `
            <div class="modal-overlay" id="modal-contribuicao" onclick="if(event.target === this) ConhecimentoColaborativo.fecharModal()">
                <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h2>${tipoConfig.emoji} Contribuir: ${tipoConfig.label}</h2>
                        <button class="btn-close" onclick="ConhecimentoColaborativo.fecharModal()">✕</button>
                    </div>

                    <div class="modal-body">
                        <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                            <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                                💡 <strong>Ajude a comunidade!</strong><br>
                                Sua contribuição ajudará todos os usuários do PetHouse.
                            </p>
                        </div>

                        <form id="form-contribuicao" onsubmit="event.preventDefault(); ConhecimentoColaborativo.salvarContribuicao();">
                            <div class="form-group">
                                <label>Tipo *</label>
                                <select id="contrib-tipo" class="form-control" required>
                                    <option value="vacinas" ${tipo === 'vacinas' ? 'selected' : ''}>💉 Vacina</option>
                                    <option value="vermifugos" ${tipo === 'vermifugos' ? 'selected' : ''}>🐛 Vermífugo</option>
                                    <option value="medicamentos" ${tipo === 'medicamentos' ? 'selected' : ''}>💊 Medicamento/Tratamento</option>
                                    <option value="procedimentos" ${tipo === 'procedimentos' ? 'selected' : ''}>🏥 Procedimento</option>
                                    <option value="exames" ${tipo === 'exames' ? 'selected' : ''}>🔬 Exame</option>
                                    <option value="outros" ${tipo === 'outros' ? 'selected' : ''}>📋 Outro</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Nome *</label>
                                <input type="text" id="contrib-nome" class="form-control" required 
                                       value="${textoReconhecido}"
                                       placeholder="${tipoConfig.placeholder}">
                            </div>

                            <div class="form-group">
                                <label>Fabricante/Laboratório</label>
                                <input type="text" id="contrib-fabricante" class="form-control" 
                                       placeholder="Ex: Zoetis, MSD, Virbac">
                            </div>

                            <div class="form-group">
                                <label>Descrição</label>
                                <textarea id="contrib-descricao" class="form-control" rows="3" 
                                          placeholder="Informações úteis sobre este item"></textarea>
                            </div>

                            <div class="form-group">
                                <label>Nomes Alternativos (um por linha)</label>
                                <textarea id="contrib-aliases" class="form-control" rows="2" 
                                          placeholder="Outras formas como este item pode aparecer"></textarea>
                            </div>

                            <div class="form-group">
                                <label>Palavras-chave (separadas por vírgula)</label>
                                <input type="text" id="contrib-keywords" class="form-control" 
                                       placeholder="Palavras que ajudam a identificar este item">
                            </div>

                            <!-- Campos específicos por tipo -->
                            <div id="campos-especificos"></div>

                            ${textoReconhecido ? `
                            <details style="margin-top: 1rem;">
                                <summary style="cursor: pointer; color: #666; font-size: 0.9rem;">
                                    Ver texto extraído
                                </summary>
                                <pre style="background: #f5f5f5; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.75rem; max-height: 200px; overflow-y: auto;">${textoReconhecido}</pre>
                            </details>
                            ` : ''}

                            <div class="alert alert-info" style="margin-top: 1rem;">
                                <strong>ℹ️ Sua contribuição será revisada</strong><br>
                                Após aprovação, ficará disponível para toda a comunidade!
                            </div>

                            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
                                <button type="button" class="btn" onclick="ConhecimentoColaborativo.fecharModal()">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    ✅ Enviar Contribuição
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);

        // Atualizar campos específicos quando tipo mudar
        document.getElementById('contrib-tipo').addEventListener('change', (e) => {
            this.atualizarCamposEspecificos(e.target.value);
        });

        // Inicializar campos específicos
        this.atualizarCamposEspecificos(tipo);
    },

    /**
     * Atualiza campos específicos por tipo
     */
    atualizarCamposEspecificos(tipo) {
        const container = document.getElementById('campos-especificos');
        
        if (tipo === 'vacinas') {
            container.innerHTML = `
                <div class="form-group">
                    <label>Tipo de Vacina</label>
                    <select id="tipo-vacina" class="form-control">
                        <option value="">Selecione...</option>
                        <option value="V10">V10 (Déctupla)</option>
                        <option value="V8">V8 (Óctupla)</option>
                        <option value="V6">V6 (Sêxtupla)</option>
                        <option value="V4">V4 (Quádrupla)</option>
                        <option value="Antirrábica">Antirrábica</option>
                        <option value="Gripe Canina">Gripe Canina (KC/Tosse dos Canis)</option>
                        <option value="Giárdia">Giárdia</option>
                        <option value="Leishmaniose">Leishmaniose</option>
                        <option value="Outra">Outra</option>
                    </select>
                </div>
            `;
        } else if (tipo === 'vermifugos') {
            container.innerHTML = `
                <div class="form-group">
                    <label>Princípio Ativo</label>
                    <input type="text" id="principio-ativo" class="form-control" 
                           placeholder="Ex: Praziquantel, Ivermectina">
                </div>
            `;
        } else if (tipo === 'medicamentos') {
            container.innerHTML = `
                <div class="form-group">
                    <label>Categoria</label>
                    <select id="categoria-medicamento" class="form-control">
                        <option value="">Selecione...</option>
                        <option value="Antibiótico">Antibiótico</option>
                        <option value="Anti-inflamatório">Anti-inflamatório</option>
                        <option value="Analgésico">Analgésico</option>
                        <option value="Antipulgas">Antipulgas/Carrapatos</option>
                        <option value="Suplemento">Suplemento</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
            `;
        } else {
            container.innerHTML = '';
        }
    },

    /**
     * Salva contribuição
     */
    async salvarContribuicao() {
        const tipo = document.getElementById('contrib-tipo').value;
        const nome = document.getElementById('contrib-nome').value.trim();
        const fabricante = document.getElementById('contrib-fabricante').value.trim();
        const descricao = document.getElementById('contrib-descricao').value.trim();
        
        const aliasesInput = document.getElementById('contrib-aliases').value.trim();
        const keywordsInput = document.getElementById('contrib-keywords').value.trim();
        
        const aliases = aliasesInput ? aliasesInput.split('\n').map(a => a.trim()).filter(a => a) : [];
        const keywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim()).filter(k => k) : [];

        // Metadados específicos por tipo
        const metadados = {};
        
        if (tipo === 'vacinas') {
            const tipoVacina = document.getElementById('tipo-vacina')?.value;
            if (tipoVacina) metadados.tipo_vacina = tipoVacina;
        } else if (tipo === 'vermifugos') {
            const principioAtivo = document.getElementById('principio-ativo')?.value;
            if (principioAtivo) metadados.principio_ativo = principioAtivo;
        } else if (tipo === 'medicamentos') {
            const categoria = document.getElementById('categoria-medicamento')?.value;
            if (categoria) metadados.categoria = categoria;
        }

        try {
            const btn = document.querySelector('#form-contribuicao button[type="submit"]');
            btn.disabled = true;
            btn.textContent = '⏳ Enviando...';

            await this.contribuir({
                tipo,
                nome,
                fabricante,
                descricao,
                aliases,
                keywords,
                metadados
            });

            this.fecharModal();
            
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast(`✅ Contribuição enviada! Obrigado por ajudar a comunidade! 🎉`, 'success');
            }
        } catch (error) {
            if (typeof app !== 'undefined' && app.showToast) { app.showToast('❌ Erro ao enviar contribuição: ' + error.message, 'error'); } else { console.error('Erro ao enviar contribuição:', error); }
            const btn = document.querySelector('#form-contribuicao button[type="submit"]');
            btn.disabled = false;
            btn.textContent = '✅ Enviar Contribuição';
        }
    },

    /**
     * Adiciona botão "Não reconhecido?" no resultado
     */
    adicionarBotaoNaoReconhecido(containerResultado, tipo, textoExtraido) {
        const tipoConfig = this.getTipoConfig(tipo);
        
        const botao = `
            <div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #856404;">
                    ⚠️ <strong>${tipoConfig.label} não reconhecido?</strong>
                </p>
                <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #856404;">
                    Ajude a melhorar o sistema adicionando ao banco de dados!
                </p>
                <button class="btn" onclick="ConhecimentoColaborativo.mostrarModalContribuicao('${tipo}', \`${textoExtraido.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" 
                        style="background: #ffc107; color: #000;">
                    ${tipoConfig.emoji} Adicionar ${tipoConfig.label}
                </button>
            </div>
        `;

        containerResultado.insertAdjacentHTML('beforeend', botao);
    },

    /**
     * Obtém configuração do tipo
     */
    getTipoConfig(tipo) {
        const configs = {
            vacinas: {
                emoji: '💉',
                label: 'Vacina',
                placeholder: 'Ex: Vanguard Plus 5, Nobivac DHPPi'
            },
            vermifugos: {
                emoji: '🐛',
                label: 'Vermífugo',
                placeholder: 'Ex: Drontal Plus, Endogard'
            },
            medicamentos: {
                emoji: '💊',
                label: 'Medicamento',
                placeholder: 'Ex: Rimadyl, Apoquel'
            },
            procedimentos: {
                emoji: '🏥',
                label: 'Procedimento',
                placeholder: 'Ex: Castração, Limpeza Dentária'
            },
            exames: {
                emoji: '🔬',
                label: 'Exame',
                placeholder: 'Ex: Hemograma, Ultrassom'
            },
            outros: {
                emoji: '📋',
                label: 'Outro',
                placeholder: 'Nome do item'
            }
        };

        return configs[tipo] || configs.outros;
    },

    /**
     * Obtém ID único do contribuidor (anônimo)
     */
    getContribuidorId() {
        let id = localStorage.getItem('contribuidor_id');
        if (!id) {
            id = 'contrib_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('contribuidor_id', id);
        }
        return id;
    },

    /**
     * Registra analytics
     */
    async registrarAnalytics(evento, dados) {
        try {
            await fetch(`${this.supabaseUrl}/rest/v1/analytics`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: evento,
                    event_data: dados,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('❌ [Conhecimento] Erro ao registrar analytics:', error);
        }
    },

    /**
     * Fecha modal
     */
    fecharModal() {
        const modal = document.getElementById('modal-contribuicao');
        if (modal) {
            modal.remove();
        }
    }
};

// Inicializar quando o app carregar
if (typeof app !== 'undefined') {
    const originalInit = app.init;
    app.init = function() {
        originalInit.call(this);
        ConhecimentoColaborativo.init();
    };
}

// Manter compatibilidade com código antigo
window.VacinasColaborativas = {
    mostrarModalNovaVacina: (texto) => ConhecimentoColaborativo.mostrarModalContribuicao('vacinas', texto),
    adicionarBotaoVacinaNaoReconhecida: (container, texto) => ConhecimentoColaborativo.adicionarBotaoNaoReconhecido(container, 'vacinas', texto)
};
