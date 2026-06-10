/**
 * Módulo de Timeline Cronológica para Prontuário
 * Visualização compacta e profissional de vacinas e vermífugos
 * Suporta: pet.vacinas, pet.vacinas_wizard, pet.vermifugo
 */

const TimelineProntuario = {

    /**
     * Normaliza uma vacina para estrutura padrão independente da origem
     */
    _normalizarVacina(v) {
        return {
            id: v.id,
            nome: v.nome || v.vacinaNome || v.vacina || 'Vacina',
            icone: v.vacinaIcon || '💉',
            cor: v.vacinaCor || v.cor || '#4caf50',
            data: v.data,
            dose: v.dose || v.numeroDose || null,
            totalDoses: v.totalDoses || null,
            proxima: v.proxima || v.proximaDose || null,
            local: v.localNome || v.local || null,
            veterinario: v.veterinario || null,
            lote: v.lote || null,
            categoria: 'vacina',
            _origem: v._origem || 'vacinas'
        };
    },

    /**
     * Normaliza um vermífugo para estrutura padrão
     */
    _normalizarVermifugo(v) {
        return {
            id: v.id,
            nome: v.nome || v.vermifugoNome || v.produto || 'Vermífugo',
            icone: '💊',
            cor: v.cor || '#2196F3',
            data: v.data,
            dose: v.dose || null,
            proxima: v.proxima || v.proximaDose || null,
            veterinario: v.veterinario || null,
            categoria: 'vermifugo',
            _origem: 'vermifugo'
        };
    },

    /**
     * Coleta todos os registros do pet (vacinas + vacinas_wizard + vermífugos)
     */
    _coletarRegistros(pet) {
        const registros = [];

        // Vacinas antigas (pet.vacinas)
        if (pet.vacinas && pet.vacinas.length > 0) {
            pet.vacinas.forEach(v => {
                registros.push(this._normalizarVacina({ ...v, _origem: 'vacinas' }));
            });
        }

        // Vacinas do wizard (pet.vacinas_wizard)
        if (pet.vacinas_wizard && pet.vacinas_wizard.length > 0) {
            pet.vacinas_wizard.forEach(v => {
                registros.push(this._normalizarVacina({ ...v, _origem: 'vacinas_wizard' }));
            });
        }

        // Vermífugos
        if (pet.vermifugo && pet.vermifugo.length > 0) {
            pet.vermifugo.forEach(v => {
                registros.push(this._normalizarVermifugo(v));
            });
        }

        // Ordenar por data (mais recente primeiro)
        registros.sort((a, b) => new Date(b.data) - new Date(a.data));

        return registros;
    },

    /**
     * Renderiza resumo compacto (para cards de alerta)
     */
    renderizarResumo(pet) {
        const registros = this._coletarRegistros(pet);
        const totalVacinas = registros.filter(r => r.categoria === 'vacina').length;
        const totalVermifugos = registros.filter(r => r.categoria === 'vermifugo').length;

        if (totalVacinas === 0 && totalVermifugos === 0) return '';

        return `
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                ${totalVacinas > 0 ? `<span style="background:#e8f5e9;color:#2e7d32;padding:0.3rem 0.75rem;border-radius:20px;font-size:0.8rem;font-weight:600;">💉 ${totalVacinas} vacina${totalVacinas > 1 ? 's' : ''}</span>` : ''}
                ${totalVermifugos > 0 ? `<span style="background:#e3f2fd;color:#1565c0;padding:0.3rem 0.75rem;border-radius:20px;font-size:0.8rem;font-weight:600;">💊 ${totalVermifugos} vermífugo${totalVermifugos > 1 ? 's' : ''}</span>` : ''}
            </div>
        `;
    },

    /**
     * Renderiza timeline cronológica completa
     */
    renderizar(pet) {
        const registros = this._coletarRegistros(pet);

        if (registros.length === 0) {
            return `
                <div style="text-align:center;padding:2rem;color:#999;">
                    <p style="margin:0;font-size:0.95rem;">Nenhum registro de vacina ou vermífugo ainda</p>
                </div>
            `;
        }

        return `
            <div class="timeline-prontuario" style="position:relative;padding:0.5rem 0;">
                ${registros.map((r, i) => this.renderizarItem(r, i === registros.length - 1)).join('')}
            </div>
        `;
    },

    /**
     * Renderiza item individual da timeline
     */
    renderizarItem(registro, ultimo = false) {
        const data = registro.data
            ? new Date(registro.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Data não informada';

        const proximaData = registro.proxima
            ? new Date(registro.proxima).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            : null;

        const hoje = new Date();
        const atrasado = registro.proxima && new Date(registro.proxima) < hoje;

        const doseInfo = registro.dose
            ? `Dose: ${registro.dose}${registro.totalDoses ? '/' + registro.totalDoses : ''}`
            : null;

        return `
            <div class="timeline-item" style="position:relative;padding-left:2.5rem;padding-bottom:1.25rem;">
                ${!ultimo ? `<div style="position:absolute;left:0.75rem;top:2rem;bottom:0;width:2px;background:#e8e8e8;"></div>` : ''}

                <!-- Ícone -->
                <div style="position:absolute;left:0;top:0;width:1.75rem;height:1.75rem;background:${registro.cor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px ${registro.cor}55;font-size:0.85rem;">
                    ${registro.icone}
                </div>

                <!-- Card -->
                <div style="background:white;border-radius:10px;padding:0.85rem 1rem;box-shadow:0 1px 4px rgba(0,0,0,0.08);border-left:3px solid ${registro.cor};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
                        <div style="flex:1;min-width:0;">
                            <h4 style="margin:0;color:${registro.cor};font-size:0.9rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${registro.nome}</h4>
                            <p style="margin:0.2rem 0 0;font-size:0.75rem;color:#888;">📅 ${data}</p>
                            ${doseInfo ? `<p style="margin:0.15rem 0 0;font-size:0.75rem;color:#666;">${doseInfo}</p>` : ''}
                            ${registro.veterinario ? `<p style="margin:0.15rem 0 0;font-size:0.75rem;color:#666;">👨‍⚕️ ${registro.veterinario}</p>` : ''}
                            ${registro.local ? `<p style="margin:0.15rem 0 0;font-size:0.75rem;color:#666;">📍 ${registro.local}</p>` : ''}
                        </div>
                        <div style="display:flex;flex-direction:column;gap:0.35rem;align-items:flex-end;flex-shrink:0;">
                            <span style="background:${registro.cor}18;color:${registro.cor};padding:0.2rem 0.5rem;border-radius:4px;font-size:0.7rem;font-weight:700;white-space:nowrap;">
                                ${registro.categoria === 'vacina' ? 'VACINA' : 'VERMÍFUGO'}
                            </span>
                            <button onclick="TimelineProntuario.excluirRegistro('${registro.id}', '${registro.categoria}', '${registro._origem}')"
                                    style="background:#f44336;color:white;border:none;border-radius:5px;padding:0.25rem 0.5rem;font-size:0.7rem;cursor:pointer;display:flex;align-items:center;gap:0.2rem;white-space:nowrap;"
                                    title="Excluir registro">
                                🗑️ Excluir
                            </button>
                        </div>
                    </div>

                    ${proximaData ? `
                        <div style="margin-top:0.6rem;padding:0.4rem 0.6rem;background:${atrasado ? '#fff3e0' : '#f1f8e9'};border-radius:6px;font-size:0.75rem;color:${atrasado ? '#e65100' : '#558b2f'};">
                            ${atrasado ? '⚠️' : '📅'} Próxima: ${proximaData}${atrasado ? ' (atrasada)' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Exclui registro individual - suporta vacinas, vacinas_wizard e vermifugo
     */
    excluirRegistro(id, categoria, origem) {
        // Converter id para número se necessário (IDs são timestamps numéricos)
        const idNum = Number(id);
        const idStr = String(id);

        const pet = app.data.pets.find(p => p.id === app.currentPet);
        if (!pet) {
            console.error('[Timeline] Pet não encontrado para exclusão');
            return;
        }

        // Criar modal de confirmação customizado (não usa confirm() nativo)
        const modalId = 'timeline-confirm-modal';
        const existente = document.getElementById(modalId);
        if (existente) existente.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;padding:1.5rem;max-width:320px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">
                <div style="font-size:2.5rem;margin-bottom:0.75rem;">🗑️</div>
                <h3 style="margin:0 0 0.5rem;color:#333;font-size:1.1rem;">Excluir registro?</h3>
                <p style="margin:0 0 1.25rem;color:#666;font-size:0.9rem;">Esta ação não pode ser desfeita.</p>
                <div style="display:flex;gap:0.75rem;justify-content:center;">
                    <button id="timeline-confirm-cancel"
                            style="flex:1;padding:0.75rem;border:2px solid #ddd;background:white;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#666;font-weight:600;">
                        Cancelar
                    </button>
                    <button id="timeline-confirm-ok"
                            style="flex:1;padding:0.75rem;border:none;background:#f44336;color:white;border-radius:10px;font-size:0.9rem;cursor:pointer;font-weight:700;">
                        Excluir
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('timeline-confirm-cancel').onclick = () => modal.remove();

        document.getElementById('timeline-confirm-ok').onclick = () => {
            modal.remove();

            let removido = false;

            if (categoria === 'vacina') {
                // Tentar remover de vacinas_wizard primeiro
                if (pet.vacinas_wizard && pet.vacinas_wizard.length > 0) {
                    const antes = pet.vacinas_wizard.length;
                    pet.vacinas_wizard = pet.vacinas_wizard.filter(v => v.id !== idNum && String(v.id) !== idStr);
                    if (pet.vacinas_wizard.length < antes) removido = true;
                }
                // Tentar remover de vacinas (legado)
                if (!removido && pet.vacinas && pet.vacinas.length > 0) {
                    const antes = pet.vacinas.length;
                    pet.vacinas = pet.vacinas.filter(v => v.id !== idNum && String(v.id) !== idStr);
                    if (pet.vacinas.length < antes) removido = true;
                }
            } else if (categoria === 'vermifugo') {
                if (pet.vermifugo && pet.vermifugo.length > 0) {
                    const antes = pet.vermifugo.length;
                    pet.vermifugo = pet.vermifugo.filter(v => v.id !== idNum && String(v.id) !== idStr);
                    if (pet.vermifugo.length < antes) removido = true;
                }
            }

            if (removido) {
                app.saveData();
                if (typeof app.showToast === 'function') {
                    app.showToast('✅ Registro excluído com sucesso', 'success');
                }
                // Re-renderizar a aba atual sem recarregar a página
                if (typeof app.renderPet === 'function') {
                    app.renderPet(pet.id);
                    // Garantir que a aba Cuidados permaneça ativa
                    setTimeout(() => {
                        if (typeof app.changeTab === 'function') {
                            app.changeTab('cuidados');
                        }
                    }, 50);
                }
            } else {
                console.error('[Timeline] Registro não encontrado para exclusão:', { id, idNum, idStr, categoria });
                if (typeof app.showToast === 'function') {
                    app.showToast('❌ Erro ao excluir registro', 'error');
                }
            }
        };
    }
};

// Exportar para uso global
window.TimelineProntuario = TimelineProntuario;
