/**
 * Módulo de Geração de Prontuário em PDF
 * Gera prontuário completo e profissional para impressão
 */

const PDF = {
    /**
     * Busca informações da vacina no banco de dados
     */
    buscarInfoVacina(nomeVacina) {
        if (!window.VacinasRapido) return null;
        
        const todasVacinas = [
            ...(VacinasRapido.vacinas.caes || []),
            ...(VacinasRapido.vacinas.gatos || [])
        ];
        
        const nomeNormalizado = nomeVacina.toLowerCase().trim();
        
        return todasVacinas.find(v => {
            const nomeVacinaNorm = v.nome.toLowerCase();
            if (nomeVacinaNorm.includes(nomeNormalizado) || nomeNormalizado.includes(nomeVacinaNorm.split('(')[0].trim())) {
                return true;
            }
            if (v.nomes_alternativos) {
                return v.nomes_alternativos.some(alt => 
                    alt.toLowerCase().includes(nomeNormalizado) || 
                    nomeNormalizado.includes(alt.toLowerCase())
                );
            }
            return false;
        });
    },

    /**
     * Gera gráfico de peso em SVG
     */
    gerarGraficoPeso(registrosPeso) {
        if (!registrosPeso || registrosPeso.length === 0) {
            return '';
        }

        // Ordenar por data
        const dados = registrosPeso
            .map(r => ({
                data: new Date(r.data),
                peso: parseFloat(r.peso) || 0
            }))
            .sort((a, b) => a.data - b.data);

        if (dados.length === 0) return '';

        // Dimensões do gráfico
        const width = 700;
        const height = 120;
        const padding = { top: 20, right: 40, bottom: 40, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Escalas
        const minPeso = Math.max(0, Math.min(...dados.map(d => d.peso)) - 0.5);
        const maxPeso = Math.max(...dados.map(d => d.peso)) + 0.5;
        const pesoRange = maxPeso - minPeso;

        // Função para converter peso em coordenada Y
        const pesoToY = (peso) => {
            return padding.top + chartHeight - ((peso - minPeso) / pesoRange) * chartHeight;
        };

        // Função para converter índice em coordenada X
        const indexToX = (index) => {
            return padding.left + (index / (dados.length - 1 || 1)) * chartWidth;
        };

        // Gerar pontos da linha
        const pontos = dados.map((d, i) => `${indexToX(i)},${pesoToY(d.peso)}`).join(' ');

        // Gerar área preenchida
        const area = `
            M ${padding.left},${padding.top + chartHeight}
            L ${dados.map((d, i) => `${indexToX(i)},${pesoToY(d.peso)}`).join(' L ')}
            L ${indexToX(dados.length - 1)},${padding.top + chartHeight}
            Z
        `;

        // Gerar linhas de grade horizontais
        const gridLines = [];
        const numLines = 4;
        for (let i = 0; i <= numLines; i++) {
            const peso = minPeso + (pesoRange / numLines) * i;
            const y = pesoToY(peso);
            gridLines.push(`
                <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" 
                      stroke="#e0e0e0" stroke-width="1" stroke-dasharray="3,3"/>
                <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" 
                      font-size="10" fill="#666">${peso.toFixed(1)}</text>
            `);
        }

        // Gerar labels de data
        const dateLabels = dados.map((d, i) => {
            if (dados.length <= 5 || i % Math.ceil(dados.length / 5) === 0 || i === dados.length - 1) {
                return `
                    <text x="${indexToX(i)}" y="${height - 10}" text-anchor="middle" 
                          font-size="9" fill="#666">
                        ${d.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </text>
                `;
            }
            return '';
        }).join('');

        return `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <!-- Grid -->
                ${gridLines.join('')}
                
                <!-- Área preenchida -->
                <path d="${area}" fill="rgba(33, 150, 243, 0.1)" stroke="none"/>
                
                <!-- Linha -->
                <polyline points="${pontos}" fill="none" stroke="#2196F3" stroke-width="2.5"/>
                
                <!-- Pontos -->
                ${dados.map((d, i) => `
                    <circle cx="${indexToX(i)}" cy="${pesoToY(d.peso)}" r="4" 
                            fill="#2196F3" stroke="white" stroke-width="2"/>
                `).join('')}
                
                <!-- Labels de data -->
                ${dateLabels}
                
                <!-- Eixo Y label -->
                <text x="15" y="${padding.top + chartHeight / 2}" text-anchor="middle" 
                      font-size="11" fill="#666" transform="rotate(-90, 15, ${padding.top + chartHeight / 2})">
                    Peso (kg)
                </text>
                
                <!-- Título -->
                <text x="${width / 2}" y="15" text-anchor="middle" 
                      font-size="12" font-weight="bold" fill="#333">
                    Evolução do Peso
                </text>
            </svg>
        `;
    },

    /**
     * Gera prontuário completo em HTML para impressão
     */
    gerarProntuario(pet, casaNome) {
        if (!pet) {
            alert('Pet não encontrado!');
            return;
        }

        // Calcular idade
        const calcularIdade = (nascimento) => {
            const nasc = new Date(nascimento);
            const hoje = new Date();
            let anos = hoje.getFullYear() - nasc.getFullYear();
            let meses = hoje.getMonth() - nasc.getMonth();
            
            if (meses < 0) {
                anos--;
                meses += 12;
            }
            
            if (anos > 0) {
                return `${anos} ano${anos > 1 ? 's' : ''}${meses > 0 ? ` e ${meses} ${meses > 1 ? 'meses' : 'mês'}` : ''}`;
            }
            return `${meses} ${meses > 1 ? 'meses' : 'mês'}`;
        };

        // Calcular peso atual
        const pesoAtual = (pet.peso && pet.peso.length > 0) 
            ? pet.peso.sort((a, b) => new Date(b.data) - new Date(a.data))[0].peso + ' kg'
            : 'Não registrado';

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prontuário - ${pet.nome}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.3;
            color: #333;
            background: white;
            padding: 10px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        /* Cabeçalho */
        .header {
            text-align: center;
            padding: 10px 0;
            border-bottom: 2px solid #2196F3;
            margin-bottom: 12px;
            page-break-after: avoid;
        }
        
        .header h1 {
            color: #2196F3;
            font-size: 20pt;
            margin-bottom: 3px;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 9pt;
        }
        
        /* Informações do Pet */
        .pet-info {
            background: #f5f5f5;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        
        .pet-info h2 {
            color: #2196F3;
            font-size: 14pt;
            margin-bottom: 5px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            font-size: 8pt;
        }
        
        .info-item {
            display: flex;
            gap: 5px;
        }
        
        .info-label {
            font-weight: bold;
            color: #666;
        }
        
        /* Seções */
        .section {
            margin-bottom: 12px;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #2196F3;
            font-size: 11pt;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #2196F3;
            margin-bottom: 6px;
            page-break-after: avoid;
        }
        
        /* Tabelas */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-top: 4px;
        }
        
        thead {
            background: #2196F3;
            color: white;
        }
        
        th {
            padding: 5px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 8pt;
        }
        
        td {
            padding: 4px 6px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        tbody tr:hover {
            background: #f5f5f5;
        }
        
        tbody tr:nth-child(even) {
            background: #fafafa;
        }
        
        .empty-section {
            padding: 6px;
            text-align: center;
            color: #999;
            font-style: italic;
            background: transparent;
            border-radius: 0;
            font-size: 8pt;
        }
        
        /* Vacina com detalhes */
        .vacina-detalhes {
            font-size: 7pt;
            color: #666;
            font-style: italic;
            margin-top: 1px;
        }
        
        /* Gráfico */
        .grafico-container {
            margin: 6px 0;
            text-align: center;
            page-break-inside: avoid;
        }
        
        /* Rodapé */
        .footer {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #999;
            font-size: 7pt;
            page-break-before: avoid;
        }
        
        /* Botões de ação */
        .print-actions {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        }
        
        .print-btn {
            padding: 12px 24px;
            font-size: 14pt;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.2s;
        }
        
        .print-btn-primary {
            background: #2196F3;
            color: white;
        }
        
        .print-btn-secondary {
            background: #f44336;
            color: white;
        }
        
        .print-btn:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        /* Impressão */
        @media print {
            body {
                margin: 0;
                padding: 8mm;
            }
            
            .container {
                max-width: 100%;
            }
            
            .no-print, .print-actions {
                display: none !important;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            table {
                page-break-inside: auto;
            }
            
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            
            thead {
                display: table-header-group;
            }
            
            .header {
                page-break-after: avoid;
            }
            
            .pet-info {
                page-break-inside: avoid;
            }
            
            .grafico-container {
                page-break-inside: avoid;
            }
        }
        
        @page {
            margin: 10mm;
            size: A4;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Cabeçalho -->
        <div class="header">
            <h1>🐾 Prontuário Veterinário</h1>
            <div class="subtitle">${casaNome || 'PetHouse'}</div>
        </div>
        
        <!-- Informações do Pet -->
        <div class="pet-info">
            <h2>${pet.nome}</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Espécie:</span>
                    <span>${pet.especie}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Raça:</span>
                    <span>${pet.raca || 'SRD'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sexo:</span>
                    <span>${pet.sexo || 'Não informado'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nascimento:</span>
                    <span>${new Date(pet.nascimento).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Idade:</span>
                    <span>${calcularIdade(pet.nascimento)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Peso Atual:</span>
                    <span>${pesoAtual}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cor/Pelagem:</span>
                    <span>${pet.cor || 'Não informado'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Microchip:</span>
                    <span>${pet.microchip || 'Não registrado'}</span>
                </div>
            </div>
        </div>
        
        <!-- Histórico de Peso com Gráfico -->
        ${(pet.peso && pet.peso.length > 0) ? `
        <div class="section">
            <h2>⚖️ Histórico de Peso</h2>
                <div class="grafico-container">
                    ${this.gerarGraficoPeso(pet.peso)}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Peso</th>
                            <th>Variação</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pet.peso.sort((a, b) => new Date(b.data) - new Date(a.data)).map((p, i, arr) => {
                            const pesoAtual = parseFloat(p.peso) || 0;
                            const pesoAnterior = i < arr.length - 1 ? parseFloat(arr[i + 1].peso) || 0 : 0;
                            const variacao = pesoAnterior > 0 ? pesoAtual - pesoAnterior : 0;
                            const variacaoTexto = variacao > 0 ? `+${variacao.toFixed(1)} kg` : variacao < 0 ? `${variacao.toFixed(1)} kg` : '-';
                            
                            return `
                                <tr>
                                    <td>${new Date(p.data).toLocaleDateString('pt-BR')}</td>
                                    <td>${p.peso} kg</td>
                                    <td>${variacaoTexto}</td>
                                    <td>${p.obs || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
        </div>
            ` : ''}
        
        <!-- Vacinas -->
        ${(pet.vacinas && pet.vacinas.length > 0) ? `
        <div class="section">
            <h2>💉 Histórico de Vacinas</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30%;">Vacina</th>
                            <th style="width: 15%;">Data Aplicação</th>
                            <th style="width: 15%;">Próxima Dose</th>
                            <th style="width: 15%;">Veterinário</th>
                            <th style="width: 25%;">Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pet.vacinas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(v => {
                            const infoVacina = this.buscarInfoVacina(v.nome);
                            const nomesAlternativos = infoVacina && infoVacina.nomes_alternativos 
                                ? infoVacina.nomes_alternativos.join(', ') 
                                : '';
                            
                            return `
                                <tr>
                                    <td>
                                        <strong>${v.nome}</strong>
                                        ${v.dose ? `<div class="vacina-detalhes">${v.dose}</div>` : ''}
                                        ${nomesAlternativos ? `<div class="vacina-detalhes">Também: ${nomesAlternativos}</div>` : ''}
                                        ${v.lote ? `<div class="vacina-detalhes">Lote: ${v.lote}</div>` : ''}
                                    </td>
                                    <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                                    <td>${v.proxima ? new Date(v.proxima).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td>${v.veterinario || '-'}</td>
                                    <td>${v.obs || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
        </div>
            ` : ''}
        
        <!-- Vermífugo -->
        ${(pet.vermifugo && pet.vermifugo.length > 0) ? `
        <div class="section">
            <h2>💊 Histórico de Vermífugo</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30%;">Produto</th>
                            <th style="width: 15%;">Data Aplicação</th>
                            <th style="width: 15%;">Próxima Dose</th>
                            <th style="width: 15%;">Veterinário</th>
                            <th style="width: 25%;">Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pet.vermifugo.sort((a, b) => new Date(b.data) - new Date(a.data)).map(v => `
                            <tr>
                                <td>
                                    <strong>${v.nome}</strong>
                                    ${v.principio_ativo ? `<div class="vacina-detalhes">P.A.: ${v.principio_ativo}</div>` : ''}
                                    ${v.dosagem ? `<div class="vacina-detalhes">Dosagem: ${v.dosagem}</div>` : ''}
                                </td>
                                <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                                <td>${v.proxima ? new Date(v.proxima).toLocaleDateString('pt-BR') : '-'}</td>
                                <td>${v.veterinario || '-'}</td>
                                <td>${v.obs || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        </div>
            ` : ''}
        
        <!-- Consultas -->
        ${(pet.consultas && pet.consultas.length > 0) ? `
        <div class="section">
            <h2>🏥 Histórico de Consultas</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%;">Data</th>
                            <th style="width: 20%;">Veterinário</th>
                            <th style="width: 25%;">Motivo</th>
                            <th style="width: 40%;">Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pet.consultas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(c => `
                            <tr>
                                <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
                                <td>${c.veterinario || '-'}</td>
                                <td>${c.motivo || '-'}</td>
                                <td>${c.obs || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        </div>
            ` : ''}
        
        <!-- Cirurgias -->
        ${(pet.cirurgias && pet.cirurgias.length > 0) ? `
        <div class="section">
            <h2>🔪 Histórico de Cirurgias</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%;">Data</th>
                            <th style="width: 20%;">Veterinário</th>
                            <th style="width: 25%;">Procedimento</th>
                            <th style="width: 40%;">Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pet.cirurgias.sort((a, b) => new Date(b.data) - new Date(a.data)).map(c => `
                            <tr>
                                <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
                                <td>${c.veterinario || '-'}</td>
                                <td>${c.procedimento || '-'}</td>
                                <td>${c.obs || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        </div>
            ` : ''}
        
        <!-- Tratamentos -->
        ${(pet.tratamentos && pet.tratamentos.length > 0) ? `
        <div class="section">
            <h2>💊 Histórico de Tratamentos</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%;">Data Início</th>
                            <th style="width: 15%;">Data Fim</th>
                            <th style="width: 25%;">Medicamento</th>
                            <th style="width: 15%;">Dosagem</th>
                            <th style="width: 30%;">Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pet.tratamentos.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)).map(t => `
                            <tr>
                                <td>${new Date(t.data_inicio).toLocaleDateString('pt-BR')}</td>
                                <td>${t.data_fim ? new Date(t.data_fim).toLocaleDateString('pt-BR') : 'Em andamento'}</td>
                                <td>${t.medicamento || '-'}</td>
                                <td>${t.dosagem || '-'}</td>
                                <td>${t.obs || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        </div>
            ` : ''}
        
        <!-- Diagnósticos -->
        ${(pet.diagnosticos && pet.diagnosticos.length > 0) ? `
        <div class="section">
            <h2>🔬 Histórico de Diagnósticos</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%;">Data</th>
                            <th style="width: 20%;">Veterinário</th>
                            <th style="width: 25%;">Diagnóstico</th>
                            <th style="width: 40%;">Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pet.diagnosticos.sort((a, b) => new Date(b.data) - new Date(a.data)).map(d => `
                            <tr>
                                <td>${new Date(d.data).toLocaleDateString('pt-BR')}</td>
                                <td>${d.veterinario || '-'}</td>
                                <td>${d.diagnostico || '-'}</td>
                                <td>${d.obs || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        </div>
            ` : ''}
        
        <!-- Rodapé -->
        <div class="footer">
            <p><strong>Prontuário gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>PetHouse - Sistema de Gestão de Pets</p>
            <p style="margin-top: 5px; font-size: 7pt;">Este documento é um resumo do histórico do pet e não substitui avaliação veterinária profissional.</p>
        </div>
    </div>
    
    <!-- Botões de Ação -->
    <div class="print-actions no-print">
        <button class="print-btn print-btn-primary" onclick="window.print()">🖨️ Imprimir</button>
        <button class="print-btn print-btn-secondary" onclick="window.close()">❌ Fechar</button>
    </div>
</body>
</html>
        `;

        // Abrir em nova janela
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    },

    /**
     * Gera seção de peso (reutilizável)
     */
    gerarSecaoPeso(registrosPeso, incluirGrafico = true) {
        if (!registrosPeso || registrosPeso.length === 0) return '';
        
        // Limitar a 20 pontos mais recentes para o gráfico
        const registrosGrafico = registrosPeso
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 20)
            .reverse();
        
        return `
        <div class="section" id="peso">
            <h2>⚖️ Histórico de Peso (${registrosPeso.length} registros)</h2>
            ${incluirGrafico ? `
                <div class="grafico-container">
                    ${this.gerarGraficoPeso(registrosGrafico)}
                </div>
            ` : ''}
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Peso</th>
                        <th>Variação</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${registrosPeso.sort((a, b) => new Date(b.data) - new Date(a.data)).map((p, i, arr) => {
                        const pesoAtual = parseFloat(p.peso) || 0;
                        const pesoAnterior = i < arr.length - 1 ? parseFloat(arr[i + 1].peso) || 0 : 0;
                        const variacao = pesoAnterior > 0 ? pesoAtual - pesoAnterior : 0;
                        const variacaoTexto = variacao > 0 ? `+${variacao.toFixed(1)} kg` : variacao < 0 ? `${variacao.toFixed(1)} kg` : '-';
                        
                        return `
                            <tr>
                                <td>${new Date(p.data).toLocaleDateString('pt-BR')}</td>
                                <td>${p.peso} kg</td>
                                <td>${variacaoTexto}</td>
                                <td>${p.obs || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    /**
     * Gera seção de vacinas (reutilizável)
     */
    gerarSecaoVacinas(vacinas) {
        if (!vacinas || vacinas.length === 0) return '';
        
        return `
        <div class="section" id="vacinas">
            <h2>💉 Histórico de Vacinas (${vacinas.length} aplicações)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 30%;">Vacina</th>
                        <th style="width: 15%;">Data Aplicação</th>
                        <th style="width: 15%;">Próxima Dose</th>
                        <th style="width: 15%;">Veterinário</th>
                        <th style="width: 25%;">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${vacinas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(v => {
                        const infoVacina = this.buscarInfoVacina(v.nome);
                        const nomesAlternativos = infoVacina && infoVacina.nomes_alternativos 
                            ? infoVacina.nomes_alternativos.join(', ') 
                            : '';
                        
                        return `
                            <tr>
                                <td>
                                    <strong>${v.nome}</strong>
                                    ${v.dose ? `<div class="vacina-detalhes">${v.dose}</div>` : ''}
                                    ${nomesAlternativos ? `<div class="vacina-detalhes">Também: ${nomesAlternativos}</div>` : ''}
                                    ${v.lote ? `<div class="vacina-detalhes">Lote: ${v.lote}</div>` : ''}
                                </td>
                                <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                                <td>${v.proxima ? new Date(v.proxima).toLocaleDateString('pt-BR') : '-'}</td>
                                <td>${v.veterinario || '-'}</td>
                                <td>${v.obs || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    /**
     * Gera seção de vermífugos (reutilizável)
     */
    gerarSecaoVermifugos(vermifugos) {
        if (!vermifugos || vermifugos.length === 0) return '';
        
        return `
        <div class="section" id="vermifugos">
            <h2>💊 Histórico de Vermífugo (${vermifugos.length} aplicações)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 30%;">Produto</th>
                        <th style="width: 15%;">Data Aplicação</th>
                        <th style="width: 15%;">Próxima Dose</th>
                        <th style="width: 15%;">Veterinário</th>
                        <th style="width: 25%;">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${vermifugos.sort((a, b) => new Date(b.data) - new Date(a.data)).map(v => `
                        <tr>
                            <td>
                                <strong>${v.nome}</strong>
                                ${v.principio_ativo ? `<div class="vacina-detalhes">P.A.: ${v.principio_ativo}</div>` : ''}
                                ${v.dosagem ? `<div class="vacina-detalhes">Dosagem: ${v.dosagem}</div>` : ''}
                            </td>
                            <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                            <td>${v.proxima ? new Date(v.proxima).toLocaleDateString('pt-BR') : '-'}</td>
                            <td>${v.veterinario || '-'}</td>
                            <td>${v.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    /**
     * Gera seção de consultas (reutilizável)
     */
    gerarSecaoConsultas(consultas) {
        if (!consultas || consultas.length === 0) return '';
        
        return `
        <div class="section" id="consultas">
            <h2>🏥 Histórico de Consultas (${consultas.length} consultas)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Data</th>
                        <th style="width: 20%;">Veterinário</th>
                        <th style="width: 25%;">Motivo</th>
                        <th style="width: 40%;">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${consultas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(c => `
                        <tr>
                            <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
                            <td>${c.veterinario || '-'}</td>
                            <td>${c.motivo || '-'}</td>
                            <td>${c.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    /**
     * Gera seção de cirurgias (reutilizável)
     */
    gerarSecaoCirurgias(cirurgias) {
        if (!cirurgias || cirurgias.length === 0) return '';
        
        return `
        <div class="section" id="cirurgias">
            <h2>🔪 Histórico de Cirurgias (${cirurgias.length} procedimentos)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Data</th>
                        <th style="width: 20%;">Veterinário</th>
                        <th style="width: 25%;">Procedimento</th>
                        <th style="width: 40%;">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${cirurgias.sort((a, b) => new Date(b.data) - new Date(a.data)).map(c => `
                        <tr>
                            <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
                            <td>${c.veterinario || '-'}</td>
                            <td>${c.procedimento || '-'}</td>
                            <td>${c.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    /**
     * Gera seção de tratamentos (reutilizável)
     */
    gerarSecaoTratamentos(tratamentos) {
        if (!tratamentos || tratamentos.length === 0) return '';
        
        return `
        <div class="section" id="tratamentos">
            <h2>💊 Histórico de Tratamentos (${tratamentos.length} tratamentos)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Data Início</th>
                        <th style="width: 15%;">Data Fim</th>
                        <th style="width: 25%;">Medicamento</th>
                        <th style="width: 15%;">Dosagem</th>
                        <th style="width: 30%;">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${tratamentos.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)).map(t => `
                        <tr>
                            <td>${new Date(t.data_inicio).toLocaleDateString('pt-BR')}</td>
                            <td>${t.data_fim ? new Date(t.data_fim).toLocaleDateString('pt-BR') : 'Em andamento'}</td>
                            <td>${t.medicamento || '-'}</td>
                            <td>${t.dosagem || '-'}</td>
                            <td>${t.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    /**
     * Gera seção de diagnósticos (reutilizável)
     */
    gerarSecaoDiagnosticos(diagnosticos) {
        if (!diagnosticos || diagnosticos.length === 0) return '';
        
        return `
        <div class="section" id="diagnosticos">
            <h2>🔬 Histórico de Diagnósticos (${diagnosticos.length} diagnósticos)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Data</th>
                        <th style="width: 20%;">Veterinário</th>
                        <th style="width: 25%;">Diagnóstico</th>
                        <th style="width: 40%;">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${diagnosticos.sort((a, b) => new Date(b.data) - new Date(a.data)).map(d => `
                        <tr>
                            <td>${new Date(d.data).toLocaleDateString('pt-BR')}</td>
                            <td>${d.veterinario || '-'}</td>
                            <td>${d.diagnostico || '-'}</td>
                            <td>${d.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    }
};

// Exportar para uso global
window.PDF = PDF;
