/**
 * Módulo de OCR para Cartão de Vacinação
 * Usa Tesseract.js para leitura automática e inteligente
 */

const OCRCartao = {
    /**
     * Banco de dados de vacinas conhecidas
     */
    vacinasConhecidas: {
        // Vanguard
        'vanguard': { tipo: 'v10', nome: 'Vanguard Plus (V10)', laboratorio: 'Zoetis' },
        'vanguard p': { tipo: 'v10', nome: 'Vanguard P (V10)', laboratorio: 'Zoetis' },
        'vanguard plus': { tipo: 'v10', nome: 'Vanguard Plus (V10)', laboratorio: 'Zoetis' },
        
        // BronchiGuard
        'bronchiguard': { tipo: 'gripe_canina', nome: 'BronchiGuard (Tosse dos Canis)', laboratorio: 'Zoetis' },
        'bronchi guard': { tipo: 'gripe_canina', nome: 'BronchiGuard (Tosse dos Canis)', laboratorio: 'Zoetis' },
        
        // GiardiaVax
        'giardiavax': { tipo: 'giardia', nome: 'GiardiaVax', laboratorio: 'Zoetis' },
        'giardia vax': { tipo: 'giardia', nome: 'GiardiaVax', laboratorio: 'Zoetis' },
        
        // Defensor
        'defensor': { tipo: 'antirrabica', nome: 'Defensor (Antirrábica)', laboratorio: 'Zoetis' },
        
        // Recombitek
        'recombitek': { tipo: 'v8', nome: 'Recombitek (V8)', laboratorio: 'Merial' },
        
        // Nobivac
        'nobivac': { tipo: 'v10', nome: 'Nobivac (V10)', laboratorio: 'MSD' },
        
        // Duramune
        'duramune': { tipo: 'v8', nome: 'Duramune (V8)', laboratorio: 'Boehringer' },
        
        // Genéricas
        'v8': { tipo: 'v8', nome: 'V8 (Óctupla)' },
        'v10': { tipo: 'v10', nome: 'V10 (Déctupla)' },
        'v12': { tipo: 'v12', nome: 'V12' },
        'antirrábica': { tipo: 'antirrabica', nome: 'Antirrábica' },
        'antirrabica': { tipo: 'antirrabica', nome: 'Antirrábica' },
        'raiva': { tipo: 'antirrabica', nome: 'Antirrábica' }
    },

    /**
     * Padrões regex para extração
     */
    padroes: {
        // Datas no formato DD/MM/YY ou DD/MM/YYYY
        data: /(\d{2})[\s\/\-](\d{2})[\s\/\-](\d{2,4})/g,
        
        // Lotes
        lote: /(?:lote|lot|l\.?)\s*:?\s*([A-Z0-9\-]+)/gi,
        
        // Validade
        validade: /(?:val|validade|exp)\s*:?\s*(\d{2}\/\d{2}\/\d{2,4})/gi,
        
        // Fabricação
        fabricacao: /(?:fab|fabricação|mfg)\s*:?\s*(\d{2}\/\d{2}\/\d{2,4})/gi
    },

    /**
     * Processa imagem com OCR
     */
    async processarImagem(arquivo) {
        try {
            // Mostrar loading
            app.showToast('📸 Processando imagem...', 'info');

            // Criar worker do Tesseract
            const worker = await Tesseract.createWorker('por', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progresso = Math.round(m.progress * 100);
                        console.log(`OCR: ${progresso}%`);
                    }
                }
            });

            // Processar imagem
            const { data: { text } } = await worker.recognize(arquivo);
            await worker.terminate();

            console.log('Texto extraído:', text);

            // Analisar texto
            const resultado = this.analisarTexto(text);
            
            return resultado;

        } catch (error) {
            console.error('Erro no OCR:', error);
            app.showToast('❌ Erro ao processar imagem', 'error');
            return null;
        }
    },

    /**
     * Analisa texto extraído e identifica vacinas
     */
    analisarTexto(texto) {
        const textoLower = texto.toLowerCase();
        const linhas = texto.split('\n');
        
        const vacinas = [];
        const datas = [];
        const lotes = [];

        // Extrair todas as datas
        let match;
        while ((match = this.padroes.data.exec(texto)) !== null) {
            const dia = match[1];
            const mes = match[2];
            let ano = match[3];
            
            // Converter ano de 2 dígitos para 4
            if (ano.length === 2) {
                ano = parseInt(ano) > 50 ? '19' + ano : '20' + ano;
            }
            
            datas.push(`${ano}-${mes}-${dia}`);
        }

        // Extrair lotes
        this.padroes.lote.lastIndex = 0;
        while ((match = this.padroes.lote.exec(texto)) !== null) {
            lotes.push(match[1]);
        }

        // Identificar vacinas
        for (const [chave, vacina] of Object.entries(this.vacinasConhecidas)) {
            if (textoLower.includes(chave)) {
                vacinas.push({
                    ...vacina,
                    encontrado: true
                });
            }
        }

        // Se não encontrou vacinas específicas, tentar identificar por padrões
        if (vacinas.length === 0) {
            // Procurar por "REVACINAÇÃO" para contar doses
            const revacinacoes = (texto.match(/revacina[çc][ãa]o/gi) || []).length;
            
            if (revacinacoes > 0) {
                vacinas.push({
                    tipo: 'v10',
                    nome: 'Vacina Polivalente (V10)',
                    encontrado: false,
                    sugestao: true
                });
            }
        }

        // Agrupar datas em pares (aplicação + revacinação)
        const registros = [];
        for (let i = 0; i < datas.length; i += 2) {
            if (datas[i]) {
                registros.push({
                    dataAplicacao: datas[i],
                    dataRevacinacao: datas[i + 1] || null
                });
            }
        }

        return {
            vacinas: vacinas,
            registros: registros,
            lotes: lotes,
            textoCompleto: texto,
            sucesso: vacinas.length > 0 || registros.length > 0
        };
    },

    /**
     * Modal de escaneamento
     */
    mostrarEscaneamento(petId) {
        const modalContent = `
            <div class="modal-header">
                <h2>📸 Escanear Cartão de Vacinação</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                        📱 <strong>Como usar:</strong><br>
                        1. Tire uma foto clara do cartão de vacinação<br>
                        2. Certifique-se de que o texto está legível<br>
                        3. O sistema lerá automaticamente as vacinas, datas e lotes<br>
                        4. Revise os dados antes de salvar
                    </p>
                </div>

                <div style="text-align: center; padding: 2rem; border: 2px dashed #ccc; border-radius: 8px; margin-bottom: 1rem; cursor: pointer;" 
                     onclick="document.getElementById('foto-cartao').click();">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📸</div>
                    <p style="margin: 0; color: #666; font-size: 1.1rem;">
                        <strong>Clique para tirar foto ou selecionar imagem</strong>
                    </p>
                    <p style="margin: 0.5rem 0 0 0; color: #999; font-size: 0.9rem;">
                        Formatos aceitos: JPG, PNG
                    </p>
                </div>

                <input type="file" 
                       id="foto-cartao" 
                       accept="image/*" 
                       capture="environment"
                       style="display: none;"
                       onchange="OCRCartao.processarArquivo('${petId}', this.files[0])">

                <div id="preview-container" style="display: none; margin-bottom: 1rem;">
                    <img id="preview-imagem" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>

                <div id="resultado-ocr" style="display: none;"></div>

                <div style="background: #fff3cd; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                    <p style="margin: 0; font-size: 0.85rem; color: #856404;">
                        💡 <strong>Dicas para melhor resultado:</strong><br>
                        • Boa iluminação<br>
                        • Foto nítida (sem tremor)<br>
                        • Cartão plano (sem dobras)<br>
                        • Texto bem visível
                    </p>
                </div>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
    },

    /**
     * Processa arquivo selecionado
     */
    async processarArquivo(petId, arquivo) {
        if (!arquivo) return;

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview-imagem').src = e.target.result;
            document.getElementById('preview-container').style.display = 'block';
        };
        reader.readAsDataURL(arquivo);

        // Processar com OCR
        const resultado = await this.processarImagem(arquivo);

        if (resultado && resultado.sucesso) {
            this.mostrarResultado(petId, resultado);
        } else {
            app.showToast('❌ Não foi possível identificar vacinas no cartão', 'error');
        }
    },

    /**
     * Mostra resultado do OCR
     */
    mostrarResultado(petId, resultado) {
        const pet = app.data.pets.find(p => p.id === petId);
        
        let vacinasHTML = '';
        
        if (resultado.vacinas.length > 0) {
            vacinasHTML = resultado.vacinas.map((v, idx) => `
                <div style="background: white; padding: 1rem; border-radius: 4px; border-left: 4px solid #4caf50; margin-bottom: 0.75rem;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #4caf50;">
                        ${v.encontrado ? '✅' : '💡'} ${v.nome}
                    </h4>
                    ${v.laboratorio ? `<p style="margin: 0; font-size: 0.85rem; color: #666;">Laboratório: ${v.laboratorio}</p>` : ''}
                    ${v.sugestao ? '<p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #ff9800;">Sugestão baseada no contexto</p>' : ''}
                </div>
            `).join('');
        }

        let registrosHTML = '';
        
        if (resultado.registros.length > 0) {
            registrosHTML = `
                <h4 style="margin: 1rem 0 0.5rem 0;">📅 Datas Encontradas:</h4>
                ${resultado.registros.map((r, idx) => `
                    <div style="background: white; padding: 0.75rem; border-radius: 4px; border-left: 4px solid #2196F3; margin-bottom: 0.5rem;">
                        <p style="margin: 0; font-size: 0.9rem;">
                            <strong>Aplicação:</strong> ${new Date(r.dataAplicacao).toLocaleDateString('pt-BR')}
                            ${r.dataRevacinacao ? `<br><strong>Revacinação:</strong> ${new Date(r.dataRevacinacao).toLocaleDateString('pt-BR')}` : ''}
                        </p>
                    </div>
                `).join('')}
            `;
        }

        let lotesHTML = '';
        
        if (resultado.lotes.length > 0) {
            lotesHTML = `
                <h4 style="margin: 1rem 0 0.5rem 0;">🏷️ Lotes Encontrados:</h4>
                <p style="margin: 0; font-size: 0.9rem; color: #666;">
                    ${resultado.lotes.join(', ')}
                </p>
            `;
        }

        const resultadoHTML = `
            <div id="resultado-ocr" style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <h3 style="margin: 0 0 1rem 0; color: #4caf50;">✅ Cartão Escaneado!</h3>
                
                ${vacinasHTML}
                ${registrosHTML}
                ${lotesHTML}

                <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn" onclick="OCRCartao.mostrarEscaneamento('${petId}')">
                        🔄 Escanear Novamente
                    </button>
                    <button class="btn btn-primary" onclick="OCRCartao.importarDados('${petId}', ${JSON.stringify(resultado).replace(/"/g, '&quot;')})">
                        ✅ Importar Dados
                    </button>
                </div>

                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; color: #666; font-size: 0.85rem;">Ver texto completo extraído</summary>
                    <pre style="background: white; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.8rem; overflow-x: auto;">${resultado.textoCompleto}</pre>
                </details>
            </div>
        `;

        document.getElementById('resultado-ocr').innerHTML = resultadoHTML;
        document.getElementById('resultado-ocr').style.display = 'block';
    },

    /**
     * Importa dados para o sistema
     */
    importarDados(petId, resultado) {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) return;

        let totalImportado = 0;

        // Para cada vacina encontrada
        resultado.vacinas.forEach((vacina, idx) => {
            // Para cada registro de data
            resultado.registros.forEach((registro, regIdx) => {
                const vacinaRegistro = {
                    id: Date.now().toString() + idx + regIdx,
                    nome: vacina.nome,
                    data: registro.dataAplicacao,
                    proxima: registro.dataRevacinacao || null,
                    lote: resultado.lotes[regIdx] || '',
                    veterinario: '',
                    obs: 'Importado automaticamente via OCR',
                    cor: '#4caf50',
                    tipo: 'vacina',
                    importado: true
                };

                // Adicionar ao pet
                if (!pet.vacinas) pet.vacinas = [];
                pet.vacinas.push(vacinaRegistro);

                // Criar alarme se houver próxima dose
                if (vacinaRegistro.proxima && window.Alarmes) {
                    window.Alarmes.agendarAlarme(
                        pet.nome,
                        'vacina',
                        vacinaRegistro.proxima,
                        `${vacinaRegistro.nome} - Revacinação`
                    );
                }

                totalImportado++;
            });
        });

        // Salvar
        app.saveData();
        app.closeModal();
        app.showToast(`✅ ${totalImportado} vacina(s) importada(s) com sucesso!`, 'success');
        app.render();
    }
};

// Exportar para uso global
window.OCRCartao = OCRCartao;
