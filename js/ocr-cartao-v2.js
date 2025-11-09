/**
 * Módulo de OCR Inteligente para Cartão de Vacinação V2
 * Sistema avançado com IA, normalização e prevenção de duplicatas
 */

const OCRCartaoV2 = {
    /**
     * Banco de dados expandido de vacinas conhecidas
     */
    vacinasConhecidas: {
        // Vanguard (Zoetis)
        'vanguard': { nome: 'V10 (Déctupla)', tipo: 'V10', laboratorio: 'Zoetis', aliases: ['vanguard', 'vanguard plus', 'vanguard p'] },
        
        // BronchiGuard (Zoetis)
        'bronchiguard': { nome: 'Gripe Canina (KC)', tipo: 'Gripe Canina', laboratorio: 'Zoetis', aliases: ['bronchiguard', 'bronchi guard', 'tosse dos canis', 'bordetella'] },
        
        // GiardiaVax (Zoetis)
        'giardiavax': { nome: 'Giárdia (1ª dose)', tipo: 'Giárdia', laboratorio: 'Zoetis', aliases: ['giardiavax', 'giardia vax', 'giardia', 'giardíase'] },
        
        // Defensor (Zoetis)
        'defensor': { nome: 'Antirrábica', tipo: 'Antirrábica', laboratorio: 'Zoetis', aliases: ['defensor', 'raiva', 'antirrábica', 'antirrabica'] },
        
        // Recombitek (Merial)
        'recombitek': { nome: 'V8 (Óctupla)', tipo: 'V8', laboratorio: 'Merial', aliases: ['recombitek'] },
        
        // Nobivac (MSD)
        'nobivac': { nome: 'V10 (Déctupla)', tipo: 'V10', laboratorio: 'MSD', aliases: ['nobivac'] },
        
        // Duramune (Boehringer)
        'duramune': { nome: 'V8 (Óctupla)', tipo: 'V8', laboratorio: 'Boehringer', aliases: ['duramune'] },
        
        // Versican (Zoetis)
        'versican': { nome: 'V10 (Déctupla)', tipo: 'V10', laboratorio: 'Zoetis', aliases: ['versican'] },
        
        // Leish-Tec (Leishmaniose)
        'leish': { nome: 'Leishmaniose (1ª dose)', tipo: 'Leishmaniose', laboratorio: 'Ceva', aliases: ['leish', 'leishmaniose', 'leish-tec', 'leishtec'] }
    },

    /**
     * Banco de dados de vermífugos conhecidos
     */
    vermifugosConhecidos: {
        'vetmax': { nome: 'Vetmax Plus', principios: ['Febendazol', 'Pamoato de Pirantel', 'Praziquantel'], laboratorio: 'Ourofino' },
        'drontal': { nome: 'Drontal Plus', principios: ['Febantel', 'Pamoato de Pirantel', 'Praziquantel'], laboratorio: 'Bayer' },
        'endogard': { nome: 'Endogard', principios: ['Febantel', 'Pamoato de Pirantel', 'Praziquantel'], laboratorio: 'Virbac' },
        'canex': { nome: 'Canex Plus', principios: ['Pamoato de Pirantel', 'Praziquantel'], laboratorio: 'Ceva' },
        'vermivet': { nome: 'Vermivet', principios: ['Pamoato de Pirantel', 'Praziquantel'], laboratorio: 'Vetnil' }
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
     * Processa imagem com OCR usando LLM para interpretação inteligente
     */
    async processarImagem(arquivo) {
        try {
            app.showToast('📸 Processando imagem com IA...', 'info');

            // Etapa 1: OCR básico com Tesseract
            const worker = await Tesseract.createWorker('por', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progresso = Math.round(m.progress * 100);
                        console.log(`OCR: ${progresso}%`);
                    }
                }
            });

            const { data: { text } } = await worker.recognize(arquivo);
            await worker.terminate();

            console.log('Texto extraído:', text);

            // Etapa 2: Análise inteligente com LLM
            const resultado = await this.analisarComIA(text);
            
            return resultado;

        } catch (error) {
            console.error('Erro no OCR:', error);
            app.showToast('❌ Erro ao processar imagem', 'error');
            return null;
        }
    },

    /**
     * Analisa texto usando LLM para interpretação inteligente
     */
    async analisarComIA(texto) {
        try {
            // Preparar prompt para o LLM
            const prompt = `Você é um especialista em análise de cartões de vacinação veterinária.

Analise o texto extraído de um cartão de vacinação e identifique:

1. **Vacinas aplicadas** (nome comercial e tipo)
2. **Datas de aplicação** (formato DD/MM/AAAA)
3. **Lotes** (se disponíveis)
4. **Veterinário** (se mencionado)

**Regras importantes:**
- Normalize nomes de vacinas para o padrão brasileiro
- Vanguard/Vanguard Plus → "V10 (Déctupla)"
- BronchiGuard → "Gripe Canina (KC)"
- GiardiaVax → "Giárdia (1ª dose)"
- Defensor → "Antirrábica"
- Identifique se é 1ª dose, revacinação ou reforço
- Converta anos de 2 dígitos (25 → 2025, 26 → 2026)

**Texto do cartão:**
${texto}

**Responda APENAS com um JSON válido no formato:**
{
  "vacinas": [
    {
      "nome": "V10 (Déctupla)",
      "tipo": "V10",
      "laboratorio": "Zoetis",
      "data": "2025-11-07",
      "dose": "1ª dose",
      "lote": "ABC123",
      "veterinario": "José Horácio",
      "proximaDose": "2025-11-28"
    }
  ],
  "sucesso": true
}`;

            // Chamar LLM
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY || window.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4.1-mini',
                    messages: [
                        { role: 'system', content: 'Você é um assistente especializado em análise de cartões de vacinação veterinária. Responda sempre com JSON válido.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error('Erro na API do LLM');
            }

            const data = await response.json();
            const jsonText = data.choices[0].message.content.trim();
            
            // Extrair JSON (remover markdown se houver)
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Resposta inválida do LLM');
            }

            const resultado = JSON.parse(jsonMatch[0]);
            
            // Adicionar texto completo
            resultado.textoCompleto = texto;
            
            return resultado;

        } catch (error) {
            console.error('Erro na análise com IA:', error);
            
            // Fallback: análise básica sem IA
            return this.analisarTextoBasico(texto);
        }
    },

    /**
     * Análise básica (fallback sem IA)
     */
    analisarTextoBasico(texto) {
        const textoLower = texto.toLowerCase();
        const vacinas = [];
        const datas = [];

        // Extrair datas
        let match;
        this.padroes.data.lastIndex = 0;
        while ((match = this.padroes.data.exec(texto)) !== null) {
            const dia = match[1].padStart(2, '0');
            const mes = match[2].padStart(2, '0');
            let ano = match[3];
            
            if (ano.length === 2) {
                ano = parseInt(ano) > 50 ? '19' + ano : '20' + ano;
            }
            
            datas.push(`${ano}-${mes}-${dia}`);
        }

        // Identificar vacinas
        for (const [chave, vacina] of Object.entries(this.vacinasConhecidas)) {
            for (const alias of vacina.aliases) {
                if (textoLower.includes(alias)) {
                    vacinas.push({
                        nome: vacina.nome,
                        tipo: vacina.tipo,
                        laboratorio: vacina.laboratorio,
                        data: datas[0] || null,
                        dose: '1ª dose',
                        encontrado: true
                    });
                    break;
                }
            }
        }

        return {
            vacinas: vacinas,
            sucesso: vacinas.length > 0,
            textoCompleto: texto
        };
    },

    /**
     * Verifica se vacina já existe (prevenção de duplicatas)
     */
    verificarDuplicata(pet, vacina) {
        if (!pet.vacinas || pet.vacinas.length === 0) {
            return false;
        }

        // Tolerância de 3 dias
        const dataVacina = new Date(vacina.data);
        const tolerancia = 3 * 24 * 60 * 60 * 1000; // 3 dias em ms

        for (const v of pet.vacinas) {
            const dataExistente = new Date(v.data);
            const diferencaDias = Math.abs(dataVacina - dataExistente);

            // Mesma vacina e data próxima = duplicata
            if (v.nome === vacina.nome && diferencaDias <= tolerancia) {
                return true;
            }
        }

        return false;
    },

    /**
     * Processa vermífugos (mesma lógica de vacinas)
     */
    async processarVermifugo(arquivo) {
        try {
            app.showToast('🐛 Processando cartão de vermífugos...', 'info');

            // OCR básico
            const worker = await Tesseract.createWorker('por', 1);
            const { data: { text } } = await worker.recognize(arquivo);
            await worker.terminate();

            console.log('Texto extraído (vermífugo):', text);

            // Análise inteligente
            const resultado = await this.analisarVermifugoComIA(text);
            
            return resultado;

        } catch (error) {
            console.error('Erro no OCR de vermífugo:', error);
            app.showToast('❌ Erro ao processar imagem', 'error');
            return null;
        }
    },

    /**
     * Analisa vermífugos com IA
     */
    async analisarVermifugoComIA(texto) {
        try {
            const prompt = `Você é um especialista em análise de cartões de vermifugação veterinária.

Analise o texto extraído e identifique:

1. **Produto vermífugo** (nome comercial)
2. **Princípios ativos**
3. **Datas de aplicação**
4. **Próxima dose** (geralmente 3-6 meses depois)

**Produtos conhecidos:**
- Vetmax Plus (Febendazol, Pamoato de Pirantel, Praziquantel)
- Drontal Plus (Febantel, Pamoato de Pirantel, Praziquantel)
- Endogard, Canex Plus, Vermivet

**Texto do cartão:**
${texto}

**Responda APENAS com JSON válido:**
{
  "vermifugos": [
    {
      "produto": "Vetmax Plus",
      "principios": ["Febendazol 200 mg", "Pamoato de Pirantel 144 mg", "Praziquantel 50 mg"],
      "data": "2025-11-06",
      "proximaDose": "2026-02-06"
    }
  ],
  "sucesso": true
}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY || window.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4.1-mini',
                    messages: [
                        { role: 'system', content: 'Você é um assistente especializado em análise de cartões de vermifugação. Responda sempre com JSON válido.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 1500
                })
            });

            if (!response.ok) throw new Error('Erro na API do LLM');

            const data = await response.json();
            const jsonText = data.choices[0].message.content.trim();
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) throw new Error('Resposta inválida do LLM');

            const resultado = JSON.parse(jsonMatch[0]);
            resultado.textoCompleto = texto;
            resultado.tipo = 'vermifugo';
            
            return resultado;

        } catch (error) {
            console.error('Erro na análise de vermífugo com IA:', error);
            return this.analisarVermifugoBasico(texto);
        }
    },

    /**
     * Análise básica de vermífugos (fallback)
     */
    analisarVermifugoBasico(texto) {
        const textoLower = texto.toLowerCase();
        const vermifugos = [];
        const datas = [];

        // Extrair datas
        let match;
        this.padroes.data.lastIndex = 0;
        while ((match = this.padroes.data.exec(texto)) !== null) {
            const dia = match[1].padStart(2, '0');
            const mes = match[2].padStart(2, '0');
            let ano = match[3];
            
            if (ano.length === 2) {
                ano = parseInt(ano) > 50 ? '19' + ano : '20' + ano;
            }
            
            datas.push(`${ano}-${mes}-${dia}`);
        }

        // Identificar vermífugos
        for (const [chave, vermifugo] of Object.entries(this.vermifugosConhecidos)) {
            if (textoLower.includes(chave)) {
                vermifugos.push({
                    produto: vermifugo.nome,
                    principios: vermifugo.principios,
                    data: datas[0] || null,
                    encontrado: true
                });
                break;
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
     * Modal de escaneamento
     */
    mostrarEscaneamento(petId, tipo = 'vacina') {
        const modalContent = `
                <div class="modal-header">
                <h2>📸 Escanear Cartão de ${tipo === 'vermifugo' ? 'Vermifugação' : 'Vacinação'}</h2>
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
                     onclick="document.getElementById('foto-cartao-v2').click();">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📸💡</div>
                    <p style="margin: 0; color: #666; font-size: 1.1rem;">
                        <strong>Clique para tirar foto ou selecionar imagem</strong>
                    </p>
                    <p style="margin: 0.5rem 0 0 0; color: #999; font-size: 0.9rem;">
                        Formatos aceitos: JPG, PNG
                    </p>
                </div>

                <input type="file" 
                       id="foto-cartao-v2" 
                       accept="image/*" 
                       capture="environment"
                       style="display: none;"
                       onchange="OCRCartaoV2.processarArquivo('${petId}', this.files[0], '${tipo}')">

                <div id="preview-container-v2" style="display: none; margin-bottom: 1rem;">
                    <img id="preview-imagem-v2" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                </div>

                <div id="resultado-ocr-v2" style="display: none;"></div>

                <div style="background: #fff3cd; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                    <p style="margin: 0; font-size: 0.85rem; color: #856404;">
                        💡 <strong>Dicas para melhor resultado:</strong><br>
                        • Boa iluminação<br>
                        • Foto nítida (sem tremor)<br>
                        • Cartão plano (sem dobras)<br>
                        • Texto bem visível<br>
                        • Adesivos de vacinas visíveis
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
        
        if (resultado.vacinas && resultado.vacinas.length > 0) {
            vacinasHTML = resultado.vacinas.map((v, idx) => {
                const isDuplicata = this.verificarDuplicata(pet, v);
                
                return `
                <div style="background: ${isDuplicata ? '#ffebee' : 'white'}; padding: 1rem; border-radius: 4px; border-left: 4px solid ${isDuplicata ? '#f44336' : '#4caf50'}; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin: 0 0 0.5rem 0; color: ${isDuplicata ? '#f44336' : '#4caf50'};">
                                ${isDuplicata ? '⚠️' : '✅'} ${v.nome}
                            </h4>
                            ${v.laboratorio ? `<p style="margin: 0; font-size: 0.85rem; color: #666;">Laboratório: ${v.laboratorio}</p>` : ''}
                            ${v.data ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Data: ${new Date(v.data).toLocaleDateString('pt-BR')}</p>` : ''}
                            ${v.dose ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Dose: ${v.dose}</p>` : ''}
                            ${v.lote ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Lote: ${v.lote}</p>` : ''}
                            ${v.veterinario ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666;">Veterinário: ${v.veterinario}</p>` : ''}
                            ${v.proximaDose ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #ff9800;">Próxima dose: ${new Date(v.proximaDose).toLocaleDateString('pt-BR')}</p>` : ''}
                            ${isDuplicata ? '<p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #f44336; font-weight: bold;">⚠️ Já existe registro similar</p>' : ''}
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
                const isDuplicata = false; // TODO: implementar verificação de duplicata para vermífugos
                
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
