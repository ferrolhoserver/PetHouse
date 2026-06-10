// PetHouse - Aplicativo Simplificado e Funcional
// Gestão familiar de pets com prontuário completo

class PetHouse {
    constructor() {
        this.userId = this.getUserId();
        this.data = this.loadData();
        this.currentView = 'home';
        this.currentPet = null;
        this.currentTab = 'peso';
        this.syncEnabled = false;
        this.init();
    }

    async init() {
        // Verificar limite de famílias (protótipo)
        if (window.FamilyLimit && !this.data.familyId) {
            const canCreate = await FamilyLimit.canCreateFamily();
            if (!canCreate) {
                const { current } = await FamilyLimit.checkAvailability();
                FamilyLimit.showFullScreen(current);
                return; // Bloquear acesso
            }
        }
        
        // Inicializar Supabase
        if (window.SupabaseSync) {
            this.syncEnabled = await SupabaseSync.init();
            
            // Tentar carregar dados da nuvem
            if (this.syncEnabled) {
                const result = await SupabaseSync.loadFromCloud();
                if (result.success && result.data) {
                    // Mesclar dados da nuvem com dados locais
                    this.data = result.data;
                    this.saveData(); // Salvar localmente também
                    console.log('☁️ Dados carregados da nuvem');
                }
            }
        }
        
        this.render();
        this.setupEventListeners();
    }

    // ===== GERENCIAMENTO DE DADOS =====
    
    getUserId() {
        // Verifica se já existe um userId no localStorage
        let userId = localStorage.getItem('pethouse_userId');
        
        if (!userId) {
            // Gera um ID único para este usuário/dispositivo
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('pethouse_userId', userId);
        }
        
        return userId;
    }
    
