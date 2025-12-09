/**
 * Dashboard Profissional de Banho & Tosa
 * Sistema inteligente com gráficos, estatísticas e recomendações
 */

const DashboardBanhoTosa = {
    
    // Recomendações por porte do pet
    recomendacoes: {
        pequeno: { dias: 15, descricao: 'Pets pequenos precisam de banho a cada 15 dias' },
        medio: { dias: 21, descricao: 'Pets médios precisam de banho a cada 21 dias' },
        grande: { dias: 30, descricao: 'Pets grandes precisam de banho a cada 30 dias' }
    },
    
    /**
     * Determinar porte do pet baseado no peso
     */
    determinarPorte(peso) {
        if (peso < 10) return 'pequeno';
        if (peso < 25) return 'medio';
        return 'grande';
    },
    
    /**
     * Coletar todos os banhos/tosas de todos os formatos
     */
    coletarCuidados(pet) {
        const cuidados = [];
        
        // Formato antigo: pet.banho_tosa
        if (pet.banho_tosa && pet.banho_tosa.length > 0) {
            pet.banho_tosa.forEach(b => {
                cuidados.push({
                    tipo: 'banho',
                    data: b.data,
                    local: b.local || 'Não informado',
                    valor: b.valor || 0,
                    obs: b.observacoes || ''
                });
            });
        }
        
        // Formato antigo: pet.banhos
        if (pet.banhos && pet.banhos.length > 0) {
            pet.banhos.forEach(b => {
                cuidados.push({
                    tipo: 'banho',
                    data: b.data,
                    local: b.local || 'Não informado',
                    valor: b.valor || 0,
                    obs: b.observacoes || ''
                });
            });
        }
        
        // Formato antigo: pet.tosas
        if (pet.tosas && pet.tosas.length > 0) {
            pet.tosas.forEach(t => {
                cuidados.push({
                    tipo: 'tosa',
                    tipoTosa: t.tipo || 'completa',
                    data: t.data,
                    local: t.local || 'Não informado',
                    valor: t.valor || 0,
                    obs: t.observacoes || ''
                });
            });
        }
        
        // Formato wizard: pet.cuidados_wizard
        if (pet.cuidados_wizard && pet.cuidados_wizard.length > 0) {
            pet.cuidados_wizard.forEach(c => {
                cuidados.push({
                    tipo: c.tipo,
                    tipoTosa: c.tipoTosa,
                    data: c.data,
                    local: c.localNome || 'Não informado',
                    valor: c.valor || 0,
                    obs: c.obs || '',
                    adicionais: c.adicionais || []
                });
            });
        }
        
        // Ordenar por data (mais recente primeiro)
        return cuidados.sort((a, b) => new Date(b.data) - new Date(a.data));
    },
    
    /**
     * Calcular estatísticas
     */
    calcularEstatisticas(cuidados) {
        const banhos = cuidados.filter(c => c.tipo === 'banho' || c.tipo === 'banho_tosa');
        const tosas = cuidados.filter(c => c.tipo === 'tosa' || c.tipo === 'banho_tosa');
        
        const gastoTotal = cuidados.reduce((sum, c) => sum + (c.valor || 0), 0);
        
        const hoje = new Date();
        const ultimoCuidado = cuidados[0];
        const diasDesdeUltimo = ultimoCuidado 
            ? Math.floor((hoje - new Date(ultimoCuidado.data)) / (1000 * 60 * 60 * 24))
            : null;
        
        return {
            totalBanhos: banhos.length,
            totalTosas: tosas.length,
            gastoTotal: gastoTotal,
            diasDesdeUltimo: diasDesdeUltimo,
            ultimoCuidado: ultimoCuidado
        };
    },
    
    /**
     * Renderizar cards de estatísticas
     */
    renderCards(stats, pet) {
        // Usar base de raças se disponível
        let recomendacao;
        if (window.BaseRacas) {
            const infoRaca = window.BaseRacas.obterRecomendacoes(pet);
            recomendacao = {
                dias: infoRaca.banho.frequencia,
                descricao: infoRaca.banho.descricao
            };
        } else {
            // Fallback para sistema antigo baseado em peso
            const porte = this.determinarPorte(pet.peso?.[pet.peso.length - 1]?.valor || 10);
            recomendacao = this.recomendacoes[porte];
        }
        
        const statusBanho = stats.diasDesdeUltimo === null 
            ? { cor: '#999', texto: 'Sem registro', icon: '❓' }
            : stats.diasDesdeUltimo > recomendacao.dias
            ? { cor: '#ff9800', texto: 'Agendar banho', icon: '⚠️' }
            : { cor: '#4caf50', texto: 'Em dia', icon: '✅' };
        
        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem">
                <!-- Card: Total de Banhos -->
                <div data-filtro="banhos" style="background:linear-gradient(135deg,#2196F3,#1976D2);padding:1.5rem;border-radius:16px;color:white;box-shadow:0 4px 12px rgba(33,150,243,0.3)">
                    <div style="font-size:2.5rem;margin-bottom:0.5rem">🛁</div>
                    <div style="font-size:2rem;font-weight:700">${stats.totalBanhos}</div>
                    <div style="opacity:0.9">Banhos realizados</div>
                </div>
                
                <!-- Card: Total de Tosas -->
                <div data-filtro="tosas" style="background:linear-gradient(135deg,#9C27B0,#7B1FA2);padding:1.5rem;border-radius:16px;color:white;box-shadow:0 4px 12px rgba(156,39,176,0.3)">
                    <div style="font-size:2.5rem;margin-bottom:0.5rem">✂️</div>
                    <div style="font-size:2rem;font-weight:700">${stats.totalTosas}</div>
                    <div style="opacity:0.9">Tosas realizadas</div>
                </div>
                
                <!-- Card: Gasto Total -->
                <div data-filtro="gastos" style="background:linear-gradient(135deg,#4CAF50,#388E3C);padding:1.5rem;border-radius:16px;color:white;box-shadow:0 4px 12px rgba(76,175,80,0.3)">
                    <div style="font-size:2.5rem;margin-bottom:0.5rem">💰</div>
                    <div style="font-size:2rem;font-weight:700">R$ ${stats.gastoTotal.toFixed(2)}</div>
                    <div style="opacity:0.9">Gasto total</div>
                </div>
                
                <!-- Card: Status -->
                <div data-filtro="status" style="background:linear-gradient(135deg,${statusBanho.cor},${statusBanho.cor}dd);padding:1.5rem;border-radius:16px;color:white;box-shadow:0 4px 12px ${statusBanho.cor}40">
                    <div style="font-size:2.5rem;margin-bottom:0.5rem">${statusBanho.icon}</div>
                    <div style="font-size:1.5rem;font-weight:700">${stats.diasDesdeUltimo !== null ? `Há ${stats.diasDesdeUltimo} dias` : 'Sem registro'}</div>
                    <div style="opacity:0.9">${statusBanho.texto}</div>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar timeline
     */
    renderTimeline(cuidados) {
        if (cuidados.length === 0) {
            return `
                <div style="text-align:center;padding:3rem;color:#999">
                    <div style="font-size:3rem;margin-bottom:1rem">📅</div>
                    <div style="font-size:1.2rem">Nenhum cuidado registrado ainda</div>
                    <div style="margin-top:0.5rem">Adicione o primeiro banho ou tosa!</div>
                </div>
            `;
        }
        
        return `
            <div style="margin-top:2rem">
                <h3 style="margin-bottom:1.5rem;color:#333">📅 Timeline de Cuidados</h3>
                <div style="position:relative;padding-left:2rem">
                    <!-- Linha vertical -->
                    <div style="position:absolute;left:0.5rem;top:0;bottom:0;width:2px;background:#e0e0e0"></div>
                    
                    ${cuidados.slice(0, 10).map((c, i) => {
                        const cor = c.tipo === 'banho' ? '#2196F3' : c.tipo === 'tosa' ? '#9C27B0' : '#4CAF50';
                        const icon = c.tipo === 'banho' ? '🛁' : c.tipo === 'tosa' ? '✂️' : '🛁✂️';
                        const data = new Date(c.data).toLocaleDateString('pt-BR');
                        
                        return `
                            <div data-tipo="${c.tipo}" data-item-timeline style="position:relative;margin-bottom:1.5rem;padding-left:2rem">
                                <!-- Bolinha -->
                                <div style="position:absolute;left:-1.5rem;top:0.25rem;width:1rem;height:1rem;border-radius:50%;background:${cor};border:3px solid white;box-shadow:0 0 0 2px ${cor}"></div>
                                
                                <!-- Card -->
                                <div style="background:white;padding:1rem;border-radius:12px;border-left:4px solid ${cor};box-shadow:0 2px 8px rgba(0,0,0,0.1);position:relative">
                                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                                        <span style="font-size:1.5rem">${icon}</span>
                                        <strong style="color:${cor}">${c.tipo === 'banho' ? 'Banho' : c.tipo === 'tosa' ? 'Tosa' : 'Banho + Tosa'}</strong>
                                        ${c.tipoTosa ? `<span style="color:#666;font-size:0.9rem">(${c.tipoTosa})</span>` : ''}
                                    </div>
                                    <div style="font-size:0.9rem;color:#666;margin-bottom:0.25rem">
                                        📅 ${data} • 📍 ${c.local}
                                    </div>
                                    ${c.valor > 0 ? `<div style="font-size:0.9rem;color:#4CAF50;font-weight:600">💰 R$ ${c.valor.toFixed(2)}</div>` : ''}
                                    ${c.obs ? `<div style="font-size:0.85rem;color:#999;margin-top:0.5rem;font-style:italic">${c.obs}</div>` : ''}
                                    
                                    <!-- Botões de ação -->
                                    <div style="position:absolute;top:0.5rem;right:0.5rem;display:flex;gap:0.5rem">
                                        <button onclick="editarCuidado(${i})" style="background:#2196F3;color:white;border:none;padding:0.4rem 0.8rem;border-radius:6px;cursor:pointer;font-size:0.85rem" title="Editar">
                                            ✏️ Editar
                                        </button>
                                        <button onclick="deletarCuidado(${i})" style="background:#f44336;color:white;border:none;padding:0.4rem 0.8rem;border-radius:6px;cursor:pointer;font-size:0.85rem" title="Deletar">
                                            🗑️ Deletar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar recomendações inteligentes
     */
    renderRecomendacoes(pet, stats) {
        // Usar base de raças se disponível
        let infoRaca, recomendacao;
        if (window.BaseRacas) {
            infoRaca = window.BaseRacas.obterRecomendacoes(pet);
            recomendacao = {
                dias: infoRaca.banho.frequencia,
                descricao: infoRaca.banho.descricao
            };
        } else {
            // Fallback
            const pesoAtual = pet.peso?.[pet.peso.length - 1]?.valor || 10;
            const porte = this.determinarPorte(pesoAtual);
            recomendacao = this.recomendacoes[porte];
            infoRaca = { porte, caracteristicas: [], cuidadosEspeciais: [] };
        }
        
        const proximoBanho = stats.ultimoCuidado 
            ? new Date(new Date(stats.ultimoCuidado.data).getTime() + recomendacao.dias * 24 * 60 * 60 * 1000)
            : new Date();
        
        const diasAteProximo = Math.ceil((proximoBanho - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div style="background:linear-gradient(135deg,#E3F2FD,#BBDEFB);padding:1.5rem;border-radius:16px;margin-top:2rem">
                <h3 style="margin-bottom:1rem;color:#1976D2">💡 Recomendações Inteligentes</h3>
                
                <div style="background:white;padding:1rem;border-radius:12px;margin-bottom:1rem">
                    <div style="font-weight:600;color:#333;margin-bottom:0.5rem">🐾 Raça: ${pet.raca || 'Não informada'}</div>
                    <div style="color:#666;font-size:0.9rem;margin-bottom:0.5rem">🐕 Porte: ${infoRaca.porte.charAt(0).toUpperCase() + infoRaca.porte.slice(1)}</div>
                    <div style="color:#666;font-size:0.9rem">${recomendacao.descricao}</div>
                    ${infoRaca.pelagem ? `<div style="color:#666;font-size:0.9rem;margin-top:0.5rem">✂️ Pelagem: ${infoRaca.pelagem}</div>` : ''}
                </div>
                
                ${stats.ultimoCuidado ? `
                    <div style="background:white;padding:1rem;border-radius:12px">
                        <div style="font-weight:600;color:#333;margin-bottom:0.5rem">📅 Próximo banho recomendado</div>
                        <div style="color:#666;font-size:0.9rem">
                            ${proximoBanho.toLocaleDateString('pt-BR')} 
                            ${diasAteProximo > 0 
                                ? `(em ${diasAteProximo} dias)` 
                                : `<span style="color:#ff9800;font-weight:600">(atrasado ${Math.abs(diasAteProximo)} dias)</span>`
                            }
                        </div>
                    </div>
                ` : `
                    <div style="background:white;padding:1rem;border-radius:12px">
                        <div style="font-weight:600;color:#333;margin-bottom:0.5rem">🎯 Primeiro banho</div>
                        <div style="color:#666;font-size:0.9rem">Adicione o primeiro banho para começar o acompanhamento!</div>
                    </div>
                `}
            </div>
        `;
    },
    
    /**
     * Renderizar dashboard completo
     */
    render(pet) {
        const cuidados = this.coletarCuidados(pet);
        const stats = this.calcularEstatisticas(cuidados);
        
        // Inicializar filtros após renderização
        setTimeout(() => this.inicializarFiltros(cuidados), 100);
        
        return `
            <div id="dashboard-banho-tosa" style="padding:1.5rem">
                ${this.renderCards(stats, pet)}
                ${this.renderRecomendacoes(pet, stats)}
                ${this.renderTimeline(cuidados)}
            </div>
        `;
    },
    
    /**
     * Inicializar sistema de filtros interativos
     */
    inicializarFiltros(cuidados) {
        if (!window.FiltrosInterativos) return;
        
        const cards = [
            { filtro: 'banhos' },
            { filtro: 'tosas' },
            { filtro: 'gastos' },
            { filtro: 'status' }
        ];
        
        window.FiltrosInterativos.inicializar(
            'dashboard-banho-tosa',
            cards,
            (filtro) => this.aplicarFiltro(filtro, cuidados)
        );
    },
    
    /**
     * Aplicar filtro na timeline
     */
    aplicarFiltro(filtro, cuidados) {
        const itens = document.querySelectorAll('[data-item-timeline]');
        
        itens.forEach(item => {
            const tipo = item.dataset.tipo;
            let deveExibir = true;
            
            if (filtro === 'banhos') {
                deveExibir = tipo === 'banho' || tipo === 'banho_tosa';
            } else if (filtro === 'tosas') {
                deveExibir = tipo === 'tosa' || tipo === 'banho_tosa';
            } else if (filtro === null) {
                deveExibir = true; // Mostrar tudo
            }
            
            if (deveExibir) {
                item.style.display = '';
                item.style.animation = 'fadeIn 0.3s ease';
            } else {
                item.style.display = 'none';
            }
        });
    }
};

// Exportar para uso global
window.DashboardBanhoTosa = DashboardBanhoTosa;
