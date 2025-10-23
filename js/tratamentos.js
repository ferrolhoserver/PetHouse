/**
 * Módulo Tratamentos
 * Gerencia tratamentos e medicações dos pets
 */

const Tratamentos = {
    /**
     * Renderiza o conteúdo da aba Tratamentos
     */
    renderContent(pet) {
        if (!pet.tratamentos) pet.tratamentos = [];
        
        // Ordenar por data (mais recente primeiro)
        const tratamentos = [...pet.tratamentos].sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let html = `
            <div class="tab-content">
                <div class="flex justify-between align-center" style="margin-bottom: 1rem;">
                    <h3>💊 Tratamentos</h3>
                    <button class="btn btn-primary" onclick="Tratamentos.showAddModal()">+ Adicionar</button>
                </div>
        `;
        
        if (tratamentos.length === 0) {
            html += '<p class="text-muted">Nenhum tratamento registrado ainda.</p>';
        } else {
            tratamentos.forEach((t, idx) => {
                html += this.renderTratamento(t, idx);
            });
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * Renderiza um tratamento
     */
    renderTratamento(tratamento, index) {
        const date = new Date(tratamento.data).toLocaleDateString('pt-BR');
        const preco = tratamento.preco ? `R$ ${parseFloat(tratamento.preco).toFixed(2)}` : null;
        
        return `
            <div class="record-item">
                <div class="flex justify-between">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <strong style="font-size: 1.1rem;">${tratamento.tratamento}</strong>
                            ${preco ? `<span class="badge" style="background: #4CAF50; color: white; font-size: 0.75rem;">${preco}</span>` : ''}
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            <div>📅 ${date}</div>
                            ${tratamento.medicacao ? `<div>💊 ${tratamento.medicacao}</div>` : ''}
                            ${tratamento.dosagem ? `<div>📏 Dosagem: ${tratamento.dosagem}</div>` : ''}
                            ${tratamento.duracao ? `<div>⏱️ Duração: ${tratamento.duracao}</div>` : ''}
                            ${tratamento.veterinario ? `<div>👨‍⚕️ ${tratamento.veterinario}</div>` : ''}
                            ${tratamento.obs ? `<div style="margin-top: 0.5rem;">${tratamento.obs}</div>` : ''}
                        </div>
                    </div>
                    <button class="btn btn-small btn-primary" onclick="Tratamentos.showEditModal(${index})" style="height: fit-content;">✏️</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Mostra modal para adicionar tratamento
     */
    showAddModal() {
        const modalContent = `
            <div class="modal-header">
                <h2>Adicionar Tratamento</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="tratamento-form" onsubmit="Tratamentos.handleAdd(event); return false;">
                <div class="form-group">
                    <label>Data de Início *</label>
                    <input type="date" id="tratamento-data" required>
                </div>
                <div class="form-group">
                    <label>Tratamento *</label>
                    <input type="text" id="tratamento-tratamento" required placeholder="Ex: Antibiótico, Anti-inflamatório, etc.">
                </div>
                <div class="form-group">
                    <label>Medicação</label>
                    <input type="text" id="tratamento-medicacao" placeholder="Nome do medicamento">
                </div>
                <div class="form-group">
                    <label>Dosagem</label>
                    <input type="text" id="tratamento-dosagem" placeholder="Ex: 1 comprimido 2x ao dia">
                </div>
                <div class="form-group">
                    <label>Duração</label>
                    <input type="text" id="tratamento-duracao" placeholder="Ex: 7 dias, 2 semanas, etc.">
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="tratamento-veterinario" placeholder="Nome do veterinário">
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="tratamento-preco" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="tratamento-obs" rows="3" placeholder="Detalhes adicionais"></textarea>
                </div>
                <div class="flex justify-end" style="gap: 0.5rem; margin-top: 1rem;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Adicionar</button>
                </div>
            </form>
        `;
        document.getElementById('modal-content').innerHTML = modalContent;
        app.openModal();
    },
    
    /**
     * Adiciona novo tratamento
     */
    handleAdd(event) {
        event.preventDefault();
        
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet) return;
        
        if (!pet.tratamentos) pet.tratamentos = [];
        
        const tratamento = {
            data: document.getElementById('tratamento-data').value,
            tratamento: document.getElementById('tratamento-tratamento').value.trim(),
            medicacao: document.getElementById('tratamento-medicacao').value.trim(),
            dosagem: document.getElementById('tratamento-dosagem').value.trim(),
            duracao: document.getElementById('tratamento-duracao').value.trim(),
            veterinario: document.getElementById('tratamento-veterinario').value.trim(),
            obs: document.getElementById('tratamento-obs').value.trim()
        };
        
        const precoEl = document.getElementById('tratamento-preco');
        if (precoEl && precoEl.value) {
            tratamento.preco = parseFloat(precoEl.value);
        }
        
        pet.tratamentos.push(tratamento);
        
        app.saveData();
        app.closeModal();
        app.render();
        app.showToast('Tratamento adicionado com sucesso!');
    },
    
    /**
     * Mostra modal para editar tratamento
     */
    showEditModal(index) {
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet || !pet.tratamentos || !pet.tratamentos[index]) return;
        
        const t = pet.tratamentos[index];
        
        const modalContent = `
            <div class="modal-header">
                <h2>Editar Tratamento</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="edit-tratamento-form" onsubmit="Tratamentos.handleEdit(${index}, event); return false;">
                <div class="form-group">
                    <label>Data de Início *</label>
                    <input type="date" id="edit-tratamento-data" value="${t.data}" required>
                </div>
                <div class="form-group">
                    <label>Tratamento *</label>
                    <input type="text" id="edit-tratamento-tratamento" value="${t.tratamento}" required>
                </div>
                <div class="form-group">
                    <label>Medicação</label>
                    <input type="text" id="edit-tratamento-medicacao" value="${t.medicacao || ''}">
                </div>
                <div class="form-group">
                    <label>Dosagem</label>
                    <input type="text" id="edit-tratamento-dosagem" value="${t.dosagem || ''}">
                </div>
                <div class="form-group">
                    <label>Duração</label>
                    <input type="text" id="edit-tratamento-duracao" value="${t.duracao || ''}">
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="edit-tratamento-veterinario" value="${t.veterinario || ''}">
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="edit-tratamento-preco" value="${t.preco || ''}" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-tratamento-obs" rows="3">${t.obs || ''}</textarea>
                </div>
                <div class="flex justify-end" style="gap: 0.5rem; margin-top: 1rem;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `;
        document.getElementById('modal-content').innerHTML = modalContent;
        app.openModal();
    },
    
    /**
     * Salva edição de tratamento
     */
    handleEdit(index, event) {
        event.preventDefault();
        
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet || !pet.tratamentos || !pet.tratamentos[index]) return;
        
        pet.tratamentos[index] = {
            data: document.getElementById('edit-tratamento-data').value,
            tratamento: document.getElementById('edit-tratamento-tratamento').value.trim(),
            medicacao: document.getElementById('edit-tratamento-medicacao').value.trim(),
            dosagem: document.getElementById('edit-tratamento-dosagem').value.trim(),
            duracao: document.getElementById('edit-tratamento-duracao').value.trim(),
            veterinario: document.getElementById('edit-tratamento-veterinario').value.trim(),
            obs: document.getElementById('edit-tratamento-obs').value.trim()
        };
        
        const precoEl = document.getElementById('edit-tratamento-preco');
        if (precoEl && precoEl.value) {
            pet.tratamentos[index].preco = parseFloat(precoEl.value);
        }
        
        app.saveData();
        app.closeModal();
        app.render();
        app.showToast('Tratamento atualizado com sucesso!');
    }
};

// Expor globalmente
window.Tratamentos = Tratamentos;

