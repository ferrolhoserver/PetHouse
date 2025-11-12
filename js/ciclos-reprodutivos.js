/**
 * Banco de dados de ciclos reprodutivos por espécie
 * Informações sobre cio, gestação e reprodução
 */

const CiclosReprodutivos = {
    Cachorro: {
        nome: 'Cadela',
        tipoCiclo: 'monoestrico_estacional',
        intervaloCio: 180, // dias (6 meses)
        duracaoCio: 21, // dias
        fases: {
            proestro: { inicio: 1, fim: 9, descricao: 'Sangramento, atrai machos mas não aceita cópula' },
            estro: { inicio: 9, fim: 15, descricao: 'Período fértil - aceita cópula' },
            metaestro: { inicio: 15, fim: 21, descricao: 'Fim do cio, não aceita mais cópula' }
        },
        melhorPeriodo: { inicio: 9, fim: 15 },
        gestacao: 63, // dias
        desmame: 56, // dias (8 semanas)
        idadePrimeiroCio: 6, // meses
        informacoes: [
            '🌸 O cio ocorre aproximadamente a cada 6 meses',
            '📅 Duração total: cerca de 21 dias',
            '💕 Período fértil: 9º ao 15º dia (estro)',
            '🩸 Sangramento mais intenso no início (proestro)',
            '✨ Melhor momento para cruzamento: 11º ao 13º dia',
            '🤰 Gestação: 63 dias (9 semanas)',
            '🍼 Desmame: 8 semanas após nascimento',
            '⚠️ Primeiro cio geralmente entre 6-12 meses'
        ],
        cuidados: [
            '🚫 Evitar contato com machos se não deseja cruzamento',
            '🩲 Usar fraldinhas higiênicas durante sangramento',
            '🏃 Passeios com guia curta e supervisão constante',
            '🧼 Higiene redobrada na região genital',
            '💊 Considerar castração se não for reproduzir'
        ]
    },
    
    Gato: {
        nome: 'Gata',
        tipoCiclo: 'poliestrico_estacional',
        intervaloCio: 21, // dias (durante estação reprodutiva)
        duracaoCio: 7, // dias (média)
        fases: {
            proestro: { inicio: 1, fim: 2, descricao: 'Comportamento inicial, vocalização leve' },
            estro: { inicio: 2, fim: 7, descricao: 'Cio ativo - vocalização intensa, postura lordose' },
        },
        melhorPeriodo: { inicio: 2, fim: 4 },
        gestacao: 65, // dias
        desmame: 56, // dias (8 semanas)
        idadePrimeiroCio: 6, // meses
        estacaoReprodutiva: {
            inicio: 'Agosto', // Primavera no hemisfério sul
            fim: 'Março' // Outono
        },
        informacoes: [
            '🌸 Gatas são poliéstricas sazonais (vários cios na estação)',
            '📅 Estação reprodutiva: Agosto a Março (primavera/verão)',
            '💕 Duração do cio: 4-10 dias (média 7 dias)',
            '🔁 Pode entrar no cio a cada 2-3 semanas durante a estação',
            '✨ Melhor período: 2º ao 4º dia do cio',
            '🐱 Ovulação induzida pela cópula',
            '🤰 Gestação: 65 dias (9 semanas)',
            '🍼 Desmame: 8 semanas após nascimento',
            '⚠️ Primeiro cio geralmente entre 6-9 meses'
        ],
        cuidados: [
            '🔊 Vocalização intensa é normal (miados altos)',
            '🚫 Manter dentro de casa se não deseja cruzamento',
            '🏠 Enriquecimento ambiental para reduzir estresse',
            '🎾 Brinquedos e atividades para distrair',
            '💊 Considerar castração - previne cio e doenças'
        ]
    },
    
    Coelho: {
        nome: 'Coelha',
        tipoCiclo: 'poliestrico_continuo',
        intervaloCio: 0, // Contínuo - ovulação induzida
        duracaoCio: 365, // Receptiva quase sempre
        fases: {
            receptiva: { inicio: 1, fim: 14, descricao: 'Aceita cópula - vulva avermelhada' },
            naoReceptiva: { inicio: 14, fim: 16, descricao: 'Não aceita cópula - vulva pálida' }
        },
        melhorPeriodo: { inicio: 1, fim: 14 },
        gestacao: 31, // dias
        desmame: 42, // dias (6 semanas)
        idadePrimeiroCio: 4, // meses
        informacoes: [
            '🌸 Coelhas não têm cio tradicional - são receptivas quase sempre',
            '💕 Ovulação é induzida pela cópula',
            '📅 Ciclo de receptividade: 14-16 dias',
            '🔴 Vulva avermelhada = receptiva',
            '⚪ Vulva pálida = não receptiva',
            '🤰 Gestação: 31 dias (cerca de 1 mês)',
            '🍼 Desmame: 6 semanas após nascimento',
            '⚠️ Maturidade sexual: 4-6 meses'
        ],
        cuidados: [
            '🏠 Separar machos e fêmeas se não deseja reprodução',
            '🪺 Preparar ninho antes do parto',
            '💊 Castração recomendada - previne câncer uterino',
            '👀 Observar comportamento de nidificação',
            '🩺 Acompanhamento veterinário durante gestação'
        ]
    },
    
    Roedor: {
        nome: 'Fêmea',
        tipoCiclo: 'poliestrico_continuo',
        intervaloCio: 4, // dias (varia por espécie)
        duracaoCio: 1, // dia
        fases: {
            estro: { inicio: 1, fim: 1, descricao: 'Período fértil - aceita cópula' }
        },
        melhorPeriodo: { inicio: 1, fim: 1 },
        gestacao: 21, // dias (média - varia por espécie)
        desmame: 21, // dias (3 semanas)
        idadePrimeiroCio: 2, // meses
        variacoesPorTipo: {
            'Hamster Sírio': { intervaloCio: 4, gestacao: 16, desmame: 21 },
            'Hamster Anão Russo': { intervaloCio: 4, gestacao: 18, desmame: 21 },
            'Porquinho-da-índia': { intervaloCio: 16, gestacao: 68, desmame: 21 },
            'Rato Twister': { intervaloCio: 5, gestacao: 21, desmame: 21 },
            'Gerbil': { intervaloCio: 4, gestacao: 24, desmame: 21 },
            'Chinchila': { intervaloCio: 30, gestacao: 111, desmame: 42 }
        },
        informacoes: [
            '🌸 Roedores têm ciclos muito curtos e frequentes',
            '📅 Hamsters: cio a cada 4 dias',
            '📅 Porquinhos-da-índia: cio a cada 16 dias',
            '💕 Período fértil muito curto (poucas horas)',
            '🤰 Gestação varia: 16 dias (hamster) a 111 dias (chinchila)',
            '🍼 Desmame: 3-6 semanas conforme espécie',
            '⚠️ Maturidade sexual muito precoce (2-3 meses)'
        ],
        cuidados: [
            '🏠 Separar machos e fêmeas SEMPRE',
            '⚡ Reprodução muito rápida - cuidado!',
            '🪺 Não manipular fêmea grávida excessivamente',
            '🤫 Ambiente calmo durante gestação e parto',
            '💊 Castração difícil - prevenção por separação'
        ]
    }
};

