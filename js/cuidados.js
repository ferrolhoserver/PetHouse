/**
 * Módulo Cuidados - Gerencia Vacinas, Vermífugo e Banho/Tosa
 * Inclui controle de preços opcional
 */


const Cuidados = {
    /**
     * Renderiza o conteúdo da aba Cuidados
     */
    renderContent(pet) {
        // Mesclar todos os cuidados em um único array
        const cuidados = [];
        
        // Adicionar vacinas
        if (pet.vacinas) {
            pet.vacinas.forEach((v, idx) => {
                cuidados.push({
                    tipo: 'vacina',
                    icon: '💉',
                    ...v,
                    originalIndex: idx
                });
            });
        }
        
        // Adicionar vermífugos
        if (pet.vermifugo) {
            pet.vermifugo.forEach((v, idx) => {
                cuidados.push({
                    tipo: 'vermifugo',
                    icon: '💊',
                    ...v,
                    originalIndex: idx
                });
            });
        }
        
        // Adicionar banhos/tosas
        if (pet.banho_tosa) {
            pet.banho_tosa.forEach((b, idx) => {
                cuidados.push({
                    tipo: 'banho_tosa',
                    icon: '🛁',
                    ...b,
                    originalIndex: idx
                });
            });
        }
        
        // Ordenar por data (mais recente primeiro)
        cuidados.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let html = `
            <div class="tab-content">
                <h3 style="margin-bottom: 1rem;">💝 Cuidados</h3>
                <div class="cuidados-buttons" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <button class="btn btn-success btn-small" onclick="VacinasRapido.mostrarSelecao(app.data.pets.find(p => p.id === '${pet.id}'))" style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);">
                        💉 Registro Rápido de Vacina
                    </button>
                    <button class="btn btn-primary btn-small" onclick="VermifugosRapido.mostrarSelecao(app.data.pets.find(p => p.id === '${pet.id}'))" style="background: linear-gradient(135deg, #2196F3 0%, #42a5f5 100%);">
                        💊 Registro Rápido de Vermífugo
                    </button>
                    <button class="btn btn-small" onclick="Cuidados.showAddModal('banho_tosa')" style="background: linear-gradient(135deg, #00bcd4 0%, #26c6da 100%); color: white;">
                        🛁 Adicionar Banho/Tosa
                    </button>
                </div>
                
                <div class="cuidados-buttons" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <button class="btn btn-small" onclick="OCRCartaoV2.mostrarEscaneamento('${pet.id}', 'vacina')" style="background: #9c27b0; color: white;">
                        📸 Escanear Vacinas
                    </button>
                    <button class="btn btn-small" onclick="OCRCartaoV2.mostrarEscaneamento('${pet.id}', 'vermifugo')" style="background: #ff5722; color: white;">
                        🐛 Escanear Vermífugos
                    </button>
                    <button class="btn btn-small" onclick="Calendario.mostrarExportacao(app.data.pets.find(p => p.id === '${pet.id}'))" style="background: #ff9800; color: white;">
                        📅 Exportar para Calendário
                    </button>
                    <button class="btn btn-small" onclick="Alarmes.mostrarGerenciador()" style="background: #f44336; color: white;">
                        🔔 Gerenciar Alarmes
                    </button>
                </div>
                
                <!-- Timeline Cronológica -->
                ${window.TimelineProntuario ? `
                    <div style="margin-bottom: 1.5rem;">
                        ${window.TimelineProntuario.renderizarResumo(pet)}
                    </div>
                ` : ''}
        `;
        
        // Mostrar alertas (se houver)
        const alertasHTML = this.renderAlertas(pet);
        if (alertasHTML) {
            html += alertasHTML;
        }
        
        // Mostrar registros em timeline cronológica
        if (window.TimelineProntuario) {
            html += window.TimelineProntuario.renderizar(pet);
        } else {
            // Fallback para renderização antiga
            if (cuidados.length === 0) {
                html += '<p class="text-muted">Nenhum cuidado registrado ainda.</p>';
            } else {
                cuidados.forEach(c => {
                    html += this.renderCuidado(c);
                });
            }
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * Renderiza um registro de cuidado
     */
    renderCuidado(cuidado) {
        const date = new Date(cuidado.data).toLocaleDateString('pt-BR');
        const proxima = cuidado.proxima ? new Date(cuidado.proxima).toLocaleDateString('pt-BR') : null;
        const preco = cuidado.preco ? `R$ ${parseFloat(cuidado.preco).toFixed(2)}` : null;
        
        let tipoLabel = '';
        if (cuidado.tipo === 'vacina') tipoLabel = 'Vacina';
        else if (cuidado.tipo === 'vermifugo') tipoLabel = 'Vermífugo';
        else if (cuidado.tipo === 'banho_tosa') tipoLabel = 'Banho/Tosa';
        
        return `
            <div class="record-item">
                <div class="flex justify-between">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <span style="font-size: 1.2rem;">${cuidado.icon}</span>
                            <strong>${cuidado.nome || tipoLabel}</strong>
                            ${preco ? `<span class="badge" style="background: #4CAF50; color: white; font-size: 0.75rem;">${preco}</span>` : ''}
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            <div>📅 ${date}</div>
                            ${proxima ? `<div>🔔 Próxima: ${proxima}</div>` : ''}
                            ${cuidado.obs ? `<div style="margin-top: 0.25rem;"><small>${cuidado.obs}</small></div>` : ''}
                        </div>
                    </div>
                    <button class="btn btn-small btn-primary" onclick="Cuidados.showEditModal('${cuidado.tipo}', ${cuidado.originalIndex})" style="height: fit-content;">✏️</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderiza alertas de vacinas e vermífugos
     */
    renderAlertas(pet) {
        const alertasVacinas = window.AlertasVacinas ? AlertasVacinas.calcular(pet) : [];
        const alertasVermifugo = window.AlertasVermifugo ? AlertasVermifugo.calcular(pet) : [];
        
        if (alertasVacinas.length === 0 && alertasVermifugo.length === 0) {
            return '';
        }
        
        let html = '<div class="alert-box" style="background: #fff9c4; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">';
        html += '<h4 style="margin-top: 0;">⚠️ Alertas de Cuidados</h4>';
        
        if (alertasVacinas.length > 0) {
            html += '<div style="margin-bottom: 1rem;"><strong>💉 Vacinas:</strong></div>';
            alertasVacinas.forEach(alerta => {
                html += `<div class="alert-item" style="margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px;">
                    <strong>${alerta.nome}</strong><br>
                    <small>${alerta.mensagem}</small>
                </div>`;
            });
        }
        
        if (alertasVermifugo.length > 0) {
            html += '<div style="margin-bottom: 0.5rem; margin-top: 1rem;"><strong>💊 Vermífugo:</strong></div>';
            alertasVermifugo.forEach(alerta => {
                html += `<div class="alert-item" style="margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px;">
                    <strong>${alerta.nome}</strong><br>
                    <small>${alerta.mensagem}</small>
                </div>`;
            });
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * Mostra modal para adicionar novo cuidado
     */
    showAddModal(tipo) {
        let title = '';
        let formHTML = '';
        
        if (tipo === 'vacina') {
            title = 'Adicionar Vacina';
            formHTML = `
                <div class="form-group">
                    <label>Nome da Vacina *</label>
                    <input type="text" id="cuidado-nome" required>
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="cuidado-data" required>
                </div>
                <div class="form-group">
                    <label>Próxima Dose</label>
                    <input type="date" id="cuidado-proxima">
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="cuidado-preco" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="cuidado-obs" rows="3"></textarea>
                </div>
            `;
        } else if (tipo === 'vermifugo') {
            title = 'Adicionar Vermífugo';
            formHTML = `
                <div class="form-group">
                    <label>Nome do Vermífugo *</label>
                    <input type="text" id="cuidado-nome" required>
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="cuidado-data" required>
                </div>
                <div class="form-group">
                    <label>Próxima Aplicação</label>
                    <input type="date" id="cuidado-proxima">
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="cuidado-preco" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="cuidado-obs" rows="3"></textarea>
                </div>
            `;
        } else if (tipo === 'banho_tosa') {
            title = 'Adicionar Banho/Tosa';
            formHTML = `
                <div class="form-group">
                    <label>Tipo *</label>
                    <select id="cuidado-nome" required>
                        <option value="Banho">Banho</option>
                        <option value="Tosa">Tosa</option>
                        <option value="Banho e Tosa">Banho e Tosa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="cuidado-data" required>
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="cuidado-preco" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="cuidado-obs" rows="3"></textarea>
                </div>
            `;
        }
        
        const modalContent = `
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="cuidado-form" onsubmit="Cuidados.handleAdd('${tipo}', event); return false;">
                ${formHTML}
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
     * Adiciona novo cuidado
     */
    handleAdd(tipo, event) {
        event.preventDefault();
        
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet) return;
        
        const cuidado = {
            nome: document.getElementById('cuidado-nome').value.trim(),
            data: document.getElementById('cuidado-data').value,
            obs: document.getElementById('cuidado-obs').value.trim()
        };
        
        const proximaEl = document.getElementById('cuidado-proxima');
        if (proximaEl && proximaEl.value) {
            cuidado.proxima = proximaEl.value;
        }
        
        const precoEl = document.getElementById('cuidado-preco');
        if (precoEl && precoEl.value) {
            cuidado.preco = parseFloat(precoEl.value);
        }
        
        // Adicionar ao array correspondente
        if (tipo === 'vacina') {
            if (!pet.vacinas) pet.vacinas = [];
            pet.vacinas.push(cuidado);
        } else if (tipo === 'vermifugo') {
            if (!pet.vermifugo) pet.vermifugo = [];
            pet.vermifugo.push(cuidado);
        } else if (tipo === 'banho_tosa') {
            if (!pet.banho_tosa) pet.banho_tosa = [];
            pet.banho_tosa.push(cuidado);
        }
        
        app.saveData();
        app.closeModal();
        app.render();
        app.showToast(`${tipo === 'vacina' ? 'Vacina' : tipo === 'vermifugo' ? 'Vermífugo' : 'Banho/Tosa'} adicionado com sucesso!`);
    },
    
    /**
     * Mostra modal para editar cuidado
     */
    showEditModal(tipo, index) {
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet) return;
        
        let cuidado;
        if (tipo === 'vacina') cuidado = pet.vacinas[index];
        else if (tipo === 'vermifugo') cuidado = pet.vermifugo[index];
        else if (tipo === 'banho_tosa') cuidado = pet.banho_tosa[index];
        
        if (!cuidado) return;
        
        let title = '';
        let formHTML = '';
        
        if (tipo === 'vacina') {
            title = 'Editar Vacina';
            formHTML = `
                <div class="form-group">
                    <label>Nome da Vacina *</label>
                    <input type="text" id="edit-cuidado-nome" value="${cuidado.nome}" required>
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="edit-cuidado-data" value="${cuidado.data}" required>
                </div>
                <div class="form-group">
                    <label>Próxima Dose</label>
                    <input type="date" id="edit-cuidado-proxima" value="${cuidado.proxima || ''}">
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="edit-cuidado-preco" value="${cuidado.preco || ''}" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-cuidado-obs" rows="3">${cuidado.obs || ''}</textarea>
                </div>
            `;
        } else if (tipo === 'vermifugo') {
            title = 'Editar Vermífugo';
            formHTML = `
                <div class="form-group">
                    <label>Nome do Vermífugo *</label>
                    <input type="text" id="edit-cuidado-nome" value="${cuidado.nome}" required>
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="edit-cuidado-data" value="${cuidado.data}" required>
                </div>
                <div class="form-group">
                    <label>Próxima Aplicação</label>
                    <input type="date" id="edit-cuidado-proxima" value="${cuidado.proxima || ''}">
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="edit-cuidado-preco" value="${cuidado.preco || ''}" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-cuidado-obs" rows="3">${cuidado.obs || ''}</textarea>
                </div>
            `;
        } else if (tipo === 'banho_tosa') {
            title = 'Editar Banho/Tosa';
            formHTML = `
                <div class="form-group">
                    <label>Tipo *</label>
                    <select id="edit-cuidado-nome" required>
                        <option value="Banho" ${cuidado.nome === 'Banho' ? 'selected' : ''}>Banho</option>
                        <option value="Tosa" ${cuidado.nome === 'Tosa' ? 'selected' : ''}>Tosa</option>
                        <option value="Banho e Tosa" ${cuidado.nome === 'Banho e Tosa' ? 'selected' : ''}>Banho e Tosa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" id="edit-cuidado-data" value="${cuidado.data}" required>
                </div>
                <div class="form-group">
                    <label>Preço (opcional)</label>
                    <input type="number" id="edit-cuidado-preco" value="${cuidado.preco || ''}" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="edit-cuidado-obs" rows="3">${cuidado.obs || ''}</textarea>
                </div>
            `;
        }
        
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = `
            <form id="edit-cuidado-form" onsubmit="Cuidados.handleEdit('${tipo}', ${index}, event); return false;">
                ${formHTML}
                <div class="flex justify-end" style="gap: 0.5rem; margin-top: 1rem;">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `;
        app.openModal();
    },
    
    /**
     * Salva edição de cuidado
     */
    handleEdit(tipo, index, event) {
        event.preventDefault();
        
        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet) return;
        
        let cuidado;
        if (tipo === 'vacina') cuidado = pet.vacinas[index];
        else if (tipo === 'vermifugo') cuidado = pet.vermifugo[index];
        else if (tipo === 'banho_tosa') cuidado = pet.banho_tosa[index];
        
        if (!cuidado) return;
        
        cuidado.nome = document.getElementById('edit-cuidado-nome').value.trim();
        cuidado.data = document.getElementById('edit-cuidado-data').value;
        cuidado.obs = document.getElementById('edit-cuidado-obs').value.trim();
        
        const proximaEl = document.getElementById('edit-cuidado-proxima');
        if (proximaEl) {
            cuidado.proxima = proximaEl.value || null;
        }
        
        const precoEl = document.getElementById('edit-cuidado-preco');
        if (precoEl) {
            cuidado.preco = precoEl.value ? parseFloat(precoEl.value) : null;
        }
        
        app.saveData();
        app.closeModal();
        app.render();
        app.showToast('Cuidado atualizado com sucesso!');
    }
};

// Expor globalmente
window.Cuidados = Cuidados;

