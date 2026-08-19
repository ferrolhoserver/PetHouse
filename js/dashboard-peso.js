/**
 * Dashboard Profissional de Peso
 * Sistema inteligente com gráfico de evolução e análise de tendências
 */

const DashboardPeso = {
    
    pesoEmKg(registro) {
        if (window.PetHouseWeight?.kg) return window.PetHouseWeight.kg(registro);
        const raw = Number(registro?.valor ?? registro?.peso ?? 0);
        return Number.isFinite(raw) && raw > 1000 ? raw / 1000 : (Number.isFinite(raw) ? raw : 0);
    },

    /**
     * Calcular estatísticas de peso
     */
    calcularEstatisticas(pet) {
        if (!pet.peso || pet.peso.length === 0) {
            return {
                pesoAtual: 0,
                pesoAnterior: 0,
                variacao: 0,
                tendencia: 'estavel',
                totalRegistros: 0
            };
        }
        
        const pesos = [...pet.peso].sort((a, b) => new Date(b.data) - new Date(a.data));
        const pesoAtual = this.pesoEmKg(pesos[0]);
        const pesoAnterior = pesos.length > 1 ? this.pesoEmKg(pesos[1]) : pesoAtual;
        const variacao = pesoAtual - pesoAnterior;
        
        let tendencia = 'estavel';
        if (variacao > 0.5) tendencia = 'subindo';
        else if (variacao < -0.5) tendencia = 'descendo';
        
        return {
            pesoAtual,
            pesoAnterior,
            variacao,
            tendencia,
            totalRegistros: pet.peso.length
        };
    },
    
    /**
     * Renderizar cards de estatísticas
     */
    renderCards(stats) {
        // Tratar valores undefined/NaN
        const pesoAtual = stats.pesoAtual || 0;
        const variacao = stats.variacao || 0;
        const totalRegistros = stats.totalRegistros || 0;
        
        const iconeTendencia = stats.tendencia === 'subindo' ? '📈' : stats.tendencia === 'descendo' ? '📉' : '➡️';
        const corTendencia = stats.tendencia === 'subindo' ? '#4CAF50' : stats.tendencia === 'descendo' ? '#ff9800' : '#2196F3';
        const textoVariacao = variacao > 0 ? `+${variacao.toFixed(1)}` : variacao.toFixed(1);
        
        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;margin-bottom:2rem">
                <!-- Peso Atual -->
                <div style="background:linear-gradient(135deg,#2196F3,#64B5F6);color:white;padding:2rem;border-radius:16px;box-shadow:0 4px 16px rgba(33,150,243,0.3)">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem">⚖️ Peso Atual</div>
                    <div style="font-size:2.5rem;font-weight:700">${pesoAtual.toFixed(1)} kg</div>
                </div>
                
                <!-- Variação -->
                <div style="background:linear-gradient(135deg,${corTendencia},${corTendencia}dd);color:white;padding:2rem;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.2)">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem">${iconeTendencia} Variação</div>
                    <div style="font-size:2.5rem;font-weight:700">${textoVariacao} kg</div>
                </div>
                
                <!-- Total de Registros -->
                <div style="background:linear-gradient(135deg,#9C27B0,#BA68C8);color:white;padding:2rem;border-radius:16px;box-shadow:0 4px 16px rgba(156,39,176,0.3)">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem">📊 Registros</div>
                    <div style="font-size:2.5rem;font-weight:700">${totalRegistros}</div>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar gráfico de evolução
     */
    renderGrafico(pet) {
        if (!pet.peso || pet.peso.length === 0) {
            return `
                <div style="background:#f5f5f5;padding:3rem;border-radius:16px;text-align:center;margin-bottom:2rem">
                    <div style="font-size:3rem;margin-bottom:1rem">📊</div>
                    <div style="color:#999;font-size:1.1rem;margin-bottom:0.5rem">Nenhum registro de peso</div>
                    <div style="color:#bbb;font-size:0.9rem">Adicione registros para visualizar o gráfico de evolução</div>
                </div>
            `;
        }
        
        return `
            <div style="background:white;padding:1.5rem;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-bottom:2rem">
                <h3 style="margin-bottom:1.5rem;color:#333">📈 Evolução de Peso</h3>
                <canvas id="grafico-peso-dashboard" style="max-height:300px"></canvas>
            </div>
        `;
    },
    
    /**
     * Criar gráfico no canvas (deve ser chamado DEPOIS do render)
     */
    criarGrafico(pet) {
        if (!pet.peso || pet.peso.length === 0) return;
        
        const ctx = document.getElementById('grafico-peso-dashboard');
        if (!ctx) return;
        
        // Ordenar por data
        const pesos = [...pet.peso].sort((a, b) => new Date(a.data) - new Date(b.data));
        
        // Preparar dados
        const labels = pesos.map(p => new Date(p.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
        const valores = pesos.map(p => this.pesoEmKg(p));
        
        const minPeso = Math.min(...valores);
        const maxPeso = Math.max(...valores);
        const range = maxPeso - minPeso;
        const yMin = Math.max(0, minPeso - range * 0.1);
        const yMax = maxPeso + range * 0.1;
        
        // Destruir gráfico anterior se existir
        if (window.graficoPesoDashboard) {
            window.graficoPesoDashboard.destroy();
        }
        
        // Criar novo gráfico
        window.graficoPesoDashboard = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Peso (kg)',
                    data: valores,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: function(context) {
                                return 'Peso: ' + context.parsed.y.toFixed(1) + ' kg';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: yMin,
                        max: yMax,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + ' kg';
                            },
                            font: { size: 12 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 }
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
     * Renderizar análise de tendência
     */
    renderAnalise(stats, pet) {
        if (!pet.peso || pet.peso.length < 2) {
            return '';
        }
        
        // Obter peso ideal da raça
        let pesoIdeal = pet.pesoIdeal || stats.pesoAtual;
        if (window.BaseRacas) {
            const infoRaca = window.BaseRacas.obterRecomendacoes(pet);
            pesoIdeal = (infoRaca.pesoIdeal.min + infoRaca.pesoIdeal.max) / 2;
        }
        const diferenca = stats.pesoAtual - pesoIdeal;
        
        let statusCor = '#4CAF50';
        let statusTexto = 'Peso ideal';
        let statusIcon = '✅';
        let recomendacao = 'Seu pet está no peso ideal! Continue com a alimentação e exercícios atuais.';
        
        if (diferenca > 2) {
            statusCor = '#ff9800';
            statusTexto = 'Acima do peso';
            statusIcon = '⚠️';
            recomendacao = 'Seu pet está acima do peso ideal. Considere ajustar a alimentação e aumentar os exercícios. Consulte um veterinário.';
        } else if (diferenca < -2) {
            statusCor = '#ff9800';
            statusTexto = 'Abaixo do peso';
            statusIcon = '⚠️';
            recomendacao = 'Seu pet está abaixo do peso ideal. Verifique a alimentação e consulte um veterinário para avaliação.';
        }
        
        return `
            <div style="background:linear-gradient(135deg,#E3F2FD,#BBDEFB);padding:1.5rem;border-radius:16px">
                <h3 style="margin-bottom:1rem;color:#1976D2">💡 Análise de Peso</h3>
                
                <div style="background:white;padding:1.25rem;border-radius:12px;margin-bottom:1rem;border-left:4px solid ${statusCor}">
                    <div style="font-weight:600;color:#333;margin-bottom:0.5rem;font-size:1.1rem">
                        ${statusIcon} ${statusTexto}
                    </div>
                    <div style="color:#666;font-size:0.9rem;margin-bottom:0.75rem">
                        Peso atual: ${stats.pesoAtual} kg | Peso ideal: ${pesoIdeal} kg
                    </div>
                    <div style="color:#666;font-size:0.9rem">
                        ${recomendacao}
                    </div>
                </div>
                
                ${stats.tendencia !== 'estavel' ? `
                    <div style="background:white;padding:1.25rem;border-radius:12px">
                        <div style="font-weight:600;color:#333;margin-bottom:0.5rem">
                            ${stats.tendencia === 'subindo' ? '📈' : '📉'} Tendência: ${stats.tendencia === 'subindo' ? 'Ganho de peso' : 'Perda de peso'}
                        </div>
                        <div style="color:#666;font-size:0.9rem">
                            Variação de ${Math.abs(stats.variacao).toFixed(1)} kg desde o último registro
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    /**
     * Renderizar botão de adicionar peso
     */
    renderBotaoAdicionar() {
        return `
            <div style="margin-bottom:1.5rem">
                <button onclick="app.showAddRecord()" style="
                    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                    color: white;
                    border: none;
                    padding: 0.875rem 1.5rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(33, 150, 243, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(33, 150, 243, 0.3)'">
                    <span style="font-size:1.2rem">⚖️</span>
                    Adicionar Peso
                </button>
            </div>
        `;
    },
    
    /**
     * Renderizar lista de registros de peso
     */
    renderListaRegistros(pet) {
        if (!pet.peso || pet.peso.length === 0) {
            return '';
        }
        
        const registros = [...pet.peso].sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let html = `
            <div style="background:white;padding:1.5rem;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-top:2rem">
                <h3 style="margin-bottom:1rem;color:#333">📋 Histórico de Peso</h3>
                <div style="display:flex;flex-direction:column;gap:0.75rem">
        `;
        
        registros.forEach((registro, index) => {
            const data = new Date(registro.data).toLocaleDateString('pt-BR');
            const peso = this.pesoEmKg(registro);
            const pesoKg = peso.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
            const pesoGramas = Math.round(peso * 1000);
            const pesoExibido = peso > 0 && peso < 1 ? `${pesoGramas} g` : `${pesoKg} kg`;
            
            html += `
                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:1rem;
                    background:#f9f9f9;
                    border-radius:8px;
                    border-left:4px solid #2196F3;
                ">
                    <div style="flex:1">
                        <div style="font-weight:600;color:#333;margin-bottom:0.25rem">
                            ${pesoExibido}
                        </div>
                        <div style="font-size:0.85rem;color:#666">
                            📅 ${data}
                        </div>
                        ${registro.obs ? `<div style="font-size:0.85rem;color:#666;margin-top:0.25rem">📝 ${registro.obs}</div>` : ''}
                    </div>
                    <div style="display:flex;gap:0.5rem">
                        <button onclick="app.editRecord(${pet.peso.indexOf(registro)})" style="
                            background:#2196F3;
                            color:white;
                            border:none;
                            padding:0.5rem 0.75rem;
                            border-radius:6px;
                            cursor:pointer;
                            font-size:0.85rem;
                        ">✏️ Editar</button>
                        <button onclick="app.deleteRecord(${pet.peso.indexOf(registro)})" style="
                            background:#f44336;
                            color:white;
                            border:none;
                            padding:0.5rem 0.75rem;
                            border-radius:6px;
                            cursor:pointer;
                            font-size:0.85rem;
                        ">🗑️ Excluir</button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    },
    
    /**
     * Renderizar dashboard completo
     */
    render(pet) {
        const stats = this.calcularEstatisticas(pet);
        
        return `
            <div style="padding:1.5rem">
                ${this.renderBotaoAdicionar()}
                ${this.renderCards(stats)}
                ${this.renderGrafico(pet)}
                ${this.renderAnalise(stats, pet)}
                ${this.renderListaRegistros(pet)}
            </div>
        `;
    }
};

// Exportar para uso global
window.DashboardPeso = DashboardPeso;
console.log('✅ Dashboard de Peso carregado');
