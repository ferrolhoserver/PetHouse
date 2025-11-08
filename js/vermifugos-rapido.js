/**
 * Módulo de Registro Rápido de Vermífugos
 * Sistema profissional com banco de dados completo e cadastro personalizado
 */

const VermifugosRapido = {
    /**
     * Banco de dados completo de vermífugos veterinários
     */
    vermifugos: [
        // COMPRIMIDOS
        {
            id: 'drontal_plus',
            nome: 'Drontal Plus',
            laboratorio: 'Bayer',
            principio_ativo: 'Praziquantel + Pirantel + Febantel',
            apresentacao: 'Comprimido',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 10, dose: '1 comprimido', mg: '150/144/50' },
                { peso_min: 10, peso_max: 20, dose: '2 comprimidos', mg: '300/288/100' },
                { peso_min: 20, peso_max: 30, dose: '3 comprimidos', mg: '450/432/150' },
                { peso_min: 30, peso_max: 40, dose: '4 comprimidos', mg: '600/576/200' }
            ],
            cor: '#4caf50'
        },
        {
            id: 'drontal_gatos',
            nome: 'Drontal Gatos',
            laboratorio: 'Bayer',
            principio_ativo: 'Praziquantel + Pirantel',
            apresentacao: 'Comprimido',
            especie: 'gato',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 4, dose: '1/2 comprimido', mg: '10/40' },
                { peso_min: 4, peso_max: 8, dose: '1 comprimido', mg: '20/80' }
            ],
            cor: '#2196F3'
        },
        {
            id: 'endogard',
            nome: 'Endogard',
            laboratorio: 'Virbac',
            principio_ativo: 'Praziquantel + Pirantel + Febantel',
            apresentacao: 'Comprimido',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 5, dose: '1 comprimido 5kg', mg: '75/72/25' },
                { peso_min: 5, peso_max: 10, dose: '1 comprimido 10kg', mg: '150/144/50' },
                { peso_min: 10, peso_max: 20, dose: '1 comprimido 20kg', mg: '300/288/100' },
                { peso_min: 20, peso_max: 30, dose: '1 comprimido 30kg', mg: '450/432/150' }
            ],
            cor: '#9c27b0'
        },
        {
            id: 'vermivet_plus',
            nome: 'Vermivet Plus',
            laboratorio: 'Vetnil',
            principio_ativo: 'Praziquantel + Pirantel + Febantel',
            apresentacao: 'Comprimido',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 10, dose: '1 comprimido', mg: '150/144/50' },
                { peso_min: 10, peso_max: 20, dose: '2 comprimidos', mg: '300/288/100' },
                { peso_min: 20, peso_max: 30, dose: '3 comprimidos', mg: '450/432/150' }
            ],
            cor: '#ff9800'
        },
        
        // SUSPENSÕES/LÍQUIDOS
        {
            id: 'drontal_puppy',
            nome: 'Drontal Puppy',
            laboratorio: 'Bayer',
            principio_ativo: 'Pirantel + Febantel',
            apresentacao: 'Suspensão oral',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 1, dose: '1 ml', mg: '14.4/15' },
                { peso_min: 1, peso_max: 2, dose: '2 ml', mg: '28.8/30' },
                { peso_min: 2, peso_max: 5, dose: '1 ml/kg', mg: 'variável' }
            ],
            indicacao: 'Filhotes',
            cor: '#00bcd4'
        },
        {
            id: 'endal_pet',
            nome: 'Endal Pet',
            laboratorio: 'Agener',
            principio_ativo: 'Praziquantel + Pirantel + Febantel',
            apresentacao: 'Suspensão oral',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 5, dose: '5 ml', mg: '75/72/25' },
                { peso_min: 5, peso_max: 10, dose: '10 ml', mg: '150/144/50' },
                { peso_min: 10, peso_max: 20, dose: '20 ml', mg: '300/288/100' }
            ],
            cor: '#795548'
        },

        // SPOT-ON (TÓPICO)
        {
            id: 'advocate',
            nome: 'Advocate',
            laboratorio: 'Bayer',
            principio_ativo: 'Imidacloprida + Moxidectina',
            apresentacao: 'Spot-on (tópico)',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 4, dose: '1 pipeta 0.4ml', mg: '40/10' },
                { peso_min: 4, peso_max: 10, dose: '1 pipeta 1.0ml', mg: '100/25' },
                { peso_min: 10, peso_max: 25, dose: '1 pipeta 2.5ml', mg: '250/62.5' },
                { peso_min: 25, peso_max: 40, dose: '1 pipeta 4.0ml', mg: '400/100' }
            ],
            indicacao: 'Vermífugo + antipulgas + carrapatos',
            cor: '#e91e63'
        },
        {
            id: 'revolution',
            nome: 'Revolution',
            laboratorio: 'Zoetis',
            principio_ativo: 'Selamectina',
            apresentacao: 'Spot-on (tópico)',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 5, dose: '1 pipeta 0.25ml', mg: '15' },
                { peso_min: 5, peso_max: 10, dose: '1 pipeta 0.5ml', mg: '30' },
                { peso_min: 10, peso_max: 20, dose: '1 pipeta 1.0ml', mg: '60' },
                { peso_min: 20, peso_max: 40, dose: '1 pipeta 2.0ml', mg: '120' }
            ],
            indicacao: 'Vermífugo + antipulgas + sarna',
            cor: '#3f51b5'
        },

        // INJETÁVEIS
        {
            id: 'ivomec',
            nome: 'Ivomec',
            laboratorio: 'Boehringer',
            principio_ativo: 'Ivermectina',
            apresentacao: 'Injetável',
            especie: 'cao',
            dosagem_por_peso: [
                { peso_min: 0, peso_max: 10, dose: '0.1 ml/kg', mg: '1' },
                { peso_min: 10, peso_max: 20, dose: '0.1 ml/kg', mg: '1' },
                { peso_min: 20, peso_max: 40, dose: '0.1 ml/kg', mg: '1' }
            ],
            indicacao: 'Uso veterinário - aplicação por profissional',
            cor: '#607d8b'
        }
    ],

    /**
     * Vermífugos personalizados do usuário (salvos no localStorage)
     */
    personalizados: [],

    /**
     * Carrega vermífugos personalizados do localStorage
     */
    carregarPersonalizados() {
        const salvos = localStorage.getItem('vermifugos_personalizados');
        if (salvos) {
            this.personalizados = JSON.parse(salvos);
        }
    },

    /**
     * Salva vermífugos personalizados no localStorage
     */
    salvarPersonalizados() {
        localStorage.setItem('vermifugos_personalizados', JSON.stringify(this.personalizados));
    },

    /**
     * Renderiza modal de seleção de vermífugo
     */
    mostrarSelecao(pet) {
        this.carregarPersonalizados();

        const especie = pet.especie.toLowerCase();
        const ehCao = especie.includes('cao') || especie.includes('cão') || especie.includes('cachorro');
        
        // Filtrar vermífugos por espécie
        const vermifugosFiltrados = this.vermifugos.filter(v => 
            v.especie === (ehCao ? 'cao' : 'gato') || v.especie === 'ambos'
        );

        // Agrupar por apresentação
        const comprimidos = vermifugosFiltrados.filter(v => v.apresentacao.includes('Comprimido'));
        const liquidos = vermifugosFiltrados.filter(v => v.apresentacao.includes('Suspensão') || v.apresentacao.includes('oral'));
        const topicos = vermifugosFiltrados.filter(v => v.apresentacao.includes('Spot-on') || v.apresentacao.includes('tópico'));
        const injetaveis = vermifugosFiltrados.filter(v => v.apresentacao.includes('Injetável'));

        const renderizarGrupo = (titulo, lista) => {
            if (lista.length === 0) return '';
            return `
                <h4 style="margin: 1rem 0 0.5rem 0; color: #666; font-size: 0.9rem; text-transform: uppercase;">${titulo}</h4>
                ${lista.map(v => this.renderizarCardVermifugo(v, pet)).join('')}
            `;
        };

        const personalizadosHTML = this.personalizados.length > 0 ? `
            <h4 style="margin: 1rem 0 0.5rem 0; color: #666; font-size: 0.9rem; text-transform: uppercase;">📝 Meus Vermífugos</h4>
            ${this.personalizados.map(v => this.renderizarCardVermifugo(v, pet, true)).join('')}
        ` : '';

        const modalContent = `
            <div class="modal-header">
                <h2>💊 Selecionar Vermífugo</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem; max-height: 70vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <p style="margin: 0; color: #666;">
                        Vermífugo para <strong>${pet.nome}</strong> (${Math.round(pet.peso && pet.peso.length > 0 ? pet.peso[pet.peso.length - 1].peso * 1000 : 0)}g)
                    </p>
                    <button class="btn btn-small btn-primary" onclick="VermifugosRapido.criarPersonalizado('${pet.id}')">
                        + Criar Novo
                    </button>
                </div>

                ${personalizadosHTML}
                ${renderizarGrupo('💊 Comprimidos', comprimidos)}
                ${renderizarGrupo('🧪 Suspensões Orais', liquidos)}
                ${renderizarGrupo('💧 Spot-on (Tópico)', topicos)}
                ${renderizarGrupo('💉 Injetáveis', injetaveis)}
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
    },

    /**
     * Renderiza card de vermífugo
     */
    renderizarCardVermifugo(v, pet, personalizado = false) {
        const pesoAtual = pet.peso && pet.peso.length > 0 ? pet.peso[pet.peso.length - 1].peso : 0;
        const pesoKg = pesoAtual;
        
        // Encontrar dosagem recomendada
        let doseRecomendada = 'Consultar veterinário';
        if (v.dosagem_por_peso) {
            const faixa = v.dosagem_por_peso.find(d => 
                pesoKg >= d.peso_min && pesoKg <= d.peso_max
            );
            if (faixa) {
                doseRecomendada = faixa.dose;
            }
        }

        return `
            <div class="vermifugo-card" style="background: white; border-left: 4px solid ${v.cor}; padding: 1rem; margin-bottom: 0.75rem; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;"
                 onclick="VermifugosRapido.selecionarVermifugo('${pet.id}', '${v.id}', ${personalizado})">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.25rem 0; color: ${v.cor};">${v.nome}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: #666;">${v.principio_ativo}</p>
                        <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #999;">
                            📦 ${v.apresentacao} ${v.laboratorio ? `• ${v.laboratorio}` : ''}
                        </div>
                        <div style="margin-top: 0.5rem; padding: 0.5rem; background: #e3f2fd; border-radius: 4px;">
                            <strong style="font-size: 0.85rem; color: #1976d2;">
                                💊 Dose recomendada: ${doseRecomendada}
                            </strong>
                        </div>
                        ${v.indicacao ? `<div style="margin-top: 0.5rem; font-size: 0.8rem; color: #4caf50;">✓ ${v.indicacao}</div>` : ''}
                    </div>
                    <div style="color: ${v.cor}; font-size: 1.5rem;">→</div>
                </div>
            </div>
        `;
    },

    /**
     * Modal para criar vermífugo personalizado
     */
    criarPersonalizado(petId) {
        const modalContent = `
            <div class="modal-header">
                <h2>📝 Criar Vermífugo Personalizado</h2>
                <button class="modal-close" onclick="VermifugosRapido.mostrarSelecao(app.data.pets.find(p => p.id === '${petId}'))">←</button>
            </div>
            <div style="padding: 1rem;">
                <form id="vermifugo-personalizado-form" onsubmit="event.preventDefault(); VermifugosRapido.salvarPersonalizado('${petId}');">
                    <div class="form-group">
                        <label>Nome do Vermífugo *</label>
                        <input type="text" id="nome-vermifugo" placeholder="Ex: Drontal Plus" required>
                    </div>

                    <div class="form-group">
                        <label>Laboratório</label>
                        <input type="text" id="laboratorio-vermifugo" placeholder="Ex: Bayer">
                    </div>

                    <div class="form-group">
                        <label>Princípio Ativo *</label>
                        <input type="text" id="principio-ativo" placeholder="Ex: Praziquantel + Pirantel" required>
                    </div>

                    <div class="form-group">
                        <label>Apresentação *</label>
                        <select id="apresentacao-vermifugo" required>
                            <option value="">Selecione...</option>
                            <option value="Comprimido">Comprimido</option>
                            <option value="Suspensão oral">Suspensão oral</option>
                            <option value="Spot-on (tópico)">Spot-on (tópico)</option>
                            <option value="Injetável">Injetável</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Dosagem (mg)</label>
                        <input type="text" id="dosagem-mg" placeholder="Ex: 150/144/50">
                    </div>

                    <div class="form-group">
                        <label>Dose Padrão</label>
                        <input type="text" id="dose-padrao" placeholder="Ex: 1 comprimido a cada 10kg">
                    </div>

                    <div class="flex justify-end" style="gap: 0.5rem;">
                        <button type="button" class="btn" onclick="VermifugosRapido.mostrarSelecao(app.data.pets.find(p => p.id === '${petId}'))">Cancelar</button>
                        <button type="submit" class="btn btn-primary">✅ Salvar e Usar</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
    },

    /**
     * Salva vermífugo personalizado
     */
    salvarPersonalizado(petId) {
        const vermifugo = {
            id: 'custom_' + Date.now(),
            nome: document.getElementById('nome-vermifugo').value,
            laboratorio: document.getElementById('laboratorio-vermifugo').value,
            principio_ativo: document.getElementById('principio-ativo').value,
            apresentacao: document.getElementById('apresentacao-vermifugo').value,
            dosagem_mg: document.getElementById('dosagem-mg').value,
            dose_padrao: document.getElementById('dose-padrao').value,
            especie: 'ambos',
            cor: '#607d8b',
            personalizado: true
        };

        this.personalizados.push(vermifugo);
        this.salvarPersonalizados();

        // Ir direto para seleção deste vermífugo
        this.selecionarVermifugo(petId, vermifugo.id, true);
    },

    /**
     * Seleciona vermífugo e mostra formulário de aplicação
     */
    selecionarVermifugo(petId, vermifugoId, personalizado = false) {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) return;

        const lista = personalizado ? this.personalizados : this.vermifugos;
        const vermifugo = lista.find(v => v.id === vermifugoId);
        if (!vermifugo) return;

        const pesoAtual = pet.peso && pet.peso.length > 0 ? pet.peso[pet.peso.length - 1].peso : 0;
        const pesoKg = pesoAtual;
        
        // Encontrar dosagem recomendada
        let doseRecomendada = vermifugo.dose_padrao || 'Consultar veterinário';
        if (vermifugo.dosagem_por_peso) {
            const faixa = vermifugo.dosagem_por_peso.find(d => 
                pesoKg >= d.peso_min && pesoKg <= d.peso_max
            );
            if (faixa) {
                doseRecomendada = faixa.dose;
            }
        }

        const modalContent = `
            <div class="modal-header">
                <h2>💊 ${vermifugo.nome}</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <form id="vermifugo-aplicacao-form" onsubmit="event.preventDefault(); VermifugosRapido.salvarAplicacao('${petId}', '${vermifugoId}', ${personalizado});">
                    <div style="background: ${vermifugo.cor}15; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                        <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
                            <strong>${vermifugo.principio_ativo}</strong>
                        </p>
                        <p style="margin: 0; font-size: 0.85rem; color: #666;">
                            📦 ${vermifugo.apresentacao} ${vermifugo.laboratorio ? `• ${vermifugo.laboratorio}` : ''}
                        </p>
                    </div>

                    <div style="background: #e3f2fd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                        <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                            <strong>💊 Dose recomendada para ${Math.round(pesoKg * 1000)}g:</strong><br>
                            ${doseRecomendada}
                        </p>
                    </div>

                    <div class="form-group">
                        <label>Data da Aplicação *</label>
                        <input type="date" id="data-vermifugo" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>

                    <div class="form-group">
                        <label>Dose Aplicada</label>
                        <input type="text" id="dose-aplicada-vermifugo" value="${doseRecomendada}">
                    </div>

                    <div class="form-group">
                        <label>Lote</label>
                        <input type="text" id="lote-vermifugo" placeholder="Ex: L12345">
                    </div>

                    <div class="form-group">
                        <label>Próxima Aplicação</label>
                        <input type="date" id="proxima-vermifugo">
                        <small style="color: #666;">Geralmente 3 meses (90 dias) após</small>
                    </div>

                    <div class="form-group">
                        <label>Observações</label>
                        <textarea id="obs-vermifugo" rows="2" placeholder="Reações, observações..."></textarea>
                    </div>

                    <div class="flex justify-end" style="gap: 0.5rem;">
                        <button type="button" class="btn" onclick="app.closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">✅ Registrar Vermífugo</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;

        // Calcular próxima aplicação (90 dias)
        const dataProx = new Date();
        dataProx.setDate(dataProx.getDate() + 90);
        document.getElementById('proxima-vermifugo').value = dataProx.toISOString().split('T')[0];
    },

    /**
     * Salva aplicação de vermífugo
     */
    salvarAplicacao(petId, vermifugoId, personalizado) {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) return;

        const lista = personalizado ? this.personalizados : this.vermifugos;
        const vermifugo = lista.find(v => v.id === vermifugoId);

        const dataAplicacao = document.getElementById('data-vermifugo').value;

        // VALIDAÇÃO 1: Verificar duplicatas (mesmo vermífugo na mesma data)
        if (!pet.vermifugo) pet.vermifugo = [];
        const duplicata = pet.vermifugo.find(v => 
            v.nome.toLowerCase() === vermifugo.nome.toLowerCase() && 
            v.data === dataAplicacao
        );
        
        if (duplicata) {
            app.showToast('⚠️ Já existe um registro deste vermífugo nesta data!', 'error');
            return;
        }

        // VALIDAÇÃO 2: Verificar se está muito cedo (menos de 60 dias da última aplicação)
        const ultimaAplicacao = pet.vermifugo
            .filter(v => v.nome.toLowerCase() === vermifugo.nome.toLowerCase())
            .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
        
        if (ultimaAplicacao) {
            const dataUltima = new Date(ultimaAplicacao.data);
            const dataNova = new Date(dataAplicacao);
            const diasEntre = Math.floor((dataNova - dataUltima) / (1000 * 60 * 60 * 24));
            const prazoMinimo = 60; // Mínimo 60 dias entre aplicações
            
            if (diasEntre < prazoMinimo) {
                const confirmar = confirm(
                    `⚠️ ATENÇÃO!\n\n` +
                    `Este vermífugo está sendo aplicado ANTES do prazo recomendado.\n\n` +
                    `Última aplicação: ${new Date(ultimaAplicacao.data).toLocaleDateString('pt-BR')}\n` +
                    `Intervalo recomendado: 90 dias (trimestral)\n` +
                    `Intervalo atual: ${diasEntre} dias\n\n` +
                    `Deseja continuar mesmo assim?`
                );
                
                if (!confirmar) {
                    return;
                }
            }
        }

        const registro = {
            id: Date.now().toString(),
            nome: vermifugo.nome,
            principio_ativo: vermifugo.principio_ativo,
            data: dataAplicacao,
            dose: document.getElementById('dose-aplicada-vermifugo').value,
            lote: document.getElementById('lote-vermifugo').value,
            proxima: document.getElementById('proxima-vermifugo').value,
            obs: document.getElementById('obs-vermifugo').value,
            cor: vermifugo.cor,
            tipo: 'vermifugo'
        };

        // Adicionar ao pet
        pet.vermifugo.push(registro);

        // Salvar
        app.saveData();
        app.closeModal();
        app.showToast('✅ Vermífugo registrado com sucesso!', 'success');
        app.render();
    }
};

// Exportar para uso global
window.VermifugosRapido = VermifugosRapido;
