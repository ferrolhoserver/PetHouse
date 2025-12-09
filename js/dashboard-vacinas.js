/**
 * Dashboard Profissional de Vacinas
 * Sistema inteligente com calendário visual, barras de progresso e alertas
 */

const DashboardVacinas = {
    
    /**
     * Calcular estatísticas de vacinas
     */
    calcularEstatisticas(pet) {
        if (!pet.vacinas || pet.vacinas.length === 0) {
            return {
                total: 0,
                emDia: 0,
                atrasadas: 0,
                proximasVacinas: [],
                cobertura: 0
            };
        }
        
        const hoje = new Date();
        let emDia = 0;
        let atrasadas = 0;
        const proximasVacinas = [];
        
        pet.vacinas.forEach(v => {
            if (v.aplicada) {
                const ultimaAplicacao = new Date(v.data);
                const proximaData = new Date(ultimaAplicacao);
                
                // Calcular próxima data baseado na periodicidade
                if (v.periodicidade === 'anual') {
                    proximaData.setFullYear(proximaData.getFullYear() + 1);
                } else if (v.periodicidade === 'semestral') {
                    proximaData.setMonth(proximaData.getMonth() + 6);
                } else if (v.periodicidade === 'trimestral') {
                    proximaData.setMonth(proximaData.getMonth() + 3);
                }
                
                const diasAteProxima = Math.ceil((proximaData - hoje) / (1000 * 60 * 60 * 24));
                
                if (diasAteProxima < 0) {
                    atrasadas++;
                } else {
                    emDia++;
                }
                
                if (diasAteProxima <= 30 && diasAteProxima >= 0) {
                    proximasVacinas.push({
                        nome: v.nome,
                        data: proximaData,
                        diasRestantes: diasAteProxima
                    });
                }
            } else {
                atrasadas++;
                proximasVacinas.push({
                    nome: v.nome,
                    data: hoje,
                    diasRestantes: 0,
                    nuncaAplicada: true
                });
            }
        });
        
        const cobertura = pet.vacinas.length > 0 
            ? Math.round((emDia / pet.vacinas.length) * 100) 
            : 0;
        
        proximasVacinas.sort((a, b) => a.diasRestantes - b.diasRestantes);
        
        return {
            total: pet.vacinas.length,
            emDia,
            atrasadas,
            proximasVacinas: proximasVacinas.slice(0, 5),
            cobertura
        };
    },
    
    /**
     * Renderizar cards de estatísticas
     */
    renderCards(stats) {
        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;margin-bottom:2rem">
                <!-- Total de Vacinas -->
                <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:2rem;border-radius:16px;box-shadow:0 4px 16px rgba(102,126,234,0.3)">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem">💉 Total de Vacinas</div>
                    <div style="font-size:2.5rem;font-weight:700">${stats.total}</div>
                </div>
                
                <!-- Em Dia -->
                <div style="background:linear-gradient(135deg,#4CAF50,#66bb6a);color:white;padding:2rem;border-radius:16px;box-shadow:0 4px 16px rgba(76,175,80,0.3)">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem">✓ Em Dia</div>
                    <div style="font-size:2.5rem;font-weight:700">${stats.emDia}</div>
                </div>
                
                <!-- Atrasadas -->
                <div style="background:linear-gradient(135deg,${stats.atrasadas > 0 ? '#f44336,#e57373' : '#9E9E9E,#BDBDBD'});color:white;padding:2rem;border-radius:16px;box-shadow:0 4px 16px rgba(244,67,54,0.3)">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem">⚠️ Atrasadas</div>
                    <div style="font-size:2.5rem;font-weight:700">${stats.atrasadas}</div>
                </div>
                
                <!-- Cobertura -->
                <div style="background:linear-gradient(135deg,#2196F3,#64B5F6);color:white;padding:2rem;border-radius:16px;box-shadow:0 4px 16px rgba(33,150,243,0.3)">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem">📊 Cobertura</div>
                    <div style="font-size:2.5rem;font-weight:700">${stats.cobertura}%</div>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar calendário de próximas vacinas
     */
    renderCalendario(stats) {
        if (stats.proximasVacinas.length === 0) {
            return `
                <div style="background:#E8F5E9;padding:2rem;border-radius:16px;text-align:center;margin-bottom:2rem">
                    <div style="font-size:3rem;margin-bottom:1rem">✅</div>
                    <div style="font-size:1.2rem;font-weight:600;color:#2E7D32;margin-bottom:0.5rem">
                        Todas as vacinas em dia!
                    </div>
                    <div style="color:#558B2F;font-size:0.9rem">
                        Nenhuma vacina programada para os próximos 30 dias
                    </div>
                </div>
            `;
        }
        
        return `
            <div style="background:linear-gradient(135deg,#FFF3E0,#FFE0B2);padding:1.5rem;border-radius:16px;margin-bottom:2rem">
                <h3 style="margin-bottom:1.5rem;color:#E65100;display:flex;align-items:center;gap:0.5rem">
                    📅 Próximas Vacinas (30 dias)
                </h3>
                
                <div style="display:flex;flex-direction:column;gap:1rem">
                    ${stats.proximasVacinas.map(v => {
                        const cor = v.nuncaAplicada 
                            ? '#f44336' 
                            : v.diasRestantes <= 7 
                                ? '#ff9800' 
                                : '#4CAF50';
                        
                        const status = v.nuncaAplicada
                            ? 'Nunca aplicada'
                            : v.diasRestantes === 0
                                ? 'HOJE'
                                : v.diasRestantes === 1
                                    ? 'Amanhã'
                                    : `Em ${v.diasRestantes} dias`;
                        
                        return `
                            <div style="background:white;padding:1.25rem;border-radius:12px;border-left:4px solid ${cor};display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
                                <div>
                                    <div style="font-weight:600;color:#333;font-size:1.1rem;margin-bottom:0.25rem">
                                        💉 ${v.nome}
                                    </div>
                                    <div style="color:#666;font-size:0.9rem">
                                        ${v.data.toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                                <div style="background:${cor};color:white;padding:0.5rem 1rem;border-radius:8px;font-weight:600;font-size:0.9rem">
                                    ${status}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar barras de progresso por vacina
     */
    renderBarrasProgresso(pet) {
        if (!pet.vacinas || pet.vacinas.length === 0) {
            return `
                <div style="background:#f5f5f5;padding:2rem;border-radius:16px;text-align:center">
                    <div style="color:#999;font-size:1.1rem">📋 Nenhuma vacina cadastrada</div>
                </div>
            `;
        }
        
        const hoje = new Date();
        
        return `
            <div style="background:white;padding:1.5rem;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
                <h3 style="margin-bottom:1.5rem;color:#333">📊 Status Individual das Vacinas</h3>
                
                <div style="display:flex;flex-direction:column;gap:1.5rem">
                    ${pet.vacinas.map(v => {
                        let progresso = 0;
                        let cor = '#9E9E9E';
                        let statusTexto = 'Não aplicada';
                        
                        if (v.aplicada) {
                            const ultimaAplicacao = new Date(v.data);
                            const proximaData = new Date(ultimaAplicacao);
                            
                            if (v.periodicidade === 'anual') {
                                proximaData.setFullYear(proximaData.getFullYear() + 1);
                            } else if (v.periodicidade === 'semestral') {
                                proximaData.setMonth(proximaData.getMonth() + 6);
                            } else if (v.periodicidade === 'trimestral') {
                                proximaData.setMonth(proximaData.getMonth() + 3);
                            }
                            
                            const diasAteProxima = Math.ceil((proximaData - hoje) / (1000 * 60 * 60 * 24));
                            
                            if (diasAteProxima < 0) {
                                progresso = 0;
                                cor = '#f44336';
                                statusTexto = `Atrasada ${Math.abs(diasAteProxima)} dias`;
                            } else if (diasAteProxima <= 30) {
                                progresso = 50;
                                cor = '#ff9800';
                                statusTexto = `Vence em ${diasAteProxima} dias`;
                            } else {
                                progresso = 100;
                                cor = '#4CAF50';
                                statusTexto = `Em dia - Próxima: ${proximaData.toLocaleDateString('pt-BR')}`;
                            }
                        }
                        
                        return `
                            <div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
                                    <div style="font-weight:600;color:#333">💉 ${v.nome}</div>
                                    <div style="font-size:0.85rem;color:${cor};font-weight:600">${statusTexto}</div>
                                </div>
                                <div style="background:#e0e0e0;height:12px;border-radius:6px;overflow:hidden">
                                    <div style="background:${cor};height:100%;width:${progresso}%;transition:width 0.3s ease;border-radius:6px"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar dashboard completo
     */
    render(pet) {
        const stats = this.calcularEstatisticas(pet);
        
        return `
            <div style="padding:1.5rem">
                ${this.renderCards(stats)}
                ${this.renderCalendario(stats)}
                ${this.renderBarrasProgresso(pet)}
            </div>
        `;
    }
};

// Exportar para uso global
window.DashboardVacinas = DashboardVacinas;
console.log('✅ Dashboard de Vacinas carregado');
