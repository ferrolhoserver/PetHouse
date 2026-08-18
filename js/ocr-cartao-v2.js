/**
 * Módulo de OCR Inteligente para Cartão de Vacinação V2
 * Sistema avançado com análise local, normalização e prevenção de duplicatas
 */

const OCRCartaoV2 = {
    /**
     * Configuração da API OCR.space (fallback)
     */
    OCR_SPACE_API_KEY: 'K84642426988957', // API Key OCR.space
    
    /**
     * Comprimir imagem para respeitar limite de 1MB da API
     */
    async comprimirImagem(arquivo, maxSizeKB = 1024) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Reduzir dimensões se necessário (max 1920px)
                    const maxDimension = 1920;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Tentar diferentes qualidades até ficar < 1MB
                    let quality = 0.9;
                    let blob = null;
                    
                    const tryCompress = () => {
                        canvas.toBlob((b) => {
                            if (!b) {
                                reject(new Error('Falha ao comprimir imagem'));
                                return;
                            }
                            
                            const sizeKB = b.size / 1024;
                            
                            if (sizeKB <= maxSizeKB || quality <= 0.1) {
                                // Criar arquivo com nome original
                                const compressedFile = new File([b], arquivo.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                
                                console.log(`✅ [OCR] Imagem comprimida: ${(arquivo.size/1024).toFixed(0)}KB → ${sizeKB.toFixed(0)}KB`);
                                if (this.addDebugLog) this.addDebugLog(`Imagem comprimida: ${sizeKB.toFixed(0)}KB (qualidade ${Math.round(quality*100)}%)`);
                                
                                resolve(compressedFile);
                            } else {
                                // Tentar com qualidade menor
                                quality -= 0.1;
                                tryCompress();
                            }
                        }, 'image/jpeg', quality);
                    };
                    
                    tryCompress();
                };
                
                img.onerror = () => reject(new Error('Falha ao carregar imagem'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
            reader.readAsDataURL(arquivo);
        });
    },
    
    /**
     * Reconhecimento local do cartão. O nome é mantido para não quebrar chamadores legados.
     */
    async processarComAPI(arquivo) {
        try {
            const runtime = window.PetHouseOfflineRuntime;
            await runtime?.ensureTesseract?.();
            if (!window.Tesseract) throw new Error('Motor de leitura offline indisponível. Atualize o aplicativo e tente novamente.');
            if (this.addDebugLog) this.addDebugLog('Preparando imagem para leitura neste dispositivo...', 'info');
            if (this.updateProgress) this.updateProgress(30, 'Otimizando imagem localmente...');

            let arquivoFinal = arquivo;
            const sizeKB = arquivo.size / 1024;
            if (sizeKB > 1024) {
                if (this.addDebugLog) this.addDebugLog(`Imagem ${sizeKB.toFixed(0)}KB; otimizando localmente...`, 'info');
                arquivoFinal = await this.comprimirImagem(arquivo);
            }

            if (this.updateProgress) this.updateProgress(45, 'Lendo texto no dispositivo...');
            const worker = await Tesseract.createWorker(runtime?.OCR_LANGUAGE || 'por', 1, {
                ...(runtime?.OCR_OPTIONS || {}),
                logger: message => {
                    if (message.status === 'recognizing text' && this.updateProgress) {
                        this.updateProgress(45 + Math.round(message.progress * 45), 'Lendo texto no dispositivo...');
                    }
                }
            });
            const { data: { text: texto } } = await worker.recognize(arquivoFinal);
            await worker.terminate();

            if (!texto || texto.trim().length < 3) throw new Error('Não foi possível identificar texto suficiente na imagem.');
            if (this.updateProgress) this.updateProgress(95, 'Analisando informações...');
            if (this.addDebugLog) this.addDebugLog(`${texto.length} caracteres lidos localmente`, 'success');
            return texto;
        } catch (error) {
            console.error('Erro no OCR local:', error);
            if (this.addDebugLog) this.addDebugLog(`Erro no OCR local: ${error.message}`, 'error');
            throw error;
        }
    },
    
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
     * Processa imagem com OCR via API (simples e rápido)
     */
    async processarImagem(arquivo) {
        console.log('🔍 [OCR] Iniciando processamento via API...');
        console.log('🔍 [OCR] Arquivo:', arquivo ? arquivo.name : 'sem arquivo');
        
        try {
            if (!arquivo) {
                console.error('❌ [OCR] Nenhum arquivo fornecido');
                app.showToast('❌ Nenhum arquivo selecionado', 'error');
                return { sucesso: false, vacinas: [], textoCompleto: '', tipo: 'vacina' };
            }
            
            console.log('✅ [OCR] Arquivo válido, processando via API...');
            if (this.addDebugLog) this.addDebugLog('Processando via OCR.space API...');
            app.showToast('📸 Processando cartão de vacinação...', 'info');

            // Processar com API
            const text = await this.processarComAPI(arquivo);
            
            // Analisar texto
            if (this.updateProgress) this.updateProgress(80, 'Analisando texto...');
            if (this.addDebugLog) this.addDebugLog('Analisando vacinas no texto...');
            
            const resultado = await this.analisarTextoLocal(text, 'vacina');
            
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
            
            resultado.textoCompleto = text;
            return resultado;

        } catch (error) {
            console.error('❌ [OCR] ERRO:', error);
            console.error('❌ [OCR] Stack:', error.stack);
            console.error('❌ [OCR] Mensagem:', error.message);
            if (this.addDebugLog) this.addDebugLog(`Erro: ${error.message}`, 'error');
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

            // OCR local com arquivos empacotados no aplicativo.
            const runtime = window.PetHouseOfflineRuntime;
            await runtime?.ensureTesseract?.();
            if (!window.Tesseract) throw new Error('Motor de leitura offline indisponível.');
            const worker = await Tesseract.createWorker(runtime?.OCR_LANGUAGE || 'por', 1, runtime?.OCR_OPTIONS || {});
            const { data: { text } } = await worker.recognize(arquivo);
            await worker.terminate();

            console.log('=== TEXTO EXTRAÍDO (VERMÍFUGO) ===');
            console.log(text);

            // Análise inteligente LOCAL + IA
            const resultado = await this.analisarTextoLocal(text, 'vermifugo');
            
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
    async analisarTextoLocal(texto, tipo = 'vacina') {
        const textoLower = texto.toLowerCase();
        const linhas = texto.split('\n');
        
        // Extrair todas as datas primeiro
        const datas = this.extrairDatas(texto);
        console.log(`Datas encontradas: ${datas.length}`, datas);
        
        if (tipo === 'vacina') {
            return await this.analisarVacinas(texto, textoLower, linhas, datas);
        } else {
            return await this.analisarVermifugos(texto, textoLower, linhas, datas);
        }
    },

    /**
     * Analisa vacinas no texto
     */
    async analisarVacinas(texto, textoLower, linhas, datas) {
        const vacinas = [];
        const vacinasEncontradas = new Set();
        
        // 🤖 BUSCA COM IA (se disponível)
        if (typeof conhecimentoIA !== 'undefined') {
            console.log('🤖 [OCR] Tentando busca com IA...');
            try {
                const resultadosIA = await conhecimentoIA.buscarParaOCR(texto, 'vacinas');
                if (resultadosIA && resultadosIA.length > 0) {
                    console.log(`✅ [OCR] IA encontrou ${resultadosIA.length} vacinas`);
                    
                    // Adicionar vacinas encontradas pela IA ao banco local
                    resultadosIA.forEach(item => {
                        const chave = item.nome.toLowerCase().replace(/\s+/g, '');
                        if (!this.vacinasConhecidas[chave]) {
                            this.vacinasConhecidas[chave] = {
                                nome: item.nome,
                                tipo: item.metadados?.tipo_vacina || 'Desconhecido',
                                laboratorio: item.fabricante || '',
                                aliases: item.aliases || [item.nome.toLowerCase()],
                                keywords: item.keywords || [item.nome.toLowerCase()],
                                fonte: 'ia'
                            };
                        }
                        vacinasEncontradas.add(chave);
                        
                        // Registrar uso
                        conhecimentoIA.registrarUso(item.id, true);
                    });
                }
            } catch (error) {
                console.error('❌ [OCR] Erro na busca com IA:', error);
            }
        }
        
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
                <h2>${iconeTipo} Adicionar ${tituloTipo}</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div class="modal-body">
                <!-- TABS -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 2px solid #e0e0e0;">
                    <button id="tab-manual" class="tab-btn active" onclick="OCRCartaoV2.trocarTab('manual')" style="flex: 1; padding: 0.75rem; background: #2196F3; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold;">
                        ✏️ Entrada Manual
                    </button>
                    <button id="tab-ocr" class="tab-btn" onclick="OCRCartaoV2.trocarTab('ocr')" style="flex: 1; padding: 0.75rem; background: #e0e0e0; color: #666; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold;">
                        📸 Escanear Cartão
                    </button>
                </div>
                
                <!-- TAB: ENTRADA MANUAL -->
                <div id="tab-content-manual" class="tab-content" style="display: block;">
                    <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; color: #2e7d32;">
                            <strong>✅ Recomendado:</strong> Rápido, preciso e sempre funciona!
                        </p>
                    </div>
                    
                    <div id="formulario-manual-container"></div>
                </div>
                
                <!-- TAB: OCR -->
                <div id="tab-content-ocr" class="tab-content" style="display: none;">
                    <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; color: #856404;">
                            <strong>⚠️ Experimental:</strong> Pode demorar ou falhar. Use entrada manual se tiver problemas.
                        </p>
                    </div>
                    
                    <input type="file" 
                       id="foto-cartao-v2" 
                       accept="image/*" 
                       style="display: none;"
                       onchange="OCRCartaoV2.aoSelecionarFoto('${petId}', this.files[0], '${tipo}')">

                <div id="preview-container-v2" style="display: none; margin-bottom: 1rem;">
                    <img id="preview-imagem-v2" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>

                <div id="loading-ocr-v2" style="display: none; padding: 2rem;">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 3rem; animation: spin 1s linear infinite;">⌛</div>
                        <p id="loading-status-v2" style="margin-top: 1rem; color: #666; font-weight: bold;">Iniciando...</p>
                    </div>
                    
                    <!-- Barra de progresso -->
                    <div style="background: #e0e0e0; border-radius: 10px; overflow: hidden; height: 24px; margin-bottom: 1rem;">
                        <div id="progress-bar-v2" style="background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.85rem;"></div>
                    </div>
                    
                    <!-- Logs de debug -->
                    <details style="margin-top: 1rem; background: #f5f5f5; padding: 0.5rem; border-radius: 4px;">
                        <summary style="cursor: pointer; font-weight: bold; color: #666;">🔍 Ver logs de processamento</summary>
                        <div id="debug-logs-v2" style="margin-top: 0.5rem; padding: 0.5rem; background: #fff; border-radius: 4px; font-family: monospace; font-size: 0.75rem; max-height: 200px; overflow-y: auto; color: #333;"></div>
                    </details>
                </div>

                <div id="resultado-ocr-v2" style="display: none;"></div>

                <div id="botoes-container-v2" style="text-align: center; margin-top: 1rem;">
                    <button id="btn-selecionar-v2" class="btn btn-primary" onclick="document.getElementById('foto-cartao-v2').click()" style="font-size: 1.1rem; padding: 1rem 2rem;">
                        📸 Selecionar Foto do Cartão
                    </button>
                    <button id="btn-processar-v2" class="btn btn-primary" onclick="OCRCartaoV2.processarFotoSelecionada()" style="display: none; font-size: 1.1rem; padding: 1rem 2rem;">
                        ⚙️ Processar Foto
                    </button>
                    <button id="btn-trocar-v2" class="btn" onclick="OCRCartaoV2.trocarFoto()" style="display: none; margin-left: 0.5rem;">
                        🔄 Trocar Foto
                    </button>
                </div>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
        
        // Carregar formulário manual
        document.getElementById('formulario-manual-container').innerHTML = EntradaManualVacina.renderizarFormulario(petId, tipo);
    },
    
    /**
     * Trocar entre tabs
     */
    trocarTab(tab) {
        // Atualizar botões
        document.getElementById('tab-manual').className = tab === 'manual' ? 'tab-btn active' : 'tab-btn';
        document.getElementById('tab-ocr').className = tab === 'ocr' ? 'tab-btn active' : 'tab-btn';
        
        document.getElementById('tab-manual').style.background = tab === 'manual' ? '#2196F3' : '#e0e0e0';
        document.getElementById('tab-manual').style.color = tab === 'manual' ? 'white' : '#666';
        
        document.getElementById('tab-ocr').style.background = tab === 'ocr' ? '#2196F3' : '#e0e0e0';
        document.getElementById('tab-ocr').style.color = tab === 'ocr' ? 'white' : '#666';
        
        // Mostrar/esconder conteúdo
        document.getElementById('tab-content-manual').style.display = tab === 'manual' ? 'block' : 'none';
        document.getElementById('tab-content-ocr').style.display = tab === 'ocr' ? 'block' : 'none';
    },

    /**
     * Ao selecionar foto (apenas preview)
     */
    aoSelecionarFoto(petId, arquivo, tipo = 'vacina') {
        if (!arquivo) return;

        console.log('📸 [OCR] Foto selecionada:', arquivo.name);

        // Armazenar para processar depois
        this.fotoSelecionada = { petId, arquivo, tipo };

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview-imagem-v2').src = e.target.result;
            document.getElementById('preview-container-v2').style.display = 'block';
            
            // Atualizar botões
            document.getElementById('btn-selecionar-v2').style.display = 'none';
            document.getElementById('btn-processar-v2').style.display = 'inline-block';
            document.getElementById('btn-trocar-v2').style.display = 'inline-block';
            
            console.log('✅ [OCR] Preview carregado');
        };
        reader.readAsDataURL(arquivo);
    },

    /**
     * Adicionar log de debug
     */
    addDebugLog(message, type = 'info') {
        const logsDiv = document.getElementById('debug-logs-v2');
        if (!logsDiv) return;
        
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔵';
        const color = type === 'error' ? '#d32f2f' : type === 'success' ? '#388e3c' : type === 'warning' ? '#f57c00' : '#1976d2';
        
        const logEntry = document.createElement('div');
        logEntry.style.marginBottom = '4px';
        logEntry.style.color = color;
        logEntry.innerHTML = `[${timestamp}] ${icon} ${message}`;
        logsDiv.appendChild(logEntry);
        logsDiv.scrollTop = logsDiv.scrollHeight;
        
        console.log(`[OCR] ${message}`);
    },

    /**
     * Atualizar progresso
     */
    updateProgress(percent, status) {
        const progressBar = document.getElementById('progress-bar-v2');
        const statusText = document.getElementById('loading-status-v2');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
            progressBar.textContent = `${percent}%`;
        }
        
        if (statusText) {
            statusText.textContent = status;
        }
        
        this.addDebugLog(`${status} (${percent}%)`);
    },

    /**
     * Processar foto selecionada
     */
    async processarFotoSelecionada() {
        if (!this.fotoSelecionada) {
            app.showToast('⚠️ Selecione uma foto primeiro', 'warning');
            return;
        }

        const { petId, arquivo, tipo } = this.fotoSelecionada;
        
        // Limpar logs anteriores
        const logsDiv = document.getElementById('debug-logs-v2');
        if (logsDiv) logsDiv.innerHTML = '';
        
        this.addDebugLog(`Iniciando processamento de ${arquivo.name}`);
        this.addDebugLog(`Tamanho: ${(arquivo.size / 1024).toFixed(2)} KB`);
        this.addDebugLog(`Tipo: ${tipo}`);
        
        // Esconder botões e mostrar loading
        document.getElementById('botoes-container-v2').style.display = 'none';
        document.getElementById('loading-ocr-v2').style.display = 'block';
        
        // Resetar progresso
        this.updateProgress(0, 'Iniciando...');

        // Timeout de 30 segundos (API é rápida, mas pode demorar em conexão lenta)
        const timeoutId = setTimeout(() => {
            this.addDebugLog('TIMEOUT: Processamento demorou mais de 30 segundos', 'error');
            this.addDebugLog('Verifique sua conexão com a internet', 'warning');
            
            document.getElementById('loading-status-v2').textContent = '❌ Timeout!';
            document.getElementById('progress-bar-v2').style.background = '#f44336';
            
            document.getElementById('resultado-ocr-v2').innerHTML = `
                <div style="background: #ffebee; padding: 1rem; border-radius: 8px; border-left: 4px solid #d32f2f; margin-bottom: 1rem;">
                    <p style="margin: 0; color: #c62828;">
                        <strong>❌ Timeout: Processamento demorou demais</strong><br>
                        <span style="font-size: 0.9rem;">Verifique sua conexão e tente novamente.</span>
                    </p>
                    <button class="btn" onclick="const details = document.querySelector('details'); if(details) details.open = true;" style="margin-top: 0.5rem;">
                        🔍 Ver logs completos
                    </button>
                </div>
            `;
            document.getElementById('resultado-ocr-v2').style.display = 'block';
            
            setTimeout(() => {
                document.getElementById('loading-ocr-v2').style.display = 'none';
                document.getElementById('botoes-container-v2').style.display = 'block';
                document.getElementById('btn-selecionar-v2').style.display = 'inline-block';
                document.getElementById('btn-processar-v2').style.display = 'none';
                document.getElementById('btn-trocar-v2').style.display = 'none';
                this.fotoSelecionada = null;
                document.getElementById('preview-container-v2').style.display = 'none';
                document.getElementById('foto-cartao-v2').value = '';
            }, 2000);
            
            app.showToast('❌ Timeout: Verifique sua conexão', 'error');
        }, 30000); // 30 segundos

        try {
            this.updateProgress(10, 'Preparando envio...');
            this.updateProgress(20, 'Enviando para processamento...');
            
            // Processar com OCR
            let resultado;
            if (tipo === 'vermifugo') {
                this.updateProgress(30, 'Processando vermífugos...');
                resultado = await this.processarVermifugo(arquivo);
            } else {
                this.updateProgress(30, 'Processando vacinas...');
                resultado = await this.processarImagem(arquivo);
            }
            
            clearTimeout(timeoutId);
            
            this.updateProgress(90, 'Analisando resultados...');

            // Esconder loading
            document.getElementById('loading-ocr-v2').style.display = 'none';

            if (resultado && resultado.sucesso) {
                this.updateProgress(100, 'Concluído!');
                this.addDebugLog('Processamento concluído com sucesso!', 'success');
                this.mostrarResultado(petId, resultado, tipo);
            } else {
                this.addDebugLog('Nenhum dado reconhecido na imagem', 'warning');
                const msg = tipo === 'vermifugo' ? 'vermífugos' : 'vacinas';
                
                // Mostrar erro e botão para tentar novamente
                document.getElementById('resultado-ocr-v2').innerHTML = `
                    <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 1rem;">
                        <p style="margin: 0; color: #856404;">
                            <strong>⚠️ Não foi possível identificar ${msg}</strong><br>
                            <span style="font-size: 0.9rem;">Tente tirar outra foto com melhor iluminação ou texto mais legível.</span>
                        </p>
                        <button class="btn" onclick="const details = document.querySelector('#loading-ocr-v2 details'); if(details) details.open = true;" style="margin-top: 0.5rem;">
                            🔍 Ver logs de debug
                        </button>
                    </div>
                `;
                document.getElementById('resultado-ocr-v2').style.display = 'block';
                
                // Mostrar botão para tentar novamente
                document.getElementById('botoes-container-v2').style.display = 'block';
                document.getElementById('btn-selecionar-v2').style.display = 'inline-block';
                document.getElementById('btn-processar-v2').style.display = 'none';
                document.getElementById('btn-trocar-v2').style.display = 'none';
                
                app.showToast(`⚠️ Não foi possível identificar ${msg}`, 'warning');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            this.addDebugLog(`ERRO: ${error.message}`, 'error');
            this.addDebugLog(`Stack: ${error.stack}`, 'error');
            console.error('❌ [OCR] Erro no processamento:', error);
            
            document.getElementById('loading-ocr-v2').style.display = 'none';
            document.getElementById('botoes-container-v2').style.display = 'block';
            document.getElementById('btn-selecionar-v2').style.display = 'inline-block';
            document.getElementById('btn-processar-v2').style.display = 'none';
            document.getElementById('btn-trocar-v2').style.display = 'none';
            
            // Mostrar erro com logs
            document.getElementById('resultado-ocr-v2').innerHTML = `
                <div style="background: #ffebee; padding: 1rem; border-radius: 8px; border-left: 4px solid #d32f2f; margin-bottom: 1rem;">
                    <p style="margin: 0; color: #c62828;">
                        <strong>❌ Erro ao processar imagem</strong><br>
                        <span style="font-size: 0.9rem;">${error.message}</span>
                    </p>
                    <button class="btn" onclick="const details = document.querySelector('details'); if(details) details.open = true;" style="margin-top: 0.5rem;">
                        🔍 Ver logs completos
                    </button>
                </div>
            `;
            document.getElementById('resultado-ocr-v2').style.display = 'block';
            
            app.showToast('❌ Erro ao processar imagem', 'error');
        }
    },

    /**
     * Trocar foto
     */
    trocarFoto() {
        console.log('🔄 [OCR] Trocando foto...');
        
        // Limpar foto selecionada
        this.fotoSelecionada = null;
        
        // Esconder preview e resultado
        document.getElementById('preview-container-v2').style.display = 'none';
        document.getElementById('resultado-ocr-v2').style.display = 'none';
        document.getElementById('resultado-ocr-v2').innerHTML = '';
        
        // Resetar botões
        document.getElementById('btn-selecionar-v2').style.display = 'inline-block';
        document.getElementById('btn-processar-v2').style.display = 'none';
        document.getElementById('btn-trocar-v2').style.display = 'none';
        
        // Limpar input file
        document.getElementById('foto-cartao-v2').value = '';
    },

    /**
     * Processa arquivo selecionado (LEGADO - manter para compatibilidade)
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

                <!-- Botão para adicionar vacina não reconhecida -->
                <div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #856404;">
                        ⚠️ <strong>Vacina não reconhecida?</strong>
                    </p>
                    <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #856404;">
                        Ajude a melhorar o sistema adicionando esta vacina ao banco de dados!
                    </p>
                    <button class="btn" onclick="VacinasColaborativas.mostrarModalNovaVacina(\`${resultado.textoCompleto.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" style="background: #ffc107; color: #000;">
                        🎓 Adicionar Nova Vacina
                    </button>
                </div>

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
        
        // Esconder botão de seleção após processar
        const botaoSelecionar = document.querySelector('[onclick*="foto-cartao-v2"]');
        if (botaoSelecionar) {
            botaoSelecionar.style.display = 'none';
        }
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
