/**
 * Sistema de Logs e Relatório de Erros
 * Captura erros automaticamente e permite envio por e-mail
 */

const ErrorLogger = {
    // ========================================
    // CONFIGURAÇÃO - MODIFIQUE AQUI
    // ========================================
    emailDestino: 'rodrigorochalima@gmail.com', // E-mail para receber relatórios
    maxLogs: 100, // Máximo de logs armazenados
    
    /**
     * Inicializa o sistema de logs
     */
    init() {
        // Capturar erros globais
        window.addEventListener('error', (event) => {
            this.logError({
                tipo: 'JavaScript Error',
                mensagem: event.message,
                arquivo: event.filename,
                linha: event.lineno,
                coluna: event.colno,
                stack: event.error?.stack || 'N/A'
            });
        });
        
        // Capturar erros de promises não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                tipo: 'Promise Rejection',
                mensagem: event.reason?.message || event.reason,
                stack: event.reason?.stack || 'N/A'
            });
        });
        
        console.log('✅ Sistema de logs inicializado');
    },
    
    /**
     * Registra um erro
     */
    logError(erro) {
        const log = {
            timestamp: new Date().toISOString(),
            tipo: erro.tipo,
            mensagem: erro.mensagem,
            arquivo: erro.arquivo || 'N/A',
            linha: erro.linha || 'N/A',
            coluna: erro.coluna || 'N/A',
            stack: erro.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.salvarLog(log);
        console.error('🐛 [ErrorLogger]', log);
    },
    
    /**
     * Registra uma ação do usuário
     */
    logAction(acao, detalhes = {}) {
        const log = {
            timestamp: new Date().toISOString(),
            tipo: 'Ação do Usuário',
            acao: acao,
            detalhes: JSON.stringify(detalhes),
            url: window.location.href
        };
        
        this.salvarLog(log);
        console.log('📝 [ErrorLogger]', acao, detalhes);
    },
    
    /**
     * Salva log no localStorage
     */
    salvarLog(log) {
        try {
            const logs = this.getLogs();
            logs.push(log);
            
            // Manter apenas os últimos N logs
            if (logs.length > this.maxLogs) {
                logs.shift();
            }
            
            localStorage.setItem('pethouse_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Erro ao salvar log:', e);
        }
    },
    
    /**
     * Recupera todos os logs
     */
    getLogs() {
        try {
            const logs = localStorage.getItem('pethouse_logs');
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            console.error('Erro ao recuperar logs:', e);
            return [];
        }
    },
    
    /**
     * Limpa todos os logs
     */
    limparLogs() {
        localStorage.removeItem('pethouse_logs');
        console.log('🗑️ Logs limpos');
    },
    
    /**
     * Gera relatório em formato TXT
     */
    gerarRelatorio() {
        const logs = this.getLogs();
        const info = this.getSystemInfo();
        
        let relatorio = '';
        relatorio += '═══════════════════════════════════════════════════════\n';
        relatorio += '           PETHOUSE - RELATÓRIO DE LOGS\n';
        relatorio += '═══════════════════════════════════════════════════════\n\n';
        
        // Informações do Sistema
        relatorio += '📱 INFORMAÇÕES DO SISTEMA\n';
        relatorio += '─────────────────────────────────────────────────────\n';
        relatorio += `Data do Relatório: ${new Date().toLocaleString('pt-BR')}\n`;
        relatorio += `Navegador: ${info.navegador}\n`;
        relatorio += `Sistema Operacional: ${info.os}\n`;
        relatorio += `Versão do App: ${info.versao}\n`;
        relatorio += `URL Atual: ${info.url}\n`;
        relatorio += `Total de Logs: ${logs.length}\n`;
        relatorio += '\n\n';
        
        // Logs
        relatorio += '📋 HISTÓRICO DE LOGS\n';
        relatorio += '─────────────────────────────────────────────────────\n\n';
        
        if (logs.length === 0) {
            relatorio += 'Nenhum log registrado.\n';
        } else {
            logs.forEach((log, index) => {
                relatorio += `[${index + 1}] ${log.timestamp}\n`;
                relatorio += `Tipo: ${log.tipo}\n`;
                
                if (log.tipo === 'Ação do Usuário') {
                    relatorio += `Ação: ${log.acao}\n`;
                    relatorio += `Detalhes: ${log.detalhes}\n`;
                } else {
                    relatorio += `Mensagem: ${log.mensagem}\n`;
                    if (log.arquivo !== 'N/A') {
                        relatorio += `Arquivo: ${log.arquivo}:${log.linha}:${log.coluna}\n`;
                    }
                    if (log.stack && log.stack !== 'N/A') {
                        relatorio += `Stack Trace:\n${log.stack}\n`;
                    }
                }
                
                relatorio += `URL: ${log.url}\n`;
                relatorio += '\n' + '─'.repeat(55) + '\n\n';
            });
        }
        
        relatorio += '\n═══════════════════════════════════════════════════════\n';
        relatorio += '              FIM DO RELATÓRIO\n';
        relatorio += '═══════════════════════════════════════════════════════\n';
        
        return relatorio;
    },
    
    /**
     * Obtém informações do sistema
     */
    getSystemInfo() {
        const ua = navigator.userAgent;
        
        // Detectar navegador
        let navegador = 'Desconhecido';
        if (ua.includes('Chrome')) navegador = 'Chrome';
        else if (ua.includes('Safari')) navegador = 'Safari';
        else if (ua.includes('Firefox')) navegador = 'Firefox';
        else if (ua.includes('Edge')) navegador = 'Edge';
        
        // Detectar SO
        let os = 'Desconhecido';
        if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        else if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        
        return {
            navegador: navegador,
            os: os,
            versao: '1.0.0', // Versão do app
            url: window.location.href,
            userAgent: ua
        };
    },
    
    /**
     * Baixa relatório como arquivo TXT
     */
    baixarRelatorio() {
        const relatorio = this.gerarRelatorio();
        const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pethouse-log-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Obtém próximo número sequencial
     */
    getProximoNumero() {
        try {
            let numero = parseInt(localStorage.getItem('pethouse_log_numero') || '0');
            numero++;
            localStorage.setItem('pethouse_log_numero', numero.toString());
            return numero;
        } catch (e) {
            return Math.floor(Math.random() * 99999);
        }
    },
    
    /**
     * Obtém ID da família atual
     */
    getFamilyId() {
        try {
            const data = JSON.parse(localStorage.getItem('petHouseData') || '{}');
            return data.familyId || 'desconhecido';
        } catch (e) {
            return 'desconhecido';
        }
    },
    
    /**
     * Envia relatório por e-mail
     */
    enviarPorEmail(emailDestino = null) {
        emailDestino = emailDestino || this.emailDestino;
        const relatorio = this.gerarRelatorio();
        const info = this.getSystemInfo();
        
        // Gerar número sequencial e ID da família
        const numero = this.getProximoNumero();
        const familyId = this.getFamilyId();
        
        // Criar corpo do e-mail
        const assunto = encodeURIComponent(`PetHouse - Erro #${numero} - Família: ${familyId}`);
        const corpo = encodeURIComponent(
            `Olá,\n\n` +
            `Estou enviando um relatório de erro do PetHouse.\n\n` +
            `IDENTIFICAÇÃO:\n` +
            `- Número do Relatório: #${numero}\n` +
            `- ID da Família: ${familyId}\n` +
            `- Data/Hora: ${new Date().toLocaleString('pt-BR')}\n\n` +
            `INFORMAÇÕES DO SISTEMA:\n` +
            `- Navegador: ${info.navegador}\n` +
            `- Sistema Operacional: ${info.os}\n` +
            `- Total de Logs: ${this.getLogs().length}\n` +
            `- URL: ${info.url}\n\n` +
            `OBSERVAÇÕES:\n` +
            `(Descreva aqui o que estava fazendo quando o erro ocorreu)\n\n` +
            `${'─'.repeat(55)}\n\n` +
            `RELATÓRIO COMPLETO:\n\n` +
            relatorio
        );
        
        // Abrir cliente de e-mail
        window.location.href = `mailto:${emailDestino}?subject=${assunto}&body=${corpo}`;
        
        // Também baixar o arquivo
        this.baixarRelatorio();
    }
};

// Inicializar automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorLogger.init());
} else {
    ErrorLogger.init();
}

// Exportar para uso global
window.ErrorLogger = ErrorLogger;
