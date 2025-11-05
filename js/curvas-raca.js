/**
 * Banco de Dados de Curvas de Crescimento por Raça
 * Módulo independente com curvas padrão de peso para diferentes raças
 */

const CurvasRaca = {
    /**
     * Curvas de crescimento padrão por raça (em gramas)
     * Baseado em dados médios de crescimento
     */
    curvas: {
        // CÃES - PORTE PEQUENO
        'chihuahua': {
            tipo: 'cao',
            porte: 'pequeno',
            pesoAdulto: { min: 1500, max: 3000, ideal: 2250 },
            curva: [
                { semanas: 4, peso: 300 },
                { semanas: 8, peso: 600 },
                { semanas: 12, peso: 900 },
                { semanas: 16, peso: 1200 },
                { semanas: 24, peso: 1800 },
                { semanas: 52, peso: 2250 }
            ]
        },
        'poodle toy': {
            tipo: 'cao',
            porte: 'pequeno',
            pesoAdulto: { min: 2000, max: 4000, ideal: 3000 },
            curva: [
                { semanas: 4, peso: 400 },
                { semanas: 8, peso: 800 },
                { semanas: 12, peso: 1400 },
                { semanas: 16, peso: 1900 },
                { semanas: 24, peso: 2600 },
                { semanas: 52, peso: 3000 }
            ]
        },
        'yorkshire': {
            tipo: 'cao',
            porte: 'pequeno',
            pesoAdulto: { min: 2000, max: 3500, ideal: 2750 },
            curva: [
                { semanas: 4, peso: 350 },
                { semanas: 8, peso: 700 },
                { semanas: 12, peso: 1200 },
                { semanas: 16, peso: 1700 },
                { semanas: 24, peso: 2300 },
                { semanas: 52, peso: 2750 }
            ]
        },
        
        // CÃES - PORTE MÉDIO
        'beagle': {
            tipo: 'cao',
            porte: 'medio',
            pesoAdulto: { min: 8000, max: 14000, ideal: 11000 },
            curva: [
                { semanas: 4, peso: 1500 },
                { semanas: 8, peso: 3500 },
                { semanas: 12, peso: 5500 },
                { semanas: 16, peso: 7500 },
                { semanas: 24, peso: 9500 },
                { semanas: 52, peso: 11000 }
            ]
        },
        'cocker spaniel': {
            tipo: 'cao',
            porte: 'medio',
            pesoAdulto: { min: 10000, max: 15000, ideal: 12500 },
            curva: [
                { semanas: 4, peso: 1800 },
                { semanas: 8, peso: 4000 },
                { semanas: 12, peso: 6500 },
                { semanas: 16, peso: 8500 },
                { semanas: 24, peso: 11000 },
                { semanas: 52, peso: 12500 }
            ]
        },
        'bulldog francês': {
            tipo: 'cao',
            porte: 'medio',
            pesoAdulto: { min: 8000, max: 14000, ideal: 11000 },
            curva: [
                { semanas: 4, peso: 1400 },
                { semanas: 8, peso: 3200 },
                { semanas: 12, peso: 5500 },
                { semanas: 16, peso: 7500 },
                { semanas: 24, peso: 9500 },
                { semanas: 52, peso: 11000 }
            ]
        },
        
        // CÃES - PORTE GRANDE
        'labrador': {
            tipo: 'cao',
            porte: 'grande',
            pesoAdulto: { min: 25000, max: 36000, ideal: 30500 },
            curva: [
                { semanas: 4, peso: 3500 },
                { semanas: 8, peso: 7500 },
                { semanas: 12, peso: 12000 },
                { semanas: 16, peso: 17000 },
                { semanas: 24, peso: 24000 },
                { semanas: 52, peso: 30500 }
            ]
        },
        'golden retriever': {
            tipo: 'cao',
            porte: 'grande',
            pesoAdulto: { min: 25000, max: 34000, ideal: 29500 },
            curva: [
                { semanas: 4, peso: 3200 },
                { semanas: 8, peso: 7000 },
                { semanas: 12, peso: 11500 },
                { semanas: 16, peso: 16500 },
                { semanas: 24, peso: 23000 },
                { semanas: 52, peso: 29500 }
            ]
        },
        'pastor alemão': {
            tipo: 'cao',
            porte: 'grande',
            pesoAdulto: { min: 22000, max: 40000, ideal: 31000 },
            curva: [
                { semanas: 4, peso: 3800 },
                { semanas: 8, peso: 8500 },
                { semanas: 12, peso: 13500 },
                { semanas: 16, peso: 18500 },
                { semanas: 24, peso: 25000 },
                { semanas: 52, peso: 31000 }
            ]
        },
        
        // GATOS
        'persa': {
            tipo: 'gato',
            porte: 'medio',
            pesoAdulto: { min: 3500, max: 7000, ideal: 5250 },
            curva: [
                { semanas: 4, peso: 400 },
                { semanas: 8, peso: 900 },
                { semanas: 12, peso: 1500 },
                { semanas: 16, peso: 2200 },
                { semanas: 24, peso: 3500 },
                { semanas: 52, peso: 5250 }
            ]
        },
        'siamês': {
            tipo: 'gato',
            porte: 'medio',
            pesoAdulto: { min: 2500, max: 5500, ideal: 4000 },
            curva: [
                { semanas: 4, peso: 350 },
                { semanas: 8, peso: 800 },
                { semanas: 12, peso: 1400 },
                { semanas: 16, peso: 2000 },
                { semanas: 24, peso: 3200 },
                { semanas: 52, peso: 4000 }
            ]
        },
        'maine coon': {
            tipo: 'gato',
            porte: 'grande',
            pesoAdulto: { min: 5000, max: 10000, ideal: 7500 },
            curva: [
                { semanas: 4, peso: 500 },
                { semanas: 8, peso: 1200 },
                { semanas: 12, peso: 2000 },
                { semanas: 16, peso: 3000 },
                { semanas: 24, peso: 5000 },
                { semanas: 52, peso: 7500 }
            ]
        },
        'srd gato': {
            tipo: 'gato',
            porte: 'medio',
            pesoAdulto: { min: 3000, max: 6000, ideal: 4500 },
            curva: [
                { semanas: 4, peso: 400 },
                { semanas: 8, peso: 900 },
                { semanas: 12, peso: 1500 },
                { semanas: 16, peso: 2200 },
                { semanas: 24, peso: 3500 },
                { semanas: 52, peso: 4500 }
            ]
        }
    },

    /**
     * Busca curva de crescimento para uma raça
     */
    buscarCurva(raca) {
        if (!raca) return null;
        
        const racaNormalizada = raca.toLowerCase().trim();
        
        // Busca exata
        if (this.curvas[racaNormalizada]) {
            return this.curvas[racaNormalizada];
        }
        
        // Busca parcial
        for (const [key, value] of Object.entries(this.curvas)) {
            if (racaNormalizada.includes(key) || key.includes(racaNormalizada)) {
                return value;
            }
        }
        
        return null;
    },

    /**
     * Retorna peso ideal baseado na raça e idade
     */
    obterPesoIdeal(raca, idadeEmSemanas) {
        const curva = this.buscarCurva(raca);
        if (!curva) return null;

        // Se já é adulto (mais de 1 ano), retornar peso adulto ideal
        if (idadeEmSemanas >= 52) {
            return curva.pesoAdulto.ideal;
        }

        // Interpolar entre os pontos da curva
        for (let i = 0; i < curva.curva.length - 1; i++) {
            const pontoAtual = curva.curva[i];
            const proximoPonto = curva.curva[i + 1];

            if (idadeEmSemanas >= pontoAtual.semanas && idadeEmSemanas <= proximoPonto.semanas) {
                // Interpolação linear
                const proporcao = (idadeEmSemanas - pontoAtual.semanas) / 
                                 (proximoPonto.semanas - pontoAtual.semanas);
                const pesoInterpolado = pontoAtual.peso + 
                                       (proximoPonto.peso - pontoAtual.peso) * proporcao;
                return Math.round(pesoInterpolado);
            }
        }

        return null;
    },

    /**
     * Lista todas as raças disponíveis
     */
    listarRacas() {
        return Object.keys(this.curvas).sort();
    }
};

// Exportar para uso global
window.CurvasRaca = CurvasRaca;
