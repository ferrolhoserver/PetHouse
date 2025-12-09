/**
 * Base de Dados de Raças
 * Características específicas de cada raça para recomendações inteligentes
 */

const BaseRacas = {
    
    /**
     * Banco de dados de raças de cachorros
     */
    racasCachorros: {
        // RAÇAS PEQUENAS
        'Shih Tzu': {
            porte: 'pequeno',
            pesoIdeal: { min: 4, max: 7 },
            pelagem: 'longa',
            banho: { frequencia: 15, descricao: 'Pelagem longa requer banhos frequentes' },
            tosa: { frequencia: 45, descricao: 'Tosa higiênica recomendada mensalmente' },
            caracteristicas: ['Pelagem longa e sedosa', 'Requer escovação diária', 'Propenso a problemas oculares'],
            cuidadosEspeciais: ['Limpeza dos olhos diária', 'Atenção com nós no pelo']
        },
        
        'Poodle': {
            porte: 'pequeno',
            pesoIdeal: { min: 3, max: 25 },
            pelagem: 'cacheada',
            banho: { frequencia: 21, descricao: 'Pelagem cacheada precisa de hidratação regular' },
            tosa: { frequencia: 30, descricao: 'Tosa necessária a cada 30-45 dias' },
            caracteristicas: ['Pelagem cacheada', 'Não solta pelo', 'Inteligente e ativo'],
            cuidadosEspeciais: ['Escovação 2-3x por semana', 'Limpeza de ouvidos']
        },
        
        'Yorkshire': {
            porte: 'pequeno',
            pesoIdeal: { min: 2, max: 3.5 },
            pelagem: 'longa',
            banho: { frequencia: 15, descricao: 'Pelagem delicada requer cuidados frequentes' },
            tosa: { frequencia: 60, descricao: 'Tosa opcional, mais por estética' },
            caracteristicas: ['Pelagem longa e sedosa', 'Muito pequeno', 'Energético'],
            cuidadosEspeciais: ['Escovação diária', 'Proteção contra frio']
        },
        
        'Maltês': {
            porte: 'pequeno',
            pesoIdeal: { min: 3, max: 4 },
            pelagem: 'longa',
            banho: { frequencia: 15, descricao: 'Pelagem branca requer banhos frequentes' },
            tosa: { frequencia: 45, descricao: 'Tosa higiênica recomendada' },
            caracteristicas: ['Pelagem branca e longa', 'Companheiro ideal', 'Alerta'],
            cuidadosEspeciais: ['Limpeza dos olhos', 'Escovação diária']
        },
        
        'Chihuahua': {
            porte: 'pequeno',
            pesoIdeal: { min: 1.5, max: 3 },
            pelagem: 'curta',
            banho: { frequencia: 30, descricao: 'Pelagem curta, banhos espaçados' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa' },
            caracteristicas: ['Muito pequeno', 'Corajoso', 'Leal'],
            cuidadosEspeciais: ['Proteção contra frio', 'Cuidado com quedas']
        },
        
        // RAÇAS MÉDIAS
        'Beagle': {
            porte: 'medio',
            pesoIdeal: { min: 9, max: 11 },
            pelagem: 'curta',
            banho: { frequencia: 30, descricao: 'Pelagem curta e densa' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa' },
            caracteristicas: ['Pelagem curta', 'Olfato apurado', 'Amigável'],
            cuidadosEspeciais: ['Controle de peso', 'Exercícios regulares']
        },
        
        'Cocker Spaniel': {
            porte: 'medio',
            pesoIdeal: { min: 12, max: 15 },
            pelagem: 'longa',
            banho: { frequencia: 21, descricao: 'Pelagem longa requer cuidados' },
            tosa: { frequencia: 45, descricao: 'Tosa regular recomendada' },
            caracteristicas: ['Pelagem longa e sedosa', 'Orelhas longas', 'Dócil'],
            cuidadosEspeciais: ['Limpeza de ouvidos frequente', 'Escovação regular']
        },
        
        'Border Collie': {
            porte: 'medio',
            pesoIdeal: { min: 14, max: 20 },
            pelagem: 'media',
            banho: { frequencia: 30, descricao: 'Pelagem dupla, banhos moderados' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa, apenas escovação' },
            caracteristicas: ['Muito inteligente', 'Energético', 'Pelagem dupla'],
            cuidadosEspeciais: ['Exercícios intensos diários', 'Estimulação mental']
        },
        
        'Bulldog Francês': {
            porte: 'medio',
            pesoIdeal: { min: 8, max: 14 },
            pelagem: 'curta',
            banho: { frequencia: 21, descricao: 'Dobras da pele requerem limpeza' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa' },
            caracteristicas: ['Focinho achatado', 'Dobras faciais', 'Companheiro'],
            cuidadosEspeciais: ['Limpeza de dobras diária', 'Cuidado com calor']
        },
        
        // RAÇAS GRANDES
        'Golden Retriever': {
            porte: 'grande',
            pesoIdeal: { min: 25, max: 34 },
            pelagem: 'longa',
            banho: { frequencia: 30, descricao: 'Pelagem densa e oleosa' },
            tosa: { frequencia: 60, descricao: 'Tosa higiênica recomendada' },
            caracteristicas: ['Pelagem dourada e densa', 'Muito amigável', 'Inteligente'],
            cuidadosEspeciais: ['Escovação 2-3x por semana', 'Exercícios diários']
        },
        
        'Labrador': {
            porte: 'grande',
            pesoIdeal: { min: 25, max: 36 },
            pelagem: 'curta',
            banho: { frequencia: 30, descricao: 'Pelagem curta e densa' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa' },
            caracteristicas: ['Pelagem curta', 'Energético', 'Amigável'],
            cuidadosEspeciais: ['Controle de peso', 'Exercícios regulares']
        },
        
        'Pastor Alemão': {
            porte: 'grande',
            pesoIdeal: { min: 22, max: 40 },
            pelagem: 'media',
            banho: { frequencia: 30, descricao: 'Pelagem dupla' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa' },
            caracteristicas: ['Pelagem dupla', 'Inteligente', 'Protetor'],
            cuidadosEspeciais: ['Escovação regular', 'Treinamento desde filhote']
        },
        
        'Rottweiler': {
            porte: 'grande',
            pesoIdeal: { min: 35, max: 60 },
            pelagem: 'curta',
            banho: { frequencia: 30, descricao: 'Pelagem curta e densa' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa' },
            caracteristicas: ['Pelagem curta', 'Forte', 'Leal'],
            cuidadosEspeciais: ['Socialização desde filhote', 'Exercícios regulares']
        },
        
        'Husky Siberiano': {
            porte: 'grande',
            pesoIdeal: { min: 16, max: 27 },
            pelagem: 'dupla',
            banho: { frequencia: 45, descricao: 'Pelagem dupla, banhos espaçados' },
            tosa: { frequencia: 0, descricao: 'NUNCA tosar! Pelagem regula temperatura' },
            caracteristicas: ['Pelagem dupla espessa', 'Olhos azuis comuns', 'Energético'],
            cuidadosEspeciais: ['Escovação frequente', 'Exercícios intensos', 'Não tosar']
        },
        
        // SRD (Sem Raça Definida)
        'SRD': {
            porte: 'variavel',
            pesoIdeal: { min: 5, max: 30 },
            pelagem: 'variavel',
            banho: { frequencia: 30, descricao: 'Frequência varia conforme pelagem' },
            tosa: { frequencia: 60, descricao: 'Avaliar necessidade individualmente' },
            caracteristicas: ['Características variadas', 'Geralmente resistente', 'Único'],
            cuidadosEspeciais: ['Avaliar características individuais']
        }
    },
    
    /**
     * Banco de dados de raças de gatos
     */
    racasGatos: {
        'Persa': {
            porte: 'medio',
            pesoIdeal: { min: 3, max: 6 },
            pelagem: 'longa',
            banho: { frequencia: 30, descricao: 'Pelagem longa requer banhos regulares' },
            tosa: { frequencia: 60, descricao: 'Tosa higiênica recomendada' },
            caracteristicas: ['Pelagem longa e densa', 'Focinho achatado', 'Calmo'],
            cuidadosEspeciais: ['Escovação diária', 'Limpeza dos olhos']
        },
        
        'Siamês': {
            porte: 'medio',
            pesoIdeal: { min: 3, max: 5 },
            pelagem: 'curta',
            banho: { frequencia: 60, descricao: 'Pelagem curta, banhos espaçados' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa' },
            caracteristicas: ['Pelagem curta', 'Olhos azuis', 'Vocal'],
            cuidadosEspeciais: ['Interação social', 'Estimulação mental']
        },
        
        'Maine Coon': {
            porte: 'grande',
            pesoIdeal: { min: 5, max: 10 },
            pelagem: 'longa',
            banho: { frequencia: 45, descricao: 'Pelagem longa e densa' },
            tosa: { frequencia: 0, descricao: 'Não necessita tosa, apenas escovação' },
            caracteristicas: ['Pelagem longa', 'Porte grande', 'Sociável'],
            cuidadosEspeciais: ['Escovação 2-3x por semana', 'Espaço para brincar']
        },
        
        'SRD': {
            porte: 'variavel',
            pesoIdeal: { min: 3, max: 6 },
            pelagem: 'variavel',
            banho: { frequencia: 60, descricao: 'Gatos se limpam sozinhos' },
            tosa: { frequencia: 0, descricao: 'Avaliar necessidade' },
            caracteristicas: ['Características variadas', 'Geralmente resistente'],
            cuidadosEspeciais: ['Avaliar características individuais']
        }
    },
    
    /**
     * Obter informações de uma raça
     */
    obterRaca(especie, raca) {
        const base = especie === 'Cachorro' ? this.racasCachorros : this.racasGatos;
        return base[raca] || base['SRD'];
    },
    
    /**
     * Determinar porte baseado no peso
     */
    determinarPorte(peso) {
        if (peso < 10) return 'pequeno';
        if (peso < 25) return 'medio';
        return 'grande';
    },
    
    /**
     * Obter recomendações baseadas na raça
     */
    obterRecomendacoes(pet) {
        const info = this.obterRaca(pet.especie, pet.raca);
        
        return {
            porte: info.porte === 'variavel' ? this.determinarPorte(pet.peso?.[pet.peso.length - 1]?.valor || 10) : info.porte,
            pesoIdeal: info.pesoIdeal,
            pelagem: info.pelagem,
            banho: info.banho,
            tosa: info.tosa,
            caracteristicas: info.caracteristicas,
            cuidadosEspeciais: info.cuidadosEspeciais
        };
    }
};

// Exportar globalmente
window.BaseRacas = BaseRacas;

console.log('✅ Base de Raças carregada');
