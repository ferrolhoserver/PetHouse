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
                <button class="btn btn-primary" onclick="console.log('🐞 [Botão] Clicado!'); try { if (typeof app === 'undefined') { alert('❌ app não definido'); } else if (typeof app.registrarNovoCio !== 'function') { alert('❌ app.registrarNovoCio não é função'); } else { app.registrarNovoCio(); } } catch(e) { console.error('❌ Erro:', e); alert('❌ Erro: ' + e.message); }">
                    🌸 Registrar Novo Cio
                </button>
            </div>
        `;
        
        // Informações sobre o ciclo da espécie
        html += this.renderizarInformacoes(ciclo, pet);
        
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
     * Calcula e retorna texto do próximo cio
     */
    calcularProximoCioTexto(pet, ciclo) {
        if (!pet.cios || pet.cios.length === 0 || ciclo.intervaloCio === 0) {
            return '';
        }
        
        // Pegar último cio
        const ultimoCio = pet.cios[pet.cios.length - 1];
        const dataInicio = new Date(ultimoCio.inicio);
        const proximaData = new Date(dataInicio);
        proximaData.setDate(proximaData.getDate() + ciclo.intervaloCio);
        
        const hoje = new Date();
        const diasRestantes = Math.floor((proximaData - hoje) / (1000 * 60 * 60 * 24));
        
        let cor = '#4caf50'; // Verde
        let emoji = '✅';
        
        if (diasRestantes < 0) {
            cor = '#f44336'; // Vermelho - atrasado
            emoji = '⚠️';
        } else if (diasRestantes <= 14) {
            cor = '#ff9800'; // Laranja - próximo
            emoji = '🔔';
        }
        
        return `
            <div style="font-size: 0.85rem; color: ${cor}; margin-top: 0.5rem;">
                ${emoji} Próximo: ${proximaData.toLocaleDateString('pt-BR')}
                ${diasRestantes >= 0 ? `(em ${diasRestantes} dias)` : `(${Math.abs(diasRestantes)} dias atrás)`}
            </div>
        `;
    },
    
    /**
     * Renderiza informações sobre o ciclo reprodutivo
     */
    renderizarInformacoes(ciclo, pet) {
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
                        ${this.calcularProximoCioTexto(pet, ciclo)}
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
     * Abre formulário
     */
    abrirFormulario(petId) {
        const pet = window.app?.data?.pets?.find(p => p.id === petId);
        if (!pet || !window.app) {
            alert('❌ Erro ao carregar pet. Recarregue a página.');
            return;
        }
        this.mostrarFormularioRegistro(pet, window.app);
    },
    
    /**
     * Mostra formulário de registro de cio
     */
    mostrarFormularioRegistro(pet, app) {
        console.log('✅ [Cio] Abrindo formulário para:', pet.nome);
        
        const ciclo = window.CiclosReprodutivos?.[pet.especie];
        const hoje = new Date().toISOString().split('T')[0];
        
        app.showModal(`
            <div class="modal-header">
                <h2>🌸 Registrar Cio</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <form id="form-cio" onsubmit="return ControleCio.salvarCioForm(event, '${pet.id}', app)">
                <div class="form-group">
                    <label>Data de Início do Cio *</label>
                    <input type="date" id="cio-inicio" required>
                    <small style="color: #666;">Pode ser uma data passada</small>
                </div>
                
                <div class="form-group">
                    <label>Data de Fim do Cio</label>
                    <input type="date" id="cio-fim">
                    <small style="color: #666;">Deixe em branco para calcular automaticamente (${ciclo ? ciclo.duracaoCio + ' dias' : 'duração média'})</small>
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
     * Salva registro de cio (versão para formulário)
     */
    salvarCioForm(event, petId, app) {
        event.preventDefault();
        
        console.log('🐞 [Cio] Salvando cio para pet:', petId);
        
        if (!app || !app.data || !app.data.pets) {
            console.error('❌ [Cio] app não disponível ao salvar!');
            alert('❌ Erro: Sistema não inicializado. Recarregue a página.');
            return false;
        }
        
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) {
            console.error('❌ [Cio] Pet não encontrado ao salvar:', petId);
            return false;
        }
        
        this.salvarCio(event, pet, app);
        return false;
    },
    
    /**
     * Salva registro de cio
     */
    salvarCio(event, pet, app) {
        console.log('✅ [Cio] Salvando cio para:', pet.nome);
        
        const inicio = document.getElementById('cio-inicio').value;
        let fim = document.getElementById('cio-fim').value;
        const observacoes = document.getElementById('cio-observacoes').value;
        const houveCruzamento = document.getElementById('cio-cruzamento').checked;
        
        // Se não informou data de fim, calcular automaticamente baseado na duração do ciclo
        if (!fim && inicio) {
            const ciclo = window.CiclosReprodutivos?.[pet.especie];
            if (ciclo && ciclo.duracaoCio) {
                const dataInicio = new Date(inicio);
                const dataFim = new Date(dataInicio);
                dataFim.setDate(dataFim.getDate() + ciclo.duracaoCio);
                fim = dataFim.toISOString().split('T')[0];
                console.log('✅ [Cio] Data de fim calculada automaticamente:', fim, '(', ciclo.duracaoCio, 'dias)');
            }
        }
        
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
        
        app.saveData();
        app.closeModal();
        app.render();
        
        alert('✅ Cio registrado com sucesso!');
    },
    
    /**
     * Exclui registro de cio
     */
    excluirCio(cioId) {
        const modalId = 'excluir-cio-modal';
        const existente = document.getElementById(modalId);
        if (existente) existente.remove();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
        modal.innerHTML = `<div style="background:white;border-radius:16px;padding:1.5rem;max-width:320px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;"><div style="font-size:2.5rem;margin-bottom:0.75rem;">🗑️</div><h3 style="margin:0 0 0.5rem;color:#333;font-size:1.1rem;">Excluir registro de cio?</h3><p style="margin:0 0 1.25rem;color:#666;font-size:0.9rem;">Esta ação não pode ser desfeita.</p><div style="display:flex;gap:0.75rem;"><button id="excluir-cio-cancel" style="flex:1;padding:0.75rem;border:2px solid #ddd;background:white;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#666;font-weight:600;">Cancelar</button><button id="excluir-cio-ok" style="flex:1;padding:0.75rem;border:none;background:#f44336;color:white;border-radius:10px;font-size:0.9rem;cursor:pointer;font-weight:700;">Excluir</button></div></div>`;
        document.body.appendChild(modal);
        document.getElementById('excluir-cio-cancel').onclick = () => modal.remove();
        document.getElementById('excluir-cio-ok').onclick = () => {
            modal.remove();
            const pet = window.app.data.pets.find(p => p.cios?.some(c => c.id === cioId || p.cios.indexOf(c).toString() === cioId));
            if (!pet) return;
            pet.cios = pet.cios.filter((c, index) => c.id !== cioId && index.toString() !== cioId);
            window.app.saveData();
            window.app.render();
            if (window.app.showToast) window.app.showToast('✅ Registro excluído com sucesso!', 'success');
        };
    }
};

// Exportar para uso global
window.ControleCio = ControleCio;
