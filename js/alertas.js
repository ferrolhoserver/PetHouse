/**
 * Módulo de Alertas de Vacinas e Vermífugo
 * Funções independentes que não modificam o código existente
 */

const Alertas = {
    /**
     * Calcula a idade do pet em dias
     */
    calcularIdadeDias(nascimento) {
        const hoje = new Date();
        const nasc = new Date(nascimento);
        const diff = hoje - nasc;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },

    /**
     * Determina a fase de vida do pet
     */
    determinarFase(idadeDias, especie) {
        if (especie === 'Cachorro') {
            if (idadeDias <= 120) return 'filhote';
            if (idadeDias <= 2555) return 'adulto'; // ~7 anos
            return 'idoso';
        } else if (especie === 'Gato') {
            if (idadeDias <= 120) return 'filhote';
            if (idadeDias <= 2555) return 'adulto';
            return 'idoso';
        }
        return 'adulto';
    },

    /**
     * Calcula alertas de vacinas para um pet
     */
    calcularAlertasVacinas(pet) {
        if (!pet || !VacinasDB[pet.especie]) {
            return [];
        }

        const idadeDias = this.calcularIdadeDias(pet.nascimento);
        const fase = this.determinarFase(idadeDias, pet.especie);
        const vacinasEsperadas = VacinasDB[pet.especie][fase] || [];
        const vacinasAplicadas = pet.vacinas || [];
        const alertas = [];

        // Para filhotes: verificar vacinas por idade
        if (fase === 'filhote') {
            vacinasEsperadas.forEach(vacina => {
                if (idadeDias >= vacina.idade_dias) {
                    // Verificar se já foi aplicada
                    const jaAplicada = vacinasAplicadas.some(v => 
                        v.nome.toLowerCase().includes(vacina.nome.toLowerCase().split('(')[0].trim().toLowerCase())
                    );

                    if (!jaAplicada) {
                        const diasAtraso = idadeDias - vacina.idade_dias;
                        alertas.push({
                            tipo: 'vacina',
                            nome: vacina.nome,
                            descricao: vacina.descricao,
                            status: 'atrasada',
                            prioridade: vacina.obrigatoria ? 'alta' : 'media',
                            diasAtraso: diasAtraso,
                            mensagem: `Atrasada há ${diasAtraso} dias! Aplicar urgentemente.`
                        });
                    }
                } else {
                    // Vacina futura
                    const diasRestantes = vacina.idade_dias - idadeDias;
                    if (diasRestantes <= 7) {
                        alertas.push({
                            tipo: 'vacina',
                            nome: vacina.nome,
                            descricao: vacina.descricao,
                            status: 'proxima',
                            prioridade: 'media',
                            diasRestantes: diasRestantes,
                            mensagem: `Aplicar em ${diasRestantes} dias (aos ${vacina.idade_dias} dias de vida)`
                        });
                    }
                }
            });
        }

        // Para adultos e idosos: verificar reforços anuais
        if (fase === 'adulto' || fase === 'idoso') {
            vacinasEsperadas.forEach(vacina => {
                // Extrair nome base da vacina esperada (sem "Reforço Anual")
                const nomeBase = vacina.nome.toLowerCase().split('(')[0].trim();
                
                // Buscar vacina aplicada que corresponda ao nome base
                const ultimaAplicacao = vacinasAplicadas
                    .filter(v => {
                        const nomeAplicado = v.nome.toLowerCase();
                        // Verificar se o nome aplicado contém o nome base
                        // Ex: "V10 (Déctupla)" contém "v10" ou "v8 ou v10" contém "v10"
                        return nomeAplicado.includes(nomeBase) || 
                               nomeBase.includes(nomeAplicado.split('(')[0].trim()) ||
                               (nomeBase.includes('v8 ou v10') && (nomeAplicado.includes('v8') || nomeAplicado.includes('v10'))) ||
                               (nomeBase.includes('antirrábica') && nomeAplicado.includes('antirrábica'));
                    })
                    .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

                if (!ultimaAplicacao) {
                    // Verificar se está coberta por vacina múltipla (V10, V8, etc)
                    const cobertura = window.VacinasCompostas?.vacinaEstaCoberta(vacina.nome, vacinasAplicadas);
                    
                    if (cobertura) {
                        // Coberta por vacina múltipla - NÃO adicionar alerta
                        console.log(`✅ ${vacina.nome} coberta por ${cobertura.vacinaCobre}`);
                    } else {
                        // Nunca foi aplicada e não está coberta
                        alertas.push({
                            tipo: 'vacina',
                            nome: vacina.nome,
                            descricao: vacina.descricao,
                            status: 'pendente',
                            prioridade: vacina.obrigatoria ? 'alta' : 'media',
                            mensagem: 'Vacina nunca aplicada. Agendar com veterinário.'
                        });
                    }
                } else {
                    // Verificar se está na hora do reforço
                    const dataUltima = new Date(ultimaAplicacao.data);
                    const hoje = new Date();
                    const diasDesdeUltima = Math.floor((hoje - dataUltima) / (1000 * 60 * 60 * 24));

                    if (diasDesdeUltima >= vacina.frequencia_dias) {
                        const diasAtraso = diasDesdeUltima - vacina.frequencia_dias;
                        alertas.push({
                            tipo: 'vacina',
                            nome: vacina.nome,
                            descricao: vacina.descricao,
                            status: 'atrasada',
                            prioridade: vacina.obrigatoria ? 'alta' : 'media',
                            diasAtraso: diasAtraso,
                            ultimaAplicacao: ultimaAplicacao.data,
                            mensagem: `Reforço atrasado há ${diasAtraso} dias! Última aplicação: ${new Date(ultimaAplicacao.data).toLocaleDateString('pt-BR')}`
                        });
                    } else if (diasDesdeUltima >= vacina.frequencia_dias - 30) {
                        const diasRestantes = vacina.frequencia_dias - diasDesdeUltima;
                        alertas.push({
                            tipo: 'vacina',
                            nome: vacina.nome,
                            descricao: vacina.descricao,
                            status: 'proxima',
                            prioridade: 'media',
                            diasRestantes: diasRestantes,
                            ultimaAplicacao: ultimaAplicacao.data,
                            mensagem: `Reforço em ${diasRestantes} dias. Última aplicação: ${new Date(ultimaAplicacao.data).toLocaleDateString('pt-BR')}`
                        });
                    }
                }
            });
        }

        return alertas;
    },

    /**
     * Calcula alertas de vermífugo para um pet
     */
    calcularAlertasVermifugo(pet) {
        if (!pet) {
            return [];
        }

        const idadeDias = this.calcularIdadeDias(pet.nascimento);
        const alertas = [];

        // Determinar protocolo de vermifugação
        let protocolo;
        if (idadeDias <= 90) {
            protocolo = VermifugoDB.filhote;
        } else if (idadeDias <= 180) {
            protocolo = VermifugoDB.jovem;
        } else if (idadeDias <= 2555) {
            protocolo = VermifugoDB.adulto;
        } else {
            protocolo = VermifugoDB.idoso;
        }

        const vermifugosAplicados = pet.vermifugo || [];

        if (vermifugosAplicados.length === 0) {
            // Nunca foi vermifugado
            alertas.push({
                tipo: 'vermifugo',
                nome: 'Vermifugação',
                descricao: protocolo.descricao,
                status: 'pendente',
                prioridade: 'alta',
                mensagem: `Vermifugação nunca realizada! ${protocolo.descricao}`,
                protocolo: protocolo
            });
        } else {
            // Verificar última vermifugação
            const ultimaVermifugacao = vermifugosAplicados
                .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

            const dataUltima = new Date(ultimaVermifugacao.data);
            const hoje = new Date();
            const diasDesdeUltima = Math.floor((hoje - dataUltima) / (1000 * 60 * 60 * 24));

            if (diasDesdeUltima >= protocolo.frequencia_dias) {
                const diasAtraso = diasDesdeUltima - protocolo.frequencia_dias;
                alertas.push({
                    tipo: 'vermifugo',
                    nome: 'Vermifugação',
                    descricao: protocolo.descricao,
                    status: 'atrasada',
                    prioridade: 'alta',
                    diasAtraso: diasAtraso,
                    ultimaAplicacao: ultimaVermifugacao.data,
                    mensagem: `Vermifugação atrasada há ${diasAtraso} dias! Última: ${new Date(ultimaVermifugacao.data).toLocaleDateString('pt-BR')}`,
                    protocolo: protocolo
                });
            } else if (diasDesdeUltima >= protocolo.frequencia_dias - 7) {
                const diasRestantes = protocolo.frequencia_dias - diasDesdeUltima;
                alertas.push({
                    tipo: 'vermifugo',
                    nome: 'Vermifugação',
                    descricao: protocolo.descricao,
                    status: 'proxima',
                    prioridade: 'media',
                    diasRestantes: diasRestantes,
                    ultimaAplicacao: ultimaVermifugacao.data,
                    mensagem: `Próxima vermifugação em ${diasRestantes} dias. Última: ${new Date(ultimaVermifugacao.data).toLocaleDateString('pt-BR')}`,
                    protocolo: protocolo
                });
            }
        }

        // Adicionar recomendação de dosagem por peso
        const pesoAtual = (pet.peso && pet.peso.length > 0) 
            ? pet.peso.sort((a, b) => new Date(b.data) - new Date(a.data))[0].peso 
            : null;

        if (pesoAtual && alertas.length > 0) {
            const dosagem = pesoAtual <= 5 
                ? VermifugoDosagem.ate_5kg 
                : VermifugoDosagem.de_5_a_10kg;

            alertas.forEach(alerta => {
                alerta.dosagem = dosagem.dosagem;
                alerta.pesoAtual = pesoAtual;
            });
        }

        return alertas;
    },

    /**
     * Calcula todos os alertas de um pet
     */
    calcularTodosAlertas(pet) {
        const alertasVacinas = this.calcularAlertasVacinas(pet);
        const alertasVermifugo = this.calcularAlertasVermifugo(pet);

        return {
            vacinas: alertasVacinas,
            vermifugo: alertasVermifugo,
            total: alertasVacinas.length + alertasVermifugo.length,
            criticos: alertasVacinas.filter(a => a.status === 'atrasada' && a.prioridade === 'alta').length +
                      alertasVermifugo.filter(a => a.status === 'atrasada').length
        };
    },

    /**
     * Renderiza alertas em HTML
     */
    renderizarAlertas(alertas) {
        if (!alertas || (alertas.vacinas.length === 0 && alertas.vermifugo.length === 0)) {
            return '<p style="color: #4CAF50; text-align: center;">✅ Todas as vacinas e vermífugos em dia!</p>';
        }

        let html = '';

        // Alertas de vacinas
        if (alertas.vacinas.length > 0) {
            html += '<div class="alertas-section"><h4>💉 Vacinas</h4>';
            alertas.vacinas.forEach(alerta => {
                const cor = alerta.status === 'atrasada' ? '#f44336' : 
                           alerta.status === 'proxima' ? '#ff9800' : '#2196F3';
                const icone = alerta.status === 'atrasada' ? '⚠️' : 
                             alerta.status === 'proxima' ? '📅' : 'ℹ️';

                // Verificar se está coberta por vacina múltipla
                const cobertura = window.VacinasCompostas?.vacinaEstaCoberta(alerta.nome, pet.vacinas || []);
                const descricaoFinal = cobertura ? 
                    window.VacinasCompostas.gerarDescricaoCobertura(alerta.nome, cobertura) : 
                    alerta.descricao;
                
                html += `
                    <div class="alerta-card" style="border-left: 4px solid ${cor}; margin: 0.5rem 0; padding: 0.75rem; background: #f9f9f9; border-radius: 4px;">
                        <div style="font-weight: bold; color: ${cor};">${icone} ${alerta.nome}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 0.25rem;">${alerta.mensagem}</div>
                        ${descricaoFinal ? `<div style="font-size: 0.85rem; color: ${cobertura ? '#4CAF50' : '#999'}; margin-top: 0.25rem;">${cobertura ? '✅' : ''} ${descricaoFinal}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        // Alertas de vermífugo
        if (alertas.vermifugo.length > 0) {
            html += '<div class="alertas-section" style="margin-top: 1rem;"><h4>💊 Vermífugo</h4>';
            alertas.vermifugo.forEach(alerta => {
                const cor = alerta.status === 'atrasada' ? '#f44336' : 
                           alerta.status === 'proxima' ? '#ff9800' : '#2196F3';
                const icone = alerta.status === 'atrasada' ? '⚠️' : 
                             alerta.status === 'proxima' ? '📅' : 'ℹ️';

                html += `
                    <div class="alerta-card" style="border-left: 4px solid ${cor}; margin: 0.5rem 0; padding: 0.75rem; background: #f9f9f9; border-radius: 4px;">
                        <div style="font-weight: bold; color: ${cor};">${icone} ${alerta.nome}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 0.25rem;">${alerta.mensagem}</div>
                        ${alerta.dosagem ? `<div style="font-size: 0.85rem; color: #2196F3; margin-top: 0.25rem;">💊 Dosagem: ${alerta.dosagem} (Peso: ${alerta.pesoAtual} kg)</div>` : ''}
                        ${alerta.protocolo.observacao ? `<div style="font-size: 0.85rem; color: #999; margin-top: 0.25rem;">ℹ️ ${alerta.protocolo.observacao}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        return html;
    }
};

// Exportar para uso global
window.Alertas = Alertas;

