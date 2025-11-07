/**
 * Módulo de Timeline Cronológica para Prontuário
 * Visualização compacta e profissional de vacinas e vermífugos
 */

const TimelineProntuario = {
    /**
     * Renderiza timeline cronológica de vacinas e vermífugos
     */
    renderizar(pet) {
        // Coletar todos os registros
        const registros = [];

        // Vacinas
        if (pet.vacinas && pet.vacinas.length > 0) {
            pet.vacinas.forEach(v => {
                registros.push({
                    ...v,
                    categoria: 'vacina',
                    icone: '💉',
                    cor: v.cor || '#4caf50'
                });
            });
        }

        // Vermífugos
        if (pet.vermifugo && pet.vermifugo.length > 0) {
            pet.vermifugo.forEach(v => {
                registros.push({
                    ...v,
                    categoria: 'vermifugo',
                    icone: '💊',
                    cor: v.cor || '#2196F3'
                });
            });
        }

        // Ordenar por data (mais recente primeiro)
        registros.sort((a, b) => new Date(b.data) - new Date(a.data));

        if (registros.length === 0) {
            return `
                <div style="text-align: center; padding: 2rem; color: #999;">
                    <p style="margin: 0;">Nenhum registro de vacina ou vermífugo ainda</p>
                </div>
            `;
        }

        // Renderizar timeline
        return `
            <div class="timeline-prontuario" style="position: relative;">
                ${registros.map((r, index) => this.renderizarItem(r, index === registros.length - 1)).join('')}
            </div>
        `;
    },

    /**
     * Renderiza item da timeline
     */
    renderizarItem(registro, ultimo = false) {
        const data = new Date(registro.data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const proximaData = registro.proxima ? new Date(registro.proxima).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : null;

        // Verificar se próxima dose está atrasada
        const hoje = new Date();
        const dataProxima = registro.proxima ? new Date(registro.proxima) : null;
        const atrasado = dataProxima && dataProxima < hoje;

        return `
            <div class="timeline-item" style="position: relative; padding-left: 2.5rem; padding-bottom: 1.5rem;">
                <!-- Linha vertical -->
                ${!ultimo ? `<div style="position: absolute; left: 0.75rem; top: 2rem; bottom: 0; width: 2px; background: #e0e0e0;"></div>` : ''}
                
                <!-- Ícone -->
                <div style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: ${registro.cor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <span style="font-size: 1rem;">${registro.icone}</span>
                </div>

                <!-- Conteúdo -->
                <div style="background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 3px solid ${registro.cor};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <div>
                            <h4 style="margin: 0; color: ${registro.cor}; font-size: 0.95rem;">${registro.nome}</h4>
                            <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #999;">📅 ${data}</p>
                        </div>
                        <span style="background: ${registro.cor}15; color: ${registro.cor}; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">
                            ${registro.categoria === 'vacina' ? 'VACINA' : 'VERMÍFUGO'}
                        </span>
                    </div>

                    ${registro.principio_ativo ? `
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #666;">
                            <strong>Princípio ativo:</strong> ${registro.principio_ativo}
                        </p>
                    ` : ''}

                    ${registro.dose ? `
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">
                            <strong>Dose:</strong> ${registro.dose}
                        </p>
                    ` : ''}

                    ${registro.lote ? `
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #999;">
                            Lote: ${registro.lote}
                        </p>
                    ` : ''}

                    ${registro.veterinario ? `
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #999;">
                            Veterinário: ${registro.veterinario}
                        </p>
                    ` : ''}

                    ${registro.obs ? `
                        <p style="margin: 0.5rem 0 0 0; padding: 0.5rem; background: #f5f5f5; border-radius: 4px; font-size: 0.85rem; color: #666;">
                            💬 ${registro.obs}
                        </p>
                    ` : ''}

                    ${proximaData ? `
                        <div style="margin-top: 0.75rem; padding: 0.5rem; background: ${atrasado ? '#ffebee' : '#e8f5e9'}; border-radius: 4px; border-left: 3px solid ${atrasado ? '#f44336' : '#4caf50'};">
                            <p style="margin: 0; font-size: 0.85rem; color: ${atrasado ? '#c62828' : '#2e7d32'};">
                                ${atrasado ? '⚠️' : '📅'} <strong>Próxima aplicação:</strong> ${proximaData}
                                ${atrasado ? ' <span style="font-weight: bold;">(ATRASADO)</span>' : ''}
                            </p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza resumo estatístico
     */
    renderizarResumo(pet) {
        const totalVacinas = pet.vacinas ? pet.vacinas.length : 0;
        const totalVermifugos = pet.vermifugo ? pet.vermifugo.length : 0;

        // Verificar próximas aplicações
        const hoje = new Date();
        let proximasVacinas = 0;
        let proximosVermifugos = 0;
        let atrasados = 0;

        if (pet.vacinas) {
            pet.vacinas.forEach(v => {
                if (v.proxima) {
                    const dataProx = new Date(v.proxima);
                    if (dataProx > hoje) proximasVacinas++;
                    else atrasados++;
                }
            });
        }

        if (pet.vermifugo) {
            pet.vermifugo.forEach(v => {
                if (v.proxima) {
                    const dataProx = new Date(v.proxima);
                    if (dataProx > hoje) proximosVermifugos++;
                    else atrasados++;
                }
            });
        }

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${totalVacinas}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">💉 Vacinas</div>
                </div>
                <div style="background: linear-gradient(135deg, #2196F3 0%, #42a5f5 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${totalVermifugos}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">💊 Vermífugos</div>
                </div>
                ${atrasados > 0 ? `
                    <div style="background: linear-gradient(135deg, #f44336 0%, #ef5350 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;">${atrasados}</div>
                        <div style="font-size: 0.85rem; opacity: 0.9;">⚠️ Atrasados</div>
                    </div>
                ` : ''}
            </div>
        `;
    }
};

// Exportar para uso global
window.TimelineProntuario = TimelineProntuario;