/**
 * Funções auxiliares para cálculos de cio
 */
const CalculosCio = {
    /**
     * Calcula próximo cio baseado no último
     */
    calcularProximoCio(ultimoCio, especie) {
        const ciclo = CiclosReprodutivos[especie];
        if (!ciclo || !ultimoCio) return null;
        
        const dataUltimo = new Date(ultimoCio);
        const proximaData = new Date(dataUltimo);
        proximaData.setDate(proximaData.getDate() + ciclo.intervaloCio);
        
        return proximaData;
    },
    
    /**
     * Verifica se está no período fértil
     */
    estaNoPeridoFertil(inicioCio, especie) {
        const ciclo = CiclosReprodutivos[especie];
        if (!ciclo || !inicioCio) return false;
        
        const hoje = new Date();
        const inicio = new Date(inicioCio);
        const diasDesdeCio = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
        
        return diasDesdeCio >= ciclo.melhorPeriodo.inicio && 
               diasDesdeCio <= ciclo.melhorPeriodo.fim;
    },
    
    /**
     * Calcula dias até o próximo cio
     */
    diasAteProximoCio(ultimoCio, especie) {
        const proximoCio = this.calcularProximoCio(ultimoCio, especie);
        if (!proximoCio) return null;
        
        const hoje = new Date();
        const dias = Math.floor((proximoCio - hoje) / (1000 * 60 * 60 * 24));
        
        return dias;
    },
    
    /**
     * Calcula data prevista do parto
     */
    calcularDataParto(dataCruzamento, especie) {
        const ciclo = CiclosReprodutivos[especie];
        if (!ciclo || !dataCruzamento) return null;
        
        const dataCruz = new Date(dataCruzamento);
        const dataParto = new Date(dataCruz);
        dataParto.setDate(dataParto.getDate() + ciclo.gestacao);
        
        return dataParto;
    },
    
    /**
     * Formata data para exibição
     */
    formatarData(data) {
        if (!data) return '';
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR');
    },
    
    /**
     * Gera descrição do status atual
     */
    gerarStatusCio(pet) {
        if (!pet.cios || pet.cios.length === 0) {
            return {
                status: 'sem_registro',
                mensagem: 'Nenhum cio registrado ainda',
                cor: '#999'
            };
        }
        
        const ultimoCio = pet.cios[pet.cios.length - 1];
        const ciclo = CiclosReprodutivos[pet.especie];
        
        if (!ciclo) {
            return {
                status: 'nao_aplicavel',
                mensagem: 'Controle de cio não disponível para esta espécie',
                cor: '#999'
            };
        }
        
        const hoje = new Date();
        const inicioCio = new Date(ultimoCio.inicio);
        const diasDesdeCio = Math.floor((hoje - inicioCio) / (1000 * 60 * 60 * 24));
        
        // Verificar se está em cio ativo
        if (diasDesdeCio >= 0 && diasDesdeCio <= ciclo.duracaoCio) {
            if (this.estaNoPeridoFertil(ultimoCio.inicio, pet.especie)) {
                return {
                    status: 'periodo_fertil',
                    mensagem: `🌟 Período fértil! (Dia ${diasDesdeCio} do cio)`,
                    cor: '#4CAF50',
                    dias: diasDesdeCio
                };
            } else {
                return {
                    status: 'em_cio',
                    mensagem: `🌸 Em cio (Dia ${diasDesdeCio} de ${ciclo.duracaoCio})`,
                    cor: '#FF9800',
                    dias: diasDesdeCio
                };
            }
        }
        
        // Calcular próximo cio
        const diasAteProximo = this.diasAteProximoCio(ultimoCio.inicio, pet.especie);
        
        if (diasAteProximo < 0) {
            return {
                status: 'atrasado',
                mensagem: `⚠️ Cio atrasado (${Math.abs(diasAteProximo)} dias)`,
                cor: '#F44336'
            };
        } else if (diasAteProximo <= 7) {
            const proximaData = this.calcularProximoCio(ultimoCio.inicio, pet.especie);
            return {
                status: 'proximo',
                mensagem: `🔔 Próximo cio: ${this.formatarData(proximaData)} (em ${diasAteProximo} dias)`,
                cor: '#FF9800'
            };
        } else {
            const proximaData = this.calcularProximoCio(ultimoCio.inicio, pet.especie);
            return {
                status: 'normal',
                mensagem: `📅 Próximo cio: ${this.formatarData(proximaData)} (em ${diasAteProximo} dias)`,
                cor: '#2196F3'
            };
        }
    }
};

// Exportar para uso global
window.CiclosReprodutivos = CiclosReprodutivos;
window.CalculosCio = CalculosCio;
