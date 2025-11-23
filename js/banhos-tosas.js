/**
 * Módulo de Banhos e Tosas
 * Gerencia registros de higiene e estética do pet
 */

const BanhosTosas = {
    /**
     * Renderiza formulário de banho
     */
    renderBanhoForm() {
        return `
            <div class="form-group">
                <label>Data do Banho *</label>
                <input type="date" id="record-data" required>
            </div>
            <div class="form-group">
                <label>Tipo de Banho *</label>
                <select id="record-tipo" required>
                    <option value="">Selecione...</option>
                    <option value="completo">Banho Completo</option>
                    <option value="simples">Banho Simples</option>
                    <option value="seco">Banho Seco</option>
                    <option value="terapeutico">Banho Terapêutico</option>
                    <option value="hidratacao">Banho com Hidratação</option>
                </select>
            </div>
            <div class="form-group">
                <label>Local</label>
                <input type="text" id="record-local" placeholder="Ex: Pet Shop XYZ, Casa">
            </div>
            <div class="form-group">
                <label>Profissional</label>
                <input type="text" id="record-profissional" placeholder="Nome do banhista">
            </div>
            <div class="form-group">
                <label>Produtos Utilizados</label>
                <textarea id="record-produtos" rows="2" placeholder="Shampoo, condicionador, etc."></textarea>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea id="record-obs" rows="3" placeholder="Comportamento, reações, etc."></textarea>
            </div>
        `;
    },

    /**
     * Renderiza formulário de tosa
     */
    renderTosaForm() {
        return `
            <div class="form-group">
                <label>Data da Tosa *</label>
                <input type="date" id="record-data" required>
            </div>
            <div class="form-group">
                <label>Tipo de Tosa *</label>
                <select id="record-tipo" required>
                    <option value="">Selecione...</option>
                    <option value="higienica">Tosa Higiênica</option>
                    <option value="completa">Tosa Completa</option>
                    <option value="bebe">Tosa Bebê</option>
                    <option value="verao">Tosa de Verão</option>
                    <option value="raca">Tosa de Raça</option>
                    <option value="tesoura">Tosa na Tesoura</option>
                    <option value="maquina">Tosa na Máquina</option>
                </select>
            </div>
            <div class="form-group">
                <label>Local</label>
                <input type="text" id="record-local" placeholder="Ex: Pet Shop XYZ, Casa">
            </div>
            <div class="form-group">
                <label>Profissional</label>
                <input type="text" id="record-profissional" placeholder="Nome do tosador">
            </div>
            <div class="form-group">
                <label>Estilo/Corte</label>
                <input type="text" id="record-estilo" placeholder="Descrição do corte">
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea id="record-obs" rows="3" placeholder="Comportamento, resultado, etc."></textarea>
            </div>
        `;
    },

    /**
     * Obtém dados do formulário de banho
     */
    getBanhoFromForm() {
        const data = document.getElementById('record-data').value;
        const tipo = document.getElementById('record-tipo').value;
        const local = document.getElementById('record-local')?.value || '';
        const profissional = document.getElementById('record-profissional')?.value || '';
        const produtos = document.getElementById('record-produtos')?.value || '';
        const obs = document.getElementById('record-obs')?.value || '';

        if (!data || !tipo) {
            alert('Preencha os campos obrigatórios!');
            return null;
        }

        return {
            id: Date.now(),
            data,
            tipo,
            local,
            profissional,
            produtos,
            obs,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Obtém dados do formulário de tosa
     */
    getTosaFromForm() {
        const data = document.getElementById('record-data').value;
        const tipo = document.getElementById('record-tipo').value;
        const local = document.getElementById('record-local')?.value || '';
        const profissional = document.getElementById('record-profissional')?.value || '';
        const estilo = document.getElementById('record-estilo')?.value || '';
        const obs = document.getElementById('record-obs')?.value || '';

        if (!data || !tipo) {
            alert('Preencha os campos obrigatórios!');
            return null;
        }

        return {
            id: Date.now(),
            data,
            tipo,
            local,
            profissional,
            estilo,
            obs,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Renderiza lista de banhos
     */
    renderBanhosList(banhos) {
        if (!banhos || banhos.length === 0) {
            return '<p class="empty-state">Nenhum banho registrado</p>';
        }

        const sorted = [...banhos].sort((a, b) => new Date(b.data) - new Date(a.data));

        return `
            <div class="records-list">
                ${sorted.map(banho => `
                    <div class="record-card">
                        <div class="record-header">
                            <span class="record-date">🛁 ${this.formatDate(banho.data)}</span>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn-icon" onclick="app.showEditBanho('${banho.id}')" title="Editar">
                                    ✏️
                                </button>
                                <button class="btn-icon" onclick="app.deleteRecord('banhos', '${banho.id}')" title="Excluir">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="record-body">
                            <p><strong>Tipo:</strong> ${this.getTipoLabel(banho.tipo, 'banho')}</p>
                            ${banho.local ? `<p><strong>Local:</strong> ${banho.local}</p>` : ''}
                            ${banho.profissional ? `<p><strong>Profissional:</strong> ${banho.profissional}</p>` : ''}
                            ${banho.produtos ? `<p><strong>Produtos:</strong> ${banho.produtos}</p>` : ''}
                            ${banho.obs ? `<p><strong>Obs:</strong> ${banho.obs}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Renderiza lista de tosas
     */
    renderTosasList(tosas) {
        if (!tosas || tosas.length === 0) {
            return '<p class="empty-state">Nenhuma tosa registrada</p>';
        }

        const sorted = [...tosas].sort((a, b) => new Date(b.data) - new Date(a.data));

        return `
            <div class="records-list">
                ${sorted.map(tosa => `
                    <div class="record-card">
                        <div class="record-header">
                            <span class="record-date">✂️ ${this.formatDate(tosa.data)}</span>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn-icon" onclick="app.showEditTosa('${tosa.id}')" title="Editar">
                                    ✏️
                                </button>
                                <button class="btn-icon" onclick="app.deleteRecord('tosas', '${tosa.id}')" title="Excluir">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="record-body">
                            <p><strong>Tipo:</strong> ${this.getTipoLabel(tosa.tipo, 'tosa')}</p>
                            ${tosa.local ? `<p><strong>Local:</strong> ${tosa.local}</p>` : ''}
                            ${tosa.profissional ? `<p><strong>Profissional:</strong> ${tosa.profissional}</p>` : ''}
                            ${tosa.estilo ? `<p><strong>Estilo:</strong> ${tosa.estilo}</p>` : ''}
                            ${tosa.obs ? `<p><strong>Obs:</strong> ${tosa.obs}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Calcula estatísticas de banhos
     */
    calcularEstatisticasBanhos(banhos) {
        if (!banhos || banhos.length === 0) {
            return {
                total: 0,
                ultimoBanho: null,
                mediaIntervalo: 0,
                proximoRecomendado: null
            };
        }

        const sorted = [...banhos].sort((a, b) => new Date(b.data) - new Date(a.data));
        const ultimoBanho = sorted[0];
        
        // Calcular média de intervalo entre banhos
        let somaIntervalos = 0;
        let countIntervalos = 0;
        
        for (let i = 0; i < sorted.length - 1; i++) {
            const data1 = new Date(sorted[i].data);
            const data2 = new Date(sorted[i + 1].data);
            const intervalo = Math.abs(data1 - data2) / (1000 * 60 * 60 * 24);
            somaIntervalos += intervalo;
            countIntervalos++;
        }
        
        const mediaIntervalo = countIntervalos > 0 ? Math.round(somaIntervalos / countIntervalos) : 15;
        
        // Calcular próximo banho recomendado
        const dataUltimoBanho = new Date(ultimoBanho.data);
        const proximoRecomendado = new Date(dataUltimoBanho);
        proximoRecomendado.setDate(proximoRecomendado.getDate() + mediaIntervalo);
        
        return {
            total: banhos.length,
            ultimoBanho: ultimoBanho.data,
            mediaIntervalo,
            proximoRecomendado: proximoRecomendado.toISOString().split('T')[0]
        };
    },

    /**
     * Formata data para exibição
     */
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    },

    /**
     * Retorna label do tipo
     */
    getTipoLabel(tipo, categoria) {
        const labels = {
            banho: {
                'completo': 'Banho Completo',
                'simples': 'Banho Simples',
                'seco': 'Banho Seco',
                'terapeutico': 'Banho Terapêutico',
                'hidratacao': 'Banho com Hidratação'
            },
            tosa: {
                'higienica': 'Tosa Higiênica',
                'completa': 'Tosa Completa',
                'bebe': 'Tosa Bebê',
                'verao': 'Tosa de Verão',
                'raca': 'Tosa de Raça',
                'tesoura': 'Tosa na Tesoura',
                'maquina': 'Tosa na Máquina'
            }
        };
        
        return labels[categoria]?.[tipo] || tipo;
    }
};

// Exportar para uso global
window.BanhosTosas = BanhosTosas;
