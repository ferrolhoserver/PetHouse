/**
 * Módulo de IA para Conhecimento Colaborativo
 * Gera embeddings e faz busca semântica
 */

class ConhecimentoIA {
    constructor() {
        this.supabaseUrl = 'https://vaylmepocuppvfkixeoj.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWxtZXBvY3VwcHZma2l4ZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NjQ1NTIsImV4cCI6MjA0ODE0MDU1Mn0.gKwWnHx5fqTa3aPxYdaGGlLJKJXVZUcALZlhH_Jz0Ek';
        
        // Configuração da OpenAI (via proxy do Supabase Edge Functions)
        this.openaiEndpoint = `${this.supabaseUrl}/functions/v1/generate-embedding`;
        
        // Cache de embeddings
        this.embeddingCache = new Map();
    }

    /**
     * Gera embedding de texto usando OpenAI
     * (Será implementado via Edge Function no Supabase)
     */
    async gerarEmbedding(texto) {
        // Verifica cache
        const cacheKey = texto.toLowerCase().trim();
        if (this.embeddingCache.has(cacheKey)) {
            return this.embeddingCache.get(cacheKey);
        }

        try {
            // Por enquanto, retorna null (busca tradicional)
            // TODO: Implementar Edge Function no Supabase para gerar embeddings
            console.log('⚠️ [IA] Embeddings ainda não implementados, usando busca tradicional');
            return null;
        } catch (error) {
            console.error('❌ [IA] Erro ao gerar embedding:', error);
            return null;
        }
    }

    /**
     * Busca semântica usando embeddings
     */
    async buscarSemantica(query, tipo = null, limite = 10) {
        try {
            // Gera embedding da query
            const embedding = await this.gerarEmbedding(query);

            // Chama função do Supabase
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/rpc/buscar_conhecimento_hibrido`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query_text: query,
                        query_embedding: embedding,
                        tipo_filtro: tipo,
                        limite: limite
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Erro na busca');
            }

            const resultados = await response.json();
            
            console.log(`✅ [IA] Busca retornou ${resultados.length} resultados`);
            
            return resultados;
        } catch (error) {
            console.error('❌ [IA] Erro na busca semântica:', error);
            
            // Fallback: busca tradicional
            return await this.buscarTradicional(query, tipo, limite);
        }
    }

    /**
     * Busca tradicional (fallback sem IA)
     */
    async buscarTradicional(query, tipo = null, limite = 10) {
        try {
            const queryLower = query.toLowerCase();
            
            let url = `${this.supabaseUrl}/rest/v1/conhecimento_colaborativo?status=eq.aprovado&select=*&limit=${limite}`;
            
            if (tipo) {
                url += `&tipo=eq.${tipo}`;
            }

            const response = await fetch(url, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro na busca tradicional');
            }

            const dados = await response.json();

            // Filtra e pontua resultados
            const resultados = dados
                .map(item => {
                    let score = 0;
                    const nome = item.nome.toLowerCase();
                    const aliases = item.aliases || [];
                    const keywords = item.keywords || [];

                    // Pontuação por correspondência
                    if (nome.includes(queryLower)) score += 10;
                    if (queryLower.includes(nome)) score += 8;
                    
                    aliases.forEach(alias => {
                        if (alias.toLowerCase().includes(queryLower)) score += 5;
                        if (queryLower.includes(alias.toLowerCase())) score += 4;
                    });

                    keywords.forEach(keyword => {
                        if (queryLower.includes(keyword.toLowerCase())) score += 3;
                    });

                    // Adiciona score de qualidade
                    score += item.score_qualidade * 0.1;

                    return {
                        ...item,
                        score
                    };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, limite);

            console.log(`✅ [IA] Busca tradicional retornou ${resultados.length} resultados`);
            
            return resultados;
        } catch (error) {
            console.error('❌ [IA] Erro na busca tradicional:', error);
            return [];
        }
    }

    /**
     * Registra uso de conhecimento (aprendizado)
     */
    async registrarUso(conhecimentoId, foiUtil = null) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/rpc/registrar_uso_conhecimento`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        p_conhecimento_id: conhecimentoId,
                        p_foi_util: foiUtil
                    })
                }
            );

            if (response.ok) {
                console.log(`✅ [IA] Uso registrado para conhecimento ${conhecimentoId}`);
            }
        } catch (error) {
            console.error('❌ [IA] Erro ao registrar uso:', error);
        }
    }

    /**
     * Registra feedback do usuário
     */
    async registrarFeedback(conhecimentoId, tipoFeedback, comentario = null) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/conhecimento_feedback`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        conhecimento_id: conhecimentoId,
                        usuario_id: ConhecimentoColaborativo.getContribuidorId(),
                        tipo_feedback: tipoFeedback,
                        comentario: comentario,
                        created_at: new Date().toISOString()
                    })
                }
            );

            if (response.ok) {
                console.log(`✅ [IA] Feedback registrado: ${tipoFeedback}`);
                return true;
            }
        } catch (error) {
            console.error('❌ [IA] Erro ao registrar feedback:', error);
        }
        return false;
    }

    /**
     * Registra log de ação
     */
    async registrarLog(conhecimentoId, acao, detalhes = {}) {
        try {
            await fetch(
                `${this.supabaseUrl}/rest/v1/conhecimento_logs`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        conhecimento_id: conhecimentoId,
                        acao: acao,
                        usuario_id: ConhecimentoColaborativo.getContribuidorId(),
                        detalhes: detalhes,
                        created_at: new Date().toISOString()
                    })
                }
            );
        } catch (error) {
            console.error('❌ [IA] Erro ao registrar log:', error);
        }
    }

    /**
     * Busca conhecimento para OCR
     */
    async buscarParaOCR(textoExtraido, tipo = 'vacinas') {
        console.log(`🔍 [IA] Buscando ${tipo} no texto: "${textoExtraido.substring(0, 100)}..."`);

        // Extrai palavras-chave do texto
        const palavras = textoExtraido
            .toLowerCase()
            .split(/\s+/)
            .filter(p => p.length > 3);

        // Busca por cada palavra significativa
        const resultadosPorPalavra = [];
        
        for (const palavra of palavras.slice(0, 10)) { // Limita a 10 palavras
            const resultados = await this.buscarSemantica(palavra, tipo, 5);
            resultadosPorPalavra.push(...resultados);
        }

        // Remove duplicatas e ordena por score
        const resultadosUnicos = Array.from(
            new Map(resultadosPorPalavra.map(r => [r.id, r])).values()
        ).sort((a, b) => (b.score || 0) - (a.score || 0));

        console.log(`✅ [IA] Encontrados ${resultadosUnicos.length} resultados únicos`);

        return resultadosUnicos.slice(0, 5); // Top 5
    }

    /**
     * Sugere conhecimento similar
     */
    async sugerirSimilares(conhecimentoId, limite = 5) {
        try {
            // Busca o conhecimento original
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/conhecimento_colaborativo?id=eq.${conhecimentoId}&select=*`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (!response.ok) return [];

            const [conhecimento] = await response.json();
            if (!conhecimento) return [];

            // Busca similares pelo nome
            return await this.buscarSemantica(
                conhecimento.nome, 
                conhecimento.tipo, 
                limite + 1
            ).then(resultados => 
                resultados.filter(r => r.id !== conhecimentoId).slice(0, limite)
            );
        } catch (error) {
            console.error('❌ [IA] Erro ao sugerir similares:', error);
            return [];
        }
    }
}

// Instância global
window.conhecimentoIA = new ConhecimentoIA();

console.log('🤖 [IA] Módulo de IA carregado');
