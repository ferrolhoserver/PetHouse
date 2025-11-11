/**
 * Mapeamento de vacinas compostas e suas coberturas
 * Define quais doenças são cobertas por vacinas múltiplas
 */

const VacinasCompostas = {
    /**
     * Mapa de vacinas múltiplas e as doenças que elas cobrem
     */
    cobertura: {
        'v10': [
            'cinomose',
            'parvovirose',
            'hepatite',
            'adenovírus',
            'parainfluenza',
            'coronavírus',
            'leptospirose'
        ],
        'v8': [
            'cinomose',
            'parvovirose',
            'hepatite',
            'adenovírus',
            'parainfluenza',
            'coronavírus',
            'leptospirose'
        ],
        'v6': [
            'cinomose',
            'parvovirose',
            'hepatite',
            'adenovírus',
            'parainfluenza',
            'coronavírus'
        ],
        'v4': [
            'cinomose',
            'parvovirose',
            'hepatite',
            'adenovírus'
        ]
    },

    /**
     * Normaliza nome de vacina para busca
     */
    normalizarNome(nome) {
        return nome.toLowerCase()
            .replace(/[()]/g, '')
            .replace(/déctupla|dectupla/g, '')
            .replace(/óctupla|octupla/g, '')
            .replace(/sêxtupla|sextupla/g, '')
            .replace(/quádrupla|quadrupla/g, '')
            .trim();
    },

    /**
     * Verifica se uma doença está coberta por alguma vacina múltipla aplicada
     * @param {string} doenca - Nome da doença a verificar
     * @param {Array} vacinasAplicadas - Lista de vacinas já aplicadas
     * @returns {Object|null} - Informações da vacina que cobre a doença, ou null
     */
    verificarCobertura(doenca, vacinasAplicadas) {
        const doencaNormalizada = this.normalizarNome(doenca);
        
        // Buscar vacinas múltiplas aplicadas
        for (const vacina of vacinasAplicadas) {
            const nomeVacina = this.normalizarNome(vacina.nome);
            
            // Verificar cada tipo de vacina múltipla
            for (const [tipo, doencasCobertas] of Object.entries(this.cobertura)) {
                if (nomeVacina.includes(tipo)) {
                    // Verificar se a doença está na lista de cobertura
                    const coberta = doencasCobertas.some(d => 
                        doencaNormalizada.includes(d) || d.includes(doencaNormalizada)
                    );
                    
                    if (coberta) {
                        return {
                            vacinaCobre: vacina.nome,
                            tipo: tipo.toUpperCase(),
                            data: vacina.data,
                            veterinario: vacina.veterinario
                        };
                    }
                }
            }
        }
        
        return null;
    },

    /**
     * Verifica se uma vacina específica está coberta por vacina múltipla
     * @param {string} nomeVacina - Nome da vacina a verificar
     * @param {Array} vacinasAplicadas - Lista de vacinas já aplicadas
     * @returns {Object|null} - Informações da cobertura, ou null
     */
    vacinaEstaCoberta(nomeVacina, vacinasAplicadas) {
        // Extrair doença do nome da vacina
        // Ex: "Leptospirose" de "Leptospirose (integrada à V10)"
        const doenca = nomeVacina.split('(')[0].trim();
        return this.verificarCobertura(doenca, vacinasAplicadas);
    },

    /**
     * Obtém lista de doenças cobertas por uma vacina
     * @param {string} nomeVacina - Nome da vacina
     * @returns {Array} - Lista de doenças cobertas
     */
    obterDoencasCobertas(nomeVacina) {
        const nomeNormalizado = this.normalizarNome(nomeVacina);
        
        for (const [tipo, doencas] of Object.entries(this.cobertura)) {
            if (nomeNormalizado.includes(tipo)) {
                return doencas;
            }
        }
        
        return [];
    },

    /**
     * Gera descrição de cobertura para exibição
     * @param {string} doenca - Nome da doença
     * @param {Object} cobertura - Objeto de cobertura retornado por verificarCobertura
     * @returns {string} - Descrição formatada
     */
    gerarDescricaoCobertura(doenca, cobertura) {
        if (!cobertura) return null;
        
        const dataFormatada = new Date(cobertura.data).toLocaleDateString('pt-BR');
        return `Proteção contra ${doenca.toLowerCase()} (integrada à ${cobertura.tipo}) - Aplicada em ${dataFormatada}`;
    }
};

// Exportar para uso global
window.VacinasCompostas = VacinasCompostas;
