/**
 * Módulo de Integração com Calendário
 * Gera arquivos .ics para adicionar eventos ao calendário do iPhone/iOS
 */

const Calendario = {
    /**
     * Gera arquivo .ics para um evento
     */
    gerarICS(evento) {
        const {
            titulo,
            descricao,
            data,
            duracao = 60, // minutos
            localizacao = '',
            alarmes = [15, 1440, 10080] // 15 min, 1 dia, 1 semana antes
        } = evento;

        const dataInicio = new Date(data);
        const dataFim = new Date(dataInicio.getTime() + duracao * 60000);

        // Formatar datas no formato iCalendar (YYYYMMDDTHHmmssZ)
        const formatarData = (d) => {
            return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        // Gerar UID único
        const uid = `pethouse-${Date.now()}@pethouse.app`;

        // Gerar alarmes
        const alarmesICS = alarmes.map(minutos => {
            return `BEGIN:VALARM
TRIGGER:-PT${minutos}M
ACTION:DISPLAY
DESCRIPTION:${titulo}
END:VALARM`;
        }).join('\n');

        // Montar arquivo ICS
        const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PetHouse//Gestão de Pets//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PetHouse
X-WR-TIMEZONE:America/Sao_Paulo
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatarData(new Date())}
DTSTART:${formatarData(dataInicio)}
DTEND:${formatarData(dataFim)}
SUMMARY:${titulo}
DESCRIPTION:${descricao}
LOCATION:${localizacao}
STATUS:CONFIRMED
SEQUENCE:0
${alarmesICS}
END:VEVENT
END:VCALENDAR`;

        return ics;
    },

    /**
     * Baixa arquivo .ics
     */
    baixarICS(ics, nomeArquivo) {
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Adiciona vacina ao calendário
     */
    adicionarVacinaAoCalendario(pet, vacina) {
        if (!vacina.proxima) {
            app.showToast('❌ Esta vacina não tem data de próxima aplicação', 'error');
            return;
        }

        const evento = {
            titulo: `💉 ${vacina.nome} - ${pet.nome}`,
            descricao: `Aplicar ${vacina.nome} em ${pet.nome}\n\n${vacina.obs || ''}`,
            data: vacina.proxima,
            duracao: 30,
            localizacao: vacina.veterinario || 'Veterinário',
            alarmes: [15, 1440, 10080] // 15 min, 1 dia, 1 semana
        };

        const ics = this.gerarICS(evento);
        this.baixarICS(ics, `vacina-${pet.nome}-${vacina.nome}.ics`);
        
        app.showToast('✅ Evento adicionado! Abra o arquivo para importar no Calendário', 'success');
    },

    /**
     * Adiciona vermífugo ao calendário
     */
    adicionarVermifu goAoCalendario(pet, vermifugo) {
        if (!vermifugo.proxima) {
            app.showToast('❌ Este vermífugo não tem data de próxima aplicação', 'error');
            return;
        }

        const evento = {
            titulo: `💊 ${vermifugo.nome} - ${pet.nome}`,
            descricao: `Aplicar ${vermifugo.nome} em ${pet.nome}\nDose: ${vermifugo.dose || 'Conforme peso'}\n\n${vermifugo.obs || ''}`,
            data: vermifugo.proxima,
            duracao: 15,
            localizacao: '',
            alarmes: [15, 1440, 10080]
        };

        const ics = this.gerarICS(evento);
        this.baixarICS(ics, `vermifugo-${pet.nome}-${vermifugo.nome}.ics`);
        
        app.showToast('✅ Evento adicionado! Abra o arquivo para importar no Calendário', 'success');
    },

    /**
     * Exporta todos os eventos futuros de um pet
     */
    exportarTodosEventos(pet) {
        const eventos = [];
        const hoje = new Date();

        // Vacinas futuras
        if (pet.vacinas) {
            pet.vacinas.forEach(vacina => {
                if (vacina.proxima && new Date(vacina.proxima) > hoje) {
                    eventos.push({
                        titulo: `💉 ${vacina.nome} - ${pet.nome}`,
                        descricao: `Aplicar ${vacina.nome} em ${pet.nome}\n\n${vacina.obs || ''}`,
                        data: vacina.proxima,
                        duracao: 30,
                        localizacao: vacina.veterinario || 'Veterinário',
                        alarmes: [15, 1440, 10080]
                    });
                }
            });
        }

        // Vermífugos futuros
        if (pet.vermifugo) {
            pet.vermifugo.forEach(vermifugo => {
                if (vermifugo.proxima && new Date(vermifugo.proxima) > hoje) {
                    eventos.push({
                        titulo: `💊 ${vermifugo.nome} - ${pet.nome}`,
                        descricao: `Aplicar ${vermifugo.nome} em ${pet.nome}\nDose: ${vermifugo.dose || 'Conforme peso'}\n\n${vermifugo.obs || ''}`,
                        data: vermifugo.proxima,
                        duracao: 15,
                        localizacao: '',
                        alarmes: [15, 1440, 10080]
                    });
                }
            });
        }

        if (eventos.length === 0) {
            app.showToast('❌ Nenhum evento futuro para exportar', 'error');
            return;
        }

        // Gerar arquivo ICS com múltiplos eventos
        const icsHeader = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PetHouse//Gestão de Pets//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PetHouse - ${pet.nome}
X-WR-TIMEZONE:America/Sao_Paulo`;

        const icsFooter = `END:VCALENDAR`;

        const formatarData = (d) => {
            return new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const eventosICS = eventos.map(evento => {
            const dataInicio = new Date(evento.data);
            const dataFim = new Date(dataInicio.getTime() + evento.duracao * 60000);
            const uid = `pethouse-${Date.now()}-${Math.random()}@pethouse.app`;

            const alarmesICS = evento.alarmes.map(minutos => {
                return `BEGIN:VALARM
TRIGGER:-PT${minutos}M
ACTION:DISPLAY
DESCRIPTION:${evento.titulo}
END:VALARM`;
            }).join('\n');

            return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatarData(new Date())}
DTSTART:${formatarData(dataInicio)}
DTEND:${formatarData(dataFim)}
SUMMARY:${evento.titulo}
DESCRIPTION:${evento.descricao}
LOCATION:${evento.localizacao}
STATUS:CONFIRMED
SEQUENCE:0
${alarmesICS}
END:VEVENT`;
        }).join('\n');

        const ics = `${icsHeader}\n${eventosICS}\n${icsFooter}`;
        this.baixarICS(ics, `pethouse-${pet.nome}-todos-eventos.ics`);
        
        app.showToast(`✅ ${eventos.length} eventos exportados! Abra o arquivo para importar no Calendário`, 'success');
    },

    /**
     * Renderiza botão de adicionar ao calendário
     */
    renderizarBotao(pet, item, tipo) {
        if (!item.proxima) return '';

        const onClick = tipo === 'vacina' 
            ? `Calendario.adicionarVacinaAoCalendario(app.data.pets.find(p => p.id === '${pet.id}'), ${JSON.stringify(item).replace(/"/g, '&quot;')})`
            : `Calendario.adicionarVermifugoAoCalendario(app.data.pets.find(p => p.id === '${pet.id}'), ${JSON.stringify(item).replace(/"/g, '&quot;')})`;

        return `
            <button onclick="${onClick}" 
                    class="btn btn-small" 
                    style="background: #4caf50; color: white; padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-top: 0.5rem;">
                📅 Adicionar ao Calendário
            </button>
        `;
    },

    /**
     * Modal de exportação de eventos
     */
    mostrarExportacao(pet) {
        const hoje = new Date();
        let totalEventos = 0;

        if (pet.vacinas) {
            totalEventos += pet.vacinas.filter(v => v.proxima && new Date(v.proxima) > hoje).length;
        }
        if (pet.vermifugo) {
            totalEventos += pet.vermifugo.filter(v => v.proxima && new Date(v.proxima) > hoje).length;
        }

        const modalContent = `
            <div class="modal-header">
                <h2>📅 Exportar para Calendário</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                        📱 <strong>Como funciona:</strong><br>
                        1. Clique em "Exportar Todos os Eventos"<br>
                        2. Abra o arquivo .ics baixado<br>
                        3. O iPhone abrirá automaticamente o app Calendário<br>
                        4. Confirme a importação<br>
                        5. Pronto! Você receberá lembretes automáticos
                    </p>
                </div>

                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                    <h3 style="margin: 0 0 0.5rem 0;">${pet.nome}</h3>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">
                        ${totalEventos} eventos futuros encontrados
                    </p>
                    
                    ${totalEventos > 0 ? `
                        <button onclick="Calendario.exportarTodosEventos(app.data.pets.find(p => p.id === '${pet.id}')); app.closeModal();" 
                                class="btn btn-primary" 
                                style="margin-top: 1.5rem; font-size: 1.1rem; padding: 0.75rem 1.5rem;">
                            📥 Exportar Todos os Eventos
                        </button>
                    ` : `
                        <p style="margin-top: 1.5rem; color: #999;">
                            Nenhum evento futuro para exportar.<br>
                            Adicione vacinas ou vermífugos com data de próxima aplicação.
                        </p>
                    `}
                </div>

                <div style="background: #fff3cd; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                    <p style="margin: 0; font-size: 0.85rem; color: #856404;">
                        💡 <strong>Dica:</strong> Você também pode adicionar eventos individuais clicando no botão "📅 Adicionar ao Calendário" em cada vacina ou vermífugo na aba Cuidados.
                    </p>
                </div>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
    }
};

// Exportar para uso global
window.Calendario = Calendario;
