/**
 * Wizard Minimalista para Cuidados de Higiene
 * UX inspirada em apps premium com fluxo rápido e intuitivo
 */

const WizardCuidados = {
    etapaAtual: 1,
    dados: {},
    
    // Tipos de cuidados
    tipos: [
        { id: 'banho', nome: 'Banho', icon: '🛁', cor: '#2196F3' },
        { id: 'tosa', nome: 'Tosa', icon: '✂️', cor: '#9C27B0' },
        { id: 'banho_tosa', nome: 'Banho + Tosa', icon: '🛁✂️', cor: '#4CAF50' }
    ],
    
    // Locais
    locais: [
        { id: 'casa', nome: 'Em Casa', icon: '🏠' },
        { id: 'petshop', nome: 'Pet Shop', icon: '🏪' },
        { id: 'veterinario', nome: 'Veterinário', icon: '🏥' }
    ],
    
    // Adicionais rápidos
    adicionais: [
        { id: 'corte_unhas', nome: 'Corte de Unhas', icon: '✂️' },
        { id: 'limpeza_ouvido', nome: 'Limpeza de Ouvido', icon: '👂' },
        { id: 'escovacao_dental', nome: 'Escovação Dental', icon: '🦷' },
        { id: 'perfume', nome: 'Perfume', icon: '💐' },
        { id: 'hidratacao', nome: 'Hidratação', icon: '💧' }
    ],
    
    iniciar() {
        this.etapaAtual = 1;
        this.dados = {};
        this.mostrarModal();
    },
    
    mostrarModal() {
        const modal = document.createElement('div');
        modal.id = 'wizard-modal';
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
                    <h3 style="margin:0;font-size:1.3rem">Adicionar Cuidado</h3>
                    <button onclick="document.getElementById('wizard-modal').remove()" style="background:none;border:none;font-size:1.5rem;color:#999;cursor:pointer">×</button>
                </div>
                <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem">
                    ${[1,2,3].map(n => `
                        <div style="flex:1;height:4px;background:${n <= this.etapaAtual ? '#4CAF50' : '#e0e0e0'};border-radius:2px;transition:all 0.3s"></div>
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
            <div style="padding:0 1.5rem 1.5rem 1.5rem">
                <p style="color:#666;margin:0 0 1.5rem 0;font-size:1.1rem">Que tipo de cuidado?</p>
                <div style="display:grid;gap:1rem">
                    ${this.tipos.map(tipo => `
                        <button onclick="WizardCuidados.selecionarTipo('${tipo.id}')" 
                                style="padding:1.5rem;border:2px solid #e0e0e0;border-radius:16px;background:white;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:1rem;text-align:left"
                                onmouseover="this.style.transform='scale(1.02)';this.style.borderColor='${tipo.cor}';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'"
                                onmouseout="this.style.transform='scale(1)';this.style.borderColor='#e0e0e0';this.style.boxShadow='none'">
                            <div style="font-size:3rem">${tipo.icon}</div>
                            <div style="flex:1">
                                <div style="font-size:1.2rem;font-weight:600;margin-bottom:0.25rem">${tipo.nome}</div>
                                <div style="font-size:0.9rem;color:#999">Toque para selecionar</div>
                            </div>
                            <div style="font-size:1.5rem;color:#ccc">›</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderEtapa2() {
        const tipoSelecionado = this.tipos.find(t => t.id === this.dados.tipo);
        return `
            <div style="padding:0 1.5rem 1.5rem 1.5rem">
                <button onclick="WizardCuidados.voltarEtapa()" style="background:none;border:none;color:#666;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
                    ‹ Voltar
                </button>
                <p style="color:#666;margin:0 0 1.5rem 0;font-size:1.1rem">Onde foi feito?</p>
                <div style="display:grid;gap:1rem">
                    ${this.locais.map(local => `
                        <button onclick="WizardCuidados.selecionarLocal('${local.id}')" 
                                style="padding:1.5rem;border:2px solid #e0e0e0;border-radius:16px;background:white;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:1rem;text-align:left"
                                onmouseover="this.style.transform='scale(1.02)';this.style.borderColor='${tipoSelecionado.cor}';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'"
                                onmouseout="this.style.transform='scale(1)';this.style.borderColor='#e0e0e0';this.style.boxShadow='none'">
                            <div style="font-size:3rem">${local.icon}</div>
                            <div style="flex:1">
                                <div style="font-size:1.2rem;font-weight:600;margin-bottom:0.25rem">${local.nome}</div>
                                <div style="font-size:0.9rem;color:#999">Toque para selecionar</div>
                            </div>
                            <div style="font-size:1.5rem;color:#ccc">›</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderEtapa3() {
        const tipoSelecionado = this.tipos.find(t => t.id === this.dados.tipo);
        const localSelecionado = this.locais.find(l => l.id === this.dados.local);
        
        // Se for tosa, mostrar tipos de tosa
        const mostrarTiposTosa = tipoSelecionado.id === 'tosa' || tipoSelecionado.id === 'banho_tosa';
        const tiposTosa = [
            { id: 'higienica', nome: 'Higiênica' },
            { id: 'completa', nome: 'Completa' },
            { id: 'baby', nome: 'Baby' },
            { id: 'gemea', nome: 'Gêmea' },
            { id: 'tesoura', nome: 'Na Tesoura' },
            { id: 'raca', nome: 'De Raça' },
            { id: 'verao', nome: 'De Verão' }
        ];
        
        return `
            <div style="padding:0 1.5rem 1.5rem 1.5rem;max-height:70vh;overflow-y:auto">
                <button onclick="WizardCuidados.voltarEtapa()" style="background:none;border:none;color:#666;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
                    ‹ Voltar
                </button>
                
                <div style="background:linear-gradient(135deg,${tipoSelecionado.cor}15,${tipoSelecionado.cor}05);padding:1rem;border-radius:12px;margin-bottom:1.5rem">
                    <div style="display:flex;align-items:center;gap:0.5rem;font-size:1.1rem;font-weight:600">
                        ${tipoSelecionado.icon} ${tipoSelecionado.nome} ${localSelecionado.icon} ${localSelecionado.nome}
                    </div>
                </div>
                
                ${mostrarTiposTosa ? `
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.75rem;font-weight:600;color:#333">Tipo de Tosa</label>
                    <select id="wizard-tipo-tosa" style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem">
                        ${tiposTosa.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                    </select>
                </div>` : ''}
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:#333">Data</label>
                    <input type="date" id="wizard-data" value="${new Date().toISOString().split('T')[0]}" 
                           style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem">
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:#333">Valor (opcional)</label>
                    <input type="number" id="wizard-valor" step="0.01" placeholder="R$ 0,00"
                           style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem">
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.75rem;font-weight:600;color:#333">Adicionais (opcional)</label>
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem">
                        ${this.adicionais.map(add => `
                            <label style="display:flex;align-items:center;gap:0.5rem;padding:0.75rem;border:2px solid #e0e0e0;border-radius:12px;cursor:pointer;transition:all 0.2s"
                                   onmouseover="this.style.borderColor='${tipoSelecionado.cor}';this.style.background='${tipoSelecionado.cor}10'"
                                   onmouseout="this.style.borderColor='#e0e0e0';this.style.background='white'">
                                <input type="checkbox" name="wizard-add" value="${add.id}" style="width:20px;height:20px;accent-color:${tipoSelecionado.cor}">
                                <span style="font-size:0.9rem">${add.icon} ${add.nome}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:#333">Observações (opcional)</label>
                    <textarea id="wizard-obs" rows="3" placeholder="Comportamento, produtos utilizados..."
                              style="width:100%;padding:1rem;border:2px solid #e0e0e0;border-radius:12px;font-size:1rem;resize:vertical"></textarea>
                </div>
                
                <button onclick="WizardCuidados.finalizar()" 
                        style="width:100%;padding:1.25rem;border:none;border-radius:12px;background:linear-gradient(135deg,${tipoSelecionado.cor},${tipoSelecionado.cor}dd);color:white;font-size:1.1rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px ${tipoSelecionado.cor}40;transition:all 0.2s"
                        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px ${tipoSelecionado.cor}60'"
                        onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px ${tipoSelecionado.cor}40'">
                    ✓ Salvar Cuidado
                </button>
            </div>
        `;
    },
    
    selecionarTipo(tipo) {
        this.dados.tipo = tipo;
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
        const modal = document.getElementById('wizard-modal');
        if (modal) {
            modal.querySelector('div').innerHTML = this.renderEtapa();
        }
    },
    
    finalizar() {
        try {
            console.log('Finalizando wizard...');
            
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
            
            const data = document.getElementById('wizard-data')?.value;
            if (!data) {
                alert('Por favor, informe a data');
                return;
            }
            
            const valor = parseFloat(document.getElementById('wizard-valor')?.value) || 0;
            const obs = document.getElementById('wizard-obs')?.value || '';
            const adicionais = Array.from(document.querySelectorAll('input[name="wizard-add"]:checked')).map(cb => cb.value);
            const tipoTosa = document.getElementById('wizard-tipo-tosa')?.value || null;
            
            // Inicializar array se não existir
            if (!pet.cuidados_wizard) pet.cuidados_wizard = [];
            
            const tipoInfo = this.tipos.find(t => t.id === this.dados.tipo);
            const localInfo = this.locais.find(l => l.id === this.dados.local);
            
            if (!tipoInfo || !localInfo) {
                alert('Erro: dados incompletos');
                return;
            }
            
            const cuidado = {
                id: Date.now(),
                tipo: this.dados.tipo,
                tipoNome: tipoInfo.nome,
                tipoIcon: tipoInfo.icon,
                tipoCor: tipoInfo.cor,
                tipoTosa: tipoTosa,
                local: this.dados.local,
                localNome: localInfo.nome,
                localIcon: localInfo.icon,
                data: data,
                valor: valor,
                adicionais: adicionais,
                obs: obs
            };
            
            console.log('Salvando cuidado:', cuidado);
            
            pet.cuidados_wizard.push(cuidado);
            app.saveData();
            
            console.log('Cuidado salvo com sucesso!');
            
            // Fechar modal
            const modal = document.getElementById('wizard-modal');
            if (modal) modal.remove();
            
            // Recarregar detalhes do pet
            if (app.loadPetDetails) {
                app.loadPetDetails(pet.id);
            } else {
                // Fallback: recarregar página
                app.render();
            }
            
            alert('✅ Cuidado salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao finalizar wizard:', error);
            alert('❌ Erro ao salvar: ' + error.message);
        }
    }
};

// Substituir sistema antigo pelo wizard
const _originalRenderBanhosTab = PetHouse.prototype.renderTabContent;
PetHouse.prototype.renderTabContent = function(pet) {
    if (this.currentTab === 'banhos_tosas') {
        // Inicializar array
        if (!pet.cuidados_wizard) pet.cuidados_wizard = [];
        
        // Renderizar lista de cuidados
        const lista = pet.cuidados_wizard.length > 0 ? 
            pet.cuidados_wizard.sort((a,b) => new Date(b.data) - new Date(a.data)).map(c => {
                const dataFormatada = new Date(c.data).toLocaleDateString('pt-BR');
                const adicionaisHTML = c.adicionais && c.adicionais.length > 0 ? 
                    `<div style="margin-top:0.5rem;font-size:0.85rem;color:#666">+ ${c.adicionais.map(a => WizardCuidados.adicionais.find(ad => ad.id === a)?.nome || a).join(', ')}</div>` : '';
                
                return `
                    <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:4px solid ${c.tipoCor}">
                        <div style="display:flex;justify-content:space-between;align-items:start">
                            <div style="flex:1">
                                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap">
                                    <span style="font-size:1.5rem">${c.tipoIcon}</span>
                                    <strong style="font-size:1.1rem">${c.tipoNome}</strong>
                                    ${c.tipoTosa ? `<span style="background:${c.tipoCor}20;color:${c.tipoCor};padding:0.25rem 0.5rem;border-radius:8px;font-size:0.85rem;font-weight:600">${c.tipoTosa.charAt(0).toUpperCase() + c.tipoTosa.slice(1)}</span>` : ''}
                                    <span style="font-size:1.2rem">${c.localIcon}</span>
                                    <span style="color:#666">${c.localNome}</span>
                                </div>
                                <div style="color:#666;font-size:0.95rem">
                                    <div style="margin-bottom:0.25rem">📅 ${dataFormatada}</div>
                                    ${c.valor > 0 ? `<div style="color:#4CAF50;font-weight:600">💰 R$ ${c.valor.toFixed(2)}</div>` : ''}
                                </div>
                                ${c.obs ? `<div style="margin-top:0.75rem;padding:0.75rem;background:#f8f9fa;border-radius:8px;font-size:0.9rem">${c.obs}</div>` : ''}
                                ${adicionaisHTML}
                            </div>
                            <button onclick="if(confirm('Deletar?')){const pet=window.app.data.pets.find(p=>p.id===window.app.currentPet);pet.cuidados_wizard=pet.cuidados_wizard.filter(x=>x.id!==${c.id});window.app.saveData();window.app.loadPetDetails(pet.id)}" 
                                    style="background:#f44336;color:white;padding:0.5rem 0.75rem;border-radius:8px;border:none;cursor:pointer;font-size:1.2rem">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('') : '<p style="text-align:center;color:#999;padding:2rem">Nenhum cuidado registrado ainda</p>';
        
        return `
            <div style="margin-bottom:1.5rem">
                <button onclick="WizardCuidados.iniciar()" 
                        style="width:100%;padding:1.25rem;border:none;border-radius:16px;background:linear-gradient(135deg,#4CAF50,#66bb6a);color:white;font-size:1.2rem;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(76,175,80,0.3);transition:all 0.2s"
                        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 24px rgba(76,175,80,0.4)'"
                        onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(76,175,80,0.3)'">
                    ➕ Adicionar Cuidado
                </button>
            </div>
            
            <h3 style="margin:2rem 0 1rem 0;color:#333;font-size:1.3rem">Histórico (${pet.cuidados_wizard.length})</h3>
            ${lista}
        `;
    }
    
    return _originalRenderBanhosTab.call(this, pet);
};

// CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    input:focus, textarea:focus {
        outline: none !important;
        border-color: #4CAF50 !important;
        box-shadow: 0 0 0 3px rgba(76,175,80,0.1) !important;
    }
`;
document.head.appendChild(style);

window.WizardCuidados = WizardCuidados;
console.log('✅ Wizard Cuidados carregado');
