/**
 * Protocolos Vacinais Individuais
 * Cada vacina tem suas próprias regras, intervalos e recomendações
 * Baseado em WSAVA Guidelines e protocolos veterinários brasileiros
 */

const ProtocolosVacinas = {
    /**
     * V10 (Déctupla) - Vacina Polivalente
     * Protege contra: Cinomose, Parvovirose, Hepatite, Adenovirose, 
     * Parainfluenza, Coronavirose, Leptospirose (4 sorovares)
     */
    v10: {
        id: 'v10',
        nome: 'V10 (Déctupla)',
        icon: '💉',
        cor: '#2196F3',
        categoria: 'core', // Essencial
        
        // Protocolo de doses
        doses: 3,
        intervalo: 21, // dias entre doses
        idadeInicial: 45, // dias de vida (6-8 semanas)
        
        // Reforço
        reforco: {
            primeiro: 365, // 1 ano após última dose
            subsequentes: 365 // Anual
        },
        
        // Descrição
        descricao: 'Vacina polivalente essencial que protege contra as principais doenças virais e bacterianas em cães.',
        
        // Protocolo detalhado
        protocolo: [
            { dose: 1, idade: '45-60 dias', descricao: 'Primeira dose - Início da imunização' },
            { dose: 2, idade: '66-81 dias', descricao: 'Segunda dose - Reforço após 21 dias' },
            { dose: 3, idade: '87-102 dias', descricao: 'Terceira dose - Completar imunização' },
            { dose: 'R1', idade: '1 ano', descricao: 'Primeiro reforço anual' },
            { dose: 'R', idade: 'Anual', descricao: 'Reforço anual subsequente' }
        ],
        
        // Recomendações
        recomendacoes: [
            '✓ Vacina ESSENCIAL (WSAVA Core)',
            '✓ Aplicar 3 doses com intervalo de 21 dias',
            '✓ Primeira dose entre 6-8 semanas de vida',
            '✓ Reforço anual obrigatório',
            '⚠️ Não vacinar animais doentes ou debilitados',
            '⚠️ Evitar banhos 7 dias antes e depois'
        ],
        
        // Calcular próxima dose
        calcularProxima(dataAtual, doseAtual) {
            if (doseAtual < this.doses) {
                return UtilsData.adicionarDias(dataAtual, this.intervalo);
            } else {
                return UtilsData.adicionarDias(dataAtual, this.reforco.primeiro);
            }
        }
    },
    
    /**
     * V8 (Óctupla) - Vacina Polivalente
     * Similar à V10, mas sem 2 sorovares de Leptospirose
     */
    v8: {
        id: 'v8',
        nome: 'V8 (Óctupla)',
        icon: '💉',
        cor: '#2196F3',
        categoria: 'core',
        
        doses: 3,
        intervalo: 21,
        idadeInicial: 45,
        
        reforco: {
            primeiro: 365,
            subsequentes: 365
        },
        
        descricao: 'Vacina polivalente essencial, similar à V10 mas com menor cobertura contra Leptospirose.',
        
        protocolo: [
            { dose: 1, idade: '45-60 dias', descricao: 'Primeira dose' },
            { dose: 2, idade: '66-81 dias', descricao: 'Segunda dose' },
            { dose: 3, idade: '87-102 dias', descricao: 'Terceira dose' },
            { dose: 'R', idade: 'Anual', descricao: 'Reforço anual' }
        ],
        
        recomendacoes: [
            '✓ Vacina ESSENCIAL (WSAVA Core)',
            '✓ Aplicar 3 doses com intervalo de 21 dias',
            '✓ Reforço anual obrigatório',
            '⚠️ Menor cobertura contra Leptospirose que V10'
        ],
        
        calcularProxima(dataAtual, doseAtual) {
            if (doseAtual < this.doses) {
                return UtilsData.adicionarDias(dataAtual, this.intervalo);
            } else {
                return UtilsData.adicionarDias(dataAtual, this.reforco.primeiro);
            }
        }
    },
    
    /**
     * Antirrábica - Vacina contra Raiva
     * OBRIGATÓRIA POR LEI no Brasil
     */
    raiva: {
        id: 'raiva',
        nome: 'Antirrábica',
        icon: '🦠',
        cor: '#f44336',
        categoria: 'core',
        
        doses: 1,
        intervalo: 0,
        idadeInicial: 120, // 4 meses
        
        reforco: {
            primeiro: 365,
            subsequentes: 365
        },
        
        descricao: 'Vacina OBRIGATÓRIA por lei. Protege contra a raiva, doença fatal transmissível ao ser humano.',
        
        protocolo: [
            { dose: 1, idade: '4 meses', descricao: 'Dose única inicial' },
            { dose: 'R', idade: 'Anual', descricao: 'Reforço anual OBRIGATÓRIO' }
        ],
        
        recomendacoes: [
            '✓ Vacina ESSENCIAL e OBRIGATÓRIA POR LEI',
            '✓ Dose única a partir de 4 meses de idade',
            '✓ Reforço anual obrigatório',
            '⚠️ Zoonose fatal - vacinação é responsabilidade legal',
            '⚠️ Campanhas públicas gratuitas disponíveis'
        ],
        
        calcularProxima(dataAtual, doseAtual) {
            return UtilsData.adicionarDias(dataAtual, this.reforco.primeiro);
        }
    },
    
    /**
     * Giárdia - Vacina contra Giardíase
     */
    giardia: {
        id: 'giardia',
        nome: 'Giárdia',
        icon: '🦠',
        cor: '#9C27B0',
        categoria: 'nao-core',
        
        doses: 2,
        intervalo: 21,
        idadeInicial: 56, // 8 semanas
        
        reforco: {
            primeiro: 365,
            subsequentes: 365
        },
        
        descricao: 'Vacina opcional contra giardíase, recomendada para ambientes com múltiplos animais.',
        
        protocolo: [
            { dose: 1, idade: '8 semanas', descricao: 'Primeira dose' },
            { dose: 2, idade: '11 semanas', descricao: 'Segunda dose após 21 dias' },
            { dose: 'R', idade: 'Anual', descricao: 'Reforço anual' }
        ],
        
        recomendacoes: [
            '✓ Vacina OPCIONAL (Não-Core)',
            '✓ Recomendada para canis, creches e abrigos',
            '✓ 2 doses com intervalo de 21 dias',
            '⚠️ Não substitui tratamento de infestação ativa'
        ],
        
        calcularProxima(dataAtual, doseAtual) {
            if (doseAtual < this.doses) {
                return UtilsData.adicionarDias(dataAtual, this.intervalo);
            } else {
                return UtilsData.adicionarDias(dataAtual, this.reforco.primeiro);
            }
        }
    },
    
    /**
     * Leishmaniose - Vacina contra Leishmaniose Visceral
     */
    leishmaniose: {
        id: 'leishmaniose',
        nome: 'Leishmaniose',
        icon: '🦟',
        cor: '#795548',
        categoria: 'nao-core',
        
        doses: 3,
        intervalo: 21,
        idadeInicial: 120, // 4 meses
        
        reforco: {
            primeiro: 365,
            subsequentes: 365
        },
        
        descricao: 'Vacina recomendada em áreas endêmicas. Reduz risco mas não garante 100% de proteção.',
        
        protocolo: [
            { dose: 1, idade: '4 meses', descricao: 'Primeira dose' },
            { dose: 2, idade: '4m + 21d', descricao: 'Segunda dose' },
            { dose: 3, idade: '4m + 42d', descricao: 'Terceira dose' },
            { dose: 'R', idade: 'Anual', descricao: 'Reforço anual' }
        ],
        
        recomendacoes: [
            '✓ Vacina OPCIONAL (Não-Core)',
            '✓ RECOMENDADA em áreas endêmicas',
            '✓ 3 doses com intervalo de 21 dias',
            '⚠️ Fazer teste sorológico ANTES da vacinação',
            '⚠️ Não vacinar animais infectados',
            '⚠️ Usar coleira repelente como complemento'
        ],
        
        calcularProxima(dataAtual, doseAtual) {
            if (doseAtual < this.doses) {
                return UtilsData.adicionarDias(dataAtual, this.intervalo);
            } else {
                return UtilsData.adicionarDias(dataAtual, this.reforco.primeiro);
            }
        }
    },
    
    /**
     * Gripe Canina (Parainfluenza + Bordetella)
     */
    gripe: {
        id: 'gripe',
        nome: 'Gripe Canina',
        icon: '🤧',
        cor: '#FF9800',
        categoria: 'core',
        
        doses: 1,
        intervalo: 0,
        idadeInicial: 56,
        
        reforco: {
            primeiro: 365,
            subsequentes: 365
        },
        
        descricao: 'Vacina contra tosse dos canis e gripe canina. Recomendada para cães socializados.',
        
        protocolo: [
            { dose: 1, idade: '8 semanas', descricao: 'Dose única' },
            { dose: 'R', idade: 'Anual', descricao: 'Reforço anual' }
        ],
        
        recomendacoes: [
            '✓ Vacina ESSENCIAL para cães socializados',
            '✓ Dose única a partir de 8 semanas',
            '✓ Reforço anual',
            '⚠️ Obrigatória para hotéis e creches'
        ],
        
        calcularProxima(dataAtual, doseAtual) {
            return UtilsData.adicionarDias(dataAtual, this.reforco.primeiro);
        }
    },
    
    /**
     * Tosse dos Canis (Bordetella)
     */
    tosse: {
        id: 'tosse',
        nome: 'Tosse dos Canis',
        icon: '😷',
        cor: '#607D8B',
        categoria: 'nao-core',
        
        doses: 1,
        intervalo: 0,
        idadeInicial: 56,
        
        reforco: {
            primeiro: 365,
            subsequentes: 365
        },
        
        descricao: 'Vacina intranasal contra Bordetella bronchiseptica.',
        
        protocolo: [
            { dose: 1, idade: '8 semanas', descricao: 'Dose única intranasal' },
            { dose: 'R', idade: 'Anual', descricao: 'Reforço anual' }
        ],
        
        recomendacoes: [
            '✓ Vacina OPCIONAL (Não-Core)',
            '✓ Recomendada para ambientes com múltiplos cães',
            '✓ Aplicação intranasal',
            '⚠️ Pode ser exigida por hotéis e creches'
        ],
        
        calcularProxima(dataAtual, doseAtual) {
            return UtilsData.adicionarDias(dataAtual, this.reforco.primeiro);
        }
    },
    
    /**
     * Obter protocolo de uma vacina
     */
    obter(idVacina) {
        return this[idVacina] || null;
    },
    
    /**
     * Listar todas as vacinas
     */
    listar() {
        return [
            this.v10,
            this.v8,
            this.raiva,
            this.giardia,
            this.leishmaniose,
            this.gripe,
            this.tosse
        ];
    },
    
    /**
     * Listar vacinas essenciais (Core)
     */
    listarCore() {
        return this.listar().filter(v => v.categoria === 'core');
    },
    
    /**
     * Listar vacinas opcionais (Não-Core)
     */
    listarNaoCore() {
        return this.listar().filter(v => v.categoria === 'nao-core');
    }
};

// Exportar globalmente
window.ProtocolosVacinas = ProtocolosVacinas;

console.log('[ProtocolosVacinas] Protocolos vacinais carregados');
