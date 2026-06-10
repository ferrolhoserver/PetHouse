/**
 * Módulo de Visualização de Exames
 * Gráficos e comparações de exames laboratoriais
 */

const VisualizacaoExames = {
    /**
     * Renderiza aba de exames com OCR e visualizações
     */
    renderizar(pet) {
        const exames = pet.exames || [];
        const examesLab = exames.filter(e => e.tipo === 'laboratorial').sort((a, b) => new Date(b.data) - new Date(a.data));

        let html = `
            <div class="tab-content">
                <h3 style="margin-bottom: 1rem;">🔬 Exames Laboratoriais</h3>
                
                <button class="btn btn-primary" onclick="OCRExames.mostrarEscaneamento('${pet.id}')" style="margin-bottom: 1.5rem;">
                    📄 Escanear Novo Exame
                </button>

                ${examesLab.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; color: #999;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📄</div>
                        <p>Nenhum exame cadastrado ainda</p>
                        <p style="font-size: 0.9rem;">Clique em "Escanear Novo Exame" para começar</p>
                    </div>
                ` : `
                    ${this.renderizarResumo(examesLab)}
                    ${this.renderizarComparacao(examesLab)}
                    ${this.renderizarLista(examesLab, pet.id)}
                `}
            </div>
        `;

        return html;
    },

    /**
     * Renderiza resumo dos exames
     */
    renderizarResumo(exames) {
        const ultimo = exames[0];
        const totalParametros = ultimo.parametros.length;
        const normais = ultimo.parametros.filter(p => p.status.tipo === 'normal').length;
        const alterados = totalParametros - normais;

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${exames.length}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Exames</div>
                </div>
                <div style="background: linear-gradient(135deg, #2196F3 0%, #42a5f5 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${totalParametros}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Parâmetros</div>
                </div>
                <div style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${normais}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Normais</div>
                </div>
                <div style="background: linear-gradient(135deg, #f44336 0%, #ef5350 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${alterados}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Alterados</div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza comparação entre exames
     */
    renderizarComparacao(exames) {
        if (exames.length < 2) return '';

        const exameNovo = exames[0];
        const exameAntigo = exames[1];
        const comparacoes = OCRExames.compararExames(exameAntigo, exameNovo);

        if (comparacoes.length === 0) return '';

        return `
            <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 1rem 0;">📊 Comparação de Exames</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.9rem; color: #666;">
                    <div>
                        <strong>Anterior:</strong> ${new Date(exameAntigo.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                        <strong>Atual:</strong> ${new Date(exameNovo.data).toLocaleDateString('pt-BR')}
                    </div>
                </div>

                ${comparacoes.map(c => `
                    <div style="background: #f5f5f5; padding: 0.75rem; border-radius: 4px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <strong>${c.nome}</strong>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="text-align: center;">
                                <div style="font-size: 0.85rem; color: #999;">Anterior</div>
                                <div style="font-weight: bold;">${c.valorAntigo}</div>
                            </div>
                            <div style="font-size: 1.5rem; color: ${c.tendencia.cor};">
                                ${c.tendencia.icone}
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 0.85rem; color: #999;">Atual</div>
                                <div style="font-weight: bold;">${c.valorNovo}</div>
                            </div>
                            <div style="text-align: right; min-width: 60px;">
                                <div style="font-weight: bold; color: ${c.tendencia.cor};">
                                    ${c.tendencia.texto}
                                </div>
                                <div style="font-size: 0.8rem; color: #999;">${c.unidade}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}

                <button class="btn btn-small" onclick="VisualizacaoExames.mostrarGraficos('${exames[0].id}')" style="margin-top: 1rem;">
                    📈 Ver Gráficos de Evolução
                </button>
            </div>
        `;
    },

    /**
     * Renderiza lista de exames
     */
    renderizarLista(exames, petId) {
        return `
            <div>
                <h4 style="margin: 0 0 1rem 0;">📋 Histórico de Exames</h4>
                ${exames.map(exame => this.renderizarExame(exame, petId)).join('')}
            </div>
        `;
    },

    /**
     * Renderiza um exame individual
     */
    renderizarExame(exame, petId) {
        const hemograma = exame.parametros.filter(p => p.tipo === 'hemograma');
        const bioquimica = exame.parametros.filter(p => p.tipo === 'bioquimica');
        const eletrolitos = exame.parametros.filter(p => p.tipo === 'eletrolitos');

        return `
            <details style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 1rem;">
                <summary style="cursor: pointer; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                    <span>📄 Exame de ${new Date(exame.data).toLocaleDateString('pt-BR')}</span>
                    <span style="font-size: 0.9rem; color: #666; font-weight: normal;">
                        ${exame.parametros.length} parâmetros
                    </span>
                </summary>
                
                <div style="margin-top: 1rem;">
                    ${hemograma.length > 0 ? `
                        <h5 style="margin: 1rem 0 0.5rem 0; color: #e91e63;">🔴 Hemograma</h5>
                        ${this.renderizarParametros(hemograma)}
                    ` : ''}
                    
                    ${bioquimica.length > 0 ? `
                        <h5 style="margin: 1rem 0 0.5rem 0; color: #2196F3;">🧪 Bioquímica</h5>
                        ${this.renderizarParametros(bioquimica)}
                    ` : ''}
                    
                    ${eletrolitos.length > 0 ? `
                        <h5 style="margin: 1rem 0 0.5rem 0; color: #ff9800;">⚡ Eletrólitos</h5>
                        ${this.renderizarParametros(eletrolitos)}
                    ` : ''}

                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-small" onclick="VisualizacaoExames.excluirExame('${petId}', '${exame.id}')">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            </details>
        `;
    },

    /**
     * Renderiza lista de parâmetros
     */
    renderizarParametros(parametros) {
        return parametros.map(p => `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${p.nome}</strong>
                    <div style="font-size: 0.85rem; color: #666;">
                        Ref: ${p.min} - ${p.max} ${p.unidade}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${p.status.cor};">
                        ${p.valor} ${p.unidade}
                    </div>
                    <div style="font-size: 0.85rem; color: ${p.status.cor};">
                        ${p.status.icone} ${p.status.texto}
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Mostra gráficos de evolução
     */
    mostrarGraficos(petId) {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet || !pet.exames) return;

        const exames = pet.exames.filter(e => e.tipo === 'laboratorial');
        
        // Coletar todos os parâmetros únicos
        const parametrosUnicos = [...new Set(exames.flatMap(e => e.parametros.map(p => p.nome)))];

        const modalContent = `
            <div class="modal-header">
                <h2>📈 Gráficos de Evolução</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem; max-height: 70vh; overflow-y: auto;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Selecione o parâmetro:</label>
                    <select id="parametro-grafico" onchange="VisualizacaoExames.atualizarGrafico('${petId}')" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
                        ${parametrosUnicos.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>

                <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <canvas id="grafico-evolucao" style="max-height: 400px;"></canvas>
                </div>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');

        // Renderizar primeiro gráfico
        setTimeout(() => this.atualizarGrafico(petId), 100);
    },

    /**
     * Atualiza gráfico de evolução
     */
    atualizarGrafico(petId) {
        const pet = app.data.pets.find(p => p.id === petId);
        const parametro = document.getElementById('parametro-grafico').value;
        
        const exames = pet.exames.filter(e => e.tipo === 'laboratorial');
        const dados = OCRExames.gerarDadosGrafico(exames, parametro);

        if (dados.length === 0) return;

        // Pegar valores de referência do primeiro exame
        const primeiroParam = exames[0].parametros.find(p => p.nome === parametro);
        const min = primeiroParam?.min || 0;
        const max = primeiroParam?.max || 100;

        const ctx = document.getElementById('grafico-evolucao');
        
        // Destruir gráfico anterior se existir
        if (window.graficoEvolucao) {
            window.graficoEvolucao.destroy();
        }

        window.graficoEvolucao = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dados.map(d => new Date(d.data).toLocaleDateString('pt-BR')),
                datasets: [
                    {
                        label: parametro,
                        data: dados.map(d => d.valor),
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: dados.map(d => d.status.cor),
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Limite Superior',
                        data: Array(dados.length).fill(max),
                        borderColor: '#f44336',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Limite Inferior',
                        data: Array(dados.length).fill(min),
                        borderColor: '#f44336',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `${parametro}: ${context.parsed.y} ${primeiroParam.unidade}`;
                                }
                                return context.dataset.label + ': ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: primeiroParam.unidade
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Data do Exame'
                        }
                    }
                }
            }
        });
    },

    /**
     * Exclui exame
     */
        excluirExame(petId, exameId) {
        const _em = document.createElement('div');
        _em.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
        _em.innerHTML = `<div style="background:white;border-radius:16px;padding:1.5rem;max-width:320px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;"><div style="font-size:2.5rem;margin-bottom:0.75rem;">🗑️</div><h3 style="margin:0 0 0.5rem;color:#333;font-size:1.1rem;">Excluir exame?</h3><p style="margin:0 0 1.25rem;color:#666;font-size:0.9rem;">Esta ação não pode ser desfeita.</p><div style="display:flex;gap:0.75rem;"><button id="_exc" style="flex:1;padding:0.75rem;border:2px solid #ddd;background:white;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#666;font-weight:600;">Cancelar</button><button id="_exo" style="flex:1;padding:0.75rem;border:none;background:#f44336;color:white;border-radius:10px;font-size:0.9rem;cursor:pointer;font-weight:700;">Excluir</button></div></div>`;
        document.body.appendChild(_em);
        document.getElementById('_exc').onclick = () => _em.remove();
        document.getElementById('_exo').onclick = () => {
            _em.remove();
            const pet = app.data.pets.find(p => p.id === petId);
            if (!pet) return;
            pet.exames = pet.exames.filter(e => e.id !== exameId);
            app.saveData();
            app.showToast('✅ Exame excluído', 'success');
            app.render();
        };
    }
};

// Exportar para uso global
window.VisualizacaoExames = VisualizacaoExames;
