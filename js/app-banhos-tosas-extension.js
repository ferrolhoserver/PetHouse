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
            alert('Módulo de Banhos não carregado!');
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
            alert('Módulo de Tosas não carregado!');
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

        if (confirm(`Tem certeza que deseja excluir este registro?`)) {
            if (tipo === 'banhos' && pet.banhos) {
                pet.banhos = pet.banhos.filter(b => b.id !== id);
            } else if (tipo === 'tosas' && pet.tosas) {
                pet.tosas = pet.tosas.filter(t => t.id !== id);
            }

            this.saveData();
            this.render();
            this.showToast('Registro excluído!', 'success');
        }
    }
});

console.log('✅ Extensão de Banhos e Tosas carregada');
