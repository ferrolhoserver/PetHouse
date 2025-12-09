/**
 * Sistema de Filtros Interativos para Cards
 * Permite clicar nos cards para filtrar a lista abaixo
 */

const FiltrosInterativos = {
    
    /**
     * Estado atual dos filtros
     */
    filtroAtivo: null,
    
    /**
     * Tornar cards clicáveis e adicionar filtros
     * @param {string} containerId - ID do container dos cards
     * @param {Array} cards - Array de configuração dos cards [{id, filtro, elemento}]
     * @param {Function} callbackFiltro - Função chamada quando filtro muda
     */
    inicializar(containerId, cards, callbackFiltro) {
        cards.forEach(card => {
            const elemento = document.querySelector(`#${containerId} [data-filtro="${card.filtro}"]`);
            if (!elemento) return;
            
            // Tornar clicável
            elemento.style.cursor = 'pointer';
            elemento.style.transition = 'all 0.3s ease';
            
            // Adicionar evento de clique
            elemento.addEventListener('click', () => {
                this.aplicarFiltro(card.filtro, cards, callbackFiltro);
            });
            
            // Hover effect
            elemento.addEventListener('mouseenter', () => {
                if (this.filtroAtivo !== card.filtro) {
                    elemento.style.transform = 'translateY(-4px)';
                    elemento.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                }
            });
            
            elemento.addEventListener('mouseleave', () => {
                if (this.filtroAtivo !== card.filtro) {
                    elemento.style.transform = 'translateY(0)';
                    elemento.style.boxShadow = elemento.dataset.originalShadow || '0 4px 16px rgba(0,0,0,0.2)';
                }
            });
        });
    },
    
    /**
     * Aplicar filtro
     */
    aplicarFiltro(filtro, cards, callbackFiltro) {
        // Se clicar no mesmo filtro, remove
        if (this.filtroAtivo === filtro) {
            this.filtroAtivo = null;
            this.removerDestaquesVisuais(cards);
            callbackFiltro(null); // Mostrar tudo
            return;
        }
        
        // Aplicar novo filtro
        this.filtroAtivo = filtro;
        this.aplicarDestaquesVisuais(filtro, cards);
        callbackFiltro(filtro);
    },
    
    /**
     * Aplicar destaques visuais nos cards
     */
    aplicarDestaquesVisuais(filtroAtivo, cards) {
        cards.forEach(card => {
            const elemento = document.querySelector(`[data-filtro="${card.filtro}"]`);
            if (!elemento) return;
            
            if (card.filtro === filtroAtivo) {
                // Card ativo: destacar
                elemento.style.transform = 'scale(1.05)';
                elemento.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                elemento.style.border = '3px solid white';
                elemento.style.opacity = '1';
            } else {
                // Cards inativos: diminuir opacidade
                elemento.style.transform = 'scale(0.95)';
                elemento.style.opacity = '0.5';
                elemento.style.border = 'none';
            }
        });
    },
    
    /**
     * Remover destaques visuais
     */
    removerDestaquesVisuais(cards) {
        cards.forEach(card => {
            const elemento = document.querySelector(`[data-filtro="${card.filtro}"]`);
            if (!elemento) return;
            
            elemento.style.transform = 'scale(1)';
            elemento.style.opacity = '1';
            elemento.style.border = 'none';
            elemento.style.boxShadow = elemento.dataset.originalShadow || '0 4px 16px rgba(0,0,0,0.2)';
        });
    },
    
    /**
     * Filtrar elementos da lista
     * @param {string} listaSelector - Seletor CSS da lista
     * @param {string} itemSelector - Seletor CSS dos itens
     * @param {Function} funcaoFiltro - Função que retorna true se item deve ser mostrado
     */
    filtrarLista(listaSelector, itemSelector, funcaoFiltro) {
        const lista = document.querySelector(listaSelector);
        if (!lista) return;
        
        const itens = lista.querySelectorAll(itemSelector);
        let visiveisCount = 0;
        
        itens.forEach(item => {
            const deveExibir = funcaoFiltro ? funcaoFiltro(item) : true;
            
            if (deveExibir) {
                item.style.display = '';
                item.style.animation = 'fadeIn 0.3s ease';
                visiveisCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Mostrar mensagem se nenhum item visível
        this.atualizarMensagemVazia(lista, visiveisCount);
    },
    
    /**
     * Atualizar mensagem de lista vazia
     */
    atualizarMensagemVazia(lista, visiveisCount) {
        let mensagem = lista.querySelector('.filtro-mensagem-vazia');
        
        if (visiveisCount === 0) {
            if (!mensagem) {
                mensagem = document.createElement('div');
                mensagem.className = 'filtro-mensagem-vazia';
                mensagem.style.cssText = `
                    padding: 2rem;
                    text-align: center;
                    color: #999;
                    font-size: 1.1rem;
                    background: #f5f5f5;
                    border-radius: 12px;
                    margin: 1rem 0;
                `;
                mensagem.innerHTML = '🔍 Nenhum item encontrado com este filtro';
                lista.appendChild(mensagem);
            }
            mensagem.style.display = 'block';
        } else {
            if (mensagem) {
                mensagem.style.display = 'none';
            }
        }
    },
    
    /**
     * Resetar todos os filtros
     */
    resetar() {
        this.filtroAtivo = null;
    }
};

// Adicionar animação CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Exportar globalmente
window.FiltrosInterativos = FiltrosInterativos;

console.log('✅ Sistema de Filtros Interativos carregado');
