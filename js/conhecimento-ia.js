/*
 * PetHouse V2 — adaptador de conhecimento local.
 * A antiga busca em Supabase/embeddings foi removida para preservar o modo offline.
 */
class ConhecimentoIA {
    constructor() {
        this.localIndex = [];
    }

    async buscarParaOCR(texto, tipo = null, limite = 10) {
        return this.buscarTradicional(texto, tipo, limite);
    }

    async buscarSemantica(query, tipo = null, limite = 10) {
        return this.buscarTradicional(query, tipo, limite);
    }

    async buscarTradicional(query, tipo = null, limite = 10) {
        const normalized = String(query || '').trim().toLocaleLowerCase('pt-BR');
        if (!normalized) return [];
        return this.localIndex
            .filter(item => !tipo || item.tipo === tipo)
            .map(item => {
                const terms = [item.nome, ...(item.aliases || []), ...(item.keywords || [])]
                    .filter(Boolean).map(value => String(value).toLocaleLowerCase('pt-BR'));
                const score = terms.reduce((total, term) => total + (normalized.includes(term) || term.includes(normalized) ? 1 : 0), 0);
                return { ...item, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limite);
    }

    async registrarUso() {
        // O aprendizado remoto é intencionalmente desativado no modo privado/offline.
        return { localOnly: true };
    }
}

const conhecimentoIA = new ConhecimentoIA();
window.ConhecimentoIA = ConhecimentoIA;
window.conhecimentoIA = conhecimentoIA;
