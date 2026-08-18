/**
 * Módulo de Entrada Manual de Vacinas com Autocomplete
 */

const EntradaManualVacina = {
    /**
     * Renderizar formulário de entrada manual
     */
    renderizarFormulario(petId, tipo = 'vacina') {
        const tituloTipo = tipo === 'vermifugo' ? 'Vermífugo' : 'Vacina';
        
        return `
            <form id="form-entrada-manual" onsubmit="EntradaManualVacina.salvarManual(event, '${petId}', '${tipo}')">
                <!-- Nome da Vacina com Autocomplete -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                        ${tipo === 'vermifugo' ? '🐛' : '💉'} Nome do ${tituloTipo} *
                    </label>
                    <input 
                        type="text" 
                        id="input-nome-vacina"
                        class="form-control" 
                        placeholder="Ex: V10, Vanguard, Nobivac..."
                        required
                        autocomplete="off"
                        oninput="EntradaManualVacina.buscarSugestoes(this.value, '${tipo}')"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;"
                    >
                    <div id="sugestoes-vacina" style="display: none; position: absolute; background: white; border: 2px solid #2196F3; border-radius: 8px; max-height: 200px; overflow-y: auto; width: calc(100% - 2rem); z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
                </div>

                <!-- Data de Aplicação -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                        📅 Data de Aplicação *
                    </label>
                    <input 
                        type="date" 
                        id="input-data-aplicacao"
                        class="form-control" 
                        required
                        max="${new Date().toISOString().split('T')[0]}"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;"
                    >
                </div>

                <!-- Próxima Aplicação (Opcional) -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                        📆 Próxima Aplicação (Opcional)
                    </label>
                    <input 
                        type="date" 
                        id="input-proxima-aplicacao"
                        class="form-control" 
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;"
                    >
                </div>

                <!-- Lote (Opcional) -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                        🏷️ Lote (Opcional)
                    </label>
                    <input 
                        type="text" 
                        id="input-lote"
                        class="form-control" 
                        placeholder="Ex: L123456"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;"
                    >
                </div>

                <!-- Veterinário (Opcional) -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                        👨‍⚕️ Veterinário (Opcional)
                    </label>
                    <input 
                        type="text" 
                        id="input-veterinario"
                        class="form-control" 
                        placeholder="Ex: Dr. João Silva"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;"
                    >
                </div>

                <!-- Observações (Opcional) -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                        📝 Observações (Opcional)
                    </label>
                    <textarea 
                        id="input-observacoes"
                        class="form-control" 
                        rows="3"
                        placeholder="Ex: Reação leve, aplicado na pata direita..."
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; resize: vertical;"
                    ></textarea>
                </div>

                <!-- Botões -->
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="btn" onclick="app.closeModal()" style="flex: 1;">
                        ❌ Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary" style="flex: 2;">
                        ✅ Salvar ${tituloTipo}
                    </button>
                </div>
            </form>
        `;
    },

    /**
     * Buscar sugestões de vacinas no banco colaborativo
     */
    async buscarSugestoes(termo, tipo) {
        if (!termo || termo.length < 2) {
            document.getElementById('sugestoes-vacina').style.display = 'none';
            return;
        }

        try {
            const categoria = tipo === 'vermifugo' ? 'vermifugos' : 'vacinas';
            const data = window.ConhecimentoColaborativo
                ? await window.ConhecimentoColaborativo.buscarPorTexto(termo, categoria)
                : [];
            if (data && data.length > 0) {
                this.mostrarSugestoes(data.slice(0, 5));
            } else {
                document.getElementById('sugestoes-vacina').style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao buscar sugestões locais:', error);
            document.getElementById('sugestoes-vacina').style.display = 'none';
        }
    },

    /**
     * Mostrar sugestões na tela
     */
    mostrarSugestoes(sugestoes) {
        const container = document.getElementById('sugestoes-vacina');
        
        const html = sugestoes.map(item => `
            <div 
                onclick="EntradaManualVacina.selecionarSugestao('${item.nome.replace(/'/g, "\\'")}', '${(item.fabricante || '').replace(/'/g, "\\'")}')"
                style="padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s;"
                onmouseover="this.style.background='#f5f5f5'"
                onmouseout="this.style.background='white'"
            >
                <div style="font-weight: bold; color: #2196F3;">${item.nome}</div>
                ${item.fabricante ? `<div style="font-size: 0.85rem; color: #666;">Fabricante: ${item.fabricante}</div>` : ''}
                ${item.descricao ? `<div style="font-size: 0.8rem; color: #999; margin-top: 0.25rem;">${item.descricao.substring(0, 60)}...</div>` : ''}
            </div>
        `).join('');

        container.innerHTML = html;
        container.style.display = 'block';
    },

    /**
     * Selecionar sugestão
     */
    selecionarSugestao(nome, fabricante) {
        document.getElementById('input-nome-vacina').value = nome;
        document.getElementById('sugestoes-vacina').style.display = 'none';
        
        // Focar no próximo campo
        document.getElementById('input-data-aplicacao').focus();
    },

    /**
     * Salvar entrada manual
     */
    async salvarManual(event, petId, tipo) {
        event.preventDefault();

        const nome = document.getElementById('input-nome-vacina').value.trim();
        const dataAplicacao = document.getElementById('input-data-aplicacao').value;
        const proximaAplicacao = document.getElementById('input-proxima-aplicacao').value;
        const lote = document.getElementById('input-lote').value.trim();
        const veterinario = document.getElementById('input-veterinario').value.trim();
        const observacoes = document.getElementById('input-observacoes').value.trim();

        if (!nome || !dataAplicacao) {
            app.showToast('❌ Preencha os campos obrigatórios', 'error');
            return;
        }

        try {
            app.showToast('💾 Salvando...', 'info');

            // Calcular próxima dose usando exclusivamente o histórico deste pet no cofre local.
            const pet = app.data?.pets?.find(item => item.id === petId);
            if (!pet) throw new Error('Pet não encontrado no perfil protegido.');
            let proximaCalculada = proximaAplicacao;
            
            if (!proximaCalculada && typeof ProtocolosVacinais !== 'undefined') {
                const historico = tipo === 'vermifugo'
                    ? (pet.vermifugo || pet.vermifugos || [])
                    : [...(pet.vacinas || []), ...(pet.vacinas_wizard || [])];
                const protocolo = ProtocolosVacinais.identificarProtocolo(nome);
                const vacinasMesmoNome = historico.filter(v => {
                    const nomeRegistro = v?.nome || v?.vacinaNome || '';
                    const prot = ProtocolosVacinais.identificarProtocolo(nomeRegistro);
                    return prot?.key && protocolo?.key && prot.key === protocolo.key;
                });
                
                const numeroDose = vacinasMesmoNome.length + 1; // +1 porque ainda não salvou a atual
                
                // Calcular próxima dose baseado no protocolo
                const proxima = ProtocolosVacinais.calcularProximaDose(
                    nome,
                    dataAplicacao,
                    numeroDose,
                    vacinasMesmoNome
                );
                
                if (proxima) {
                    proximaCalculada = proxima.toISOString().split('T')[0];
                    console.log(`✅ Próxima dose calculada automaticamente: ${proximaCalculada} (dose ${numeroDose})`);
                }
            }

            const dados = {
                id: `${tipo}_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
                nome,
                vacinaNome: nome,
                data: dataAplicacao,
                data_aplicacao: dataAplicacao,
                proximaDose: proximaCalculada || null,
                proxima_aplicacao: proximaCalculada || null,
                lote: lote || null,
                veterinario: veterinario || null,
                observacoes: observacoes || null,
                pet_id: petId,
                criado_em: new Date().toISOString(),
                origem: 'manual-local'
            };

            if (tipo === 'vermifugo') {
                pet.vermifugo = Array.isArray(pet.vermifugo) ? pet.vermifugo : [];
                pet.vermifugo.push(dados);
            } else {
                pet.vacinas = Array.isArray(pet.vacinas) ? pet.vacinas : [];
                pet.vacinas.push(dados);
            }
            await app.saveData();
            app.closeModal();
            // A tela do pet pode ter sido renderizada em outra aba; preserve Cuidados para exibir o registro recém-criado.
            if (typeof app.renderPet === 'function') {
                app.renderPet(petId);
                window.setTimeout(() => app.changeTab?.('cuidados'), 50);
            } else if (typeof app.render === 'function') {
                app.render();
            }
            app.showToast(`✅ ${tipo === 'vermifugo' ? 'Vermífugo' : 'Vacina'} salvo no perfil protegido.`, 'success');
            await this.registrarUso(nome, tipo);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            app.showToast(`❌ Erro ao salvar: ${error.message}`, 'error');
        }
    },

    /**
     * Registrar uso no conhecimento colaborativo
     */
    async registrarUso(nome, tipo) {
        // O uso é mantido no prontuário local. Não há telemetria ou RPC remoto neste modo.
        return { localOnly: true, nome, tipo };
    }
};
