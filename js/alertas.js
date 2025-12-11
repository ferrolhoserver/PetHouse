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
     * Renderiza alertas em HTML - CARDS COMPACTOS CLICÁVEIS
     */
    renderizarAlertas(alertas, pet = null) {
        if (!alertas || (alertas.vacinas.length === 0 && alertas.vermifugo.length === 0)) {
            return '<p style="color: #4CAF50; text-align: center; padding: 1rem;">✅ Todas as vacinas e vermífugos em dia!</p>';
        }

        // Contar alertas por categoria
        const vacinasCount = alertas.vacinas.length;
        const vermifugoCount = alertas.vermifugo.length;
        const ciosCount = 0; // TODO: implementar alertas de cio
        const banhoCount = 0; // TODO: implementar alertas de banho

        // Cards compactos e clicáveis
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin: 1rem 0;">';

        // Card de Vacinas
        if (vacinasCount > 0) {
            const temAtrasadas = alertas.vacinas.some(a => a.status === 'atrasada');
            const cor = temAtrasadas ? '#f44336' : '#ff9800';
            html += `
                <div onclick="app.changeTab('cuidados')" style="
                    background: linear-gradient(135deg, ${cor}15 0%, ${cor}25 100%);
                    border-left: 4px solid ${cor};
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                    <div style="font-size: 2rem; text-align: center;">${temAtrasadas ? '⚠️' : '💉'}</div>
                    <div style="font-weight: bold; text-align: center; color: ${cor}; margin-top: 0.5rem;">${vacinasCount}</div>
                    <div style="font-size: 0.85rem; text-align: center; color: #666; margin-top: 0.25rem;">Vacinas ${temAtrasadas ? 'atrasadas' : 'pendentes'}</div>
                </div>
            `;
        }

        // Card de Vermífugo
        if (vermifugoCount > 0) {
            const temAtrasadas = alertas.vermifugo.some(a => a.status === 'atrasada');
            const cor = temAtrasadas ? '#f44336' : '#ff9800';
            html += `
                <div onclick="app.changeTab('cuidados')" style="
                    background: linear-gradient(135deg, ${cor}15 0%, ${cor}25 100%);
                    border-left: 4px solid ${cor};
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                    <div style="font-size: 2rem; text-align: center;">💊</div>
                    <div style="font-weight: bold; text-align: center; color: ${cor}; margin-top: 0.5rem;">${vermifugoCount}</div>
                    <div style="font-size: 0.85rem; text-align: center; color: #666; margin-top: 0.25rem;">Vermífugo ${temAtrasadas ? 'atrasado' : 'pendente'}</div>
                </div>
            `;
        }

        // Card de Banho (placeholder)
        if (banhoCount > 0) {
            html += `
                <div onclick="app.changeTab('banho-tosa')" style="
                    background: linear-gradient(135deg, #2196F315 0%, #2196F325 100%);
                    border-left: 4px solid #2196F3;
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                    <div style="font-size: 2rem; text-align: center;">🛁</div>
                    <div style="font-weight: bold; text-align: center; color: #2196F3; margin-top: 0.5rem;">${banhoCount}</div>
                    <div style="font-size: 0.85rem; text-align: center; color: #666; margin-top: 0.25rem;">Banho pendente</div>
                </div>
            `;
        }

        html += '</div>';

        // Detalhes expandidos (opcional - pode ser removido se quiser apenas cards)
        html += '<details style="margin-top: 1rem; padding: 0.5rem; background: #f9f9f9; border-radius: 4px;"><summary style="cursor: pointer; font-weight: bold; color: #666;">Ver detalhes dos alertas</summary>';
        
        // Alertas de vacinas detalhados
        if (alertas.vacinas.length > 0) {
            html += '<div style="margin-top: 1rem;"><h4 style="color: #666; font-size: 0.9rem;">💉 Vacinas</h4>';
            alertas.vacinas.forEach(alerta => {
                const cor = alerta.status === 'atrasada' ? '#f44336' : 
                           alerta.status === 'proxima' ? '#ff9800' : '#2196F3';
                const icone = alerta.status === 'atrasada' ? '⚠️' : 
                             alerta.status === 'proxima' ? '📅' : 'ℹ️';

                html += `
                    <div style="border-left: 3px solid ${cor}; margin: 0.5rem 0; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.85rem;">
                        <div style="font-weight: bold; color: ${cor};">${icone} ${alerta.nome}</div>
                        <div style="color: #666; margin-top: 0.25rem;">${alerta.mensagem}</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Alertas de vermífugo detalhados
        if (alertas.vermifugo.length > 0) {
            html += '<div style="margin-top: 1rem;"><h4 style="color: #666; font-size: 0.9rem;">💊 Vermífugo</h4>';
            alertas.vermifugo.forEach(alerta => {
                const cor = alerta.status === 'atrasada' ? '#f44336' : 
                           alerta.status === 'proxima' ? '#ff9800' : '#2196F3';
                const icone = alerta.status === 'atrasada' ? '⚠️' : 
                             alerta.status === 'proxima' ? '📅' : 'ℹ️';

                html += `
                    <div style="border-left: 3px solid ${cor}; margin: 0.5rem 0; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.85rem;">
                        <div style="font-weight: bold; color: ${cor};">${icone} ${alerta.nome}</div>
                        <div style="color: #666; margin-top: 0.25rem;">${alerta.mensagem}</div>
                        ${alerta.dosagem ? `<div style="color: #2196F3; margin-top: 0.25rem;">💊 ${alerta.dosagem}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</details>';

        return html;
    }
};

// Exportar para uso global
window.Alertas = Alertas;

