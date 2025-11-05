/**
 * Módulo de Gráfico de Crescimento de Peso
 * Totalmente independente e modular - não afeta o resto do app
 */

const GraficoPeso = {
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
            <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="margin-top: 0; color: #2196F3;">📈 Curva de Crescimento</h3>
                <div style="position: relative; height: 300px;">
                    <canvas id="peso-chart-${pet.id}"></canvas>
                </div>
                <div style="margin-top: 1rem; padding: 0.75rem; background: #e3f2fd; border-radius: 4px;">
                    <p style="margin: 0; font-size: 0.9rem;">
                        <strong>📊 Resumo:</strong><br>
                        Peso atual: <strong>${dados.pesoAtual}</strong><br>
                        Variação: <strong style="color: ${dados.variacao >= 0 ? '#4caf50' : '#f44336'}">
                            ${dados.variacao >= 0 ? '+' : ''}${dados.variacao}
                        </strong><br>
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
    prepararDados(pet) {
        const registros = pet.peso || [];
        
        // Ordenar por data
        const ordenados = [...registros].sort((a, b) => 
            new Date(a.data) - new Date(b.data)
        );

        // Calcular estatísticas
        const pesoAtual = ordenados.length > 0 
            ? Math.round(ordenados[ordenados.length - 1].peso * 1000) + ' g'
            : '0 g';
        
        const pesoInicial = ordenados.length > 0 
            ? ordenados[0].peso * 1000 
            : 0;
        
        const pesoFinal = ordenados.length > 0 
            ? ordenados[ordenados.length - 1].peso * 1000 
            : 0;
        
        const variacao = ordenados.length > 1 
            ? Math.round(pesoFinal - pesoInicial) + ' g'
            : '0 g';

        return {
            registros: ordenados,
            pesoAtual,
            variacao: Math.round(pesoFinal - pesoInicial),
            totalRegistros: ordenados.length
        };
    },

    /**
     * Cria o gráfico usando Chart.js
     */
    criarGrafico(pet, dados) {
        const ctx = document.getElementById(`peso-chart-${pet.id}`);
        if (!ctx) return;

        // Preparar dados para Chart.js
        const labels = dados.registros.map(r => {
            const data = new Date(r.data);
            return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        });

        const pesos = dados.registros.map(r => r.peso * 1000); // Converter para gramas

        // Criar gráfico
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Peso (g)',
                    data: pesos,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.4, // Curva suave
                    fill: true
                }]
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
