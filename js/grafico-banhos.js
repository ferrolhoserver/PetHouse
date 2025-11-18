/**
 * Módulo de Gráfico de Frequência de Banhos
 * Visualiza a frequência e intervalo entre banhos
 */

const GraficoBanhos = {
    /**
     * Gera gráfico de frequência de banhos
     */
    gerarGrafico(banhos) {
        if (!banhos || banhos.length === 0) {
            return '<p style="text-align: center; color: #666;">Nenhum banho registrado</p>';
        }

        const sorted = [...banhos].sort((a, b) => new Date(a.data) - new Date(b.data));
        
        // Calcular intervalos entre banhos
        const intervalos = [];
        for (let i = 1; i < sorted.length; i++) {
            const data1 = new Date(sorted[i - 1].data);
            const data2 = new Date(sorted[i].data);
            const dias = Math.round((data2 - data1) / (1000 * 60 * 60 * 24));
            intervalos.push({
                de: sorted[i - 1].data,
                ate: sorted[i].data,
                dias
            });
        }

        // Calcular estatísticas
        const stats = this.calcularEstatisticas(banhos);

        return `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <h3 style="color: #1976d2; margin-bottom: 1rem;">📊 Estatísticas de Banhos</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: white; padding: 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: #2196F3;">${stats.total}</div>
                        <div style="color: #666; font-size: 0.9rem;">Total de Banhos</div>
                    </div>
                    
                    <div style="background: white; padding: 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: #4CAF50;">${stats.mediaIntervalo}</div>
                        <div style="color: #666; font-size: 0.9rem;">Dias (média)</div>
                    </div>
                    
                    <div style="background: white; padding: 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: #FF9800;">${this.formatarData(stats.ultimoBanho)}</div>
                        <div style="color: #666; font-size: 0.9rem;">Último Banho</div>
                    </div>
                    
                    <div style="background: white; padding: 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: #9C27B0;">${this.formatarData(stats.proximoRecomendado)}</div>
                        <div style="color: #666; font-size: 0.9rem;">Próximo Sugerido</div>
                    </div>
                </div>

                ${intervalos.length > 0 ? `
                    <h4 style="color: #666; margin-bottom: 0.5rem;">Intervalo entre Banhos</h4>
                    <div style="background: white; padding: 1rem; border-radius: 6px;">
                        ${intervalos.map(int => `
                            <div style="display: flex; align-items: center; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #eee;">
                                <div style="flex: 1;">
                                    <div style="font-size: 0.85rem; color: #666;">
                                        ${this.formatarData(int.de)} → ${this.formatarData(int.ate)}
                                    </div>
                                </div>
                                <div style="flex: 2; margin: 0 1rem;">
                                    <div style="background: #e3f2fd; height: 24px; border-radius: 12px; position: relative; overflow: hidden;">
                                        <div style="background: linear-gradient(90deg, #2196F3, #1976D2); height: 100%; width: ${Math.min(100, (int.dias / 30) * 100)}%; border-radius: 12px; transition: width 0.3s;"></div>
                                    </div>
                                </div>
                                <div style="width: 60px; text-align: right; font-weight: bold; color: #1976D2;">
                                    ${int.dias} ${int.dias === 1 ? 'dia' : 'dias'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div style="margin-top: 1rem; padding: 0.75rem; background: #e8f5e9; border-radius: 6px; border-left: 4px solid #4CAF50;">
                    <strong>💡 Recomendação:</strong> 
                    ${this.gerarRecomendacao(stats)}
                </div>
            </div>
        `;
    },

    /**
     * Calcula estatísticas de banhos
     */
    calcularEstatisticas(banhos) {
        const sorted = [...banhos].sort((a, b) => new Date(b.data) - new Date(a.data));
        const ultimoBanho = sorted[0];
        
        // Calcular média de intervalo
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
        
        // Próximo banho recomendado
        const dataUltimo = new Date(ultimoBanho.data);
        const proximoRecomendado = new Date(dataUltimo);
        proximoRecomendado.setDate(proximoRecomendado.getDate() + mediaIntervalo);
        
        // Dias desde último banho
        const hoje = new Date();
        const diasDesdeUltimo = Math.round((hoje - dataUltimo) / (1000 * 60 * 60 * 24));
        
        return {
            total: banhos.length,
            ultimoBanho: ultimoBanho.data,
            mediaIntervalo,
            proximoRecomendado: proximoRecomendado.toISOString().split('T')[0],
            diasDesdeUltimo
        };
    },

    /**
     * Gera recomendação baseada nas estatísticas
     */
    gerarRecomendacao(stats) {
        const { diasDesdeUltimo, mediaIntervalo } = stats;
        
        if (diasDesdeUltimo > mediaIntervalo + 7) {
            return `O pet está ${diasDesdeUltimo - mediaIntervalo} dias além do intervalo médio. Considere agendar um banho em breve.`;
        } else if (diasDesdeUltimo > mediaIntervalo) {
            return `O intervalo desde o último banho está próximo da média. Um banho pode ser agendado nos próximos dias.`;
        } else {
            const diasRestantes = mediaIntervalo - diasDesdeUltimo;
            return `O pet está dentro do intervalo regular. Próximo banho sugerido em aproximadamente ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}.`;
        }
    },

    /**
     * Formata data para exibição
     */
    formatarData(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    /**
     * Gera versão para PDF
     */
    gerarGraficoPDF(banhos) {
        if (!banhos || banhos.length === 0) {
            return '';
        }

        const stats = this.calcularEstatisticas(banhos);
        const sorted = [...banhos].sort((a, b) => new Date(a.data) - new Date(b.data));
        
        // Calcular intervalos
        const intervalos = [];
        for (let i = 1; i < sorted.length; i++) {
            const data1 = new Date(sorted[i - 1].data);
            const data2 = new Date(sorted[i].data);
            const dias = Math.round((data2 - data1) / (1000 * 60 * 60 * 24));
            intervalos.push({
                de: sorted[i - 1].data,
                ate: sorted[i].data,
                dias
            });
        }

        return `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 4px; margin: 12px 0; page-break-inside: avoid;">
                <h3 style="color: #1976d2; margin: 0 0 10px 0; font-size: 11pt;">📊 Análise de Frequência de Banhos</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                        <td style="padding: 8px; background: white; border-radius: 4px; text-align: center; width: 25%;">
                            <div style="font-size: 16pt; font-weight: bold; color: #2196F3;">${stats.total}</div>
                            <div style="color: #666; font-size: 8pt;">Total de Banhos</div>
                        </td>
                        <td style="width: 2%;"></td>
                        <td style="padding: 8px; background: white; border-radius: 4px; text-align: center; width: 25%;">
                            <div style="font-size: 16pt; font-weight: bold; color: #4CAF50;">${stats.mediaIntervalo}</div>
                            <div style="color: #666; font-size: 8pt;">Dias (média)</div>
                        </td>
                        <td style="width: 2%;"></td>
                        <td style="padding: 8px; background: white; border-radius: 4px; text-align: center; width: 23%;">
                            <div style="font-size: 9pt; font-weight: bold; color: #FF9800;">${this.formatarData(stats.ultimoBanho)}</div>
                            <div style="color: #666; font-size: 8pt;">Último Banho</div>
                        </td>
                        <td style="width: 2%;"></td>
                        <td style="padding: 8px; background: white; border-radius: 4px; text-align: center; width: 23%;">
                            <div style="font-size: 9pt; font-weight: bold; color: #9C27B0;">${this.formatarData(stats.proximoRecomendado)}</div>
                            <div style="color: #666; font-size: 8pt;">Próximo Sugerido</div>
                        </td>
                    </tr>
                </table>

                ${intervalos.length > 0 && intervalos.length <= 10 ? `
                    <div style="background: white; padding: 8px; border-radius: 4px;">
                        <div style="font-weight: bold; color: #666; margin-bottom: 6px; font-size: 9pt;">Intervalo entre Banhos:</div>
                        ${intervalos.map(int => `
                            <div style="margin-bottom: 6px; font-size: 8pt;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                    <span style="color: #666;">${this.formatarData(int.de)} → ${this.formatarData(int.ate)}</span>
                                    <span style="font-weight: bold; color: #1976D2;">${int.dias} ${int.dias === 1 ? 'dia' : 'dias'}</span>
                                </div>
                                <div style="background: #e3f2fd; height: 6px; border-radius: 3px; overflow: hidden;">
                                    <div style="background: #2196F3; height: 100%; width: ${Math.min(100, (int.dias / 30) * 100)}%;"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div style="margin-top: 8px; padding: 6px; background: #e8f5e9; border-radius: 4px; border-left: 3px solid #4CAF50; font-size: 8pt;">
                    <strong>💡 Recomendação:</strong> ${this.gerarRecomendacao(stats)}
                </div>
            </div>
        `;
    }
};

// Exportar para uso global
window.GraficoBanhos = GraficoBanhos;
