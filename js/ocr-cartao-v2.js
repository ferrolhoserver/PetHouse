/**
 * Módulo de OCR Inteligente para Cartão de Vacinação V2
 * Sistema avançado com análise local, normalização e prevenção de duplicatas
 */

const OCRCartaoV2 = {
    /**
     * Banco de dados expandido de vacinas conhecidas
     */
    vacinasConhecidas: {
        // Vanguard (Zoetis)
        'vanguard': { 
            nome: 'V10 (Déctupla)', 
            tipo: 'V10', 
            laboratorio: 'Zoetis', 
            aliases: ['vanguard', 'vanguard plus', 'vanguard p', 'vanguard®'],
            keywords: ['vanguard', 'cinomose', 'parainfluenza', 'coronavirus', 'leptospira']
        },
        
        // BronchiGuard (Zoetis)
        'bronchiguard': { 
            nome: 'Gripe Canina (KC)', 
            tipo: 'Gripe Canina', 
            laboratorio: 'Zoetis', 
            aliases: ['bronchiguard', 'bronchi guard', 'tosse dos canis', 'bordetella', 'bronchiguard®'],
            keywords: ['bronchi', 'tosse', 'bordetella', 'bronchiseptica']
        },
        
        // GiardiaVax (Zoetis)
        'giardiavax': { 
            nome: 'Giárdia', 
            tipo: 'Giárdia', 
            laboratorio: 'Zoetis', 
            aliases: ['giardiavax', 'giardia vax', 'giardia', 'giardíase', 'giardiavax®'],
            keywords: ['giardia', 'giardíase', 'inativada']
        },
        
        // Defensor (Zoetis)
        'defensor': { 
            nome: 'Antirrábica', 
            tipo: 'Antirrábica', 
            laboratorio: 'Zoetis', 
            aliases: ['defensor', 'raiva', 'antirrábica', 'antirrabica', 'defensor®'],
            keywords: ['defensor', 'raiva', 'inativada contra raiva', 'veterinário']
        },
        
        // Recombitek (Merial)
        'recombitek': { 
            nome: 'V8 (Óctupla)', 
            tipo: 'V8', 
            laboratorio: 'Merial', 
            aliases: ['recombitek'],
            keywords: ['recombitek']
        },
        
        // Nobivac (MSD)
        'nobivac': { 
            nome: 'V10 (Déctupla)', 
            tipo: 'V10', 
            laboratorio: 'MSD', 
            aliases: ['nobivac'],
            keywords: ['nobivac']
        },
        
        // Duramune (Boehringer)
        'duramune': { 
            nome: 'V8 (Óctupla)', 
            tipo: 'V8', 
            laboratorio: 'Boehringer', 
            aliases: ['duramune'],
            keywords: ['duramune']
        },
        
        // Versican (Zoetis)
        'versican': { 
            nome: 'V10 (Déctupla)', 
            tipo: 'V10', 
            laboratorio: 'Zoetis', 
            aliases: ['versican'],
            keywords: ['versican']
        },
        
        // Leish-Tec (Leishmaniose)
        'leish': { 
            nome: 'Leishmaniose', 
            tipo: 'Leishmaniose', 
            laboratorio: 'Ceva', 
            aliases: ['leish', 'leishmaniose', 'leish-tec', 'leishtec'],
            keywords: ['leish', 'leishmaniose']
        }
    },

    /**
     * Banco de dados de vermífugos conhecidos
     */
    vermifugosConhecidos: {
        'vetmax': { 
            nome: 'Vetmax Plus', 
            principios: ['Febendazol', 'Pamoato de Pirantel', 'Praziquantel'], 
            laboratorio: 'Ourofino',
            keywords: ['vetmax']
        },
        'drontal': { 
            nome: 'Drontal Plus', 
            principios: ['Febantel', 'Pamoato de Pirantel', 'Praziquantel'], 
            laboratorio: 'Bayer',
            keywords: ['drontal']
        },
        'endogard': { 
            nome: 'Endogard', 
            principios: ['Febantel', 'Pamoato de Pirantel', 'Praziquantel'], 
            laboratorio: 'Virbac',
            keywords: ['endogard']
        },
        'canex': { 
            nome: 'Canex Plus', 
            principios: ['Pamoato de Pirantel', 'Praziquantel'], 
            laboratorio: 'Ceva',
            keywords: ['canex']
        },
        'vermivet': { 
            nome: 'Vermivet', 
            principios: ['Pamoato de Pirantel', 'Praziquantel'], 
            laboratorio: 'Vetnil',
            keywords: ['vermivet']
        }
    },

    /**
     * Padrões regex melhorados
     */
    padroes: {
        // Datas em vários formatos
        data: /(\d{1,2})[\s\/\-\.](\d{1,2})[\s\/\-\.](\d{2,4})/g,
        
        // Lotes
        lote: /(?:lote|lot|l\.?|part|fabr|venc)\s*[:\/]?\s*([A-Z0-9\-\/]+)/gi,
        
        // Palavras-chave de revacinação
        revacinacao: /revacina[çc][ãa]o|refor[çc]o|2[ªº]?\s*dose|3[ªº]?\s*dose/gi,
        
        // Veterinário
        veterinario: /(?:vet|veterinário|dr|dra)\.?\s+([A-Za-zÀ-ÿ\s]+)/gi
    },

    /**
     * Processa imagem com OCR e análise local inteligente
     */
    async processarImagem(arquivo) {
        console.log('🔍 [OCR] Iniciando processamento...');
        console.log('🔍 [OCR] Arquivo:', arquivo ? arquivo.name : 'sem arquivo');
        
        try {
            if (!arquivo) {
                console.error('❌ [OCR] Nenhum arquivo fornecido');
                app.showToast('❌ Nenhum arquivo selecionado', 'error');
                return { sucesso: false, vacinas: [], textoCompleto: '', tipo: 'vacina' };
            }
            
            console.log('✅ [OCR] Arquivo válido, iniciando Tesseract...');
            app.showToast('📸 Processando cartão de vacinação...', 'info');

            // Etapa 1: Verificar se Tesseract está disponível
            if (typeof Tesseract === 'undefined') {
                console.error('❌ [OCR] Tesseract.js não está carregado!');
                app.showToast('❌ Biblioteca OCR não carregada. Recarregue a página.', 'error');
                return { sucesso: false, vacinas: [], textoCompleto: '', tipo: 'vacina' };
            }
            
            console.log('✅ [OCR] Tesseract disponível, criando worker...');

            // Etapa 2: Criar worker (Tesseract v5)
            const worker = await Tesseract.createWorker({
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progresso = Math.round(m.progress * 100);
                        console.log(`🔄 [OCR] Progresso: ${progresso}%`);
                    }
                }
            });
            
            console.log('✅ [OCR] Worker criado, carregando idioma português...');
            await worker.loadLanguage('por');
            await worker.initialize('por');
            
            console.log('✅ [OCR] Idioma carregado, reconhecendo texto...');

            // Etapa 3: Reconhecer texto
            const { data: { text } } = await worker.recognize(arquivo);
            await worker.terminate();
            
            console.log('✅ [OCR] Texto extraído com sucesso!');
            console.log('=== TEXTO EXTRAÍDO ===');
            console.log(text);
            console.log('=== FIM DO TEXTO ===');

            // Etapa 4: Análise inteligente LOCAL
            console.log('🧠 [OCR] Analisando texto...');
            const resultado = this.analisarTextoLocal(text, 'vacina');
            
            console.log('📊 [OCR] Resultado da análise:', resultado);
            
            if (resultado.vacinas && resultado.vacinas.length > 0) {
                console.log(`✅ [OCR] ${resultado.vacinas.length} vacina(s) identificada(s)!`);
                app.showToast(`✅ ${resultado.vacinas.length} vacina(s) identificada(s)!`, 'success');
                resultado.sucesso = true;
            } else {
                console.log('⚠️ [OCR] Nenhuma vacina identificada');
                app.showToast('⚠️ Nenhuma vacina identificada. Tente outra foto.', 'warning');
                resultado.sucesso = false;
            }
            
            return resultado;

        } catch (error) {
            console.error('❌ [OCR] ERRO CAPTURADO:', error);
            console.error('❌ [OCR] Stack:', error.stack);
            console.error('❌ [OCR] Mensagem:', error.message);
            app.showToast(`❌ Erro: ${error.message}`, 'error');
            return { sucesso: false, vacinas: [], textoCompleto: '', tipo: 'vacina' };
        }
    },

    /**
     * Processa vermífugos (mesma lógica de vacinas)
     */
    async processarVermifugo(arquivo) {
        try {
            app.showToast('🐛 Processando cartão de vermífugos...', 'info');

            // OCR básico (Tesseract v5)
            const worker = await Tesseract.createWorker();
            await worker.loadLanguage('por');
            await worker.initialize('por');
            const { data: { text } } = await worker.recognize(arquivo);
            await worker.terminate();

            console.log('=== TEXTO EXTRAÍDO (VERMÍFUGO) ===');
            console.log(text);

            // Análise inteligente LOCAL
            const resultado = this.analisarTextoLocal(text, 'vermifugo');
            
            if (resultado.vermifugos && resultado.vermifugos.length > 0) {
                app.showToast(`✅ ${resultado.vermifugos.length} vermífugo(s) identificado(s)!`, 'success');
            } else {
                app.showToast('⚠️ Nenhum vermífugo identificado. Tente outra foto.', 'warning');
            }
            
            return resultado;

        } catch (error) {
            console.error('Erro no OCR de vermífugo:', error);
            app.showToast('❌ Erro ao processar imagem', 'error');
            return null;
        }
    },

    /**
     * Análise inteligente LOCAL do texto extraído
     */
    analisarTextoLocal(texto, tipo = 'vacina') {
        const textoLower = texto.toLowerCase();
        const linhas = texto.split('\n');
        
        // Extrair todas as datas primeiro
        const datas = this.extrairDatas(texto);
        console.log(`Datas encontradas: ${datas.length}`, datas);
        
        if (tipo === 'vacina') {
            return this.analisarVacinas(texto, textoLower, linhas, datas);
        } else {
            return this.analisarVermifugos(texto, textoLower, linhas, datas);
        }
    },

    /**
     * Analisa vacinas no texto
     */
    analisarVacinas(texto, textoLower, linhas, datas) {
        const vacinas = [];
        const vacinasEncontradas = new Set();
        
        // Identificar vacinas presentes
        for (const [chave, vacina] of Object.entries(this.vacinasConhecidas)) {
            // Verificar aliases
            for (const alias of vacina.aliases) {
                if (textoLower.includes(alias.toLowerCase())) {
                    vacinasEncontradas.add(chave);
                    console.log(`✓ Vacina encontrada: ${vacina.nome} (via alias: ${alias})`);
                    break;
                }
            }
            
            // Verificar keywords
            if (!vacinasEncontradas.has(chave)) {
                for (const keyword of vacina.keywords) {
                    if (textoLower.includes(keyword.toLowerCase())) {
                        vacinasEncontradas.add(chave);
                        console.log(`✓ Vacina encontrada: ${vacina.nome} (via keyword: ${keyword})`);
                        break;
                    }
                }
            }
        }
        
        console.log(`Total de vacinas diferentes identificadas: ${vacinasEncontradas.size}`);
        
        // Para cada vacina encontrada, buscar suas aplicações
        for (const chave of vacinasEncontradas) {
            const vacina = this.vacinasConhecidas[chave];
            const aplicacoes = this.buscarAplicacoes(texto, textoLower, linhas, vacina, datas);
            
            console.log(`${vacina.nome}: ${aplicacoes.length} aplicação(ões)`);
            
            for (const app of aplicacoes) {
                vacinas.push({
                    nome: vacina.nome,
                    tipo: vacina.tipo,
                    laboratorio: vacina.laboratorio,
                    data: app.data,
                    dose: app.dose,
                    lote: app.lote,
                    veterinario: app.veterinario,
                    proximaDose: app.proximaDose
                });
            }
        }
        
        // Se não encontrou vacinas específicas mas tem datas, criar registros genéricos
        if (vacinas.length === 0 && datas.length > 0) {
            console.log('⚠️ Nenhuma vacina específica identificada, criando registros genéricos...');
            
            // Verificar se tem indicação de revacinação
            const temRevacinacao = /revacina[çc][ãa]o/gi.test(texto);
            
            if (temRevacinacao) {
                datas.forEach((data, idx) => {
                    vacinas.push({
                        nome: 'Revacinação',
                        tipo: 'Revacinação',
                        laboratorio: 'Não identificado',
                        data: data,
                        dose: `${idx + 1}ª aplicação`,
                        lote: '',
                        veterinario: '',
                        proximaDose: null
                    });
                });
            }
        }
        
        return {
            vacinas: vacinas,
            sucesso: vacinas.length > 0,
            textoCompleto: texto,
            tipo: 'vacina'
        };
    },

    /**
     * Busca aplicações de uma vacina específica
     */
    buscarAplicacoes(texto, textoLower, linhas, vacina, todasDatas) {
        const aplicacoes = [];
        
        // Encontrar contexto da vacina no texto
        const nomeVacina = vacina.aliases[0];
        const regexVacina = new RegExp(nomeVacina, 'gi');
        let match;
        const posicoes = [];
        
        while ((match = regexVacina.exec(texto)) !== null) {
            posicoes.push(match.index);
        }
        
        console.log(`  Posições de "${nomeVacina}": ${posicoes.length}`);
        
        // Se encontrou a vacina no texto, buscar datas próximas
        if (posicoes.length > 0) {
            for (const pos of posicoes) {
                // Pegar contexto (300 caracteres antes e depois)
                const inicio = Math.max(0, pos - 300);
                const fim = Math.min(texto.length, pos + 300);
                const contexto = texto.substring(inicio, fim);
                
                // Buscar datas no contexto
                const datasContexto = this.extrairDatas(contexto);
                
                if (datasContexto.length > 0) {
                    // Usar a primeira data encontrada
                    const data = datasContexto[0];
                    
                    // Buscar lote
                    const lote = this.extrairLote(contexto);
                    
                    // Determinar dose
                    let dose = '1ª dose';
                    if (/revacina[çc][ãa]o|refor[çc]o|2[ªº]?\s*dose/gi.test(contexto)) {
                        dose = 'Revacinação';
                    } else if (/3[ªº]?\s*dose/gi.test(contexto)) {
                        dose = '3ª dose';
                    }
                    
                    aplicacoes.push({
                        data: data,
                        dose: dose,
                        lote: lote,
                        veterinario: '',
                        proximaDose: this.calcularProximaDose(data, dose)
                    });
                }
            }
        }
        
        // Se não encontrou aplicações mas a vacina está presente, usar datas genéricas
        if (aplicacoes.length === 0 && todasDatas.length > 0) {
            // Usar primeira data disponível
            aplicacoes.push({
                data: todasDatas[0],
                dose: '1ª dose',
                lote: '',
                veterinario: '',
                proximaDose: this.calcularProximaDose(todasDatas[0], '1ª dose')
            });
        }
        
        return aplicacoes;
    },

    /**
     * Analisa vermífugos no texto
     */
    analisarVermifugos(texto, textoLower, linhas, datas) {
        const vermifugos = [];
        
        // Identificar vermífugos presentes
        for (const [chave, vermifugo] of Object.entries(this.vermifugosConhecidos)) {
            for (const keyword of vermifugo.keywords) {
                if (textoLower.includes(keyword.toLowerCase())) {
                    // Para cada data, criar um registro
                    datas.forEach((data, idx) => {
                        vermifugos.push({
                            produto: vermifugo.nome,
                            principios: vermifugo.principios,
                            laboratorio: vermifugo.laboratorio,
                            data: data,
                            proximaDose: this.calcularProximaDoseVermifugo(data)
                        });
                    });
                    break;
                }
            }
        }
        
        return {
            vermifugos: vermifugos,
            sucesso: vermifugos.length > 0,
            textoCompleto: texto,
            tipo: 'vermifugo'
        };
    },

    /**
     * Extrai datas do texto
     */
    extrairDatas(texto) {
        const datas = [];
        const regex = /(\d{1,2})[\s\/\-\.](\d{1,2})[\s\/\-\.](\d{2,4})/g;
        let match;
        
        while ((match = regex.exec(texto)) !== null) {
            let dia = match[1].padStart(2, '0');
            let mes = match[2].padStart(2, '0');
            let ano = match[3];
            
            // Corrigir ano de 2 dígitos
            if (ano.length === 2) {
                const anoNum = parseInt(ano);
                ano = anoNum > 50 ? '19' + ano : '20' + ano;
            }
            
            // Validar data
            const diaNum = parseInt(dia);
            const mesNum = parseInt(mes);
            
            if (diaNum >= 1 && diaNum <= 31 && mesNum >= 1 && mesNum <= 12) {
                const dataFormatada = `${ano}-${mes}-${dia}`;
                
                // Evitar duplicatas
                if (!datas.includes(dataFormatada)) {
                    datas.push(dataFormatada);
                }
            }
        }
        
        return datas;
    },

    /**
     * Extrai lote do texto
     */
    extrairLote(texto) {
        const match = /(?:lote|lot|l\.?|part|fabr|venc)\s*[:\/]?\s*([A-Z0-9\-\/]+)/gi.exec(texto);
        return match ? match[1] : '';
    },

    /**
     * Calcula próxima dose (vacina)
     */
    calcularProximaDose(dataStr, dose) {
        if (dose.toLowerCase().includes('revacinação') || dose.toLowerCase().includes('reforço')) {
            // Revacinação anual
            const data = new Date(dataStr);
            data.setFullYear(data.getFullYear() + 1);
            return data.toISOString().split('T')[0];
        } else if (dose === '1ª dose') {
            // 2ª dose após 21-30 dias
            const data = new Date(dataStr);
            data.setDate(data.getDate() + 21);
            return data.toISOString().split('T')[0];
        }
        return null;
    },

    /**
     * Calcula próxima dose (vermífugo)
     */
    calcularProximaDoseVermifugo(dataStr) {
        // Vermífugo a cada 3 meses
        const data = new Date(dataStr);
        data.setMonth(data.getMonth() + 3);
        return data.toISOString().split('T')[0];
    },

    /**
     * Verifica se é duplicata
     */
    verificarDuplicata(pet, vacina) {
        if (!pet.vacinas || pet.vacinas.length === 0) return false;
        
        const dataVacina = new Date(vacina.data);
        const nomeVacinaNorm = vacina.nome.toLowerCase().trim();
        
        for (const v of pet.vacinas) {
            const dataExistente = new Date(v.data);
            const nomeExistenteNorm = v.nome.toLowerCase().trim();
            
            // Mesma vacina
            const mesmaVacina = nomeExistenteNorm.includes(nomeVacinaNorm) || 
                               nomeVacinaNorm.includes(nomeExistenteNorm);
            
            // Diferença de até 3 dias
            const diffDias = Math.abs((dataVacina - dataExistente) / (1000 * 60 * 60 * 24));
            const mesmaData = diffDias <= 3;
            
            if (mesmaVacina && mesmaData) {
                return true;
            }
        }
        
        return false;
    },

    /**
     * Modal de escaneamento
     */
    mostrarEscaneamento(petId, tipo = 'vacina') {
        const tituloTipo = tipo === 'vermifugo' ? 'Vermifugação' : 'Vacinação';
        const iconeTipo = tipo === 'vermifugo' ? '🐛' : '💉';
        
        const modalContent = `
            <div class="modal-header">
                <h2>📸 Escanear Cartão de ${tituloTipo}</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #1976d2;">📱 Como usar:</h4>
                    <ol style="margin: 0; padding-left: 1.5rem; color: #555;">
                        <li>Tire uma foto clara do cartão de ${tipo === 'vermifugo' ? 'vermifugação' : 'vacinação'}</li>
                        <li>Certifique-se de que o texto está legível</li>
                        <li>O sistema lerá automaticamente as ${tipo === 'vermifugo' ? 'vermifugações' : 'vacinas'}, datas e lotes</li>
                        <li>Revise os dados antes de salvar</li>
                    </ol>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                        ${iconeTipo} <strong>Dica:</strong> Boa iluminação e foto nítida melhoram o resultado!<br>
                        Formatos aceitos: JPG, PNG
                    </p>
                </div>

                <input type="file" 
                       id="foto-cartao-v2" 
                       accept="image/*" 
                       style="display: none;"
                       onchange="OCRCartaoV2.processarArquivo('${petId}', this.files[0], '${tipo}')">

                <div id="preview-container-v2" style="display: none; margin-bottom: 1rem;">
                    <img id="preview-imagem-v2" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>

                <div id="resultado-ocr-v2" style="display: none;"></div>

                <div style="text-align: center; margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="document.getElementById('foto-cartao-v2').click()" style="font-size: 1.1rem; padding: 1rem 2rem;">
                        📸 Selecionar Foto do Cartão
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
    },

    /**
     * Processa arquivo selecionado
     */
    async processarArquivo(petId, arquivo, tipo = 'vacina') {
        if (!arquivo) return;

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview-imagem-v2').src = e.target.result;
            document.getElementById('preview-container-v2').style.display = 'block';
        };
        reader.readAsDataURL(arquivo);

        // Processar com OCR
        let resultado;
        if (tipo === 'vermifugo') {
            resultado = await this.processarVermifugo(arquivo);
        } else {
            resultado = await this.processarImagem(arquivo);
        }

        if (resultado && resultado.sucesso) {
            this.mostrarResultado(petId, resultado, tipo);
        } else {
            const msg = tipo === 'vermifugo' ? 'vermífugos' : 'vacinas';
            app.showToast(`❌ Não foi possível identificar ${msg} no cartão`, 'error');
        }
    },

    /**
     * Mostra resultado do OCR
     */
    mostrarResultado(petId, resultado, tipo = 'vacina') {
        const pet = app.data.pets.find(p => p.id === petId);
        
        let vacinasHTML = '';
        
        // Renderizar vacinas
        if (tipo === 'vacina' && resultado.vacinas) {
            vacinasHTML = resultado.vacinas.map((v, idx) => {
                const isDuplicata = this.verificarDuplicata(pet, v);
                const corBorda = isDuplicata ? '#f44336' : '#4caf50';
                const iconeStatus = isDuplicata ? '⚠️' : '✅';
                const labelStatus = isDuplicata ? 'JÁ EXISTE' : 'NOVA';
                
                return `
                <div style="background: white; padding: 1rem; border-radius: 4px; border-left: 4px solid ${corBorda}; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <h4 style="margin: 0; color: ${corBorda};">
                                    ${iconeStatus} ${v.nome}
                                </h4>
                                ${isDuplicata ? '<span style="background: #f44336; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">DUPLICATA</span>' : ''}
                            </div>
                            ${v.laboratorio ? `<p style="margin: 0; font-size: 0.85rem; color: #666;">Laboratório: ${v.laboratorio}</p>` : ''}
                            ${v.data ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Data: ${new Date(v.data).toLocaleDateString('pt-BR')}</p>` : ''}
                            ${v.dose ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Dose: ${v.dose}</p>` : ''}
                            ${v.lote ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Lote: ${v.lote}</p>` : ''}
                            ${v.proximaDose ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #ff9800;">Próxima dose: ${new Date(v.proximaDose).toLocaleDateString('pt-BR')}</p>` : ''}
                        </div>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" 
                                   id="vacina-${idx}" 
                                   ${isDuplicata ? '' : 'checked'}
                                   style="width: 20px; height: 20px;">
                            <span style="font-size: 0.85rem; color: #666;">Importar</span>
                        </label>
                    </div>
                </div>
            `}).join('');
        }

        // Renderizar vermífugos se for o caso
        if (tipo === 'vermifugo' && resultado.vermifugos) {
            vacinasHTML = resultado.vermifugos.map((v, idx) => {
                return `
                <div style="background: white; padding: 1rem; border-radius: 4px; border-left: 4px solid #ff9800; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin: 0 0 0.5rem 0; color: #ff9800;">
                                ✅ ${v.produto}
                            </h4>
                            ${v.principios ? `<p style="margin: 0; font-size: 0.85rem; color: #666;">Princípios: ${v.principios.join(', ')}</p>` : ''}
                            ${v.data ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Data: ${new Date(v.data).toLocaleDateString('pt-BR')}</p>` : ''}
                            ${v.proximaDose ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #ff9800;">Próxima dose: ${new Date(v.proximaDose).toLocaleDateString('pt-BR')}</p>` : ''}
                        </div>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" 
                                   id="vermifugo-${idx}" 
                                   checked
                                   style="width: 20px; height: 20px;">
                            <span style="font-size: 0.85rem; color: #666;">Importar</span>
                        </label>
                    </div>
                </div>
            `}).join('');
        }

        const tituloSecao = tipo === 'vermifugo' ? '🐛 Vermífugos Identificados' : '📋 Vacinas Identificadas';
        const botaoTexto = tipo === 'vermifugo' ? 'Escanear Vermífugo' : 'Escanear Vacina';

        const resultadoHTML = `
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px;">
                <h3 style="margin: 0 0 1rem 0;">${tituloSecao}</h3>
                
                ${vacinasHTML}

                <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn" onclick="OCRCartaoV2.mostrarEscaneamento('${petId}', '${tipo}')">
                        🔄 ${botaoTexto} Novamente
                    </button>
                    <button class="btn btn-primary" onclick="OCRCartaoV2.importarDados('${petId}', ${JSON.stringify(resultado).replace(/"/g, '&quot;')}, '${tipo}')">
                        ✅ Importar Selecionadas
                    </button>
                </div>

                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; color: #666; font-size: 0.9rem;">Ver texto extraído</summary>
                    <pre style="background: white; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.75rem; overflow-x: auto;">${resultado.textoCompleto}</pre>
                </details>
            </div>
        `;
        
        document.getElementById('resultado-ocr-v2').innerHTML = resultadoHTML;
        document.getElementById('resultado-ocr-v2').style.display = 'block';
    },

    /**
     * Importa dados selecionados
     */
    importarDados(petId, resultado, tipo = 'vacina') {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) return;

        let importadas = 0;

        if (tipo === 'vermifugo' && resultado.vermifugos) {
            if (!pet.vermifugo) pet.vermifugo = [];

            resultado.vermifugos.forEach((vermifugo, idx) => {
                const checkbox = document.getElementById(`vermifugo-${idx}`);
                
                if (checkbox && checkbox.checked) {
                    pet.vermifugo.push({
                        id: Date.now() + idx,
                        produto: vermifugo.produto,
                        principios: vermifugo.principios ? vermifugo.principios.join(', ') : '',
                        data: vermifugo.data,
                        proxima: vermifugo.proximaDose || null,
                        obs: 'Importado via OCR',
                        cor: '#ff9800',
                        tipo: 'vermifugo',
                        importado: true
                    });
                    importadas++;
                }
            });

            if (importadas > 0) {
                app.saveData();
                app.showToast(`✅ ${importadas} vermífugo${importadas > 1 ? 's' : ''} importado${importadas > 1 ? 's' : ''} com sucesso!`, 'success');
                app.closeModal();
                app.showPetDetails(petId);
            } else {
                app.showToast('⚠️ Nenhum vermífugo foi importado', 'warning');
            }
        } else {
            // Importar vacinas
            if (!pet.vacinas) pet.vacinas = [];

            resultado.vacinas.forEach((vacina, idx) => {
                const checkbox = document.getElementById(`vacina-${idx}`);
                
                if (checkbox && checkbox.checked) {
                    // Verificar duplicata novamente
                    if (!this.verificarDuplicata(pet, vacina)) {
                        pet.vacinas.push({
                            id: Date.now() + idx,
                            nome: vacina.nome,
                            tipo: vacina.tipo || 'Vacina',
                            data: vacina.data,
                            proxima: vacina.proximaDose || null,
                            lote: vacina.lote || '',
                            veterinario: vacina.veterinario || '',
                            obs: `Importado via OCR - ${vacina.dose || ''}`,
                            cor: '#4caf50',
                            tipo_registro: 'vacina',
                            importado: true
                        });
                        importadas++;
                    }
                }
            });

            if (importadas > 0) {
                app.saveData();
                app.showToast(`✅ ${importadas} vacina${importadas > 1 ? 's' : ''} importada${importadas > 1 ? 's' : ''} com sucesso!`, 'success');
                app.closeModal();
                app.showPetDetails(petId);
            } else {
                app.showToast('⚠️ Nenhuma vacina foi importada', 'warning');
            }
        }
    }
};

// Exportar para uso global
window.OCRCartaoV2 = OCRCartaoV2;
