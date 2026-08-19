/**
 * Módulo de Gráfico de Crescimento de Peso
 * Totalmente independente e modular - não afeta o resto do app
 * 
 * Funcionalidades:
 * - Gráfico de linha com curva suave
 * - Filtro por período (7 dias, 30 dias, 6 meses, 1 ano, tudo)
 * - Linhas de referência (peso ideal, mínimo, máximo)
 * - Cores dinâmicas para ganho/perda de peso
 * - Curvas padrão por raça
 */

const GraficoPeso = {
    chartInstance: null, // Armazenar instância do gráfico para destruir ao atualizar

    pesoEmKg(registro) {
        if (window.PetHouseWeight?.kg) return window.PetHouseWeight.kg(registro);
        const raw = Number(registro?.valor ?? registro?.peso ?? 0);
        return Number.isFinite(raw) && raw > 1000 ? raw / 1000 : (Number.isFinite(raw) ? raw : 0);
    },
    
    /**
     * Renderiza o gráfico de peso do pet
     * @param {Object} pet - Objeto do pet com dados de peso
     * @param {string} containerId - ID do elemento onde o gráfico será renderizado
     */
    renderizar(pet, containerId) {
        if (!pet || !pet.peso || pet.peso.length === 0) {
            return this.renderizarMensagemVazia(containerId);
        }

        // Preparar dados para o gráfico
        const dados = this.prepararDados(pet);
        
        // Criar HTML do container do gráfico
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container do gráfico não encontrado:', containerId);
            return;
        }

        // Renderizar gráfico usando Chart.js
        container.innerHTML = `
            <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: #2196F3;">📈 Curva de Crescimento</h3>
                    <select id="periodo-filtro-${pet.id}" onchange="GraficoPeso.aplicarFiltro('${pet.id}')" 
                            style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                        <option value="tudo">Todo período</option>
                        <option value="7">Últimos 7 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="180">Últimos 6 meses</option>
                        <option value="365">Último ano</option>
                    </select>
                </div>
                
                <!-- Configurações de referência -->
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
                    <details>
                        <summary style="cursor: pointer; font-weight: bold; color: #666;">⚙️ Configurar Linhas de Referência</summary>
                        <div style="margin-top: 0.75rem;">
                            ${this.obterBotaoCurvaRaca(pet)}
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem;">
                                <div>
                                    <label style="font-size: 0.85rem; color: #666;">Peso Ideal (g):</label>
                                    <input type="number" id="peso-ideal-${pet.id}" placeholder="Ex: 5000" 
                                           style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;"
                                           onchange="GraficoPeso.atualizarReferencias('${pet.id}')">
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #666;">Peso Mínimo (g):</label>
                                    <input type="number" id="peso-minimo-${pet.id}" placeholder="Ex: 4000" 
                                           style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;"
                                           onchange="GraficoPeso.atualizarReferencias('${pet.id}')">
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: #666;">Peso Máximo (g):</label>
                                    <input type="number" id="peso-maximo-${pet.id}" placeholder="Ex: 6000" 
                                           style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;"
                                           onchange="GraficoPeso.atualizarReferencias('${pet.id}')">
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
                
                <div style="position: relative; height: 300px;">
                    <canvas id="peso-chart-${pet.id}"></canvas>
                </div>
                
                <div style="margin-top: 1rem; padding: 0.75rem; background: #e3f2fd; border-radius: 4px;">
                    <p style="margin: 0; font-size: 0.9rem;">
                        <strong>📊 Resumo:</strong><br>
                        Peso atual: <strong>${dados.pesoAtual}</strong><br>
                        Variação: <strong style="color: ${dados.variacao >= 0 ? '#4caf50' : '#f44336'}">
                            ${dados.variacao >= 0 ? '+' : ''}${dados.variacao} g
                        </strong>
                        ${dados.variacao >= 0 ? ' 📈' : ' 📉'}<br>
                        Total de registros: <strong>${dados.totalRegistros}</strong>
                    </p>
                </div>
            </div>
        `;

        // Criar gráfico com Chart.js
        this.criarGrafico(pet, dados);
    },

    /**
     * Prepara os dados do pet para o gráfico
     */
    prepararDados(pet, diasFiltro = null) {
        const registros = pet.peso || [];
        
        // Ordenar por data
        let ordenados = [...registros].sort((a, b) => 
            new Date(a.data) - new Date(b.data)
        );

        // Aplicar filtro de período se especificado
        if (diasFiltro && diasFiltro !== 'tudo') {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - parseInt(diasFiltro));
            ordenados = ordenados.filter(r => new Date(r.data) >= dataLimite);
        }

        // Calcular estatísticas
        const pesoAtual = ordenados.length > 0
            ? Math.round(this.pesoEmKg(ordenados[ordenados.length - 1]) * 1000) + ' g'
            : '0 g';
        
        const pesoInicial = ordenados.length > 0
            ? this.pesoEmKg(ordenados[0]) * 1000
            : 0;
        
        const pesoFinal = ordenados.length > 0
            ? this.pesoEmKg(ordenados[ordenados.length - 1]) * 1000
            : 0;
        
        const variacao = ordenados.length > 1 
            ? Math.round(pesoFinal - pesoInicial)
            : 0;

        return {
            registros: ordenados,
            pesoAtual,
            variacao,
            totalRegistros: ordenados.length
        };
    },

    /**
     * Cria o gráfico usando Chart.js
     */
    criarGrafico(pet, dados) {
        const ctx = document.getElementById(`peso-chart-${pet.id}`);
        if (!ctx) return;

        // Destruir gráfico anterior se existir
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Preparar dados para Chart.js
        const labels = dados.registros.map(r => {
            const data = new Date(r.data);
            return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        });

        const pesos = dados.registros.map(r => this.pesoEmKg(r) * 1000); // Converter para gramas somente no eixo

        // Determinar cor da linha baseado na tendência
        const tendencia = dados.variacao >= 0 ? 'ganho' : 'perda';
        const corLinha = tendencia === 'ganho' ? '#4caf50' : '#2196F3';
        const corFundo = tendencia === 'ganho' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)';

        // Criar datasets
        const datasets = [{
            label: 'Peso (g)',
            data: pesos,
            borderColor: corLinha,
            backgroundColor: corFundo,
            borderWidth: 3,
            pointBackgroundColor: corLinha,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4, // Curva suave
            fill: true
        }];

        // Criar gráfico
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return 'Peso: ' + context.parsed.y + ' g';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value + ' g';
                            },
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Armazenar referência ao pet para uso posterior
        this.chartInstance.petData = { pet, dados };
    },

    /**
     * Aplica filtro de período ao gráfico
     */
    aplicarFiltro(petId) {
        const select = document.getElementById(`periodo-filtro-${petId}`);
        const periodo = select.value;
        
        // Recuperar pet dos dados do gráfico
        if (!this.chartInstance || !this.chartInstance.petData) return;
        
        const { pet } = this.chartInstance.petData;
        const dados = this.prepararDados(pet, periodo);
        
        // Recriar gráfico com novos dados
        this.criarGrafico(pet, dados);
        this.atualizarReferencias(petId);
    },

    /**
     * Atualiza linhas de referência no gráfico
     */
    atualizarReferencias(petId) {
        if (!this.chartInstance || !this.chartInstance.petData) return;

        const pesoIdeal = document.getElementById(`peso-ideal-${petId}`)?.value;
        const pesoMinimo = document.getElementById(`peso-minimo-${petId}`)?.value;
        const pesoMaximo = document.getElementById(`peso-maximo-${petId}`)?.value;

        // Remover datasets de referência existentes
        this.chartInstance.data.datasets = this.chartInstance.data.datasets.filter(
            ds => !ds.isReference
        );

        // Adicionar linhas de referência se especificadas
        if (pesoIdeal) {
            this.chartInstance.data.datasets.push({
                label: 'Peso Ideal',
                data: Array(this.chartInstance.data.labels.length).fill(parseInt(pesoIdeal)),
                borderColor: '#4caf50',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                isReference: true
            });
        }

        if (pesoMinimo) {
            this.chartInstance.data.datasets.push({
                label: 'Peso Mínimo',
                data: Array(this.chartInstance.data.labels.length).fill(parseInt(pesoMinimo)),
                borderColor: '#ff9800',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                isReference: true
            });
        }

        if (pesoMaximo) {
            this.chartInstance.data.datasets.push({
                label: 'Peso Máximo',
                data: Array(this.chartInstance.data.labels.length).fill(parseInt(pesoMaximo)),
                borderColor: '#f44336',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                isReference: true
            });
        }

        // Atualizar legenda se houver referências
        if (pesoIdeal || pesoMinimo || pesoMaximo) {
            this.chartInstance.options.plugins.legend.display = true;
        }

        this.chartInstance.update();
    },

    /**
     * Obtém botão para aplicar curva padrão da raça
     */
    obterBotaoCurvaRaca(pet) {
        if (!window.CurvasRaca || !pet.raca) return '';
        
        const curva = window.CurvasRaca.buscarCurva(pet.raca);
        if (!curva) return '';
        
        return `
            <div style="background: #e8f5e9; padding: 0.75rem; border-radius: 4px; margin-bottom: 0.75rem;">
                <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #2e7d32;">
                    📈 <strong>Curva padrão disponível para ${pet.raca}</strong>
                </p>
                <button onclick="GraficoPeso.aplicarCurvaPadrao('${pet.id}')" 
                        style="background: #4caf50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                    ✨ Aplicar Valores Padrão da Raça
                </button>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #666;">
                    Peso adulto ideal: ${curva.pesoAdulto.ideal}g (${curva.pesoAdulto.min}-${curva.pesoAdulto.max}g)
                </p>
            </div>
        `;
    },
    
    /**
     * Aplica curva padrão da raça aos campos de referência
     */
    aplicarCurvaPadrao(petId) {
        if (!this.chartInstance || !this.chartInstance.petData) return;
        
        const { pet } = this.chartInstance.petData;
        const curva = window.CurvasRaca.buscarCurva(pet.raca);
        
        if (!curva) {
            if(window.app && window.app.showToast) window.app.showToast('❌ Curva padrão não encontrada para esta raça.', 'error');
            return;
        }
        
        // Preencher campos
        document.getElementById(`peso-ideal-${petId}`).value = curva.pesoAdulto.ideal;
        document.getElementById(`peso-minimo-${petId}`).value = curva.pesoAdulto.min;
        document.getElementById(`peso-maximo-${petId}`).value = curva.pesoAdulto.max;
        
        // Atualizar gráfico
        this.atualizarReferencias(petId);
        if (window.app && window.app.showToast) window.app.showToast('✅ Valores padrão aplicados com sucesso!', 'success');
    },

    /**
     * Renderiza mensagem quando não há dados
     */
    renderizarMensagemVazia(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="background: #f5f5f5; padding: 2rem; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666;">
                    📊 Adicione registros de peso para visualizar o gráfico de crescimento
                </p>
            </div>
        `;
    }
};

// Exportar para uso global
window.GraficoPeso = GraficoPeso;
