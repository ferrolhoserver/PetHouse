/**
 * Extensão do app.js para Banhos e Tosas
 * Adiciona métodos ao PetHouse para gerenciar banhos e tosas
 */

// Adicionar métodos ao protótipo do PetHouse
Object.assign(PetHouse.prototype, {
    /**
     * Mostra modal para adicionar banho
     */
    showAddBanho() {
        if (!window.BanhosTosas) {
            if (this.showToast) this.showToast('❌ Módulo de Banhos não carregado!', 'error');
            return;
        }

        this.showModal(`
            <div class="modal-header">
                <h2>Adicionar Banho</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="add-banho-form" onsubmit="app.handleAddBanho(event)">
                ${window.BanhosTosas.renderBanhoForm()}
                <button type="submit" class="btn btn-primary">Adicionar</button>
            </form>
        `);

        // Definir data padrão como hoje
        setTimeout(() => {
            const dataInput = document.getElementById('record-data');
            if (dataInput) {
                dataInput.valueAsDate = new Date();
            }
        }, 100);
    },

    /**
     * Mostra modal para adicionar tosa
     */
    showAddTosa() {
        if (!window.BanhosTosas) {
            if (this.showToast) this.showToast('❌ Módulo de Tosas não carregado!', 'error');
            return;
        }

        this.showModal(`
            <div class="modal-header">
                <h2>Adicionar Tosa</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="add-tosa-form" onsubmit="app.handleAddTosa(event)">
                ${window.BanhosTosas.renderTosaForm()}
                <button type="submit" class="btn btn-primary">Adicionar</button>
            </form>
        `);

        // Definir data padrão como hoje
        setTimeout(() => {
            const dataInput = document.getElementById('record-data');
            if (dataInput) {
                dataInput.valueAsDate = new Date();
            }
        }, 100);
    },

    /**
     * Processa adição de banho
     */
    handleAddBanho(e) {
        e.preventDefault();

        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet) return;

        const banho = window.BanhosTosas.getBanhoFromForm();
        if (!banho) return;

        if (!pet.banhos) {
            pet.banhos = [];
        }

        pet.banhos.push(banho);
        this.saveData();
        this.closeModal();
        this.render();
        this.showToast('Banho adicionado com sucesso!', 'success');
    },

    /**
     * Processa adição de tosa
     */
    handleAddTosa(e) {
        e.preventDefault();

        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet) return;

        const tosa = window.BanhosTosas.getTosaFromForm();
        if (!tosa) return;

        if (!pet.tosas) {
            pet.tosas = [];
        }

        pet.tosas.push(tosa);
        this.saveData();
        this.closeModal();
        this.render();
        this.showToast('Tosa adicionada com sucesso!', 'success');
    },

    /**
     * Deleta registro de banho ou tosa
     */
    deleteRecord(tipo, id) {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet) return;

        // Converter ID para número se vier como string
        const numId = typeof id === 'string' ? parseFloat(id) : id;

        // Modal de confirmação customizado (sem confirm() nativo)
        const _self = this;
        const _m = document.createElement('div');
        _m.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
        _m.innerHTML = `<div style="background:white;border-radius:16px;padding:1.5rem;max-width:320px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;"><div style="font-size:2.5rem;margin-bottom:0.75rem;">🗑️</div><h3 style="margin:0 0 0.5rem;color:#333;font-size:1.1rem;">Excluir registro?</h3><p style="margin:0 0 1.25rem;color:#666;font-size:0.9rem;">Esta ação não pode ser desfeita.</p><div style="display:flex;gap:0.75rem;"><button id="_bdc" style="flex:1;padding:0.75rem;border:2px solid #ddd;background:white;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#666;font-weight:600;">Cancelar</button><button id="_bdo" style="flex:1;padding:0.75rem;border:none;background:#f44336;color:white;border-radius:10px;font-size:0.9rem;cursor:pointer;font-weight:700;">Excluir</button></div></div>`;
        document.body.appendChild(_m);
        document.getElementById('_bdc').onclick = () => _m.remove();
        document.getElementById('_bdo').onclick = () => {
            _m.remove();
            if (tipo === 'banhos' && pet.banhos) {
                pet.banhos = pet.banhos.filter(b => b.id !== numId);
            } else if (tipo === 'tosas' && pet.tosas) {
                pet.tosas = pet.tosas.filter(t => t.id !== numId);
            }
            _self.saveData();
            _self.render();
            _self.showToast('Registro excluído!', 'success');
        };
    },

    /**
     * Mostra modal para editar banho
     */
    showEditBanho(id) {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet || !pet.banhos) return;

        const numId = typeof id === 'string' ? parseFloat(id) : id;
        const banho = pet.banhos.find(b => b.id === numId);
        if (!banho) return;

        this.showModal(`
            <div class="modal-header">
                <h2>Editar Banho</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="edit-banho-form" onsubmit="app.handleEditBanho(event, '${id}')">
                ${window.BanhosTosas.renderBanhoForm(banho)}
                <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </form>
        `);
    },

    /**
     * Mostra modal para editar tosa
     */
    showEditTosa(id) {
        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet || !pet.tosas) return;

        const numId = typeof id === 'string' ? parseFloat(id) : id;
        const tosa = pet.tosas.find(t => t.id === numId);
        if (!tosa) return;

        this.showModal(`
            <div class="modal-header">
                <h2>Editar Tosa</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="edit-tosa-form" onsubmit="app.handleEditTosa(event, '${id}')">
                ${window.BanhosTosas.renderTosaForm(tosa)}
                <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </form>
        `);
    },

    /**
     * Processa edição de banho
     */
    handleEditBanho(e, id) {
        e.preventDefault();

        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet || !pet.banhos) return;

        const numId = typeof id === 'string' ? parseFloat(id) : id;
        const index = pet.banhos.findIndex(b => b.id === numId);
        if (index === -1) return;

        const banhoAtualizado = window.BanhosTosas.getBanhoFromForm();
        if (!banhoAtualizado) return;

        // Manter o ID original
        banhoAtualizado.id = numId;
        pet.banhos[index] = banhoAtualizado;

        this.saveData();
        this.closeModal();
        this.render();
        this.showToast('Banho atualizado com sucesso!', 'success');
    },

    /**
     * Processa edição de tosa
     */
    handleEditTosa(e, id) {
        e.preventDefault();

        const pet = this.data.pets.find(p => p.id === this.currentPet);
        if (!pet || !pet.tosas) return;

        const numId = typeof id === 'string' ? parseFloat(id) : id;
        const index = pet.tosas.findIndex(t => t.id === numId);
        if (index === -1) return;

        const tosaAtualizada = window.BanhosTosas.getTosaFromForm();
        if (!tosaAtualizada) return;

        // Manter o ID original
        tosaAtualizada.id = numId;
        pet.tosas[index] = tosaAtualizada;

        this.saveData();
        this.closeModal();
        this.render();
        this.showToast('Tosa atualizada com sucesso!', 'success');
    }
});

console.log('✅ Extensão de Banhos e Tosas carregada');
