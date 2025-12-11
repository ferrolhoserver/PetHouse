/**
 * Utilitários de Data - Evita bugs de timezone
 * Todas as datas são tratadas como "data local" sem conversão UTC
 */

const UtilsData = {
    /**
     * Obtém data atual no formato YYYY-MM-DD (sem conversão UTC)
     */
    hoje() {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    },
    
    /**
     * Converte string YYYY-MM-DD para Date (sem conversão UTC)
     * @param {string} dataStr - Data no formato YYYY-MM-DD
     * @returns {Date}
     */
    stringParaDate(dataStr) {
        if (!dataStr) return null;
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
    },
    
    /**
     * Converte Date para string YYYY-MM-DD (sem conversão UTC)
     * @param {Date} date
     * @returns {string}
     */
    dateParaString(date) {
        if (!date || !(date instanceof Date)) return '';
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    },
    
    /**
     * Adiciona dias a uma data
     * @param {string} dataStr - Data no formato YYYY-MM-DD
     * @param {number} dias - Número de dias a adicionar
     * @returns {string} - Nova data no formato YYYY-MM-DD
     */
    adicionarDias(dataStr, dias) {
        const date = this.stringParaDate(dataStr);
        if (!date) return '';
        date.setDate(date.getDate() + dias);
        return this.dateParaString(date);
    },
    
    /**
     * Calcula diferença em dias entre duas datas
     * @param {string} data1 - Data no formato YYYY-MM-DD
     * @param {string} data2 - Data no formato YYYY-MM-DD
     * @returns {number} - Diferença em dias
     */
    diferencaDias(data1, data2) {
        const d1 = this.stringParaDate(data1);
        const d2 = this.stringParaDate(data2);
        if (!d1 || !d2) return 0;
        const diff = d2.getTime() - d1.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
    
    /**
     * Formata data para exibição (DD/MM/YYYY)
     * @param {string} dataStr - Data no formato YYYY-MM-DD
     * @returns {string} - Data formatada DD/MM/YYYY
     */
    formatarBR(dataStr) {
        const date = this.stringParaDate(dataStr);
        if (!date) return '';
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
    },
    
    /**
     * Verifica se data1 é anterior a data2
     * @param {string} data1 - Data no formato YYYY-MM-DD
     * @param {string} data2 - Data no formato YYYY-MM-DD
     * @returns {boolean}
     */
    ehAnterior(data1, data2) {
        return this.diferencaDias(data1, data2) > 0;
    },
    
    /**
     * Verifica se data está no passado
     * @param {string} dataStr - Data no formato YYYY-MM-DD
     * @returns {boolean}
     */
    ehPassado(dataStr) {
        return this.ehAnterior(dataStr, this.hoje());
    },
    
    /**
     * Verifica se data está no futuro
     * @param {string} dataStr - Data no formato YYYY-MM-DD
     * @returns {boolean}
     */
    ehFuturo(dataStr) {
        return this.ehAnterior(this.hoje(), dataStr);
    }
};

// Exportar globalmente
window.UtilsData = UtilsData;

console.log('[UtilsData] Utilitários de data carregados');
