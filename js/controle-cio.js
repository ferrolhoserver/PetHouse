/**
 * Módulo de Controle de Cio
 * Interface para registro e acompanhamento de cios em fêmeas
 */

const ControleCio = {
    /**
     * Renderiza a interface de controle de cio
     */
    renderizar(pet) {
        if (pet.sexo !== 'Fêmea') {
            return '<p style="color: #999; text-align: center; padding: 2rem;">Controle de cio disponível apenas para fêmeas.</p>';
        }
        
        const ciclo = window.CiclosReprodutivos?.[pet.especie];
        if (!ciclo) {
            return '<p style="color: #999; text-align: center; padding: 2rem;">Controle de cio não disponível para esta espécie.</p>';
        }
        
        const status = window.CalculosCio?.gerarStatusCio(pet) || {};
        const cios = pet.cios || [];
        
        let html = '<div class="controle-cio">';
        
        // Cabeçalho com status
        html += this.renderizarStatus(status, pet, ciclo);
        
        // Botão de registro
        html += `
            <div style="margin: 1.5rem 0;">
                <button class="btn btn-primary" onclick="ControleCio.mostrarFormularioRegistro('${pet.id}')">
                    🌸 Registrar Novo Cio
                </button>
            </div>
        `;
        
        // Informações sobre o ciclo da espécie
        html += this.renderizarInformacoes(ciclo);
        
        // Histórico de cios
        if (cios.length > 0) {
            html += this.renderizarHistorico(cios, pet.especie);
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * Renderiza card de status atual
     */
    renderizarStatus(status, pet, ciclo) {
        let html = `
            <div style="background: ${status.cor}15; border-left: 4px solid ${status.cor}; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0; color: ${status.cor}; font-size: 1.2rem;">${status.mensagem}</h3>
        `;
        
        // Informações adicionais baseadas no status
        if (status.status === 'periodo_fertil') {
            html += `
                <p style="margin: 0.5rem 0 0 0; color: #555;">
                    ✨ <strong>Melhor período para cruzamento!</strong><br>
                    ${ciclo.melhorPeriodo.inicio}º ao ${ciclo.melhorPeriodo.fim}º dia do cio
                </p>
            `;
        } else if (status.status === 'em_cio') {
            const diasRestantes = ciclo.duracaoCio - status.dias;
            html += `
                <p style="margin: 0.5rem 0 0 0; color: #555;">
                    Faltam aproximadamente ${diasRestantes} dias para o fim do cio
                </p>
            `;
        } else if (status.status === 'proximo') {
            const proximoCio = window.CalculosCio?.calcularProximoCio(pet.cios[pet.cios.length - 1].inicio, pet.especie);
            html += `
                <p style="margin: 0.5rem 0 0 0; color: #555;">
                    Próximo cio previsto: ${window.CalculosCio?.formatarData(proximoCio)}
                </p>
            `;
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
    },
    
    /**
     * Renderiza informações sobre o ciclo reprodutivo
     */
    renderizarInformacoes(ciclo) {
        let html = `
            <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 1rem 0; color: #1976d2; font-size: 1.1rem;">
                    📚 Informações sobre o Cio
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div style="background: white; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 0.85rem; color: #666;">Intervalo entre cios</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #1976d2;">
                            ${ciclo.intervaloCio > 0 ? `${ciclo.intervaloCio} dias` : 'Contínuo'}
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 0.85rem; color: #666;">Duração do cio</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #1976d2;">
                            ${ciclo.duracaoCio} dias
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 0.85rem; color: #666;">Período fértil</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #4CAF50;">
                            ${ciclo.melhorPeriodo.inicio}º ao ${ciclo.melhorPeriodo.fim}º dia
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 0.85rem; color: #666;">Gestação</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #1976d2;">
                            ${ciclo.gestacao} dias
                        </div>
                    </div>
                </div>
                
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; font-weight: bold; color: #1976d2; padding: 0.5rem 0;">
                        ℹ️ Ver informações detalhadas
                    </summary>
                    <div style="margin-top: 1rem; padding-left: 1rem;">
                        ${ciclo.informacoes.map(info => `<div style="margin-bottom: 0.5rem; font-size: 0.9rem;">${info}</div>`).join('')}
                    </div>
                </details>
                
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; font-weight: bold; color: #FF9800; padding: 0.5rem 0;">
                        ⚠️ Cuidados importantes
                    </summary>
                    <div style="margin-top: 1rem; padding-left: 1rem;">
                        ${ciclo.cuidados.map(cuidado => `<div style="margin-bottom: 0.5rem; font-size: 0.9rem;">${cuidado}</div>`).join('')}
                    </div>
                </details>
            </div>
        `;
        
        return html;
    },
    
    /**
     * Renderiza histórico de cios
     */
    renderizarHistorico(cios, especie) {
        const ciclo = window.CiclosReprodutivos?.[especie];
        
        let html = `
            <div style="margin-top: 1.5rem;">
                <h3 style="margin: 0 0 1rem 0; color: #1976d2; font-size: 1.1rem;">
                    📅 Histórico de Cios (${cios.length})
                </h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        `;
        
        // Ordenar cios do mais recente para o mais antigo
        const ciosOrdenados = [...cios].reverse();
        
        ciosOrdenados.forEach((cio, index) => {
            const inicio = new Date(cio.inicio);
            const fim = cio.fim ? new Date(cio.fim) : null;
            const duracao = fim ? Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)) : null;
            
            html += `
                <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #333; margin-bottom: 0.5rem;">
                                ${index === 0 ? '🌸 Último cio' : `Cio ${cios.length - index}`}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                <div>📅 Início: ${window.CalculosCio?.formatarData(inicio)}</div>
                                ${fim ? `<div>📅 Fim: ${window.CalculosCio?.formatarData(fim)}</div>` : '<div style="color: #FF9800;">⏳ Em andamento</div>'}
                                ${duracao ? `<div>⏱️ Duração: ${duracao} dias</div>` : ''}
                            </div>
                            ${cio.observacoes ? `<div style="margin-top: 0.5rem; font-size: 0.85rem; color: #555;">💬 ${cio.observacoes}</div>` : ''}
                            ${cio.cruzamento ? `<div style="margin-top: 0.5rem; padding: 0.5rem; background: #E3F2FD; border-radius: 4px; font-size: 0.85rem;">
                                💕 Cruzamento realizado em ${window.CalculosCio?.formatarData(cio.cruzamento.data)}
                                ${cio.cruzamento.macho ? `<br>🐕 Macho: ${cio.cruzamento.macho}` : ''}
                                ${cio.cruzamento.previsaoParto ? `<br>🤰 Parto previsto: ${window.CalculosCio?.formatarData(cio.cruzamento.previsaoParto)}` : ''}
                            </div>` : ''}
                        </div>
                        <button class="btn btn-danger btn-small" onclick="ControleCio.excluirCio('${cio.id || index}')" style="margin-left: 1rem;">
                            🗑️
                        </button>
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
     * Mostra formulário de registro de cio
     */
    mostrarFormularioRegistro(petId) {
        console.log('🐞 [Cio] Abrindo formulário para pet:', petId);
        console.log('🐞 [Cio] window.app disponível?', !!window.app);
        
        if (!window.app || !window.app.data || !window.app.data.pets) {
            console.error('❌ [Cio] window.app não disponível!');
            alert('❌ Erro: Sistema não inicializado. Recarregue a página.');
            return;
        }
        
        const pet = window.app.data.pets.find(p => p.id === petId);
        if (!pet) {
            console.error('❌ [Cio] Pet não encontrado:', petId);
            return;
        }
        
        console.log('✅ [Cio] Pet encontrado:', pet.nome);
        
        const ciclo = window.CiclosReprodutivos?.[pet.especie];
        const hoje = new Date().toISOString().split('T')[0];
        
        window.app.showModal(`
            <div class="modal-header">
                <h2>🌸 Registrar Cio</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="form-cio" onsubmit="ControleCio.salvarCio(event, '${petId}')">
                <div class="form-group">
                    <label>Data de Início do Cio *</label>
                    <input type="date" id="cio-inicio" required>
                    <small style="color: #666;">Pode ser uma data passada</small>
                </div>
                
                <div class="form-group">
                    <label>Data de Fim do Cio</label>
                    <input type="date" id="cio-fim">
                    <small style="color: #666;">Deixe em branco se o cio ainda está em andamento</small>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="cio-cruzamento" onchange="ControleCio.toggleCruzamento()">
                        Houve cruzamento?
                    </label>
                </div>
                
                <div id="campos-cruzamento" style="display: none; background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <div class="form-group">
                        <label>Data do Cruzamento</label>
                        <input type="date" id="cio-data-cruzamento">
                    </div>
                    
                    <div class="form-group">
                        <label>Nome do Macho</label>
                        <input type="text" id="cio-macho" placeholder="Ex: Rex">
                    </div>
                    
                    ${ciclo ? `
                        <div style="background: #E3F2FD; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem;">
                            🤰 Parto previsto para: <span id="previsao-parto">-</span><br>
                            <small>Gestação: ${ciclo.gestacao} dias</small>
                        </div>
                    ` : ''}
                </div>
                
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="cio-observacoes" rows="3" placeholder="Ex: Sangramento intenso, comportamento agitado..."></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary">Salvar</button>
            </form>
            
            <script>
                // Atualizar previsão de parto quando data de cruzamento mudar
                document.getElementById('cio-data-cruzamento')?.addEventListener('change', function() {
                    const dataCruz = this.value;
                    if (dataCruz && window.CalculosCio) {
                        const dataParto = window.CalculosCio.calcularDataParto(dataCruz, '${pet.especie}');
                        document.getElementById('previsao-parto').textContent = window.CalculosCio.formatarData(dataParto);
                    }
                });
            </script>
        `);
    },
    
    /**
     * Toggle campos de cruzamento
     */
    toggleCruzamento() {
        const checkbox = document.getElementById('cio-cruzamento');
        const campos = document.getElementById('campos-cruzamento');
        if (campos) {
            campos.style.display = checkbox.checked ? 'block' : 'none';
        }
    },
    
    /**
     * Salva registro de cio
     */
    salvarCio(event, petId) {
        event.preventDefault();
        
        console.log('🐞 [Cio] Salvando cio para pet:', petId);
        
        if (!window.app || !window.app.data || !window.app.data.pets) {
            console.error('❌ [Cio] window.app não disponível ao salvar!');
            alert('❌ Erro: Sistema não inicializado. Recarregue a página.');
            return;
        }
        
        const pet = window.app.data.pets.find(p => p.id === petId);
        if (!pet) {
            console.error('❌ [Cio] Pet não encontrado ao salvar:', petId);
            return;
        }
        
        const inicio = document.getElementById('cio-inicio').value;
        const fim = document.getElementById('cio-fim').value;
        const observacoes = document.getElementById('cio-observacoes').value;
        const houveCruzamento = document.getElementById('cio-cruzamento').checked;
        
        const cio = {
            id: Date.now().toString(),
            inicio,
            fim: fim || null,
            observacoes
        };
        
        if (houveCruzamento) {
            const dataCruzamento = document.getElementById('cio-data-cruzamento').value;
            const macho = document.getElementById('cio-macho').value;
            
            if (dataCruzamento) {
                const previsaoParto = window.CalculosCio?.calcularDataParto(dataCruzamento, pet.especie);
                
                cio.cruzamento = {
                    data: dataCruzamento,
                    macho: macho || null,
                    previsaoParto: previsaoParto ? previsaoParto.toISOString().split('T')[0] : null
                };
            }
        }
        
        if (!pet.cios) pet.cios = [];
        pet.cios.push(cio);
        
        window.app.saveData();
        window.app.closeModal();
        window.app.render();
        
        alert('✅ Cio registrado com sucesso!');
    },
    
    /**
     * Exclui registro de cio
     */
    excluirCio(cioId) {
        if (!confirm('Tem certeza que deseja excluir este registro de cio?')) return;
        
        const pet = window.app.data.pets.find(p => p.cios?.some(c => c.id === cioId || p.cios.indexOf(c).toString() === cioId));
        if (!pet) return;
        
        pet.cios = pet.cios.filter((c, index) => c.id !== cioId && index.toString() !== cioId);
        
        window.app.saveData();
        window.app.render();
        
        alert('✅ Registro excluído com sucesso!');
    }
};

// Exportar para uso global
window.ControleCio = ControleCio;
