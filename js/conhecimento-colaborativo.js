/*
 * PetHouse V2 — conhecimento local e privado.
 * Contribuições permanecem neste dispositivo até que uma sincronização futura seja configurada explicitamente.
 */
const ConhecimentoColaborativo = {
    STORAGE_KEY: 'pethouse_local_knowledge_v2',
    cache: { vacinas: [], vermifugos: [], medicamentos: [], procedimentos: [], exames: [], outros: [], lastUpdate: null },

    async init() {
        await this.carregarTodos();
        return true;
    },

    async carregarTodos() {
        const stored = this._read();
        for (const tipo of Object.keys(this.cache).filter(key => key !== 'lastUpdate')) {
            this.cache[tipo] = Array.isArray(stored[tipo]) ? stored[tipo] : [];
        }
        this.cache.lastUpdate = Date.now();
        return this.cache;
    },

    async carregarPorTipo(tipo) {
        if (!Object.prototype.hasOwnProperty.call(this.cache, tipo) || tipo === 'lastUpdate') return [];
        await this.carregarTodos();
        return this.cache[tipo];
    },

    async buscarPorTexto(texto, tipo = null) {
        const needle = String(texto || '').trim().toLocaleLowerCase('pt-BR');
        if (!needle) return [];
        await this.carregarTodos();
        const buckets = tipo ? [tipo] : Object.keys(this.cache).filter(key => key !== 'lastUpdate');
        return buckets.flatMap(bucket => this.cache[bucket] || []).filter(item => {
            const terms = [item.nome, ...(item.aliases || []), ...(item.keywords || [])]
                .filter(Boolean).map(value => String(value).toLocaleLowerCase('pt-BR'));
            return terms.some(term => term.includes(needle) || needle.includes(term));
        });
    },

    async contribuir(dados) {
        const tipo = String(dados?.tipo || '').trim();
        const nome = String(dados?.nome || '').trim();
        if (!this.cache.hasOwnProperty(tipo) || tipo === 'lastUpdate' || !nome) throw new Error('Tipo e nome são obrigatórios.');
        const stored = this._read();
        const entry = {
            id: `local_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
            tipo, nome,
            fabricante: String(dados.fabricante || '').trim(),
            descricao: String(dados.descricao || '').trim(),
            aliases: Array.isArray(dados.aliases) ? dados.aliases : [],
            keywords: Array.isArray(dados.keywords) ? dados.keywords : [],
            metadados: dados.metadados || {},
            status: 'local',
            created_at: new Date().toISOString()
        };
        stored[tipo] = [...(stored[tipo] || []), entry];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
        await this.carregarTodos();
        return { success: true, localOnly: true, contribuicao: entry };
    },

    _read() {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'); }
        catch (_) { return {}; }
    }
};
window.ConhecimentoColaborativo = ConhecimentoColaborativo;
