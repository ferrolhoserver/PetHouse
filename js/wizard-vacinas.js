/**
 * Wizard Minimalista para Vacinas
 * Fluxo rápido e intuitivo com auto-cálculo de próxima dose
 */

const WizardVacinas = {
    etapaAtual: 1,
    dados: {},
    
    // Vacinas comuns (WSAVA Core + Não-Core)
    vacinas: [
        // Core (essenciais)
        { id: 'v8', nome: 'V8 (Óctupla)', icon: '💉', intervalo: 21, doses: 3, cor: '#2196F3', core: true },
        { id: 'v10', nome: 'V10 (Déctupla)', icon: '💉', intervalo: 21, doses: 3, cor: '#2196F3', core: true },
        { id: 'raiva', nome: 'Antirrábica', icon: '🦠', intervalo: 365, doses: 1, cor: '#f44336', core: true },
        { id: 'gripe', nome: 'Gripe Canina', icon: '🤧', intervalo: 365, doses: 1, cor: '#FF9800', core: true },
        
        // Não-Core (opcionais)
        { id: 'giardia', nome: 'Giárdia', icon: '🦠', intervalo: 21, doses: 2, cor: '#9C27B0', core: false },
        { id: 'leishmaniose', nome: 'Leishmaniose', icon: '🦟', intervalo: 21, doses: 3, cor: '#795548', core: false },
        { id: 'tosse', nome: 'Tosse dos Canis', icon: '😷', intervalo: 365, doses: 1, cor: '#607D8B', core: false }
    ],
    
    // Locais
    locais: [
        { id: 'veterinario', nome: 'Veterinário', icon: '🏥' },
        { id: 'petshop', nome: 'Pet Shop', icon: '🏪' },
        { id: 'campanha', nome: 'Campanha Pública', icon: '🚑' },
        { id: 'domicilio', nome: 'Atendimento Domiciliar', icon: '🏠' }
    ],
    
    iniciar() {
        this.etapaAtual = 1;
        this.dados = {};
        this.mostrarModal();
    },
    
    mostrarModal() {
        const modal = document.createElement('div');
        modal.id = 'wizard-vacina-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem;animation:fadeIn 0.2s';
        
        modal.innerHTML = `
            <div style="background:white;border-radius:20px;max-width:500px;width:100%;max-height:90vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
                ${this.renderEtapa()}
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    renderEtapa() {
        const progresso = `
            <div style="padding:1.5rem 1.5rem 0 1.5rem">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                    <h3 style="margin:0;font-size:1.3rem">💉 Nova Vacina</h3>
                    <button onclick="document.getElementById('wizard-vacina-modal').remove()" style="background:none;border:none;font-size:1.5rem;color:#999;cursor:pointer">×</button>
                </div>
                <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem">
                    ${[1,2,3].map(n => `
                        <div style="flex:1;height:4px;background:${n <= this.etapaAtual ? '#2196F3' : '#e0e0e0'};border-radius:2px;transition:all 0.3s"></div>
                    `).join('')}
                </div>
            </div>
        `;
        
        if (this.etapaAtual === 1) {
            return progresso + this.renderEtapa1();
        } else if (this.etapaAtual === 2) {
            return progresso + this.renderEtapa2();
        } else {
            return progresso + this.renderEtapa3();
        }
    },
    
    renderEtapa1() {
        return `
            <div style="padding:0 1.5rem 1.5rem 1.5rem;max-height:60vh;overflow-y:auto">
                <p style="color:#666;margin:0 0 1rem 0;font-size:1.1rem">Qual vacina?</p>
                
                <div style="margin-bottom:1rem">
                    <div style="font-size:0.85rem;font-weight:600;color:#4CAF50;margin-bottom:0.75rem">✓ ESSENCIAIS (WSAVA Core)</div>
                    <div style="display:grid;gap:0.75rem">
                        ${this.vacinas.filter(v => v.core).map(vac => `
                            <button onclick="WizardVacinas.selecionarVacina('${vac.id}')" 
                                    style="padding:1rem;border:2px solid #e0e0e0;border-radius:12px;background:white;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:0.75rem;text-align:left"
                                    onmouseover="this.style.borderColor='${vac.cor}';this.style.transform='translateX(4px)'"
                                    onmouseout="this.style.borderColor='#e0e0e0';this.style.transform='translateX(0)'">
                                <div style="font-size:2rem">${vac.icon}</div>
                                <div style="flex:1">
                                    <div style="font-weight:600;margin-bottom:0.25rem">${vac.nome}</div>
                                    <div style="font-size:0.85rem;color:#999">${vac.doses} dose(s) • Intervalo: ${vac.intervalo} dias</div>
                                </div>
                                <div style="font-size:1.2rem;color:#ccc">›</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <div style="font-size:0.85rem;font-weight:600;color:#FF9800;margin-bottom:0.75rem">⚠ OPCIONAIS (Não-Core)</div>
                    <div style="display:grid;gap:0.75rem">
                        ${this.vacinas.filter(v => !v.core).map(vac => `
                            <button onclick="WizardVacinas.selecionarVacina('${vac.id}')" 
                                    style="padding:1rem;border:2px solid #e0e0e0;border-radius:12px;background:white;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:0.75rem;text-align:left"
                                    onmouseover="this.style.borderColor='${vac.cor}';this.style.transform='translateX(4px)'"
                                    onmouseout="this.style.borderColor='#e0e0e0';this.style.transform='translateX(0)'">
                                <div style="font-size:2rem">${vac.icon}</div>
                                <div style="flex:1">
                                    <div style="font-weight:600;margin-bottom:0.25rem">${vac.nome}</div>
                                    <div style="font-size:0.85rem;color:#999">${vac.doses} dose(s) • Intervalo: ${vac.intervalo} dias</div>
                                </div>
                                <div style="font-size:1.2rem;color:#ccc">›</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderEtapa2() {
        const vacinaSelecionada = this.vacinas.find(v => v.id === this.dados.vacina);
        return `
            <div style="padding:0 1.5rem 1.5rem 1.5rem">
                <button onclick="WizardVacinas.voltarEtapa()" style="background:none;border:none;color:#666;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
                    ‹ Voltar
                </button>
                <p style="color:#666;margin:0 0 1.5rem 0;font-size:1.1rem">Onde foi aplicada?</p>
                <div style="display:grid;gap:1rem">
                    ${this.locais.map(local => `
                        <button onclick="WizardVacinas.selecionarLocal('${local.id}')" 
                                style="padding:1.25rem;border:2px solid #e0e0e0;border-radius:12px;background:white;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:1rem;text-align:left"
                                onmouseover="this.style.borderColor='${vacinaSelecionada.cor}';this.style.transform='scale(1.02)'"
                                onmouseout="this.style.borderColor='#e0e0e0';this.style.transform='scale(1)'">
                            <div style="font-size:2.5rem">${local.icon}</div>
                            <div style="flex:1">
                                <div style="font-weight:600;font-size:1.1rem">${local.nome}</div>
                            </div>
                            <div style="font-size:1.2rem;color:#ccc">›</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderEtapa3() {
        const vacinaSelecionada = this.vacinas.find(v => v.id === this.dados.vacina);
        const localSelecionado = this.locais.find(l => l.id === this.dados.local);
        
        return `
            <div style="padding:0 1.5rem 1.5rem 1.5rem;max-height:70vh;overflow-y:auto">
                <button onclick="WizardVacinas.voltarEtapa()" style="background:none;border:none;color:#666;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
                    ‹ Voltar
                </button>
                
                <div style="background:linear-gradient(135deg,${vacinaSelecionada.cor}15,${vacinaSelecionada.cor}05);padding:1rem;border-radius:12px;margin-bottom:1.5rem">
                    <div style="display:flex;align-items:center;gap:0.5rem;font-size:1.1rem;font-weight:600;margin-bottom:0.5rem">
                        ${vacinaSelecionada.icon} ${vacinaSelecionada.nome}
                    </div>
                    <div style="font-size:0.9rem;color:#666">${localSelecionado.icon} ${localSelecionado.nome}</div>
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Data da Aplicação</label>
                    <input type="date" id="wizard-vac-data" value="${UtilsData.hoje()}" 
                           onchange="WizardVacinas.calcularProxima()"
                           style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem">
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Dose</label>
                    <select id="wizard-vac-dose" onchange="WizardVacinas.calcularProxima()"
                            style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem">
                        ${Array.from({length: vacinaSelecionada.doses}, (_, i) => `
                            <option value="${i+1}">${i+1}ª dose${i+1 === vacinaSelecionada.doses ? ' (última)' : ''}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div id="proxima-dose-info" style="margin-bottom:1.5rem;padding:1rem;background:#e3f2fd;border-radius:12px;border-left:4px solid #2196F3">
                    <div style="font-weight:600;margin-bottom:0.25rem">📅 Próxima Dose</div>
                    <div style="font-size:0.9rem;color:#666" id="proxima-dose-texto">Calculando...</div>
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Lote (opcional)</label>
                    <input type="text" id="wizard-vac-lote" placeholder="Ex: ABC123"
                           style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem">
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Veterinário (opcional)</label>
                    <input type="text" id="wizard-vac-vet" placeholder="Nome do veterinário"
                           style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem">
                </div>
                
                <button onclick="WizardVacinas.finalizar()" 
                        style="width:100%;padding:1.25rem;border:none;border-radius:12px;background:linear-gradient(135deg,${vacinaSelecionada.cor},${vacinaSelecionada.cor}dd);color:white;font-size:1.1rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px ${vacinaSelecionada.cor}40">
                    ✓ Salvar Vacina
                </button>
            </div>
            <script>WizardVacinas.calcularProxima();</script>
        `;
    },
    
    selecionarVacina(vacina) {
        this.dados.vacina = vacina;
        this.etapaAtual = 2;
        this.atualizarModal();
    },
    
    selecionarLocal(local) {
        this.dados.local = local;
        this.etapaAtual = 3;
        this.atualizarModal();
    },
    
    voltarEtapa() {
        this.etapaAtual--;
        this.atualizarModal();
    },
    
    atualizarModal() {
        const modal = document.getElementById('wizard-vacina-modal');
        if (modal) {
            modal.querySelector('div').innerHTML = this.renderEtapa();
        }
    },
    
    calcularProxima() {
        const vacinaSelecionada = this.vacinas.find(v => v.id === this.dados.vacina);
        const data = document.getElementById('wizard-vac-data')?.value;
        const dose = parseInt(document.getElementById('wizard-vac-dose')?.value || 1);
        
        if (!data) return;
        
        const proximaData = UtilsData.adicionarDias(data, vacinaSelecionada.intervalo);
        
        const texto = document.getElementById('proxima-dose-texto');
        if (texto) {
            if (dose >= vacinaSelecionada.doses) {
                texto.innerHTML = `<strong>Última dose!</strong> Reforço anual em ${UtilsData.formatarBR(proximaData)}`;
            } else {
                texto.innerHTML = `${(dose + 1)}ª dose em <strong>${UtilsData.formatarBR(proximaData)}</strong> (${vacinaSelecionada.intervalo} dias)`;
            }
        }
    },
    
    finalizar() {
        try {
            console.log('Finalizando wizard vacinas...');
            
            // Acessar app global (sem window)
            if (typeof app === 'undefined') {
                alert('Erro: app não encontrado');
                return;
            }
            
            const pet = app.data.pets.find(p => p.id === app.currentPet);
            if (!pet) {
                alert('Erro: pet não encontrado');
                return;
            }
        
            const data = document.getElementById('wizard-vac-data')?.value;
            if (!data) {
                alert('Por favor, informe a data');
                return;
            }
        
            if (!pet.vacinas_wizard) pet.vacinas_wizard = [];
        
            const vacinaSelecionada = this.vacinas.find(v => v.id === this.dados.vacina);
            const localSelecionado = this.locais.find(l => l.id === this.dados.local);
            const dose = parseInt(document.getElementById('wizard-vac-dose')?.value || 1);
            
            if (!vacinaSelecionada || !localSelecionado) {
                alert('Erro: dados incompletos');
                return;
            }
        
            // Calcular próxima dose
            const proximaData = UtilsData.adicionarDias(data, vacinaSelecionada.intervalo);
        
            const vacina = {
                id: Date.now(),
                vacina: this.dados.vacina,
                vacinaNome: vacinaSelecionada.nome,
                vacinaIcon: vacinaSelecionada.icon,
                vacinaCor: vacinaSelecionada.cor,
                local: this.dados.local,
                localNome: localSelecionado.nome,
                localIcon: localSelecionado.icon,
                data: data,
                dose: dose,
                totalDoses: vacinaSelecionada.doses,
                proximaDose: dose < vacinaSelecionada.doses ? proximaData : null,
                lote: document.getElementById('wizard-vac-lote')?.value || '',
                veterinario: document.getElementById('wizard-vac-vet')?.value || ''
            };
        
            console.log('Salvando vacina:', vacina);
            
            pet.vacinas_wizard.push(vacina);
            
            // Recalcular próximas doses de todas as vacinas do mesmo tipo
            WizardVacinas.recalcularProximasDoses(pet, this.dados.vacina);
            
            app.saveData();
            
            console.log('Vacina salva com sucesso!');
            
            // Fechar modal
            const modal = document.getElementById('wizard-vacina-modal');
            if (modal) modal.remove();
            
            // Recarregar detalhes do pet
            if (app.loadPetDetails) {
                app.loadPetDetails(pet.id);
            } else {
                app.render();
            }
            
            alert('✅ Vacina salva com sucesso!');
        } catch (error) {
            console.error('Erro ao finalizar wizard vacinas:', error);
            alert('❌ Erro ao salvar: ' + error.message);
        }
    },
    
    /**
     * Recalcula próximas doses de todas as vacinas do mesmo tipo
     * Ordena por data e recalcula baseado no protocolo
     */
    recalcularProximasDoses(pet, tipoVacina) {
        try {
            console.log('Recalculando próximas doses para:', tipoVacina);
            
            // Filtrar vacinas do mesmo tipo
            const vacinasMesmoTipo = pet.vacinas_wizard.filter(v => v.vacina === tipoVacina);
            
            if (vacinasMesmoTipo.length === 0) return;
            
            // Ordenar por data (mais antiga primeiro)
            vacinasMesmoTipo.sort((a, b) => UtilsData.diferencaDias(b.data, a.data));
            
            // Pegar informações da vacina
            const vacinaInfo = this.vacinas.find(v => v.id === tipoVacina);
            if (!vacinaInfo) return;
            
            // Recalcular doses e próximas datas
            vacinasMesmoTipo.forEach((vac, index) => {
                // Atualizar número da dose
                vac.dose = index + 1;
                
                // Calcular próxima dose
                if (vac.dose < vacinaInfo.doses) {
                    vac.proximaDose = UtilsData.adicionarDias(vac.data, vacinaInfo.intervalo);
                } else {
                    // Última dose - próxima é o reforço anual
                    vac.proximaDose = null;
                }
            });
            
            console.log('Doses recalculadas:', vacinasMesmoTipo);
        } catch (error) {
            console.error('Erro ao recalcular doses:', error);
        }
    }
};

window.WizardVacinas = WizardVacinas;
console.log('✅ Wizard Vacinas carregado');
