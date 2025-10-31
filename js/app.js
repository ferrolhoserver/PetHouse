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
        // Salva dados específicos do usuário localmente
        localStorage.setItem(`pethouse_data_${this.userId}`, JSON.stringify(this.data));
        
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
                            <button type="submit" class="btn btn-primary">🆕 Criar Minha Família</button>
                        </form>
                    </div>
                    
                    <!-- Opção 2: Entrar em família existente -->
                    <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px;">
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
                </div>
            </div>
        `;
    }

    renderHome() {
        const petsHTML = this.data.pets.length > 0 
            ? this.data.pets.map(pet => {
                // Calcular alertas (MÓDULO NOVO)
                const alertas = window.Alertas ? window.Alertas.calcularTodosAlertas(pet) : null;
                const badgeAlertas = alertas && alertas.criticos > 0 
                    ? `<span style="background: #f44336; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; margin-left: 0.5rem;">⚠️ ${alertas.criticos}</span>`
                    : '';
                
                return `
                    <div class="pet-item" onclick="app.viewPet('${pet.id}')">
                        <div class="pet-name">${pet.nome} ${badgeAlertas}</div>
                        <div class="pet-info">
                            ${pet.especie} • ${pet.raca || 'SRD'} • ${this.calcularIdade(pet.nascimento)}
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="text-center">Nenhum pet cadastrado ainda.</p>';

        return `
            <div class="header">
                <div class="container">
                    <h1>🐾 ${this.data.casaNome}</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary btn-small" onclick="app.showAddPet()">+ Adicionar Pet</button>
                        <button class="btn btn-success btn-small" onclick="app.exportarBackup()">💾 Salvar</button>
                        <button class="btn btn-info btn-small" onclick="app.restaurarBackup()">📂 Restaurar</button>
                        <button class="btn btn-warning btn-small" onclick="app.mostrarCompartilhamento()">👥 Compartilhar</button>
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
        const alertasHTML = alertas ? window.Alertas.renderizarAlertas(alertas) : '';
        
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
                
                <div class="card">
                    ${contentHTML}
                </div>
            </div>
        `;
    }

    renderTabContent(pet) {
        // Usar módulos específicos para novas abas
        if (this.currentTab === 'cuidados' && window.Cuidados) {
            return window.Cuidados.renderContent(pet);
        }
        if (this.currentTab === 'diagnosticos' && window.Diagnosticos) {
            return window.Diagnosticos.renderContent(pet);
        }
        if (this.currentTab === 'tratamentos' && window.Tratamentos) {
            return window.Tratamentos.renderContent(pet);
        }
        
        // Abas antigas (peso, consultas, cirurgias)
        if (!pet[this.currentTab]) {
            pet[this.currentTab] = [];
        }

        const records = pet[this.currentTab];
        const recordsHTML = records.length > 0
            ? records.map((r, i) => this.renderRecord(r, i)).join('')
            : '<p class="text-center">Nenhum registro ainda.</p>';

        return `
            <div class="flex justify-between mb-1">
                <h2>${this.getTabTitle()}</h2>
                <button class="btn btn-primary btn-small" onclick="app.showAddRecord()">+ Adicionar</button>
            </div>
            <div class="record-list">
                ${recordsHTML}
            </div>
        `;
    }

    renderRecord(record, index) {
        const date = new Date(record.data).toLocaleDateString('pt-BR');
        
        if (this.currentTab === 'peso') {
            // Formatar peso com até 3 casas decimais (remove zeros desnecessários)
            const pesoFormatado = parseFloat(record.peso).toFixed(3).replace(/\.?0+$/, '');
            return `
                <div class="record-item">
                    <div class="flex justify-between">
                        <div>
                            <strong>${date}</strong> - ${pesoFormatado} kg
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

    handleSetup(e) {
        const casaNome = document.getElementById('casa-nome').value.trim();
        if (!casaNome) return;
        
        this.data.casaNome = casaNome;
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
            this.showToast('✅ Você entrou na família com sucesso!', 'success');
            this.render();
        } else if (result.firstTime) {
            // Código válido mas ainda sem dados
            alert('⚠️ Este código é válido, mas ainda não há dados cadastrados. Aguarde o administrador da família cadastrar os pets.');
        } else {
            // Erro ao carregar
            alert('❌ Erro ao entrar na família. Verifique o código e tente novamente.');
        }
    }

    handleAddPet(e) {
        const nome = document.getElementById('pet-nome').value.trim();
        const especie = document.getElementById('pet-especie').value;
        const raca = document.getElementById('pet-raca').value.trim();
        const nascimento = document.getElementById('pet-nascimento').value;
        
        if (!nome || !especie || !nascimento) return;
        
        const pet = {
            id: Date.now().toString(),
            nome,
            especie,
            raca,
            nascimento,
            peso: [],
            vacinas: [],
            vermifugo: [],
            consultas: [],
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
        const raca = document.getElementById('edit-pet-raca').value.trim();
        const nascimento = document.getElementById('edit-pet-nascimento').value;
        
        const pet = this.data.pets.find(p => p.id === petId);
        if (!pet) return;
        
        pet.nome = nome;
        pet.especie = especie;
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
            let pesoValue = parseFloat(document.getElementById('edit-record-peso').value);
            
            // Verificar se está em modo gramas e converter para kg
            const button = document.getElementById('toggle-peso-unit');
            if (button && button.textContent === 'g') {
                pesoValue = pesoValue / 1000; // Converter gramas para kg
            }
            
            record.peso = pesoValue;
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
        
        // Confirmar exclusão
        const confirmMsg = '⚠️ Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.';
        if (!confirm(confirmMsg)) return;
        
        // Remover o registro
        pet[this.currentTab].splice(index, 1);
        
        // Salvar e atualizar
        this.saveData();
        this.showToast('✅ Registro excluído com sucesso!', 'success');
        this.render();
    }


    getRecordFromForm() {
        const data = document.getElementById('record-data').value;
        if (!data) return null;
        
        const record = { data };
        
        if (this.currentTab === 'peso') {
            let pesoValue = parseFloat(document.getElementById('record-peso').value);
            
            // Verificar se está em modo gramas e converter para kg
            const button = document.getElementById('toggle-peso-unit');
            if (button && button.textContent === 'g') {
                pesoValue = pesoValue / 1000; // Converter gramas para kg
            }
            
            record.peso = pesoValue;
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
                    <select id="pet-especie" required>
                        <option value="">Selecione...</option>
                        <option value="Cachorro">Cachorro</option>
                        <option value="Gato">Gato</option>
                        <option value="Pássaro">Pássaro</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Raça</label>
                    <input type="text" id="pet-raca" placeholder="SRD">
                </div>
                <div class="form-group">
                    <label>Data de Nascimento *</label>
                    <input type="date" id="pet-nascimento" required>
                </div>
                <button type="submit" class="btn btn-primary">Adicionar</button>
            </form>
        `);
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
                            <input type="number" id="record-peso" step="0.001" required placeholder="Ex: 4.450" style="width: 100%;">
                        </div>
                        <button type="button" id="toggle-peso-unit" onclick="app.togglePesoUnit()" class="btn" style="background: #2196F3; color: white; padding: 0.75rem 1rem; min-width: 60px;">kg</button>
                    </div>
                    <small style="color: #666; display: block; margin-top: 0.25rem;" id="peso-hint">Digite o peso em quilogramas</small>
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
                    <select id="edit-pet-especie" required>
                        <option value="Cachorro" ${pet.especie === 'Cachorro' ? 'selected' : ''}>Cachorro</option>
                        <option value="Gato" ${pet.especie === 'Gato' ? 'selected' : ''}>Gato</option>
                        <option value="Pássaro" ${pet.especie === 'Pássaro' ? 'selected' : ''}>Pássaro</option>
                        <option value="Outro" ${pet.especie === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Raça</label>
                    <input type="text" id="edit-pet-raca" value="${pet.raca || ''}" placeholder="SRD">
                </div>
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
                            <input type="number" id="edit-record-peso" value="${record.peso}" step="0.001" required style="width: 100%;">
                        </div>
                        <button type="button" id="toggle-peso-unit" onclick="app.togglePesoUnit()" class="btn" style="background: #2196F3; color: white; padding: 0.75rem 1rem; min-width: 60px;">kg</button>
                    </div>
                    <small style="color: #666; display: block; margin-top: 0.25rem;" id="peso-hint">Digite o peso em quilogramas</small>
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
        if (window.PDF) {
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
        
        const modalContent = `
            <div class="modal-header">
                <h2>👥 Compartilhar Dados</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                ${familyCode ? `
                    <div style="background: #4caf50; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h3 style="margin-top: 0; color: white;">☁️ Sincronização Automática Ativada!</h3>
                        <p style="font-size: 0.9rem; margin: 0.5rem 0;">Seus dados estão sendo sincronizados automaticamente na nuvem.</p>
                        <div style="background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem;">
                            <strong>Código da Família:</strong><br>
                            <code style="font-size: 0.85rem; word-break: break-all;">${familyCode}</code>
                        </div>
                        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Envie este código para outras pessoas da família para que elas possam acessar os mesmos dados.</p>
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

    // ===== FUNÇÃO DE ALTERNÂNCIA DE UNIDADE DE PESO =====
    
    togglePesoUnit() {
        const button = document.getElementById('toggle-peso-unit');
        const input = document.getElementById('record-peso') || document.getElementById('edit-record-peso');
        const hint = document.getElementById('peso-hint');
        
        if (!button || !input) return;
        
        const currentUnit = button.textContent;
        const currentValue = parseFloat(input.value) || 0;
        
        if (currentUnit === 'kg') {
            // Mudar para gramas
            button.textContent = 'g';
            button.style.background = '#4CAF50';
            hint.textContent = 'Digite o peso em gramas';
            input.placeholder = 'Ex: 4450';
            input.step = '1';
            
            // Converter valor atual de kg para g
            if (currentValue > 0) {
                input.value = (currentValue * 1000).toFixed(0);
            }
        } else {
            // Mudar para kg
            button.textContent = 'kg';
            button.style.background = '#2196F3';
            hint.textContent = 'Digite o peso em quilogramas';
            input.placeholder = 'Ex: 4.450';
            input.step = '0.001';
            
            // Converter valor atual de g para kg
            if (currentValue > 0) {
                input.value = (currentValue / 1000).toFixed(3);
            }
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
        
        // Formatar peso com até 3 casas decimais (remove zeros desnecessários)
        const pesoFormatado = parseFloat(pesoAtual.peso).toFixed(3).replace(/\.?0+$/, '');
        return `⚖️ Peso: ${pesoFormatado} kg${variacaoTexto}`;
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
}

// Inicializar aplicativo
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new PetHouse();
});

