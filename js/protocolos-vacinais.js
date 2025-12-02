/**
 * PROTOCOLOS VACINAIS VETERINÁRIOS
 * Baseado em:
 * - Diretrizes WSAVA 2024 (World Small Animal Veterinary Association)
 * - AAHA Canine Vaccination Guidelines 2022
 * - Protocolos Zoetis e fabricantes
 */

const ProtocolosVacinais = {
    
    // Base de dados de protocolos por vacina
    protocolos: {
        
        // ========================================
        // VACINAS ESSENCIAIS (CORE)
        // ========================================
        
        'v10': {
            nome: 'V10 (Déctupla)',
            aliases: ['vanguard', 'vanguard plus', 'v8', 'v10', 'dectupla', 'octupla'],
            tipo: 'vacina',
            essencial: true,
            protocolo: {
                primeiraVacinacao: {
                    idadeInicio: '6-8 semanas',
                    doses: 3,
                    intervalo: 21, // dias entre doses
                    descricao: '3 doses com 21-30 dias de intervalo'
                },
                reforco: {
                    aposUltimaDose: 365, // 1 ano
                    frequencia: 'anual',
                    descricao: 'Reforço anual'
                }
            }
        },
        
        'v8': {
            nome: 'V8 (Óctupla)',
            aliases: ['v8', 'octupla'],
            tipo: 'vacina',
            essencial: true,
            protocolo: {
                primeiraVacinacao: {
                    idadeInicio: '6-8 semanas',
                    doses: 3,
                    intervalo: 21,
                    descricao: '3 doses com 21-30 dias de intervalo'
                },
                reforco: {
                    aposUltimaDose: 365,
                    frequencia: 'anual',
                    descricao: 'Reforço anual'
                }
            }
        },
        
        'antirrabica': {
            nome: 'Antirrábica',
            aliases: ['raiva', 'antirrabica', 'anti-rábica', 'antirrábica'],
            tipo: 'vacina',
            essencial: true,
            protocolo: {
                primeiraVacinacao: {
                    idadeInicio: '12-16 semanas',
                    doses: 1,
                    intervalo: 0,
                    descricao: 'Dose única aos 3-4 meses'
                },
                reforco: {
                    aposUltimaDose: 365,
                    frequencia: 'anual',
                    descricao: 'Reforço anual obrigatório'
                }
            }
        },
        
        // ========================================
        // VACINAS NÃO-ESSENCIAIS (NON-CORE)
        // ========================================
        
        'giardia': {
            nome: 'Giárdia',
            aliases: ['giardia', 'giardiavax', 'giárdia'],
            tipo: 'vacina',
            essencial: false,
            protocolo: {
                primeiraVacinacao: {
                    idadeInicio: '8 semanas',
                    doses: 2,
                    intervalo: 21,
                    descricao: '2 doses com 21-30 dias de intervalo'
                },
                reforco: {
                    aposUltimaDose: 180, // 6 meses
                    frequencia: 'semestral',
                    descricao: 'Reforço a cada 6 meses'
                }
            }
        },
        
        'bronchiguard': {
            nome: 'BronchiGuard (Tosse dos Canis)',
            aliases: ['bronchiguard', 'bronchi', 'tosse', 'traqueobronquite'],
            tipo: 'vacina',
            essencial: false,
            protocolo: {
                primeiraVacinacao: {
                    idadeInicio: '8 semanas',
                    doses: 2,
                    intervalo: 21,
                    descricao: '2 doses com 21-30 dias de intervalo'
                },
                reforco: {
                    aposUltimaDose: 365,
                    frequencia: 'anual',
                    descricao: 'Reforço anual'
                }
            }
        },
        
        'leishmaniose': {
            nome: 'Leishmaniose',
            aliases: ['leish', 'leishmaniose', 'leishmania'],
            tipo: 'vacina',
            essencial: false,
            protocolo: {
                primeiraVacinacao: {
                    idadeInicio: '4 meses',
                    doses: 3,
                    intervalo: 21,
                    descricao: '3 doses com 21 dias de intervalo'
                },
                reforco: {
                    aposUltimaDose: 365,
                    frequencia: 'anual',
                    descricao: 'Reforço anual'
                }
            }
        },
        
        'gripe': {
            nome: 'Gripe Canina (KC)',
            aliases: ['gripe', 'kc', 'gripe canina'],
            tipo: 'vacina',
            essencial: false,
            protocolo: {
                primeiraVacinacao: {
                    idadeInicio: '8 semanas',
                    doses: 2,
                    intervalo: 21,
                    descricao: '2 doses com 21-30 dias de intervalo'
                },
                reforco: {
                    aposUltimaDose: 365,
                    frequencia: 'anual',
                    descricao: 'Reforço anual'
                }
            }
        },
        
        // ========================================
        // VERMÍFUGOS
        // ========================================
        
        'vermifugo': {
            nome: 'Vermífugo',
            aliases: ['vermifugo', 'vermífugo', 'drontal', 'endogard', 'milbemax', 'vetmax'],
            tipo: 'vermifugo',
            protocolo: {
                filhote: {
                    intervalo: 15, // a cada 15 dias até 3 meses
                    descricao: 'A cada 15 dias até 3 meses de idade'
                },
                adulto: {
                    intervalo: 90, // a cada 3 meses
                    descricao: 'A cada 3 meses (trimestral)'
                }
            }
        }
    },
    
    /**
     * Identifica o protocolo de uma vacina/vermífugo pelo nome
     */
    identificarProtocolo(nome) {
        const nomeLower = nome.toLowerCase().trim();
        
        // Busca exata ou por aliases
        for (const [key, protocolo] of Object.entries(this.protocolos)) {
            if (protocolo.aliases.some(alias => nomeLower.includes(alias))) {
                return { key, ...protocolo };
            }
        }
        
        // Protocolo genérico se não encontrar
        return {
            key: 'generico',
            nome: nome,
            tipo: 'vacina',
            essencial: false,
            protocolo: {
                primeiraVacinacao: {
                    doses: 2,
                    intervalo: 21,
                    descricao: '2 doses com 21-30 dias'
                },
                reforco: {
                    aposUltimaDose: 365,
                    frequencia: 'anual',
                    descricao: 'Reforço anual'
                }
            }
        };
    },
    
    /**
     * Calcula a próxima dose baseado no protocolo
     * @param {string} nomeVacina - Nome da vacina
     * @param {Date} dataAplicacao - Data da aplicação atual
     * @param {number} numeroDose - Número da dose (1, 2, 3...)
     * @param {Array} historicoVacinas - Histórico de todas as doses dessa vacina
     * @returns {Date|null} - Data da próxima dose ou null se não houver
     */
    calcularProximaDose(nomeVacina, dataAplicacao, numeroDose, historicoVacinas = []) {
        const protocolo = this.identificarProtocolo(nomeVacina);
        const data = new Date(dataAplicacao);
        
        // Vermífugo tem lógica diferente
        if (protocolo.tipo === 'vermifugo') {
            // Assumir adulto (3 meses)
            data.setDate(data.getDate() + protocolo.protocolo.adulto.intervalo);
            return data;
        }
        
        // Vacinas
        const { primeiraVacinacao, reforco } = protocolo.protocolo;
        
        // Se ainda está na série inicial (doses 1, 2, 3...)
        if (numeroDose < primeiraVacinacao.doses) {
            data.setDate(data.getDate() + primeiraVacinacao.intervalo);
            return data;
        }
        
        // Se completou a série inicial, próximo é o reforço
        data.setDate(data.getDate() + reforco.aposUltimaDose);
        return data;
    },
    
    /**
     * Agrupa vacinas pelo nome e retorna a última aplicação de cada
     */
    agruparVacinasPorNome(vacinas) {
        const grupos = {};
        
        vacinas.forEach(v => {
            const protocolo = this.identificarProtocolo(v.nome);
            const chave = protocolo.key;
            
            if (!grupos[chave]) {
                grupos[chave] = [];
            }
            grupos[chave].push(v);
        });
        
        // Para cada grupo, ordenar por data e pegar a última
        const resultado = [];
        for (const [chave, lista] of Object.entries(grupos)) {
            lista.sort((a, b) => new Date(b.data) - new Date(a.data));
            const ultima = lista[0];
            
            // Calcular próxima dose
            const protocolo = this.identificarProtocolo(ultima.nome);
            const numeroDose = lista.length;
            const proxima = this.calcularProximaDose(
                ultima.nome,
                ultima.data,
                numeroDose,
                lista
            );
            
            resultado.push({
                ...ultima,
                numeroDose,
                totalDoses: lista.length,
                proximaDose: proxima,
                protocolo: protocolo.protocolo
            });
        }
        
        return resultado;
    },
    
    /**
     * Verifica se uma vacina está atrasada
     */
    estaAtrasada(vacina, hoje = new Date()) {
        if (!vacina.proximaDose) return false;
        
        const proxima = new Date(vacina.proximaDose);
        return proxima < hoje;
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ProtocolosVacinais = ProtocolosVacinais;
}