    loadData() {
        // Carrega dados específicos do usuário
        const saved = localStorage.getItem(`pethouse_data_${this.userId}`);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            casaNome: '',
            pets: [],
            membros: []
        };
    }

    async saveData() {
        try {
            // Salva dados específicos do usuário localmente
            localStorage.setItem(`pethouse_data_${this.userId}`, JSON.stringify(this.data));
            
            // Log da ação
            if (window.ErrorLogger) {
                ErrorLogger.logAction('Dados salvos', {
                    totalPets: this.data.pets.length,
                    familyId: this.data.familyId,
                    userId: this.userId
                });
            }
            
            // Track para Analytics
            if (window.Analytics) {
                Analytics.trackAction('save_data', {
                    totalPets: this.data.pets.length,
                    timestamp: new Date().toISOString()
                });
            }
        
        // Sincronizar com a nuvem se disponível
        if (this.syncEnabled && window.SupabaseSync) {
            const result = await SupabaseSync.saveToCloud(this.data);
            if (result.success) {
                this.showToast('Dados salvos e sincronizados! ☁️', 'success');
            } else if (result.offline) {
                this.showToast('Dados salvos localmente! 💾', 'success');
            } else {
                this.showToast('Dados salvos localmente! ⚠️ Erro na nuvem', 'warning');
            }
        } else {
            this.showToast('Dados salvos!', 'success');
        }
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            if (window.ErrorLogger) {
                ErrorLogger.logError({
                    tipo: 'Erro ao Salvar Dados',
                    mensagem: e.message,
                    stack: e.stack
                });
            }
            this.showToast('❌ Erro ao salvar dados!', 'error');
            throw e;
        }
    }

    // ===== RENDERIZAÇÃO =====
    
    render() {
        const app = document.getElementById('app');
        
        if (!this.data.casaNome) {
            app.innerHTML = this.renderSetup();
        } else if (this.currentView === 'home') {
            app.innerHTML = this.renderHome();
        } else if (this.currentView === 'pet') {
            app.innerHTML = this.renderPet();
            
            // Renderizar gráficos se estiver nas abas correspondentes
            if (this.currentTab === 'peso' && window.DashboardPeso) {
                const pet = this.data.pets.find(p => p.id === this.currentPet);
                if (pet) {
                    setTimeout(() => {
                        window.DashboardPeso.criarGrafico(pet);
                    }, 50);
                }
            }
            
            if (this.currentTab === 'banhos_tosas' && window.DashboardBanhoTosa) {
                setTimeout(() => {
                    window.DashboardBanhoTosa.criarGraficoFrequencia();
                }, 50);
            }
        }
    }

    renderSetup() {
        return `
            <div class="container">
                <div class="card" style="max-width: 500px; margin: 2rem auto;">
                    <h2>🏠 Bem-vindo ao PetHouse!</h2>
                    <p>Escolha uma opção para começar:</p>
                    
                    <!-- Opção 1: Criar nova família -->
                    <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h3 style="margin-top: 0;">🆕 Criar Nova Família</h3>
                        <p style="font-size: 0.9rem;">Comece do zero com seus próprios pets</p>
                        <form id="setup-form" class="mt-1">
                            <div class="form-group">
                                <label>Nome da Casa *</label>
                                <input type="text" id="casa-nome" placeholder="Ex: Família Silva" required>
                            </div>
                            <div class="form-group">
                                <label>Email para Recuperação *</label>
                                <input type="email" id="casa-email" placeholder="seu@email.com" required>
                                <small style="color: #666; font-size: 0.85rem;">Usado para recuperar o código da família se esquecer</small>
                            </div>
                            <button type="submit" class="btn btn-primary">🆕 Criar Minha Família</button>
                        </form>
                    </div>
                    
                    <!-- Opção 2: Entrar em família existente -->
                    <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h3 style="margin-top: 0;">👥 Entrar em Família Existente</h3>
                        <p style="font-size: 0.9rem;">Já tem um código? Cole aqui para acessar</p>
                        <form id="join-family-form" class="mt-1">
                            <div class="form-group">
                                <label>Código da Família *</label>
                                <input type="text" id="family-code" placeholder="Cole o código aqui" required>
                            </div>
                            <button type="submit" class="btn btn-success">👥 Entrar na Família</button>
                        </form>
                    </div>
                    
                    <!-- Opção 3: Recuperar código -->
                    <div style="background: #fff3e0; padding: 1rem; border-radius: 8px;">
                        <h3 style="margin-top: 0;">🔑 Esqueci Meu Código</h3>
                        <p style="font-size: 0.9rem;">Recupere seu código usando o email cadastrado</p>
                        <form id="recover-code-form" class="mt-1">
                            <div class="form-group">
                                <label>Email Cadastrado *</label>
                                <input type="email" id="recover-email" placeholder="seu@email.com" required>
                            </div>
                            <button type="submit" class="btn" style="background: #ff9800; color: white;">🔑 Recuperar Código</button>
                        </form>
                    </div>
                    
                    <!-- Opção 4: Usar sem sincronização -->
                    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 2px dashed #ddd;">
                        <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.75rem;">Ou continue sem sincronização (apenas local)</p>
                        <button class="btn" style="background: #999; color: white;" onclick="app.skipSync()">📱 Usar Apenas Neste Dispositivo</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPetCard(pet) {
        // Ícone do animal
        const icone = pet.especie.toLowerCase().includes('gato') || pet.especie.toLowerCase().includes('felino') ? '🐱' : '🐶';
        
        // Peso e tendência
        const pesoInfo = this.calcularPesoComTendencia(pet);
        
        // Status de vacinação
        const vacinaStatus = this.calcularStatusVacinacao(pet);
        
        // Último banho
        const banhoInfo = this.calcularUltimoBanho(pet);
        
        return `
            <div class="pet-item" onclick="app.viewPet('${pet.id}')">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <div style="font-size: 2rem;">${icone}</div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 class="pet-name">${pet.nome}</h3>
                        <p class="pet-info" style="font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pet.especie} • ${pet.raca || 'SRD'}</p>
                    </div>
                </div>
                
                <div>
                    <!-- Peso -->
                    <div style="background: #f5f5f5; padding: 0.4rem; border-radius: 4px; margin-bottom: 0.4rem;">
                        <div style="display: flex; align-items: center; gap: 0.3rem;">
                            <span style="font-size: 0.9rem;">⚖️</span>
                            <span style="font-size: 0.7rem; color: #666; text-transform: uppercase;">Peso</span>
                        </div>
                        <div style="font-weight: bold; font-size: 0.85rem; margin-top: 0.2rem;">
                            ${pesoInfo.valor} ${pesoInfo.tendencia}
                        </div>
                    </div>
                    
                    <!-- Vacinação -->
                    <div style="background: #f5f5f5; padding: 0.4rem; border-radius: 4px; margin-bottom: 0.4rem;">
                        <div style="display: flex; align-items: center; gap: 0.3rem;">
                            <span style="font-size: 0.9rem;">💉</span>
                            <span style="font-size: 0.7rem; color: #666; text-transform: uppercase;">Vacinação</span>
                        </div>
                        <div style="font-size: 0.8rem; margin-top: 0.2rem;">
                            ${vacinaStatus.texto} <span class="pet-stat-badge ${vacinaStatus.classe}">${vacinaStatus.badge}</span>
                        </div>
                    </div>
                    
                    <!-- Banho -->
                    <div style="background: #f5f5f5; padding: 0.4rem; border-radius: 4px;">
                        <div style="display: flex; align-items: center; gap: 0.3rem;">
                            <span style="font-size: 0.9rem;">🛁</span>
                            <span style="font-size: 0.7rem; color: #666; text-transform: uppercase;">Banho</span>
                        </div>
                        <div style="font-size: 0.8rem; margin-top: 0.2rem;">
                            ${banhoInfo.texto} <span class="pet-stat-badge ${banhoInfo.classe}">${banhoInfo.badge}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderHome() {
        const petsHTML = this.data.pets.length > 0 
            ? this.data.pets.map(pet => this.renderPetCard(pet)).join('')
            : '<p class="text-center" style="grid-column: 1 / -1;">Nenhum pet cadastrado ainda.</p>';

        return `
            <div class="header">
                <div class="container">
                    <h1>🐾 ${this.data.casaNome}</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary btn-small" onclick="app.showAddPet()">+ Adicionar Pet</button>
                        <button class="btn btn-success btn-small" onclick="app.exportarBackup()">💾 Salvar</button>
                        <button class="btn btn-info btn-small" onclick="app.restaurarBackup()">📂 Restaurar</button>
                        <button class="btn btn-warning btn-small" onclick="app.mostrarCompartilhamento()">👥 Compartilhar</button>
                        <button class="btn btn-danger btn-small" onclick="ErrorLogger.enviarPorEmail()" title="Reportar problema ou erro">🐛 Reportar</button>
                    </div>
                </div>
            </div>
            
            <div class="container">
                <div class="card">
                    <h2>Meus Pets</h2>
                    <div class="pet-list">
                        ${petsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    renderPet() {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet) {
            this.currentView = 'home';
            this.render();
            return '';
        }

        const tabsData = {
            peso: { title: 'Peso', icon: '⚖️' },
            cuidados: { title: 'Cuidados', icon: '💝' },
            banhos_tosas: { title: 'Cuidados de Higiene', icon: '🛁' },
            cio: { title: 'Cio', icon: '🌸' },
            consultas: { title: 'Consultas', icon: '🏥' },
            cirurgias: { title: 'Cirurgias', icon: '🔬' },
            diagnosticos: { title: 'Diagnósticos', icon: '🔍' },
            tratamentos: { title: 'Tratamentos', icon: '💊' }
        };

        const tabsHTML = Object.keys(tabsData).map(key => `
            <div class="tab ${this.currentTab === key ? 'active' : ''}" 
                 onclick="app.changeTab('${key}')">
                <div class="tab-icon">${tabsData[key].icon}</div>
                <div class="tab-label">${tabsData[key].title}</div>
            </div>
        `).join('');

        const contentHTML = this.renderTabContent(pet);

        // Calcular alertas (MÓDULO NOVO)
        const alertas = window.Alertas ? window.Alertas.calcularTodosAlertas(pet) : null;
        const alertasHTML = alertas ? window.Alertas.renderizarAlertas(alertas, pet) : '';
        
        return `
            <div class="header">
                <div class="container">
                    <div class="flex justify-between">
                        <button class="btn btn-primary btn-small" onclick="app.backToHome()">← Voltar</button>
                        <div>
                            <button class="btn btn-success btn-small" onclick="app.showEditPet('${pet.id}')"> Editar Pet</button>
                            <button class="btn btn-info btn-small" onclick="app.imprimirProntuario('${pet.id}')"> Imprimir</button>
                        </div>
                    </div>
                    <h1>${pet.nome}</h1>
                    <p>${pet.especie} • ${pet.raca || 'SRD'} • ${this.calcularIdade(pet.nascimento)}</p>
                    <p style="font-size: 1.1rem; margin-top: 0.5rem;">${this.calcularPesoAtual(pet)}</p>
                </div>
                
                <!-- Abas movidas para o header -->
                <div class="tabs-header">
                    ${tabsHTML}
                </div>
            </div>
            
            <div class="container">
                ${alertasHTML ? `<div class="card" style="margin-bottom: 1rem; background: #fff3cd;">${alertasHTML}</div>` : ''}
                
                <div class="card" id="alertas-especificos-container"></div>
                
                <div class="card">
                    ${contentHTML}
                </div>
            </div>
            <script>
                // Renderizar alertas específicos após o DOM estar pronto
                setTimeout(() => {
                    const pet = app.data.pets.find(p => p.id === '${pet.id}');
                    if (pet && window.AlertasEspecificos) {
                        window.AlertasEspecificos.renderizar(pet, 'alertas-especificos-container');
                    }
                }, 100);
            </script>
        `;
    }

    renderTabContent(pet) {
        // Usar módulos específicos para novas abas
        
        // Dashboard de Peso
        if (this.currentTab === 'peso' && window.DashboardPeso) {
            return window.DashboardPeso.render(pet);
        }
        
        if (this.currentTab === 'cuidados' && window.Cuidados) {
            return window.Cuidados.renderContent(pet);
        }
        if (this.currentTab === 'cio' && window.ControleCio) {
            return window.ControleCio.renderizar(pet);
        }
        if (this.currentTab === 'diagnosticos' && window.Diagnosticos) {
            return window.Diagnosticos.renderContent(pet);
        }
        if (this.currentTab === 'tratamentos' && window.Tratamentos) {
            return window.Tratamentos.renderContent(pet);
        }
        if (this.currentTab === 'exames' && window.VisualizacaoExames) {
            return window.VisualizacaoExames.renderizar(pet);
        }
        if (this.currentTab === 'banhos_tosas') {
            // SEMPRE usar dashboard profissional
            if (window.DashboardBanhoTosa && window.DashboardBanhoTosa.render) {
                return window.DashboardBanhoTosa.render(pet);
            }
            // Fallback para sistema antigo
            if (window.BanhosTosas) {
            // Inicializar arrays se não existirem
            if (!pet.banhos) pet.banhos = [];
            if (!pet.tosas) pet.tosas = [];
            
            // Migrar dados de banho_tosa se existirem
            if (pet.banho_tosa && pet.banho_tosa.length > 0) {
                pet.banho_tosa.forEach(item => {
                    // Adicionar ID se não existir
                    if (!item.id) {
                        item.id = Date.now() + Math.random();
                    }
                    
                    // Determinar se é banho ou tosa baseado no tipo e observações
                    const textoCompleto = `${item.tipo || ''} ${item.obs || ''}`.toLowerCase();
                    
                    if (textoCompleto.includes('banho') || textoCompleto.includes('bath')) {
                        // É um banho
                        pet.banhos.push({
                            id: item.id,
                            data: item.data,
                            tipo: item.tipo || 'banho_simples',
                            local: item.local || '',
                            profissional: item.profissional || '',
                            produtos: item.produtos || '',
                            obs: item.obs || ''
                        });
                    } else if (textoCompleto.includes('tosa') || textoCompleto.includes('corte') || textoCompleto.includes('grooming')) {
                        // É uma tosa
                        pet.tosas.push({
                            id: item.id,
                            data: item.data,
                            tipo: item.tipo || 'tosa_higienica',
                            estilo: item.estilo || '',
                            local: item.local || '',
                            profissional: item.profissional || '',
                            obs: item.obs || ''
                        });
                    } else {
                        // Se não identificar, considerar como banho por padrão
                        pet.banhos.push({
                            id: item.id,
                            data: item.data,
                            tipo: item.tipo || 'banho_simples',
                            local: item.local || '',
                            profissional: item.profissional || '',
                            produtos: item.produtos || '',
                            obs: item.obs || ''
                        });
                    }
                });
                // Limpar array antigo
                delete pet.banho_tosa;
                this.saveData();
            }
            
            const grafico = window.GraficoBanhos && pet.banhos.length > 0 ? window.GraficoBanhos.gerarGrafico(pet.banhos) : '';
            
            return `
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="app.showAddBanho()">🛁 Adicionar Banho</button>
                    <button class="btn btn-primary" onclick="app.showAddTosa()">✂️ Adicionar Tosa</button>
                </div>
                
                ${grafico}
                
                <h3 style="margin-top: 1.5rem; color: #2196F3;">🛁 Banhos (${pet.banhos.length})</h3>
                ${window.BanhosTosas.renderBanhosList(pet.banhos)}
                
                <h3 style="margin-top: 1.5rem; color: #2196F3;">✂️ Tosas (${pet.tosas.length})</h3>
                ${window.BanhosTosas.renderTosasList(pet.tosas)}
            `;
            }
            // Se nenhum sistema estiver disponível, mostrar mensagem
            return '<p class="text-center">Sistema de Banho & Tosa não disponível.</p>';
        }
        
        // Abas antigas (peso, consultas, cirurgias)
        if (!pet[this.currentTab]) {
            pet[this.currentTab] = [];
        }

        const records = pet[this.currentTab];
        const recordsHTML = records.length > 0
            ? records.map((r, i) => this.renderRecord(r, i)).join('')
            : '<p class="text-center">Nenhum registro ainda.</p>';

        // Renderizar gráfico de peso se estiver na aba de peso
        const graficoHTML = this.currentTab === 'peso' && window.GraficoPeso 
            ? '<div id="grafico-peso-container"></div>' 
            : '';

        return `
            <div class="flex justify-between mb-1">
                <h2>${this.getTabTitle()}</h2>
                <button class="btn btn-primary btn-small" onclick="app.showAddRecord()">+ Adicionar</button>
            </div>
            ${graficoHTML}
            <div class="record-list">
                ${recordsHTML}
            </div>
        `;
    }

    renderRecord(record, index) {
        const date = new Date(record.data).toLocaleDateString('pt-BR');
        
        if (this.currentTab === 'peso') {
            // Formatar peso em gramas
            const pesoGramas = Math.round(record.peso * 1000);
            return `
                <div class="record-item">
                    <div class="flex justify-between">
                        <div>
                            <strong>${date}</strong> - ${pesoGramas} g
                            ${record.obs ? `<br><small>${record.obs}</small>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-small btn-primary" onclick="app.showEditRecord(${index})" style="height: fit-content;">✏️ Editar</button>
                            <button class="btn btn-small" onclick="app.deleteRecord(${index})" style="height: fit-content; background: #f44336; color: white;">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentTab === 'vacinas') {
            const proxima = record.proxima ? new Date(record.proxima).toLocaleDateString('pt-BR') : 'Não agendada';
            return `
                <div class="record-item">
                    <div class="flex justify-between">
                        <div>
                            <strong>${record.nome}</strong><br>
                            Aplicada: ${date}<br>
                            Próxima: ${proxima}
                            ${record.obs ? `<br><small>${record.obs}</small>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-small btn-primary" onclick="app.showEditRecord(${index})" style="height: fit-content;">✏️ Editar</button>
                            <button class="btn btn-small" onclick="app.deleteRecord(${index})" style="height: fit-content; background: #f44336; color: white;">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentTab === 'vermifugo') {
            const proxima = record.proxima ? new Date(record.proxima).toLocaleDateString('pt-BR') : 'Não agendada';
            return `
                <div class="record-item">
                    <div class="flex justify-between">
                        <div>
                            <strong>${record.nome || 'Vermífugo'}</strong><br>
                            Aplicado: ${date}<br>
                            Próxima: ${proxima}
                            ${record.obs ? `<br><small>${record.obs}</small>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-small btn-primary" onclick="app.showEditRecord(${index})" style="height: fit-content;">✏️ Editar</button>
                            <button class="btn btn-small" onclick="app.deleteRecord(${index})" style="height: fit-content; background: #f44336; color: white;">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentTab === 'consultas') {
            return `
                <div class="record-item">
                    <div class="flex justify-between">
                        <div>
                            <strong>${date}</strong><br>
                            Veterinário: ${record.veterinario || 'Não informado'}<br>
                            Motivo: ${record.motivo || 'Consulta de rotina'}
                            ${record.obs ? `<br><small>${record.obs}</small>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-small btn-primary" onclick="app.showEditRecord(${index})" style="height: fit-content;">✏️ Editar</button>
                            <button class="btn btn-small" onclick="app.deleteRecord(${index})" style="height: fit-content; background: #f44336; color: white;">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentTab === 'cirurgias') {
            return `
                <div class="record-item">
                    <div class="flex justify-between">
                        <div>
                            <strong>${record.tipo || 'Cirurgia'}</strong><br>
                            Data: ${date}<br>
                            Veterinário: ${record.veterinario || 'Não informado'}
                            ${record.obs ? `<br><small>${record.obs}</small>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-small btn-primary" onclick="app.showEditRecord(${index})" style="height: fit-content;">✏️ Editar</button>
                            <button class="btn btn-small" onclick="app.deleteRecord(${index})" style="height: fit-content; background: #f44336; color: white;">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentTab === 'exames') {
            return `
                <div class="record-item">
                    <div class="flex justify-between">
                        <div>
                            <strong>${record.tipo || 'Exame'}</strong><br>
                            Data: ${date}<br>
                            Resultado: ${record.resultado || 'Aguardando'}
                            ${record.obs ? `<br><small>${record.obs}</small>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-small btn-primary" onclick="app.showEditRecord(${index})" style="height: fit-content;">✏️ Editar</button>
                            <button class="btn btn-small" onclick="app.deleteRecord(${index})" style="height: fit-content; background: #f44336; color: white;">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // ===== EVENT LISTENERS =====
    
    setupEventListeners() {
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (e.target.id === 'setup-form') {
                this.handleSetup(e);
            } else if (e.target.id === 'join-family-form') {
                this.handleJoinFamily(e);
            } else if (e.target.id === 'recover-code-form') {
                this.handleRecoverCode(e);
            } else if (e.target.id === 'add-pet-form') {
                this.handleAddPet(e);
            } else if (e.target.id === 'add-record-form') {
                this.handleAddRecord(e);
            } else if (e.target.id === 'edit-pet-form') {
                this.handleEditPet(e);
            } else if (e.target.id === 'edit-record-form') {
                this.handleEditRecord(e);
            }
        });
    }

    async handleSetup(e) {
        const casaNome = document.getElementById('casa-nome').value.trim();
        const email = document.getElementById('casa-email').value.trim();
        
        if (!casaNome || !email) {
            alert('❌ Por favor, preencha todos os campos.');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Por favor, insira um email válido.');
            return;
        }
        
        this.data.casaNome = casaNome;
        this.data.email = email;
        
        // Salvar email + código no Supabase
        if (this.syncEnabled && window.SupabaseSync) {
            const result = await SupabaseSync.saveFamilyEmail(this.userId, email);
            if (result.success) {
                this.showToast('✅ Família criada! Email vinculado com sucesso!', 'success');
            } else {
                this.showToast('⚠️ Família criada, mas erro ao vincular email. Tente novamente depois.', 'warning');
            }
        }
        
        this.saveData();
        this.render();
    }
    
    async handleJoinFamily(e) {
        const familyCode = document.getElementById('family-code').value.trim();
        if (!familyCode) {
            alert('❌ Por favor, cole o código da família.');
            return;
        }
        
        // Verificar se Supabase está disponível
        if (!this.syncEnabled || !window.SupabaseSync) {
            alert('⚠️ Sincronização não está disponível. Por favor, use a opção de backup.');
            return;
        }
        
        // Entrar na família
        await SupabaseSync.joinFamily(familyCode);
        
        // Carregar dados da nuvem
        const result = await SupabaseSync.loadFromCloud();
        
        if (result.success && result.data) {
            // Dados encontrados!
            this.data = result.data;
            this.saveData(); // Salvar localmente também
            this.render();
            alert('✅ Bem-vindo! Dados carregados com sucesso.');
        } else {
            alert('❌ Código inválido ou sem dados. Verifique e tente novamente.');
        }
    }
    
    async handleRecoverCode(e) {
        const email = document.getElementById('recover-email').value.trim();
        
        if (!email) {
            alert('❌ Por favor, insira seu email.');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Por favor, insira um email válido.');
            return;
        }
        
        // Verificar se Supabase está disponível
        if (!this.syncEnabled || !window.SupabaseSync) {
            alert('⚠️ Sincronização não está disponível. Verifique sua conexão e tente novamente.');
            return;
        }
        
        // Buscar código pelo email
        const result = await SupabaseSync.recoverFamilyCode(email);
        
        if (result.success && result.familyCode) {
            // Mostrar código em um modal
            this.showModal(`
                <h2>🎉 Código Recuperado!</h2>
                <p>Seu código da família é:</p>
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
                    <h1 style="margin: 0; color: #2196F3; font-family: monospace;">${result.familyCode}</h1>
                </div>
                <p style="font-size: 0.9rem; color: #666;">
                    📝 Anote esse código em um lugar seguro!<br>
                    Você pode usá-lo na opção "Entrar em Família Existente".
                </p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="navigator.clipboard.writeText('${result.familyCode}'); alert('✅ Código copiado!')" class="btn btn-primary" style="flex: 1;">
                        📋 Copiar Código
                    </button>
                    <button onclick="app.closeModal()" class="btn" style="background: #999; color: white; flex: 1;">
                        ❌ Fechar
                    </button>
                </div>
            `);
        } else {
            alert('❌ Email não encontrado. Verifique se digitou corretamente ou crie uma nova família.');
        }
    }

    handleAddPet(e) {
        const nome = document.getElementById('pet-nome').value.trim();
        const especie = document.getElementById('pet-especie').value;
        const sexo = document.getElementById('pet-sexo').value;
        const raca = document.getElementById('pet-raca').value.trim();
        const nascimento = document.getElementById('pet-nascimento').value;
        
        if (!nome || !especie || !sexo || !nascimento) return;
        
        const pet = {
            id: Date.now().toString(),
            nome,
            especie,
            sexo,
            raca,
            nascimento,
            peso: [],
            vacinas: [],
            vermifugo: [],
            consultas: [],
            cios: [], // Registro de cios para fêmeas
            cirurgias: [],
            exames: []
        };
        
        this.data.pets.push(pet);
        this.saveData();
        this.closeModal();
        this.render();
    }

    handleAddRecord(e) {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet) return;
        
        const record = this.getRecordFromForm();
        if (!record) return;
        
        if (!pet[this.currentTab]) {
            pet[this.currentTab] = [];
        }
        
        pet[this.currentTab].push(record);
        this.saveData();
        this.closeModal();
        this.render();
    }
// Handlers de edição para adicionar ao app.js

    handleEditPet(e) {
        const petId = document.getElementById('edit-pet-id').value;
        const nome = document.getElementById('edit-pet-nome').value.trim();
        const especie = document.getElementById('edit-pet-especie').value;
        const sexo = document.getElementById('edit-pet-sexo').value;
        const raca = document.getElementById('edit-pet-raca').value.trim();
        const nascimento = document.getElementById('edit-pet-nascimento').value;
        
        const pet = this.data.pets.find(p => p.id === petId);
        if (!pet) return;
        
        pet.nome = nome;
        pet.especie = especie;
        pet.sexo = sexo;
        pet.raca = raca;
        pet.nascimento = nascimento;
        
        this.saveData();
        this.closeModal();
        this.render();
    }

    handleEditRecord(e) {
        const index = parseInt(document.getElementById('edit-record-index').value);
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet || !pet[this.currentTab] || !pet[this.currentTab][index]) return;
        
        const record = pet[this.currentTab][index];
        
        if (this.currentTab === 'peso') {
            record.data = document.getElementById('edit-record-data').value;
            // Pegar valor em gramas e converter para kg
            const pesoGramas = parseInt(document.getElementById('edit-record-peso').value.replace(/\D/g, '')) || 0;
            record.peso = pesoGramas / 1000; // Converter gramas para kg
            record.obs = document.getElementById('edit-record-obs').value.trim();
        } else if (this.currentTab === 'vacinas') {
            record.nome = document.getElementById('edit-record-nome').value.trim();
            record.data = document.getElementById('edit-record-data').value;
            record.proxima = document.getElementById('edit-record-proxima').value;
            record.obs = document.getElementById('edit-record-obs').value.trim();
        } else if (this.currentTab === 'vermifugo') {
            record.nome = document.getElementById('edit-record-nome').value.trim();
            record.data = document.getElementById('edit-record-data').value;
            record.proxima = document.getElementById('edit-record-proxima').value;
            record.obs = document.getElementById('edit-record-obs').value.trim();
        } else if (this.currentTab === 'consultas') {
            record.data = document.getElementById('edit-record-data').value;
            record.veterinario = document.getElementById('edit-record-vet').value.trim();
            record.motivo = document.getElementById('edit-record-motivo').value.trim();
            record.obs = document.getElementById('edit-record-obs').value.trim();
        } else if (this.currentTab === 'cirurgias') {
            record.tipo = document.getElementById('edit-record-tipo').value.trim();
            record.data = document.getElementById('edit-record-data').value;
            record.veterinario = document.getElementById('edit-record-vet').value.trim();
            record.obs = document.getElementById('edit-record-obs').value.trim();
        } else if (this.currentTab === 'exames') {
            record.tipo = document.getElementById('edit-record-tipo').value.trim();
            record.data = document.getElementById('edit-record-data').value;
            record.resultado = document.getElementById('edit-record-resultado').value.trim();
            record.obs = document.getElementById('edit-record-obs').value.trim();
        }
        
        this.saveData();
        this.closeModal();
        this.render();
    }
    
    deleteRecord(index) {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet || !pet[this.currentTab] || !pet[this.currentTab][index]) return;
        
        // Modal de confirmação customizado (sem confirm() nativo que pode ser bloqueado)
        const modalId = 'delete-record-confirm-modal';
        const existente = document.getElementById(modalId);
        if (existente) existente.remove();
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;padding:1.5rem;max-width:320px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">
                <div style="font-size:2.5rem;margin-bottom:0.75rem;">🗑️</div>
                <h3 style="margin:0 0 0.5rem;color:#333;font-size:1.1rem;">Excluir registro?</h3>
                <p style="margin:0 0 1.25rem;color:#666;font-size:0.9rem;">Esta ação não pode ser desfeita.</p>
                <div style="display:flex;gap:0.75rem;justify-content:center;">
                    <button id="delete-record-cancel" style="flex:1;padding:0.75rem;border:2px solid #ddd;background:white;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#666;font-weight:600;">Cancelar</button>
                    <button id="delete-record-ok" style="flex:1;padding:0.75rem;border:none;background:#f44336;color:white;border-radius:10px;font-size:0.9rem;cursor:pointer;font-weight:700;">Excluir</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('delete-record-cancel').onclick = () => modal.remove();
        document.getElementById('delete-record-ok').onclick = () => {
            modal.remove();
            // Remover o registro
            pet[this.currentTab].splice(index, 1);
            // Salvar e atualizar
            this.saveData();
            this.showToast('✅ Registro excluído com sucesso!', 'success');
            this.render();
        };
    }


    getRecordFromForm() {
        const data = document.getElementById('record-data').value;
        if (!data) return null;
        
        const record = { data };
        
        if (this.currentTab === 'peso') {
            // Pegar valor em gramas e converter para kg
            const pesoGramas = parseInt(document.getElementById('record-peso').value.replace(/\D/g, '')) || 0;
            record.peso = pesoGramas / 1000; // Converter gramas para kg
            record.obs = document.getElementById('record-obs').value.trim();
        } else if (this.currentTab === 'vacinas') {
            record.nome = document.getElementById('record-nome').value.trim();
            record.proxima = document.getElementById('record-proxima').value;
            record.obs = document.getElementById('record-obs').value.trim();
        } else if (this.currentTab === 'vermifugo') {
            record.nome = document.getElementById('record-nome').value.trim();
            record.proxima = document.getElementById('record-proxima').value;
            record.obs = document.getElementById('record-obs').value.trim();
        } else if (this.currentTab === 'consultas') {
            record.veterinario = document.getElementById('record-vet').value.trim();
            record.motivo = document.getElementById('record-motivo').value.trim();
            record.obs = document.getElementById('record-obs').value.trim();
        } else if (this.currentTab === 'cirurgias') {
            record.tipo = document.getElementById('record-tipo').value.trim();
            record.veterinario = document.getElementById('record-vet').value.trim();
            record.obs = document.getElementById('record-obs').value.trim();
        } else if (this.currentTab === 'exames') {
            record.tipo = document.getElementById('record-tipo').value.trim();
            record.resultado = document.getElementById('record-resultado').value.trim();
            record.obs = document.getElementById('record-obs').value.trim();
        }
        
        return record;
    }

    // ===== AÇÕES =====
    
    viewPet(id) {
        this.currentPet = id;
        this.currentView = 'pet';
        this.currentTab = 'peso';
        this.render();
    }

    backToHome() {
        this.currentView = 'home';
        this.currentPet = null;
        this.render();
    }

    changeTab(tab) {
        this.currentTab = tab;
        this.render();
    }

    atualizarRacasPorEspecie() {
        const especieSelect = document.getElementById('pet-especie');
        const racaSelect = document.getElementById('pet-raca');
        
        if (!especieSelect || !racaSelect) return;
        
        const especie = especieSelect.value;
        const racas = window.RacasDB?.[especie] || [];
        
        // Limpar opções atuais
        racaSelect.innerHTML = '';
        
        if (racas.length === 0) {
            racaSelect.innerHTML = '<option value="Não especificado">Não especificado</option>';
            return;
        }
        
        // Adicionar opção SRD primeiro (se existir)
        const srd = racas.find(r => r.nome.includes('SRD') || r.nome.includes('Sem Raça'));
        if (srd) {
            const option = document.createElement('option');
            option.value = srd.nome;
            option.textContent = srd.nome;
            racaSelect.appendChild(option);
        }
        
        // Adicionar outras raças em ordem alfabética
        racas
            .filter(r => !r.nome.includes('SRD') && !r.nome.includes('Sem Raça'))
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .forEach(raca => {
                const option = document.createElement('option');
                option.value = raca.nome;
                option.textContent = raca.nome;
                racaSelect.appendChild(option);
            });
    }

    showAddPet() {
        this.showModal(`
            <div class="modal-header">
                <h2>Adicionar Pet</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="add-pet-form">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="pet-nome" required>
                </div>
                <div class="form-group">
                    <label>Espécie *</label>
                    <select id="pet-especie" required onchange="app.atualizarRacasPorEspecie()">
                        <option value="">Selecione...</option>
                        <option value="Cachorro">Cachorro</option>
                        <option value="Gato">Gato</option>
                        <option value="Pássaro">Pássaro</option>
                        <option value="Réptil">Réptil</option>
                        <option value="Roedor">Roedor</option>
                        <option value="Coelho">Coelho</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sexo *</label>
                    <select id="pet-sexo" required>
                        <option value="">Selecione...</option>
                        <option value="Macho">🐶 Macho</option>
                        <option value="Fêmea">🐶 Fêmea</option>
                        <option value="Não definido">❓ Não definido</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Raça</label>
                    <select id="pet-raca">
                        <option value="SRD">SRD (Sem Raça Definida)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Data de Nascimento *</label>
                    <input type="date" id="pet-nascimento" required>
                </div>
                <button type="submit" class="btn btn-primary">Adicionar</button>
            </form>
        `);
    }

    registrarNovoCio() {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet) return;
        
        if (window.ControleCio && window.ControleCio.mostrarFormularioRegistro) {
            window.ControleCio.mostrarFormularioRegistro(pet, this);
        }
    }

    showAddRecord() {
        const forms = {
            peso: `
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="record-data" required>
                </div>
                <div class="form-group">
                    <label>Peso *</label>
                    <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
                        <div style="flex: 1;">
                            <input type="text" id="record-peso" required placeholder="Ex: 4450 (gramas)" style="width: 100%;" oninput="app.formatPesoInput(this)">
                        </div>
                    </div>
                    <small style="color: #666; display: block; margin-top: 0.25rem;" id="peso-hint">Digite apenas os números (ex: 4450 = 4,450 kg)</small>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="record-obs" rows="3"></textarea>
                </div>
            `,
            vacinas: `
                <div class="form-group">
                    <label>Nome da Vacina *</label>
                    <input type="text" id="record-nome" required>
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="record-data" required>
                </div>
                <div class="form-group">
                    <label>Próxima Dose</label>
                    <input type="date" id="record-proxima">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="record-obs" rows="3"></textarea>
                </div>
            `,
            vermifugo: `
                <div class="form-group">
                    <label>Nome do Vermífugo</label>
                    <input type="text" id="record-nome">
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="record-data" required>
                </div>
                <div class="form-group">
                    <label>Próxima Dose</label>
                    <input type="date" id="record-proxima">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="record-obs" rows="3"></textarea>
                </div>
            `,
            consultas: `
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="record-data" required>
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="record-vet">
                </div>
                <div class="form-group">
                    <label>Motivo</label>
                    <input type="text" id="record-motivo">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="record-obs" rows="3"></textarea>
                </div>
            `,
            cirurgias: `
                <div class="form-group">
                    <label>Tipo de Cirurgia *</label>
                    <input type="text" id="record-tipo" required>
                </div>
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="record-data" required>
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="record-vet">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="record-obs" rows="3"></textarea>
                </div>
            `,
            exames: `
                <div class="form-group">
                    <label>Tipo de Exame *</label>
                    <input type="text" id="record-tipo" required>
                </div>
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="record-data" required>
                </div>
                <div class="form-group">
                    <label>Resultado</label>
                    <input type="text" id="record-resultado">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="record-obs" rows="3"></textarea>
                </div>
            `
        };

        this.showModal(`
            <div class="modal-header">
                <h2>Adicionar ${this.getTabTitle()}</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="add-record-form">
                ${forms[this.currentTab]}
                <button type="submit" class="btn btn-primary">Adicionar</button>
            </form>
        `);
    }
// Funções de edição para adicionar ao app.js

    showEditPet(petId) {
        const pet = this.data.pets.find(p => p.id === petId);
        if (!pet) return;
        
        this.showModal(`
            <div class="modal-header">
                <h2>Editar Pet</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="edit-pet-form">
                <input type="hidden" id="edit-pet-id" value="${petId}">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="edit-pet-nome" value="${pet.nome}" required>
                </div>
                <div class="form-group">
                    <label>Espécie *</label>
                    <select id="edit-pet-especie" required onchange="app.atualizarRacasEdicao()">
                        <option value="Cachorro" ${pet.especie === 'Cachorro' ? 'selected' : ''}>Cachorro</option>
                        <option value="Gato" ${pet.especie === 'Gato' ? 'selected' : ''}>Gato</option>
                        <option value="Pássaro" ${pet.especie === 'Pássaro' ? 'selected' : ''}>Pássaro</option>
                        <option value="Réptil" ${pet.especie === 'Réptil' ? 'selected' : ''}>Réptil</option>
                        <option value="Roedor" ${pet.especie === 'Roedor' ? 'selected' : ''}>Roedor</option>
                        <option value="Coelho" ${pet.especie === 'Coelho' ? 'selected' : ''}>Coelho</option>
                        <option value="Outro" ${pet.especie === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sexo *</label>
                    <select id="edit-pet-sexo" required>
                        <option value="Macho" ${pet.sexo === 'Macho' ? 'selected' : ''}>Macho</option>
                        <option value="Fêmea" ${pet.sexo === 'Fêmea' ? 'selected' : ''}>Fêmea</option>
                        <option value="Não definido" ${pet.sexo === 'Não definido' || !pet.sexo ? 'selected' : ''}>Não definido</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Raça</label>
                    <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                        <select id="edit-pet-raca" style="flex: 1;">
                            <option value="">SRD (Sem Raça Definida)</option>
                        </select>
                        <button type="button" onclick="app.forceReloadRacas()" class="btn btn-small" style="white-space: nowrap; padding: 0.5rem 1rem;">🔄</button>
                    </div>
                    <small id="racas-status" style="color: #666; display: block; margin-top: 0.25rem;">Carregando raças...</small>
                </div>
                <script>
                    // Atualizar raças ao carregar
                    console.log('🚀 [Modal] Iniciando atualização de raças...');
                    setTimeout(() => {
                        console.log('🚀 [Modal] Chamando atualizarRacasEdicao...');
                        if (window.app && window.app.atualizarRacasEdicao) {
                            app.atualizarRacasEdicao();
                            const racaSelect = document.getElementById('edit-pet-raca');
                            if (racaSelect) {
                                racaSelect.value = '${pet.raca || ''}';
                                console.log('🚀 [Modal] Raça restaurada:', racaSelect.value);
                            }
                        } else {
                            console.error('❌ [Modal] app.atualizarRacasEdicao não disponível!');
                        }
                    }, 300);
                </script>
                <div class="form-group">
                    <label>Data de Nascimento *</label>
                    <input type="date" id="edit-pet-nascimento" value="${pet.nascimento}" required>
                </div>
                <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </form>
        `);
    }

    showEditRecord(index) {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet || !pet[this.currentTab] || !pet[this.currentTab][index]) return;
        
        const record = pet[this.currentTab][index];
        let formHTML = '';
        
        if (this.currentTab === 'peso') {
            formHTML = `
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="edit-record-data" value="${record.data}" required>
                </div>
                <div class="form-group">
                    <label>Peso *</label>
                    <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
                        <div style="flex: 1;">
                            <input type="text" id="edit-record-peso" value="${Math.round(record.peso * 1000)}" required style="width: 100%;" oninput="app.formatPesoInput(this)">
                        </div>
                    </div>
                    <small style="color: #666; display: block; margin-top: 0.25rem;" id="peso-hint">Digite apenas os números (ex: 4450 = 4,450 kg)</small>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-record-obs" rows="3">${record.obs || ''}</textarea>
                </div>
            `;
        } else if (this.currentTab === 'vacinas') {
            formHTML = `
                <div class="form-group">
                    <label>Nome da Vacina *</label>
                    <input type="text" id="edit-record-nome" value="${record.nome}" required>
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="edit-record-data" value="${record.data}" required>
                </div>
                <div class="form-group">
                    <label>Próxima Dose</label>
                    <input type="date" id="edit-record-proxima" value="${record.proxima || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-record-obs" rows="3">${record.obs || ''}</textarea>
                </div>
            `;
        } else if (this.currentTab === 'vermifugo') {
            formHTML = `
                <div class="form-group">
                    <label>Nome do Vermífugo</label>
                    <input type="text" id="edit-record-nome" value="${record.nome || ''}">
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="edit-record-data" value="${record.data}" required>
                </div>
                <div class="form-group">
                    <label>Próxima Dose</label>
                    <input type="date" id="edit-record-proxima" value="${record.proxima || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-record-obs" rows="3">${record.obs || ''}</textarea>
                </div>
            `;
        } else if (this.currentTab === 'consultas') {
            formHTML = `
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="edit-record-data" value="${record.data}" required>
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="edit-record-vet" value="${record.veterinario || ''}">
                </div>
                <div class="form-group">
                    <label>Motivo</label>
                    <input type="text" id="edit-record-motivo" value="${record.motivo || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-record-obs" rows="3">${record.obs || ''}</textarea>
                </div>
            `;
        } else if (this.currentTab === 'cirurgias') {
            formHTML = `
                <div class="form-group">
                    <label>Tipo de Cirurgia *</label>
                    <input type="text" id="edit-record-tipo" value="${record.tipo || ''}" required>
                </div>
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="edit-record-data" value="${record.data}" required>
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="edit-record-vet" value="${record.veterinario || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-record-obs" rows="3">${record.obs || ''}</textarea>
                </div>
            `;
        } else if (this.currentTab === 'exames') {
            formHTML = `
                <div class="form-group">
                    <label>Tipo de Exame *</label>
                    <input type="text" id="edit-record-tipo" value="${record.tipo || ''}" required>
                </div>
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="edit-record-data" value="${record.data}" required>
                </div>
                <div class="form-group">
                    <label>Resultado</label>
                    <input type="text" id="edit-record-resultado" value="${record.resultado || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-record-obs" rows="3">${record.obs || ''}</textarea>
                </div>
            `;
        }
        
        this.showModal(`
            <div class="modal-header">
                <h2>Editar ${this.getTabTitle()}</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="edit-record-form">
                <input type="hidden" id="edit-record-index" value="${index}">
                ${formHTML}
                <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </form>
        `);
    }


    // ===== EXPORTAÇÕES =====
    
    exportarBackup() {
        const json = JSON.stringify(this.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pethouse-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Backup exportado!', 'success');
    }

    restaurarBackup() {
        // Criar input file invisível
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    // Validar estrutura básica do backup
                    if (!backupData.casaNome || !Array.isArray(backupData.pets)) {
                        throw new Error('Arquivo de backup inválido');
                    }
                    
                    // Confirmar antes de restaurar
                    if (confirm(`Deseja restaurar o backup "${backupData.casaNome}"?\n\nISTO IRÁ SUBSTITUIR TODOS OS DADOS ATUAIS!`)) {
                        this.data = backupData;
                        this.saveData();
                        this.currentView = 'home';
                        this.currentPet = null;
                        this.render();
                        this.showToast('Backup restaurado com sucesso!', 'success');
                    }
                } catch (error) {
                    alert('Erro ao restaurar backup: ' + error.message);
                    console.error('Erro ao restaurar backup:', error);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    imprimirProntuario(petId) {
        const pet = this.data.pets.find(p => p.id === petId);
        if (window.PDFAvancado) {
            // Usar PDF Avançado com modal de opções
            window.PDFAvancado.mostrarOpcoes(pet, this.data.casaNome);
        } else if (window.PDF) {
            // Fallback para PDF simples
            window.PDF.gerarProntuario(pet, this.data.casaNome);
        } else {
            alert('Módulo PDF não carregado!');
        }
    }

    exportarCalendario() {
        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PetHouse//PT\n';
        
        this.data.pets.forEach(pet => {
            // Vacinas
            if (pet.vacinas) {
                pet.vacinas.forEach(v => {
                    if (v.proxima) {
                        ics += this.createICSEvent(
                            `Vacina ${v.nome} - ${pet.nome}`,
                            v.proxima,
                            `Aplicar vacina ${v.nome} no pet ${pet.nome}`
                        );
                    }
                });
            }
            
            // Vermífugo
            if (pet.vermifugo) {
                pet.vermifugo.forEach(v => {
                    if (v.proxima) {
                        ics += this.createICSEvent(
                            `Vermífugo - ${pet.nome}`,
                            v.proxima,
                            `Aplicar vermífugo no pet ${pet.nome}`
                        );
                    }
                });
            }
        });
        
        ics += 'END:VCALENDAR';
        
        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pethouse-calendario-${new Date().toISOString().split('T')[0]}.ics`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Calendário exportado!', 'success');
    }

    createICSEvent(title, date, description) {
        const d = new Date(date + 'T09:00:00');
        const dateStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        return `BEGIN:VEVENT
UID:${Date.now()}@pethouse
DTSTAMP:${dateStr}
DTSTART:${dateStr}
SUMMARY:${title}
DESCRIPTION:${description}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${title}
END:VALARM
END:VEVENT
`;
    }

    // ===== COMPARTILHAMENTO =====
    
    mostrarCompartilhamento() {
        const familyCode = this.syncEnabled && window.SupabaseSync ? SupabaseSync.getFamilyCode() : null;
        console.log('DEBUG - familyCode:', familyCode);
        console.log('DEBUG - this.data.email:', this.data.email);
        console.log('DEBUG - !this.data.email:', !this.data.email);
        
        const modalContent = `
            <div class="modal-header">
                <h2>👥 Compartilhar Dados</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <!-- DEBUG INFO -->
                <div style="background: #ffeb3b; color: black; padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.75rem;">
                    <strong>DEBUG:</strong><br>
                    familyCode: ${familyCode || 'null'}<br>
                    this.data.email: ${this.data.email || 'undefined'}<br>
                    !this.data.email: ${!this.data.email}<br>
                    Deve mostrar botão: ${familyCode && !this.data.email}
                </div>
                
                ${familyCode ? `
                    <div style="background: #4caf50; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h3 style="margin-top: 0; color: white;">☁️ Sincronização Automática Ativada!</h3>
                        <p style="font-size: 0.9rem; margin: 0.5rem 0;">Seus dados estão sendo sincronizados automaticamente na nuvem.</p>
                        <div style="background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem;">
                            <strong>Código da Família:</strong><br>
                            <code style="font-size: 0.85rem; word-break: break-all;">${familyCode}</code>
                        </div>
                        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Envie este código para outras pessoas da família para que elas possam acessar os mesmos dados.</p>
                        ${!this.data.email ? `
                            <button class="btn" style="background: white; color: #4caf50; margin-top: 0.5rem; width: 100%;" onclick="app.vincularEmail()">
                                📧 Vincular Email para Recuperação
                            </button>
                        ` : `
                            <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">
                                ✅ Email vinculado: ${this.data.email}
                            </p>
                        `}
                    </div>
                ` : ''}
                
                <p style="margin-bottom: 1rem;">Para compartilhar seus dados com outras pessoas, use uma das opções abaixo:</p>
                
                ${familyCode ? `
                    <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h3 style="margin-top: 0;">Opção 1: Compartilhar Código da Família</h3>
                        <p style="font-size: 0.9rem;">1. Copie o código acima<br>
                        2. Envie para a outra pessoa (WhatsApp, SMS, etc.)<br>
                        3. A outra pessoa deve clicar em "👥 Compartilhar" e depois em "Entrar em uma Família"</p>
                        <button class="btn btn-primary btn-small" onclick="app.entrarEmFamilia()" style="margin-top: 0.5rem;">Entrar em uma Família</button>
                    </div>
                ` : ''}
                
                <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h3 style="margin-top: 0;">Opção ${familyCode ? '2' : '1'}: Compartilhar via Backup</h3>
                    <p style="font-size: 0.9rem;">1. Clique em "💾 Salvar" para gerar um backup<br>
                    2. Envie o arquivo para a outra pessoa (WhatsApp, email, etc.)<br>
                    3. A outra pessoa deve clicar em "📂 Restaurar" e selecionar o arquivo</p>
                </div>
                
                <div class="flex justify-end" style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="app.closeModal()">Entendi</button>
                </div>
            </div>
        `;
        document.getElementById('modal-content').innerHTML = modalContent;
        this.openModal();
    }
    
    async entrarEmFamilia() {
        const codigo = prompt('👥 Digite o código da família:');
        if (!codigo) return;
        
        if (!window.SupabaseSync) {
            alert('⚠️ Sincronização não está disponível.');
            return;
        }
        
        // Entrar na família
        await SupabaseSync.joinFamily(codigo);
        
        // Carregar dados da nuvem
        const result = await SupabaseSync.loadFromCloud();
        
        if (result.success && result.data) {
            this.data = result.data;
            this.saveData();
            this.closeModal();
            this.showToast('✅ Dados sincronizados com sucesso!', 'success');
            this.render();
        } else {
            alert('❌ Erro ao carregar dados. Verifique o código.');
        }
    }
    
    async vincularEmail() {
        const email = prompt('📧 Digite seu email para recuperação do código:');
        if (!email) return;
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Por favor, insira um email válido.');
            return;
        }
        
        // Verificar se Supabase está disponível
        if (!this.syncEnabled || !window.SupabaseSync) {
            alert('⚠️ Sincronização não está disponível. Verifique sua conexão e tente novamente.');
            return;
        }
        
        // Obter código da família atual
        const familyCode = SupabaseSync.getFamilyCode();
        if (!familyCode) {
            alert('❌ Erro: Código da família não encontrado.');
            return;
        }
        
        // Salvar email vinculado
        const result = await SupabaseSync.linkEmailToFamily(email, familyCode);
        
        if (result.success) {
            // Atualizar dados locais
            this.data.email = email;
            this.saveData();
            
            // Sincronizar com a nuvem
            await SupabaseSync.saveToCloud(this.data);
            
            this.showToast('✅ Email vinculado com sucesso!', 'success');
            this.closeModal();
            
            // Reabrir modal para mostrar email vinculado
            setTimeout(() => this.mostrarCompartilhamento(), 300);
        } else {
            alert('❌ Erro ao vincular email: ' + (result.error || 'Tente novamente'));
        }
    }

    // ====    // ===== FUNÇÃO DE FORMATAÇÃO AUTOMÁTICA DE PESO =====
    
    formatPesoInput(input) {
        // Remove tudo que não é número
        let valor = input.value.replace(/\D/g, '');
        
        // Limita a 6 dígitos (99.999 kg = 99999 g)
        if (valor.length > 6) {
            valor = valor.substring(0, 6);
        }
        
        // Formata com ponto de milhar e vírgula decimal
        if (valor.length === 0) {
            input.value = '';
        } else if (valor.length <= 3) {
            // Até 999 gramas (0,999 kg)
            input.value = valor;
        } else {
            // Adiciona ponto de milhar
            const kg = valor.slice(0, -3);
            const gramas = valor.slice(-3);
            input.value = `${kg}.${gramas}`;
        }
    }

    // ===== UTILIDADES =====
    
    calcularIdade(nascimento) {
        const hoje = new Date();
        const nasc = new Date(nascimento);
        let anos = hoje.getFullYear() - nasc.getFullYear();
        let meses = hoje.getMonth() - nasc.getMonth();
        
        if (meses < 0) {
            anos--;
            meses += 12;
        }
        
        if (anos > 0 && meses > 0) {
            return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
        } else if (anos > 0) {
            return `${anos} ano${anos > 1 ? 's' : ''}`;
        } else if (meses > 0) {
            return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
        } else {
            return 'Recém-nascido';
        }
    }

    calcularPesoComTendencia(pet) {
        if (!pet.peso || pet.peso.length === 0) {
            return {
                valor: '0 kg',
                tendencia: ''
            };
        }

        const pesosOrdenados = [...pet.peso].sort((a, b) => new Date(b.data) - new Date(a.data));
        const pesoAtual = pesosOrdenados[0];
        const pesoGramas = Math.round(pesoAtual.peso * 1000);
        
        // Calcular tendência (compara com peso de 30 dias atrás)
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        
        const pesoAnterior = pesosOrdenados.find(p => {
            const dataPeso = new Date(p.data);
            return dataPeso <= trintaDiasAtras;
        });
        
        let tendenciaHTML = '';
        if (pesoAnterior && pesoAnterior.peso !== pesoAtual.peso) {
            const variacao = pesoAtual.peso - pesoAnterior.peso;
            const variacaoAbs = Math.abs(variacao).toFixed(2);
            
            if (variacao > 0.1) {
                // Engordando
                const variacaoGramas = Math.round(variacao * 1000);
                tendenciaHTML = `<span class="peso-trend" style="color: #4CAF50;"><span class="peso-trend-icon">📈</span>+${variacaoGramas}g</span>`;
            } else if (variacao < -0.1) {
                // Emagrecendo
                const variacaoGramas = Math.round(Math.abs(variacao) * 1000);
                tendenciaHTML = `<span class="peso-trend" style="color: #f44336;"><span class="peso-trend-icon">📉</span>-${variacaoGramas}g</span>`;
            } else {
                // Estável
                tendenciaHTML = `<span class="peso-trend" style="color: #2196F3;"><span class="peso-trend-icon">➡️</span>Estável</span>`;
            }
        }
        
        return {
            valor: `${pesoGramas} g`,
            tendencia: tendenciaHTML
        };
    }
    
    calcularStatusVacinacao(pet) {
        if (!pet.vacinas || pet.vacinas.length === 0) {
            return {
                texto: 'Sem registro',
                badge: '⚠️',
                classe: 'badge-warning'
            };
        }
        
        const hoje = new Date();
        const vacinasComProxima = pet.vacinas.filter(v => v.proxima);
        
        if (vacinasComProxima.length === 0) {
            return {
                texto: 'Verificar',
                badge: 'ℹ️',
                classe: 'badge-info'
            };
        }
        
        // Encontrar a próxima vacina mais próxima
        const proximasOrdenadas = vacinasComProxima
            .map(v => ({
                ...v,
                dataProxima: new Date(v.proxima)
            }))
            .sort((a, b) => a.dataProxima - b.dataProxima);
        
        const proximaVacina = proximasOrdenadas[0];
        const diasRestantes = Math.ceil((proximaVacina.dataProxima - hoje) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
            return {
                texto: 'Atrasada',
                badge: '🔴 Atrasada',
                classe: 'badge-danger'
            };
        } else if (diasRestantes <= 7) {
            return {
                texto: `Em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`,
                badge: '🟡 Próxima',
                classe: 'badge-warning'
            };
        } else {
            return {
                texto: `Em ${diasRestantes} dias`,
                badge: '🟢 Em dia',
                classe: 'badge-success'
            };
        }
    }
    
    calcularUltimoBanho(pet) {
        // Coletar banhos de AMBOS os formatos (antigo e wizard)
        const todosBanhos = [];
        
        // Formato antigo: pet.banho_tosa
        if (pet.banho_tosa && pet.banho_tosa.length > 0) {
            todosBanhos.push(...pet.banho_tosa);
        }
        
        // Formato antigo: pet.banhos
        if (pet.banhos && pet.banhos.length > 0) {
            todosBanhos.push(...pet.banhos);
        }
        
        // Formato wizard: pet.cuidados_wizard (filtrar apenas banhos)
        if (pet.cuidados_wizard && pet.cuidados_wizard.length > 0) {
            const banhosWizard = pet.cuidados_wizard.filter(c => 
                c.tipo === 'banho' || c.tipo === 'banho_tosa'
            );
            todosBanhos.push(...banhosWizard);
        }
        
        // Se não tem nenhum banho
        if (todosBanhos.length === 0) {
            return {
                texto: 'Sem registro',
                badge: '',
                classe: ''
            };
        }
        
        const banhosOrdenados = [...todosBanhos].sort((a, b) => new Date(b.data) - new Date(a.data));
        const ultimoBanho = banhosOrdenados[0];
        const dataUltimoBanho = new Date(ultimoBanho.data);
        const hoje = new Date();
        const diasDesdeUltimoBanho = Math.floor((hoje - dataUltimoBanho) / (1000 * 60 * 60 * 24));
        
        const dataFormatada = dataUltimoBanho.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        if (diasDesdeUltimoBanho > 15) {
            return {
                texto: `${dataFormatada} (há ${diasDesdeUltimoBanho} dias)`,
                badge: '⚠️ Agendar',
                classe: 'badge-warning'
            };
        } else {
            return {
                texto: `${dataFormatada} (há ${diasDesdeUltimoBanho} dias)`,
                badge: '✅ OK',
                classe: 'badge-success'
            };
        }
    }

    calcularPesoAtual(pet) {
        if (!pet.peso || pet.peso.length === 0) {
            return '⚖️ Peso: 0 kg';
        }

        // Ordenar pesos por data (mais recente primeiro)
        const pesosOrdenados = [...pet.peso].sort((a, b) => new Date(b.data) - new Date(a.data));
        const pesoAtual = pesosOrdenados[0];
        
        // Calcular variação do último mês
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        
        // Encontrar peso de aproximadamente 1 mês atrás
        const pesoAnterior = pesosOrdenados.find(p => {
            const dataPeso = new Date(p.data);
            return dataPeso <= umMesAtras;
        });
        
        let variacaoTexto = '';
        if (pesoAnterior && pesoAnterior.peso !== pesoAtual.peso) {
            const variacao = pesoAtual.peso - pesoAnterior.peso;
            const sinal = variacao > 0 ? '+' : '';
            const cor = variacao > 0 ? '#4CAF50' : '#f44336';
            variacaoTexto = ` <span style="color: ${cor};">(${sinal}${variacao.toFixed(1)} kg no último mês)</span>`;
        }
        
        // Formatar peso em gramas
        const pesoGramas = Math.round(pesoAtual.peso * 1000);
        return `⚖️ Peso: ${pesoGramas} g${variacaoTexto}`;
    }

    getTabTitle() {
        const titles = {
            peso: 'Peso',
            vacinas: 'Vacina',
            vermifugo: 'Vermífugo',
            consultas: 'Consulta',
            cirurgias: 'Cirurgia',
            exames: 'Exame'
        };
        return titles[this.currentTab] || '';
    }

    showModal(content) {
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = content;
        modal.classList.add('show');
    }

    openModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('show');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    atualizarRacasEdicao() {
        console.log('🔍 [Raças] Atualizando raças de edição...');
        
        const especieSelect = document.getElementById('edit-pet-especie');
        const racaSelect = document.getElementById('edit-pet-raca');
        const statusEl = document.getElementById('racas-status');
        
        console.log('🔍 [Raças] Elementos:', { especieSelect, racaSelect });
        
        if (!especieSelect || !racaSelect) {
            console.error('❌ [Raças] Elementos não encontrados!');
            if (statusEl) statusEl.textContent = '❌ Erro: elementos não encontrados';
            return;
        }
        
        const especie = especieSelect.value;
        console.log('🔍 [Raças] Espécie selecionada:', especie);
        console.log('🔍 [Raças] window.RacasDB disponível?', !!window.RacasDB);
        console.log('🔍 [Raças] Raças disponíveis:', window.RacasDB);
        
        if (!window.RacasDB) {
            console.error('❌ [Raças] window.RacasDB não está carregado!');
            if (statusEl) {
                statusEl.innerHTML = '🔄 RacasDB não carregado. Recarregando automaticamente...';
                statusEl.style.color = '#ff9800';
            }
            // Tentar recarregar automaticamente
            setTimeout(() => this.forceReloadRacas(), 500);
            return;
        }
        
        const racas = window.RacasDB[especie] || [];
        console.log('🔍 [Raças] Raças da espécie', especie, ':', racas.length, 'raças');
        
        // Salvar valor atual
        const valorAtual = racaSelect.value;
        
        // Limpar opções
        racaSelect.innerHTML = '<option value="">SRD (Sem Raça Definida)</option>';
        
        // Ordenar raças alfabeticamente
        const racasOrdenadas = [...racas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        
        // Adicionar raças da espécie
        racasOrdenadas.forEach(raca => {
            const option = document.createElement('option');
            option.value = raca.nome;
            option.textContent = raca.nome;
            racaSelect.appendChild(option);
        });
        
        console.log('✅ [Raças] Adicionadas', racas.length, 'raças ao dropdown');
        
        if (statusEl) {
            if (racas.length > 0) {
                statusEl.textContent = `✅ ${racas.length} raças carregadas`;
                statusEl.style.color = '#4caf50';
            } else {
                statusEl.textContent = '⚠️ Nenhuma raça disponível para esta espécie';
                statusEl.style.color = '#ff9800';
            }
        }
        
        // Restaurar valor se existir
        if (valorAtual) {
            racaSelect.value = valorAtual;
        }
    }
    
    forceReloadRacas() {
        const statusEl = document.getElementById('racas-status');
        if (statusEl) {
            statusEl.textContent = '🔄 Recarregando...';
            statusEl.style.color = '#2196f3';
        }
        
        // Forçar recarga do script
        const oldScript = document.querySelector('script[src*="racas_db.js"]');
        if (oldScript) {
            oldScript.remove();
        }
        
        const newScript = document.createElement('script');
        newScript.src = `./js/racas_db.js?v=${Date.now()}`;
        newScript.onload = () => {
            console.log('✅ [Raças] Script recarregado com sucesso!');
            setTimeout(() => this.atualizarRacasEdicao(), 100);
        };
        newScript.onerror = () => {
            console.error('❌ [Raças] Erro ao recarregar script!');
            if (statusEl) {
                statusEl.textContent = '❌ Erro ao recarregar. Tente recarregar a página.';
                statusEl.style.color = '#d32f2f';
            }
        };
        document.head.appendChild(newScript);
    }
    
    /**
     * Pular sincronização e usar apenas localmente
     */
    skipSync() {
        // Marcar que o usuário optou por não sincronizar
        localStorage.setItem('skip_sync', 'true');
        
        // Inicializar dados vazios
        this.data = {
            casaNome: 'Minha Casa',
            pets: []
        };
        
        // Salvar no localStorage
        this.saveData();
        
        // Renderizar
        this.render();
        
        console.log('📱 Usando app apenas localmente (sem sincronização)');
    }
}

// Inicializar aplicativo
let app;
window.addEventListener('DOMContentLoaded', () => {
    // Verificar e exibir consentimento LGPD
    if (window.ConsentManager) {
        const hasConsent = ConsentManager.checkAndShow(() => {
            // Callback após aceitar consentimento
            console.log('✅ Consentimento aceito, inicializando app...');
            initializeApp();
        });
        
        // Se já tem consentimento, inicializar diretamente
        if (hasConsent) {
            initializeApp();
        }
    } else {
        // Fallback se ConsentManager não carregar
        console.warn('⚠️ ConsentManager não disponível, inicializando sem consentimento');
        initializeApp();
    }
});

function initializeApp() {
    // Criar instância do app
    app = new PetHouse();
    
    // Inicializar Analytics
    if (window.Analytics) {
        Analytics.init();
        console.log('📊 Analytics inicializado');
    }
    
    // Restaurar overflow do body (caso tenha sido bloqueado pelo consentimento)
    document.body.style.overflow = '';
}

