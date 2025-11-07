/**
 * Módulo de Alarmes e Notificações
 * Sistema de lembretes para vacinas, vermífugos e consultas
 */

const Alarmes = {
    /**
     * Solicita permissão para notificações
     */
    async solicitarPermissao() {
        if (!('Notification' in window)) {
            console.log('Este navegador não suporta notificações');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    /**
     * Envia notificação local
     */
    enviarNotificacao(titulo, mensagem, icone = '🔔') {
        if (Notification.permission === 'granted') {
            new Notification(titulo, {
                body: mensagem,
                icon: './icons/icon-192.png',
                badge: './icons/icon-192.png',
                tag: 'pethouse-notification',
                requireInteraction: false
            });
        }
    },

    /**
     * Agenda alarme para data específica
     */
    agendarAlarme(petNome, tipo, data, descricao) {
        const alarme = {
            id: Date.now().toString(),
            petNome: petNome,
            tipo: tipo, // 'vacina', 'vermifugo', 'consulta'
            data: data,
            descricao: descricao,
            ativo: true,
            criado: new Date().toISOString()
        };

        // Salvar no localStorage
        const alarmes = this.obterAlarmes();
        alarmes.push(alarme);
        localStorage.setItem('pethouse_alarmes', JSON.stringify(alarmes));

        return alarme;
    },

    /**
     * Obtém todos os alarmes
     */
    obterAlarmes() {
        const alarmes = localStorage.getItem('pethouse_alarmes');
        return alarmes ? JSON.parse(alarmes) : [];
    },

    /**
     * Remove alarme
     */
    removerAlarme(alarmeId) {
        let alarmes = this.obterAlarmes();
        alarmes = alarmes.filter(a => a.id !== alarmeId);
        localStorage.setItem('pethouse_alarmes', JSON.stringify(alarmes));
    },

    /**
     * Verifica alarmes pendentes
     */
    verificarAlarmesPendentes() {
        const alarmes = this.obterAlarmes();
        const hoje = new Date();
        const alarmesHoje = [];

        alarmes.forEach(alarme => {
            if (!alarme.ativo) return;

            const dataAlarme = new Date(alarme.data);
            const diff = Math.ceil((dataAlarme - hoje) / (1000 * 60 * 60 * 24));

            // Notificar 7 dias antes
            if (diff === 7) {
                this.enviarNotificacao(
                    `🔔 Lembrete: ${alarme.petNome}`,
                    `${alarme.descricao} em 7 dias (${new Date(alarme.data).toLocaleDateString('pt-BR')})`
                );
            }

            // Notificar 3 dias antes
            if (diff === 3) {
                this.enviarNotificacao(
                    `⚠️ Atenção: ${alarme.petNome}`,
                    `${alarme.descricao} em 3 dias (${new Date(alarme.data).toLocaleDateString('pt-BR')})`
                );
            }

            // Notificar no dia
            if (diff === 0) {
                this.enviarNotificacao(
                    `🚨 HOJE: ${alarme.petNome}`,
                    `${alarme.descricao} é HOJE!`
                );
                alarmesHoje.push(alarme);
            }

            // Notificar se atrasado
            if (diff < 0) {
                this.enviarNotificacao(
                    `❌ ATRASADO: ${alarme.petNome}`,
                    `${alarme.descricao} está atrasado há ${Math.abs(diff)} dias`
                );
            }
        });

        return alarmesHoje;
    },

    /**
     * Renderiza lista de alarmes
     */
    renderizarAlarmes() {
        const alarmes = this.obterAlarmes();
        const hoje = new Date();

        if (alarmes.length === 0) {
            return '<p style="text-align: center; color: #999; padding: 2rem;">Nenhum alarme agendado</p>';
        }

        // Ordenar por data
        alarmes.sort((a, b) => new Date(a.data) - new Date(b.data));

        return alarmes.map(alarme => {
            const dataAlarme = new Date(alarme.data);
            const diff = Math.ceil((dataAlarme - hoje) / (1000 * 60 * 60 * 24));
            
            let cor = '#4caf50';
            let status = 'Futuro';
            if (diff < 0) {
                cor = '#f44336';
                status = `Atrasado ${Math.abs(diff)} dias`;
            } else if (diff === 0) {
                cor = '#ff9800';
                status = 'HOJE';
            } else if (diff <= 7) {
                cor = '#ff9800';
                status = `${diff} dias`;
            } else {
                status = `${diff} dias`;
            }

            const icone = alarme.tipo === 'vacina' ? '💉' : alarme.tipo === 'vermifugo' ? '💊' : '🏥';

            return `
                <div style="background: white; border-left: 4px solid ${cor}; padding: 1rem; margin-bottom: 0.75rem; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <span style="font-size: 1.2rem;">${icone}</span>
                                <h4 style="margin: 0; color: ${cor};">${alarme.petNome}</h4>
                            </div>
                            <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #333;">${alarme.descricao}</p>
                            <p style="margin: 0.25rem 0; font-size: 0.85rem; color: #666;">
                                📅 ${dataAlarme.toLocaleDateString('pt-BR')}
                            </p>
                            <span style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: ${cor}15; color: ${cor}; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                                ${status}
                            </span>
                        </div>
                        <button onclick="Alarmes.removerAlarme('${alarme.id}'); app.render();" 
                                style="background: none; border: none; color: #999; cursor: pointer; font-size: 1.2rem; padding: 0.25rem;">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Modal para gerenciar alarmes
     */
    mostrarGerenciador() {
        const modalContent = `
            <div class="modal-header">
                <h2>🔔 Gerenciar Alarmes</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem; max-height: 70vh; overflow-y: auto;">
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                        💡 <strong>Alarmes automáticos:</strong> O sistema cria alarmes automaticamente quando você registra vacinas e vermífugos com data de próxima aplicação.
                    </p>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">Próximos Alarmes</h3>
                    <button class="btn btn-small btn-primary" onclick="Alarmes.solicitarPermissao().then(ok => { if(ok) app.showToast('✅ Notificações ativadas!', 'success'); else app.showToast('❌ Permissão negada', 'error'); })">
                        🔔 Ativar Notificações
                    </button>
                </div>

                ${this.renderizarAlarmes()}
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
    },

    /**
     * Inicializa verificação periódica
     */
    inicializar() {
        // Verificar alarmes a cada hora
        setInterval(() => {
            this.verificarAlarmesPendentes();
        }, 60 * 60 * 1000); // 1 hora

        // Verificar imediatamente
        this.verificarAlarmesPendentes();
    }
};

// Exportar para uso global
window.Alarmes = Alarmes;

// Inicializar quando o app carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Alarmes.inicializar());
} else {
    Alarmes.inicializar();
}
