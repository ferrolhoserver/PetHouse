/**
 * Base de Dados de Vacinas e Vermífugos
 * Módulo independente - não modifica código existente
 */

const VacinasDB = {
    /**
     * Vacinas para Cachorro de Pequeno Porte
     */
    Cachorro: {
        filhote: [
            {
                nome: "V8 ou V10 (1ª dose)",
                idade_dias: 45,
                descricao: "Primeira dose da vacina polivalente",
                obrigatoria: true
            },
            {
                nome: "V8 ou V10 (2ª dose)",
                idade_dias: 75,
                descricao: "Segunda dose da vacina polivalente",
                obrigatoria: true
            },
            {
                nome: "V8 ou V10 (3ª dose)",
                idade_dias: 105,
                descricao: "Terceira dose da vacina polivalente",
                obrigatoria: true
            },
            {
                nome: "Antirrábica",
                idade_dias: 120,
                descricao: "Vacina contra raiva (obrigatória por lei)",
                obrigatoria: true
            }
        ],
        adulto: [
            {
                nome: "V8 ou V10 (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Reforço anual da vacina polivalente",
                obrigatoria: true
            },
            {
                nome: "Antirrábica (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Reforço anual da raiva (obrigatória por lei)",
                obrigatoria: true
            },
            {
                nome: "Leptospirose",
                frequencia_dias: 365,
                descricao: "Proteção contra leptospirose (integrada à V10)",
                obrigatoria: true
            },
            {
                nome: "Tosse dos Canis",
                frequencia_dias: 365,
                descricao: "Recomendada se exposto a outros cães",
                obrigatoria: false
            },
            {
                nome: "Leishmaniose",
                frequencia_dias: 365,
                descricao: "Recomendada em regiões endêmicas",
                obrigatoria: false
            }
        ],
        idoso: [
            {
                nome: "V8 ou V10 (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Após avaliação clínica e exames básicos",
                obrigatoria: true,
                observacao: "Evitar múltiplas vacinas simultâneas se debilitado"
            },
            {
                nome: "Antirrábica (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Obrigatória por lei",
                obrigatoria: true
            }
        ]
    },

    /**
     * Vacinas para Gato
     */
    Gato: {
        filhote: [
            {
                nome: "V3, V4 ou V5 (1ª dose)",
                idade_dias: 60,
                descricao: "Primeira dose da vacina polivalente felina",
                obrigatoria: true
            },
            {
                nome: "V3, V4 ou V5 (2ª dose)",
                idade_dias: 90,
                descricao: "Segunda dose da vacina polivalente felina",
                obrigatoria: true
            },
            {
                nome: "V3, V4 ou V5 (3ª dose)",
                idade_dias: 120,
                descricao: "Terceira dose da vacina polivalente felina",
                obrigatoria: true
            },
            {
                nome: "Antirrábica",
                idade_dias: 120,
                descricao: "Vacina contra raiva (obrigatória por lei)",
                obrigatoria: true
            }
        ],
        adulto: [
            {
                nome: "V3, V4 ou V5 (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Reforço anual da vacina polivalente felina",
                obrigatoria: true
            },
            {
                nome: "Antirrábica (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Reforço anual da raiva (obrigatória por lei)",
                obrigatoria: true
            },
            {
                nome: "FeLV (Leucemia Felina)",
                frequencia_dias: 365,
                descricao: "Recomendada para gatos com acesso à rua",
                obrigatoria: false
            }
        ],
        idoso: [
            {
                nome: "V3, V4 ou V5 (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Após avaliação clínica",
                obrigatoria: true
            },
            {
                nome: "Antirrábica (Reforço Anual)",
                frequencia_dias: 365,
                descricao: "Obrigatória por lei",
                obrigatoria: true
            }
        ]
    }
};

const VermifugoDB = {
    /**
     * Protocolo de vermifugação por idade
     */
    filhote: {
        idade_max_dias: 90,
        frequencia_dias: 15,
        descricao: "A cada 15 dias até 3 meses de idade",
        peso_min: 0,
        peso_max: 5,
        dosagem: "Conforme peso e produto veterinário"
    },
    jovem: {
        idade_min_dias: 90,
        idade_max_dias: 180,
        frequencia_dias: 30,
        descricao: "Mensalmente dos 3 aos 6 meses de idade",
        peso_min: 0,
        peso_max: 10,
        dosagem: "Conforme peso e produto veterinário"
    },
    adulto: {
        idade_min_dias: 180,
        idade_max_dias: 2555, // ~7 anos
        frequencia_dias: 90,
        descricao: "A cada 3 meses (trimestral)",
        peso_min: 0,
        peso_max: 999,
        dosagem: "Conforme peso e produto veterinário",
        observacao: "Associar controle de pulgas/carrapatos"
    },
    idoso: {
        idade_min_dias: 2555, // 7+ anos
        frequencia_dias: 120,
        descricao: "A cada 4 a 6 meses, conforme risco e saúde geral",
        peso_min: 0,
        peso_max: 999,
        dosagem: "Conforme peso e produto veterinário",
        observacao: "Avaliar estado de saúde antes de vermifugar"
    }
};

/**
 * Dosagem de vermífugo por peso (Cães de Pequeno Porte)
 */
const VermifugoDosagem = {
    ate_5kg: {
        peso_max: 5,
        dosagem: "½ comprimido ou dose líquida equivalente",
        observacao: "Verificar produto específico"
    },
    de_5_a_10kg: {
        peso_min: 5,
        peso_max: 10,
        dosagem: "1 comprimido ou dose líquida equivalente",
        observacao: "Não fracionar dose"
    }
};

// Exportar para uso global
window.VacinasDB = VacinasDB;
window.VermifugoDB = VermifugoDB;
window.VermifugoDosagem = VermifugoDosagem;

