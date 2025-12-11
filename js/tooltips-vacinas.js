/**
 * Sistema de Tooltips Informativos para Vacinas
 * Mostra protocolo e recomendações ao passar mouse sobre ícone "ℹ️"
 * Arquivo separado e opcional - não quebra nada se não carregar
 */

const TooltipsVacinas = {
    /**
     * Inicializar tooltips em um container
     * @param {string} containerId - ID do container
     */
    inicializar(containerId = 'wizard-vacina-modal') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('[TooltipsVacinas] Container não encontrado:', containerId);
            return;
        }
        
        // Adicionar ícones de informação em cada vacina
        const vacinasButtons = container.querySelectorAll('[data-vacina-id]');
        vacinasButtons.forEach(btn => {
            const vacinaId = btn.getAttribute('data-vacina-id');
            if (!vacinaId) return;
            
            // Verificar se já tem ícone de info
            if (btn.querySelector('.vacina-info-icon')) return;
            
            // Criar ícone de informação
            const infoIcon = document.createElement('span');
            infoIcon.className = 'vacina-info-icon';
            infoIcon.innerHTML = 'ℹ️';
            infoIcon.style.cssText = 'position:absolute;top:0.5rem;right:0.5rem;font-size:1.2rem;cursor:help;opacity:0.6;transition:opacity 0.2s';
            
            // Eventos
            infoIcon.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                this.mostrarTooltip(vacinaId, infoIcon);
            });
            
            infoIcon.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                this.esconderTooltip();
            });
            
            // Adicionar ao botão
            btn.style.position = 'relative';
            btn.appendChild(infoIcon);
        });
        
        console.log('[TooltipsVacinas] Tooltips inicializados');
    },
    
    /**
     * Mostrar tooltip com informações da vacina
     * @param {string} vacinaId - ID da vacina
     * @param {HTMLElement} elemento - Elemento que disparou o tooltip
     */
    mostrarTooltip(vacinaId, elemento) {
        // Obter protocolo da vacina
        if (!window.ProtocolosVacinas) {
            console.warn('[TooltipsVacinas] ProtocolosVacinas não carregado');
            return;
        }
        
        const protocolo = ProtocolosVacinas.obter(vacinaId);
        if (!protocolo) {
            console.warn('[TooltipsVacinas] Protocolo não encontrado:', vacinaId);
            return;
        }
        
        // Criar tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'vacina-tooltip';
        tooltip.className = 'vacina-tooltip show';
        tooltip.innerHTML = this.renderTooltipContent(protocolo);
        
        // Posicionar tooltip
        document.body.appendChild(tooltip);
        
        const rect = elemento.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Centralizar acima do ícone
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;
        
        // Ajustar se sair da tela
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 10; // Mostrar abaixo se não couber acima
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    },
    
    /**
     * Esconder tooltip
     */
    esconderTooltip() {
        const tooltip = document.getElementById('vacina-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    },
    
    /**
     * Renderizar conteúdo do tooltip
     * @param {Object} protocolo - Protocolo da vacina
     * @returns {string} - HTML do tooltip
     */
    renderTooltipContent(protocolo) {
        const categoria = protocolo.categoria === 'core' ? 
            '<span style="color:#4CAF50">✓ ESSENCIAL (WSAVA Core)</span>' : 
            '<span style="color:#FF9800">⚠️ OPCIONAL (Não-Core)</span>';
        
        return `
            <div style="font-weight:600;margin-bottom:0.5rem;font-size:1rem">
                ${protocolo.icon} ${protocolo.nome}
            </div>
            <div style="margin-bottom:0.5rem;font-size:0.85rem;opacity:0.9">
                ${protocolo.descricao}
            </div>
            <div style="margin-bottom:0.5rem;font-size:0.85rem">
                ${categoria}
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:0.5rem;margin-top:0.5rem">
                <div style="font-weight:600;margin-bottom:0.25rem;font-size:0.9rem">📋 Protocolo:</div>
                <ul style="margin:0;padding-left:1.5rem;font-size:0.85rem">
                    <li><strong>${protocolo.doses} dose(s)</strong></li>
                    ${protocolo.intervalo > 0 ? `<li>Intervalo: <strong>${protocolo.intervalo} dias</strong></li>` : ''}
                    <li>Idade inicial: <strong>${protocolo.idadeInicial} dias</strong></li>
                    <li>Reforço: <strong>${protocolo.reforco.primeiro} dias</strong></li>
                </ul>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:0.5rem;margin-top:0.5rem">
                <div style="font-weight:600;margin-bottom:0.25rem;font-size:0.9rem">💡 Recomendações:</div>
                <ul style="margin:0;padding-left:1.5rem;font-size:0.8rem;max-height:150px;overflow-y:auto">
                    ${protocolo.recomendacoes.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    },
    
    /**
     * Adicionar tooltip a um elemento específico
     * @param {HTMLElement} elemento - Elemento para adicionar tooltip
     * @param {string} vacinaId - ID da vacina
     */
    adicionarTooltip(elemento, vacinaId) {
        if (!elemento) return;
        
        // Criar ícone de informação
        const infoIcon = document.createElement('span');
        infoIcon.className = 'vacina-info-icon';
        infoIcon.innerHTML = 'ℹ️';
        infoIcon.style.cssText = 'margin-left:0.5rem;font-size:1rem;cursor:help;opacity:0.6;transition:opacity 0.2s';
        
        // Eventos
        infoIcon.addEventListener('mouseenter', () => {
            this.mostrarTooltip(vacinaId, infoIcon);
        });
        
        infoIcon.addEventListener('mouseleave', () => {
            this.esconderTooltip();
        });
        
        // Adicionar ao elemento
        elemento.appendChild(infoIcon);
    },
    
    /**
     * Inicializar automaticamente quando wizard abrir
     */
    autoInicializar() {
        // Observar quando wizard é criado
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.id === 'wizard-vacina-modal') {
                        // Aguardar renderização completa
                        setTimeout(() => {
                            this.inicializar('wizard-vacina-modal');
                        }, 100);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: false
        });
        
        console.log('[TooltipsVacinas] Auto-inicialização ativada');
    }
};

// Exportar globalmente
window.TooltipsVacinas = TooltipsVacinas;

// Auto-inicializar quando página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TooltipsVacinas.autoInicializar();
    });
} else {
    TooltipsVacinas.autoInicializar();
}

console.log('[TooltipsVacinas] Sistema de tooltips carregado');
