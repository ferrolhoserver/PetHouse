/**
 * Módulo Diagnósticos
 * Gerencia diagnósticos dos pets
 */

const Diagnosticos = {
    /**
     * Renderiza o conteúdo da aba Diagnósticos
     */
    renderContent(pet) {
        if (!pet.diagnosticos) pet.diagnosticos = [];
        
        // Ordenar por data (mais recente primeiro)
        const diagnosticos = [...pet.diagnosticos].sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let html = `
            <div class="tab-content">
                <div class="flex justify-between align-center" style="margin-bottom: 1rem;">
                    <h3>🔍 Diagnósticos</h3>
                    <button class="btn btn-primary" onclick="Diagnosticos.showAddModal()">+ Adicionar</button>
                </div>
        `;
        
        if (diagnosticos.length === 0) {
            html += '<p class="text-muted">Nenhum diagnóstico registrado ainda.</p>';
        } else {
            diagnosticos.forEach((d, idx) => {
                html += this.renderDiagnostico(d, idx);
            });
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * Renderiza um diagnóstico
     */
    renderDiagnostico(diagnostico, index) {
        const date = new Date(diagnostico.data).toLocaleDateString('pt-BR');
        
        return `
            <div class="record-item">
                <div class="flex justify-between">
                    <div style="flex: 1;">
                        <div style="margin-bottom: 0.5rem;">
                            <strong style="font-size: 1.1rem;">${diagnostico.diagnostico}</strong>
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            <div>📅 ${date}</div>
                            ${diagnostico.veterinario ? `<div>👨‍⚕️ ${diagnostico.veterinario}</div>` : ''}
                            ${diagnostico.obs ? `<div style="margin-top: 0.5rem;">${diagnostico.obs}</div>` : ''}
                        </div>
                    </div>
                    <button class="btn btn-small btn-primary" onclick="Diagnosticos.showEditModal(${index})" style="height: fit-content;">✏️</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Mostra modal para adicionar diagnóstico
     */
    showAddModal() {
        const modalContent = `
            <div class="modal-header">
                <h2>Adicionar Diagnóstico</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="diagnostico-form" onsubmit="Diagnosticos.handleAdd(event); return false;">
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="diagnostico-data" required>
                </div>
                <div class="form-group">
                    <label>Diagnóstico *</label>
                    <input type="text" id="diagnostico-diagnostico" required placeholder="Ex: Otite, Gastroenterite, etc.">
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="diagnostico-veterinario" placeholder="Nome do veterinário">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="diagnostico-obs" rows="4" placeholder="Detalhes do diagnóstico, sintomas, etc."></textarea>
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
     * Adiciona novo diagnóstico
     */
    handleAdd(event) {
        event.preventDefault();
        
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet) return;
        
        if (!pet.diagnosticos) pet.diagnosticos = [];
        
        const diagnostico = {
            data: document.getElementById('diagnostico-data').value,
            diagnostico: document.getElementById('diagnostico-diagnostico').value.trim(),
            veterinario: document.getElementById('diagnostico-veterinario').value.trim(),
            obs: document.getElementById('diagnostico-obs').value.trim()
        };
        
        pet.diagnosticos.push(diagnostico);
        
        app.saveData();
        app.closeModal();
        app.render();
        app.showToast('Diagnóstico adicionado com sucesso!');
    },
    
    /**
     * Mostra modal para editar diagnóstico
     */
    showEditModal(index) {
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet || !pet.diagnosticos || !pet.diagnosticos[index]) return;
        
        const d = pet.diagnosticos[index];
        
        const modalContent = `
            <div class="modal-header">
                <h2>Editar Diagnóstico</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="edit-diagnostico-form" onsubmit="Diagnosticos.handleEdit(${index}, event); return false;">
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="edit-diagnostico-data" value="${d.data}" required>
                </div>
                <div class="form-group">
                    <label>Diagnóstico *</label>
                    <input type="text" id="edit-diagnostico-diagnostico" value="${d.diagnostico}" required>
                </div>
                <div class="form-group">
                    <label>Veterinário</label>
                    <input type="text" id="edit-diagnostico-veterinario" value="${d.veterinario || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-diagnostico-obs" rows="4">${d.obs || ''}</textarea>
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
     * Salva edição de diagnóstico
     */
    handleEdit(index, event) {
        event.preventDefault();
        
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet || !pet.diagnosticos || !pet.diagnosticos[index]) return;
        
        pet.diagnosticos[index] = {
            data: document.getElementById('edit-diagnostico-data').value,
            diagnostico: document.getElementById('edit-diagnostico-diagnostico').value.trim(),
            veterinario: document.getElementById('edit-diagnostico-veterinario').value.trim(),
            obs: document.getElementById('edit-diagnostico-obs').value.trim()
        };
        
        app.saveData();
        app.closeModal();
        app.render();
        app.showToast('Diagnóstico atualizado com sucesso!');
    }
};

// Expor globalmente
window.Diagnosticos = Diagnosticos;

