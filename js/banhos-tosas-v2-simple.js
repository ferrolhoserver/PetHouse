/**
 * Banhos e Tosas V2 - Sistema Profissional SIMPLIFICADO
 * Adiciona apenas um botão extra SEM modificar o sistema existente
 * Armazena em pet.servicos_profissionais (novo array)
 */

const BanhosTosasV2Simple = {
    // Tipos de serviços
    tipos: {
        banho_simples: { nome: 'Banho Simples', icon: '🛁', cat: 'banho' },
        banho_completo: { nome: 'Banho Completo', icon: '🛁', cat: 'banho' },
        banho_seco: { nome: 'Banho Seco', icon: '🛁', cat: 'banho' },
        banho_terapeutico: { nome: 'Banho Terapêutico', icon: '💊', cat: 'banho' },
        tosa_higienica: { nome: 'Tosa Higiênica', icon: '✂️', cat: 'tosa' },
        tosa_completa: { nome: 'Tosa Completa', icon: '✂️', cat: 'tosa' },
        tosa_tesoura: { nome: 'Tosa na Tesoura', icon: '✂️', cat: 'tosa' },
        tosa_bebe: { nome: 'Tosa Bebê', icon: '✂️', cat: 'tosa' },
        tosa_raca: { nome: 'Tosa de Raça', icon: '✂️', cat: 'tosa' },
        tosa_verao: { nome: 'Tosa de Verão', icon: '☀️', cat: 'tosa' },
        banho_tosa_higienica: { nome: 'Banho + Tosa Higiênica', icon: '🛁✂️', cat: 'combinado' },
        banho_tosa_completa: { nome: 'Banho + Tosa Completa', icon: '🛁✂️', cat: 'combinado' }
    },

    // Adicionais
    adicionais: {
        corte_unhas: { nome: 'Corte de Unhas', icon: '✂️' },
        limpeza_ouvido: { nome: 'Limpeza de Ouvido', icon: '👂' },
        escovacao_dental: { nome: 'Escovação Dental', icon: '🦷' },
        perfume: { nome: 'Perfume', icon: '💐' },
        laco: { nome: 'Laço/Bandana', icon: '🎀' },
        hidratacao: { nome: 'Hidratação', icon: '💧' }
    },

    mostrarModal() {
        const pet = window.app.data.pets.find(p => p.id === window.app.currentPet);
        if (!pet) return;

        const modal = document.createElement('div');
        modal.id = 'modal-v2';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem';
        
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;padding:1.5rem">
                <h3 style="margin:0 0 1rem 0">🛁 Novo Serviço Profissional</h3>
                
                <div style="margin-bottom:1rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Tipo de Serviço *</label>
                    <select id="v2-tipo" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:8px">
                        <option value="">Selecione...</option>
                        ${Object.entries(this.tipos).map(([k,v]) => `<option value="${k}">${v.icon} ${v.nome}</option>`).join('')}
                    </select>
                </div>
                
                <div style="margin-bottom:1rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Data *</label>
                    <input type="date" id="v2-data" value="${new Date().toISOString().split('T')[0]}" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:8px">
                </div>
                
                <div style="margin-bottom:1rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Local</label>
                    <input type="text" id="v2-local" placeholder="Ex: Pet Shop XYZ" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:8px">
                </div>
                
                <div style="margin-bottom:1rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Profissional</label>
                    <input type="text" id="v2-prof" placeholder="Nome do profissional" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:8px">
                </div>
                
                <div style="margin-bottom:1rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Valor (R$)</label>
                    <input type="number" id="v2-valor" step="0.01" placeholder="0.00" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:8px">
                </div>
                
                <div style="margin-bottom:1rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Adicionais</label>
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem">
                        ${Object.entries(this.adicionais).map(([k,v]) => `
                            <label style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem;border:1px solid #e0e0e0;border-radius:8px;cursor:pointer">
                                <input type="checkbox" name="v2-add" value="${k}">
                                <span style="font-size:0.9rem">${v.icon} ${v.nome}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom:1.5rem">
                    <label style="display:block;margin-bottom:0.5rem;font-weight:600">Observações</label>
                    <textarea id="v2-obs" rows="3" placeholder="Comportamento, produtos..." style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:8px"></textarea>
                </div>
                
                <div style="display:flex;gap:0.5rem">
                    <button onclick="document.getElementById('modal-v2').remove()" style="flex:1;padding:0.75rem;border:1px solid #ddd;border-radius:8px;background:white;cursor:pointer">Cancelar</button>
                    <button onclick="BanhosTosasV2Simple.salvar()" style="flex:1;padding:0.75rem;border:none;border-radius:8px;background:#4CAF50;color:white;font-weight:600;cursor:pointer">💾 Salvar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    salvar() {
        const tipo = document.getElementById('v2-tipo').value;
        const data = document.getElementById('v2-data').value;
        
        if (!tipo || !data) {
            if (window.app && window.app.showToast) window.app.showToast('⚠️ Preencha tipo e data', 'error');
            return;
        }

        const pet = window.app.data.pets.find(p => p.id === window.app.currentPet);
        if (!pet) return;

        // Inicializar array se não existir
        if (!pet.servicos_profissionais) pet.servicos_profissionais = [];

        const adicionais = Array.from(document.querySelectorAll('input[name="v2-add"]:checked')).map(cb => cb.value);

        const servico = {
            id: Date.now(),
            tipo: tipo,
            descricao: this.tipos[tipo].nome,
            categoria: this.tipos[tipo].cat,
            data: data,
            local: document.getElementById('v2-local').value,
            profissional: document.getElementById('v2-prof').value,
            valor: parseFloat(document.getElementById('v2-valor').value) || 0,
            adicionais: adicionais,
            obs: document.getElementById('v2-obs').value
        };

        pet.servicos_profissionais.push(servico);
        window.app.saveData();
        
        document.getElementById('modal-v2').remove();
                window.app.loadPetDetails(pet.id);
        if (window.app && window.app.showToast) window.app.showToast('✅ Serviço salvo!', 'success');
    },

    renderLista(servicos) {
        if (!servicos || servicos.length === 0) {
            return '<p style="text-align:center;color:#999;padding:1rem">Nenhum serviço profissional registrado</p>';
        }

        return servicos.sort((a,b) => new Date(b.data) - new Date(a.data)).map(s => {
            const tipo = this.tipos[s.tipo] || {};
            const dataFormatada = new Date(s.data).toLocaleDateString('pt-BR');
            
            let adicionaisHTML = '';
            if (s.adicionais && s.adicionais.length > 0) {
                const nomes = s.adicionais.map(a => this.adicionais[a]?.nome || a).join(', ');
                adicionaisHTML = `<div style="margin-top:0.5rem;font-size:0.85rem;color:#666">+ ${nomes}</div>`;
            }

            return `
                <div style="background:white;border-radius:12px;padding:1rem;margin-bottom:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
                    <div style="display:flex;justify-content:space-between;align-items:start">
                        <div style="flex:1">
                            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                                <span style="font-size:1.5rem">${tipo.icon}</span>
                                <strong>${s.descricao}</strong>
                                <span style="background:#4CAF50;color:white;padding:0.25rem 0.5rem;border-radius:12px;font-size:0.75rem">${s.categoria}</span>
                            </div>
                            <div style="color:#666;font-size:0.9rem">
                                <div>📅 ${dataFormatada}</div>
                                ${s.local ? `<div>📍 ${s.local}</div>` : ''}
                                ${s.profissional ? `<div>👤 ${s.profissional}</div>` : ''}
                                ${s.valor > 0 ? `<div style="color:#4CAF50;font-weight:600">💰 R$ ${s.valor.toFixed(2)}</div>` : ''}
                            </div>
                            ${s.obs ? `<div style="margin-top:0.5rem;padding:0.5rem;background:#f5f5f5;border-radius:8px;font-size:0.85rem">${s.obs}</div>` : ''}
                            ${adicionaisHTML}
                        </div>
                        <button onclick="BanhosTosasV2Simple.deletar(${s.id})" style="background:#f44336;color:white;padding:0.5rem;border-radius:8px;border:none;cursor:pointer">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    deletar(id) {
        const _m = document.createElement('div');
        _m.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
        _m.innerHTML = `<div style="background:white;border-radius:16px;padding:1.5rem;max-width:320px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;"><div style="font-size:2.5rem;margin-bottom:0.75rem;">🗑️</div><h3 style="margin:0 0 0.5rem;color:#333;font-size:1.1rem;">Excluir serviço?</h3><p style="margin:0 0 1.25rem;color:#666;font-size:0.9rem;">Esta ação não pode ser desfeita.</p><div style="display:flex;gap:0.75rem;"><button id="_svc" style="flex:1;padding:0.75rem;border:2px solid #ddd;background:white;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#666;font-weight:600;">Cancelar</button><button id="_svo" style="flex:1;padding:0.75rem;border:none;background:#f44336;color:white;border-radius:10px;font-size:0.9rem;cursor:pointer;font-weight:700;">Excluir</button></div></div>`;
        document.body.appendChild(_m);
        document.getElementById('_svc').onclick = () => _m.remove();
        document.getElementById('_svo').onclick = () => {
            _m.remove();
            const pet = window.app.data.pets.find(p => p.id === window.app.currentPet);
            if (!pet) return;
            pet.servicos_profissionais = pet.servicos_profissionais.filter(s => s.id !== id);
            window.app.saveData();
            window.app.loadPetDetails(pet.id);
            if (window.app.showToast) window.app.showToast('✅ Serviço excluído!', 'success');
        };
    }
};

// Adicionar botão extra na aba banhos_tosas
// Interceptar renderTabContent APENAS para adicionar botão
const _originalRenderTabContent = PetHouse.prototype.renderTabContent;
PetHouse.prototype.renderTabContent = function(pet) {
    const originalHTML = _originalRenderTabContent.call(this, pet);
    
    // Se for a aba banhos_tosas, adicionar botão e lista
    if (this.currentTab === 'banhos_tosas') {
        // Inicializar array se não existir
        if (!pet.servicos_profissionais) pet.servicos_profissionais = [];
        
        const botaoExtra = `
            <button class="btn btn-primary" onclick="BanhosTosasV2Simple.mostrarModal()" style="background:linear-gradient(135deg,#4CAF50 0%,#66bb6a 100%);border:none">
                ✨ Novo Serviço Profissional
            </button>
        `;
        
        const listaServicos = pet.servicos_profissionais.length > 0 ? `
            <h3 style="margin-top:2rem;color:#4CAF50">✨ Serviços Profissionais (${pet.servicos_profissionais.length})</h3>
            ${BanhosTosasV2Simple.renderLista(pet.servicos_profissionais)}
        ` : '';
        
        // Inserir botão logo após os botões existentes
        return originalHTML.replace(
            '</div>',
            `${botaoExtra}</div>${listaServicos}`
        );
    }
    
    return originalHTML;
};

window.BanhosTosasV2Simple = BanhosTosasV2Simple;
console.log('✅ Banhos & Tosas V2 Simple carregado');
