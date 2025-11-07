/**
 * Módulo de OCR para Exames Laboratoriais
 * Extrai dados de hemogramas, bioquímicos e outros exames
 */

const OCRExames = {
    /**
     * Parâmetros conhecidos de exames
     */
    parametros: {
        // Hemograma
        hemograma: {
            'hemácias': { nome: 'Hemácias', unidade: 'milhões/µL', min: 5.5, max: 8.5, tipo: 'hemograma' },
            'hemacias': { nome: 'Hemácias', unidade: 'milhões/µL', min: 5.5, max: 8.5, tipo: 'hemograma' },
            'eritrócitos': { nome: 'Hemácias', unidade: 'milhões/µL', min: 5.5, max: 8.5, tipo: 'hemograma' },
            'rbc': { nome: 'Hemácias', unidade: 'milhões/µL', min: 5.5, max: 8.5, tipo: 'hemograma' },
            
            'hemoglobina': { nome: 'Hemoglobina', unidade: 'g/dL', min: 12, max: 18, tipo: 'hemograma' },
            'hb': { nome: 'Hemoglobina', unidade: 'g/dL', min: 12, max: 18, tipo: 'hemograma' },
            'hgb': { nome: 'Hemoglobina', unidade: 'g/dL', min: 12, max: 18, tipo: 'hemograma' },
            
            'hematócrito': { nome: 'Hematócrito', unidade: '%', min: 37, max: 55, tipo: 'hemograma' },
            'hematocrito': { nome: 'Hematócrito', unidade: '%', min: 37, max: 55, tipo: 'hemograma' },
            'ht': { nome: 'Hematócrito', unidade: '%', min: 37, max: 55, tipo: 'hemograma' },
            'hct': { nome: 'Hematócrito', unidade: '%', min: 37, max: 55, tipo: 'hemograma' },
            
            'leucócitos': { nome: 'Leucócitos', unidade: '/µL', min: 6000, max: 17000, tipo: 'hemograma' },
            'leucocitos': { nome: 'Leucócitos', unidade: '/µL', min: 6000, max: 17000, tipo: 'hemograma' },
            'wbc': { nome: 'Leucócitos', unidade: '/µL', min: 6000, max: 17000, tipo: 'hemograma' },
            
            'plaquetas': { nome: 'Plaquetas', unidade: '/µL', min: 200000, max: 500000, tipo: 'hemograma' },
            'plt': { nome: 'Plaquetas', unidade: '/µL', min: 200000, max: 500000, tipo: 'hemograma' }
        },
        
        // Bioquímica
        bioquimica: {
            'ureia': { nome: 'Ureia', unidade: 'mg/dL', min: 20, max: 60, tipo: 'bioquimica' },
            'urea': { nome: 'Ureia', unidade: 'mg/dL', min: 20, max: 60, tipo: 'bioquimica' },
            'bun': { nome: 'Ureia', unidade: 'mg/dL', min: 20, max: 60, tipo: 'bioquimica' },
            
            'creatinina': { nome: 'Creatinina', unidade: 'mg/dL', min: 0.5, max: 1.5, tipo: 'bioquimica' },
            'creat': { nome: 'Creatinina', unidade: 'mg/dL', min: 0.5, max: 1.5, tipo: 'bioquimica' },
            'crea': { nome: 'Creatinina', unidade: 'mg/dL', min: 0.5, max: 1.5, tipo: 'bioquimica' },
            
            'alt': { nome: 'ALT (TGP)', unidade: 'U/L', min: 10, max: 100, tipo: 'bioquimica' },
            'tgp': { nome: 'ALT (TGP)', unidade: 'U/L', min: 10, max: 100, tipo: 'bioquimica' },
            'alanina': { nome: 'ALT (TGP)', unidade: 'U/L', min: 10, max: 100, tipo: 'bioquimica' },
            
            'ast': { nome: 'AST (TGO)', unidade: 'U/L', min: 10, max: 50, tipo: 'bioquimica' },
            'tgo': { nome: 'AST (TGO)', unidade: 'U/L', min: 10, max: 50, tipo: 'bioquimica' },
            'aspartato': { nome: 'AST (TGO)', unidade: 'U/L', min: 10, max: 50, tipo: 'bioquimica' },
            
            'fosfatase alcalina': { nome: 'Fosfatase Alcalina', unidade: 'U/L', min: 20, max: 150, tipo: 'bioquimica' },
            'fa': { nome: 'Fosfatase Alcalina', unidade: 'U/L', min: 20, max: 150, tipo: 'bioquimica' },
            'alp': { nome: 'Fosfatase Alcalina', unidade: 'U/L', min: 20, max: 150, tipo: 'bioquimica' },
            
            'glicose': { nome: 'Glicose', unidade: 'mg/dL', min: 70, max: 120, tipo: 'bioquimica' },
            'glucose': { nome: 'Glicose', unidade: 'mg/dL', min: 70, max: 120, tipo: 'bioquimica' },
            'glu': { nome: 'Glicose', unidade: 'mg/dL', min: 70, max: 120, tipo: 'bioquimica' },
            
            'albumina': { nome: 'Albumina', unidade: 'g/dL', min: 2.5, max: 4.0, tipo: 'bioquimica' },
            'alb': { nome: 'Albumina', unidade: 'g/dL', min: 2.5, max: 4.0, tipo: 'bioquimica' },
            
            'proteínas totais': { nome: 'Proteínas Totais', unidade: 'g/dL', min: 5.5, max: 7.5, tipo: 'bioquimica' },
            'proteinas totais': { nome: 'Proteínas Totais', unidade: 'g/dL', min: 5.5, max: 7.5, tipo: 'bioquimica' },
            'pt': { nome: 'Proteínas Totais', unidade: 'g/dL', min: 5.5, max: 7.5, tipo: 'bioquimica' }
        },
        
        // Eletrólitos
        eletrolitos: {
            'sódio': { nome: 'Sódio', unidade: 'mEq/L', min: 140, max: 155, tipo: 'eletrolitos' },
            'sodio': { nome: 'Sódio', unidade: 'mEq/L', min: 140, max: 155, tipo: 'eletrolitos' },
            'na': { nome: 'Sódio', unidade: 'mEq/L', min: 140, max: 155, tipo: 'eletrolitos' },
            
            'potássio': { nome: 'Potássio', unidade: 'mEq/L', min: 3.5, max: 5.5, tipo: 'eletrolitos' },
            'potassio': { nome: 'Potássio', unidade: 'mEq/L', min: 3.5, max: 5.5, tipo: 'eletrolitos' },
            'k': { nome: 'Potássio', unidade: 'mEq/L', min: 3.5, max: 5.5, tipo: 'eletrolitos' },
            
            'cálcio': { nome: 'Cálcio', unidade: 'mg/dL', min: 9, max: 11.5, tipo: 'eletrolitos' },
            'calcio': { nome: 'Cálcio', unidade: 'mg/dL', min: 9, max: 11.5, tipo: 'eletrolitos' },
            'ca': { nome: 'Cálcio', unidade: 'mg/dL', min: 9, max: 11.5, tipo: 'eletrolitos' },
            
            'fósforo': { nome: 'Fósforo', unidade: 'mg/dL', min: 2.5, max: 6.0, tipo: 'eletrolitos' },
            'fosforo': { nome: 'Fósforo', unidade: 'mg/dL', min: 2.5, max: 6.0, tipo: 'eletrolitos' },
            'p': { nome: 'Fósforo', unidade: 'mg/dL', min: 2.5, max: 6.0, tipo: 'eletrolitos' }
        }
    },

    /**
     * Processa imagem ou PDF com OCR
     */
    async processarArquivo(arquivo) {
        try {
            app.showToast('📄 Processando exame...', 'info');

            let texto = '';

            // Se for PDF, converter para imagens primeiro
            if (arquivo.type === 'application/pdf') {
                texto = await this.processarPDF(arquivo);
            } else {
                // Processar imagem diretamente
                const worker = await Tesseract.createWorker('por', 1, {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const progresso = Math.round(m.progress * 100);
                            console.log(`OCR Exame: ${progresso}%`);
                        }
                    }
                });

                const { data: { text } } = await worker.recognize(arquivo);
                await worker.terminate();
                texto = text;
            }

            console.log('Texto extraído do exame:', texto);

            // Analisar texto
            const resultado = this.analisarExame(texto);
            
            return resultado;

        } catch (error) {
            console.error('Erro no OCR de exame:', error);
            app.showToast('❌ Erro ao processar exame', 'error');
            return null;
        }
    },

    /**
     * Processa PDF (converte para imagem e faz OCR)
     */
    async processarPDF(arquivo) {
        // Por enquanto, retornar mensagem
        app.showToast('📄 PDFs serão suportados em breve. Use foto por enquanto.', 'info');
        return '';
    },

    /**
     * Analisa texto do exame e extrai parâmetros
     */
    analisarExame(texto) {
        const textoLower = texto.toLowerCase();
        const linhas = texto.split('\n');
        
        const parametrosEncontrados = [];
        const data = this.extrairData(texto);

        // Combinar todos os parâmetros
        const todosParametros = {
            ...this.parametros.hemograma,
            ...this.parametros.bioquimica,
            ...this.parametros.eletrolitos
        };

        // Para cada linha, tentar identificar parâmetro + valor
        linhas.forEach(linha => {
            const linhaLower = linha.toLowerCase();
            
            // Procurar cada parâmetro conhecido
            for (const [chave, param] of Object.entries(todosParametros)) {
                if (linhaLower.includes(chave)) {
                    // Extrair valor numérico da linha
                    const valores = linha.match(/(\d+[.,]?\d*)/g);
                    
                    if (valores && valores.length > 0) {
                        // Pegar o primeiro valor numérico encontrado
                        let valor = parseFloat(valores[0].replace(',', '.'));
                        
                        // Verificar se está dentro do range normal
                        const status = this.verificarStatus(valor, param.min, param.max);
                        
                        parametrosEncontrados.push({
                            nome: param.nome,
                            valor: valor,
                            unidade: param.unidade,
                            min: param.min,
                            max: param.max,
                            status: status,
                            tipo: param.tipo
                        });
                        
                        break; // Não procurar mais parâmetros nesta linha
                    }
                }
            }
        });

        return {
            data: data,
            parametros: parametrosEncontrados,
            textoCompleto: texto,
            sucesso: parametrosEncontrados.length > 0
        };
    },

    /**
     * Extrai data do exame
     */
    extrairData(texto) {
        const padraoData = /(\d{2})[\s\/\-](\d{2})[\s\/\-](\d{2,4})/;
        const match = texto.match(padraoData);
        
        if (match) {
            const dia = match[1];
            const mes = match[2];
            let ano = match[3];
            
            if (ano.length === 2) {
                ano = parseInt(ano) > 50 ? '19' + ano : '20' + ano;
            }
            
            return `${ano}-${mes}-${dia}`;
        }
        
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Verifica status do parâmetro
     */
    verificarStatus(valor, min, max) {
        if (valor < min) {
            return { tipo: 'baixo', cor: '#2196F3', icone: '↓', texto: 'Abaixo' };
        } else if (valor > max) {
            return { tipo: 'alto', cor: '#f44336', icone: '↑', texto: 'Acima' };
        } else {
            return { tipo: 'normal', cor: '#4caf50', icone: '✓', texto: 'Normal' };
        }
    },

    /**
     * Compara dois exames
     */
    compararExames(exameAntigo, exameNovo) {
        const comparacoes = [];

        exameNovo.parametros.forEach(paramNovo => {
            const paramAntigo = exameAntigo.parametros.find(p => p.nome === paramNovo.nome);
            
            if (paramAntigo) {
                const diferenca = paramNovo.valor - paramAntigo.valor;
                const percentual = ((diferenca / paramAntigo.valor) * 100).toFixed(1);
                
                let tendencia = {
                    icone: '→',
                    cor: '#999',
                    texto: 'Estável'
                };
                
                if (diferenca > 0) {
                    tendencia = {
                        icone: '↑',
                        cor: '#f44336',
                        texto: `+${percentual}%`
                    };
                } else if (diferenca < 0) {
                    tendencia = {
                        icone: '↓',
                        cor: '#2196F3',
                        texto: `${percentual}%`
                    };
                }
                
                comparacoes.push({
                    nome: paramNovo.nome,
                    valorAntigo: paramAntigo.valor,
                    valorNovo: paramNovo.valor,
                    diferenca: diferenca,
                    percentual: percentual,
                    tendencia: tendencia,
                    unidade: paramNovo.unidade
                });
            }
        });

        return comparacoes;
    },

    /**
     * Gera dados para gráfico de evolução
     */
    gerarDadosGrafico(exames, parametro) {
        const dados = exames
            .filter(e => e.parametros.some(p => p.nome === parametro))
            .map(e => {
                const param = e.parametros.find(p => p.nome === parametro);
                return {
                    data: e.data,
                    valor: param.valor,
                    status: param.status
                };
            })
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        return dados;
    },

    /**
     * Modal de escaneamento de exame
     */
    mostrarEscaneamento(petId) {
        const modalContent = `
            <div class="modal-header">
                <h2>📄 Escanear Exame Laboratorial</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                        🔬 <strong>Exames suportados:</strong><br>
                        • Hemograma completo<br>
                        • Bioquímica (ureia, creatinina, ALT, AST, etc.)<br>
                        • Eletrólitos (sódio, potássio, cálcio, fósforo)<br>
                        • Proteínas, glicose, albumina
                    </p>
                </div>

                <div style="text-align: center; padding: 2rem; border: 2px dashed #ccc; border-radius: 8px; margin-bottom: 1rem; cursor: pointer;" 
                     onclick="document.getElementById('foto-exame').click();">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📄</div>
                    <p style="margin: 0; color: #666; font-size: 1.1rem;">
                        <strong>Clique para selecionar foto do exame</strong>
                    </p>
                    <p style="margin: 0.5rem 0 0 0; color: #999; font-size: 0.9rem;">
                        Formatos: JPG, PNG (PDF em breve)
                    </p>
                </div>

                <input type="file" 
                       id="foto-exame" 
                       accept="image/*,application/pdf" 
                       style="display: none;"
                       onchange="OCRExames.processarEMostrar('${petId}', this.files[0])">

                <div id="preview-exame" style="display: none; margin-bottom: 1rem;">
                    <img id="preview-imagem-exame" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>

                <div id="resultado-exame" style="display: none;"></div>

                <div style="background: #fff3cd; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                    <p style="margin: 0; font-size: 0.85rem; color: #856404;">
                        💡 <strong>Dicas:</strong><br>
                        • Foto nítida e bem iluminada<br>
                        • Todos os valores visíveis<br>
                        • Sem reflexos ou sombras<br>
                        • Texto legível
                    </p>
                </div>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
    },

    /**
     * Processa e mostra resultado
     */
    async processarEMostrar(petId, arquivo) {
        if (!arquivo) return;

        // Mostrar preview se for imagem
        if (arquivo.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-imagem-exame').src = e.target.result;
                document.getElementById('preview-exame').style.display = 'block';
            };
            reader.readAsDataURL(arquivo);
        }

        // Processar com OCR
        const resultado = await this.processarArquivo(arquivo);

        if (resultado && resultado.sucesso) {
            this.mostrarResultado(petId, resultado);
        } else {
            app.showToast('❌ Não foi possível extrair dados do exame', 'error');
        }
    },

    /**
     * Mostra resultado do OCR
     */
    mostrarResultado(petId, resultado) {
        const pet = app.data.pets.find(p => p.id === petId);
        
        // Agrupar por tipo
        const hemograma = resultado.parametros.filter(p => p.tipo === 'hemograma');
        const bioquimica = resultado.parametros.filter(p => p.tipo === 'bioquimica');
        const eletrolitos = resultado.parametros.filter(p => p.tipo === 'eletrolitos');

        const renderGrupo = (titulo, parametros, cor) => {
            if (parametros.length === 0) return '';
            
            return `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0 0 0.75rem 0; color: ${cor}; border-bottom: 2px solid ${cor}; padding-bottom: 0.25rem;">
                        ${titulo}
                    </h4>
                    ${parametros.map(p => `
                        <div style="background: white; padding: 0.75rem; border-radius: 4px; border-left: 4px solid ${p.status.cor}; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${p.nome}</strong>
                                <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
                                    Referência: ${p.min} - ${p.max} ${p.unidade}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 1.2rem; font-weight: bold; color: ${p.status.cor};">
                                    ${p.valor} ${p.unidade}
                                </div>
                                <div style="font-size: 0.85rem; color: ${p.status.cor};">
                                    ${p.status.icone} ${p.status.texto}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        };

        const resultadoHTML = `
            <div id="resultado-exame" style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <h3 style="margin: 0 0 0.5rem 0; color: #4caf50;">✅ Exame Processado!</h3>
                <p style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem;">
                    Data: ${new Date(resultado.data).toLocaleDateString('pt-BR')}<br>
                    ${resultado.parametros.length} parâmetros encontrados
                </p>
                
                ${renderGrupo('🔴 Hemograma', hemograma, '#e91e63')}
                ${renderGrupo('🧪 Bioquímica', bioquimica, '#2196F3')}
                ${renderGrupo('⚡ Eletrólitos', eletrolitos, '#ff9800')}

                <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn" onclick="OCRExames.mostrarEscaneamento('${petId}')">
                        🔄 Escanear Outro
                    </button>
                    <button class="btn btn-primary" onclick="OCRExames.salvarExame('${petId}', ${JSON.stringify(resultado).replace(/"/g, '&quot;')})">
                        ✅ Salvar Exame
                    </button>
                </div>

                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; color: #666; font-size: 0.85rem;">Ver texto completo extraído</summary>
                    <pre style="background: white; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.8rem; overflow-x: auto;">${resultado.textoCompleto}</pre>
                </details>
            </div>
        `;

        document.getElementById('resultado-exame').innerHTML = resultadoHTML;
        document.getElementById('resultado-exame').style.display = 'block';
    },

    /**
     * Salva exame no prontuário
     */
    salvarExame(petId, resultado) {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) return;

        const exame = {
            id: Date.now().toString(),
            data: resultado.data,
            tipo: 'laboratorial',
            parametros: resultado.parametros,
            textoCompleto: resultado.textoCompleto,
            importado: true,
            timestamp: new Date().toISOString()
        };

        // Adicionar ao pet
        if (!pet.exames) pet.exames = [];
        pet.exames.push(exame);

        // Salvar
        app.saveData();
        app.closeModal();
        app.showToast('✅ Exame salvo com sucesso!', 'success');
        app.render();
    }
};

// Exportar para uso global
window.OCRExames = OCRExames;
