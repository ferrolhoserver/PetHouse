/**
 * Módulo de Exportação de Prontuário em PDF
 * Função independente que não modifica o código existente
 */

const PDF = {
    /**
     * Gera e imprime prontuário completo do pet
     */
    gerarProntuario(pet, casaNome) {
        if (!pet) {
            alert('Pet não encontrado!');
            return;
        }

        // Calcular idade
        const calcularIdade = (nascimento) => {
            const hoje = new Date();
            const nasc = new Date(nascimento);
            let anos = hoje.getFullYear() - nasc.getFullYear();
            let meses = hoje.getMonth() - nasc.getMonth();
            
            if (meses < 0) {
                anos--;
                meses += 12;
            }
            
            if (anos === 0 && meses === 0) {
                const dias = Math.floor((hoje - nasc) / (1000 * 60 * 60 * 24));
                return dias <= 30 ? 'Recém-nascido' : `${dias} dias`;
            }
            
            if (anos === 0) {
                return meses === 1 ? '1 mês' : `${meses} meses`;
            }
            
            if (meses === 0) {
                return anos === 1 ? '1 ano' : `${anos} anos`;
            }
            
            return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
        };

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Prontuário - ${pet.nome}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 3px solid #2196F3;
            padding-bottom: 1rem;
        }
        
        .header h1 {
            color: #2196F3;
            margin: 0;
            font-size: 24pt;
        }
        
        .header p {
            margin: 0.25rem 0;
            color: #666;
        }
        
        .info-box {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        
        .info-box h2 {
            margin: 0 0 0.5rem 0;
            color: #2196F3;
            font-size: 14pt;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
        }
        
        .info-item {
            margin: 0.25rem 0;
        }
        
        .info-item strong {
            color: #555;
        }
        
        .section {
            margin-bottom: 2rem;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #2196F3;
            border-bottom: 2px solid #2196F3;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            font-size: 16pt;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0.5rem;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #2196F3;
            color: white;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .empty-section {
            color: #999;
            font-style: italic;
            text-align: center;
            padding: 1rem;
        }
        
        .footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 9pt;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐾 Prontuário Veterinário</h1>
        <p><strong>${casaNome || 'PetHouse'}</strong></p>
    </div>
    
    <div class="info-box">
        <h2>📋 Dados do Pet</h2>
        <div class="info-grid">
            <div class="info-item"><strong>Nome:</strong> ${pet.nome}</div>
            <div class="info-item"><strong>Espécie:</strong> ${pet.especie}</div>
            <div class="info-item"><strong>Raça:</strong> ${pet.raca || 'SRD'}</div>
            <div class="info-item"><strong>Idade:</strong> ${calcularIdade(pet.nascimento)}</div>
            <div class="info-item"><strong>Nascimento:</strong> ${new Date(pet.nascimento).toLocaleDateString('pt-BR')}</div>
            <div class="info-item"><strong>ID:</strong> ${pet.id}</div>
        </div>
    </div>
    
    <!-- Diagnósticos - MOVIDO PARA O TOPO -->
    <div class="section">
        <h2>🔍 Histórico de Diagnósticos</h2>
        ${(pet.diagnosticos && pet.diagnosticos.length > 0) ? `
            <table>
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Diagnóstico</th>
                        <th>Veterinário</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pet.diagnosticos.sort((a, b) => new Date(a.data) - new Date(b.data)).map(d => {
                        const dataObj = new Date(d.data);
                        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        return `
                        <tr>
                            <td>${dataFormatada}<br><small>${horaFormatada}</small></td>
                            <td><strong>${d.diagnostico}</strong></td>
                            <td>${d.veterinario || '-'}</td>
                            <td>${d.obs || '-'}</td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        ` : '<div class="empty-section">Nenhum diagnóstico cadastrado.</div>'}
    </div>
    
    <!-- Peso -->
    <div class="section">
        <h2>⚖️ Histórico de Peso</h2>
        ${(pet.peso && pet.peso.length > 0) ? `
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Peso (kg)</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pet.peso.sort((a, b) => new Date(b.data) - new Date(a.data)).map(p => `
                        <tr>
                            <td>${new Date(p.data).toLocaleDateString('pt-BR')}</td>
                            <td>${p.peso} kg</td>
                            <td>${p.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<div class="empty-section">Nenhum registro de peso cadastrado.</div>'}
    </div>
    
    <!-- Vacinas -->
    <div class="section">
        <h2>💉 Histórico de Vacinas</h2>
        ${(pet.vacinas && pet.vacinas.length > 0) ? `
            <table>
                <thead>
                    <tr>
                        <th>Vacina</th>
                        <th>Data Aplicação</th>
                        <th>Próxima Dose</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pet.vacinas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(v => `
                        <tr>
                            <td>${v.nome}</td>
                            <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                            <td>${v.proxima ? new Date(v.proxima).toLocaleDateString('pt-BR') : '-'}</td>
                            <td>${v.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<div class="empty-section">Nenhuma vacina cadastrada.</div>'}
    </div>
    
    <!-- Vermífugo -->
    <div class="section">
        <h2>💊 Histórico de Vermífugo</h2>
        ${(pet.vermifugo && pet.vermifugo.length > 0) ? `
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Data Aplicação</th>
                        <th>Próxima Dose</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pet.vermifugo.sort((a, b) => new Date(b.data) - new Date(a.data)).map(v => `
                        <tr>
                            <td>${v.nome}</td>
                            <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                            <td>${v.proxima ? new Date(v.proxima).toLocaleDateString('pt-BR') : '-'}</td>
                            <td>${v.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<div class="empty-section">Nenhum vermífugo cadastrado.</div>'}
    </div>
    
    <!-- Consultas -->
    <div class="section">
        <h2>🏥 Histórico de Consultas</h2>
        ${(pet.consultas && pet.consultas.length > 0) ? `
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Veterinário</th>
                        <th>Motivo</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pet.consultas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(c => `
                        <tr>
                            <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
                            <td>${c.veterinario}</td>
                            <td>${c.motivo}</td>
                            <td>${c.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<div class="empty-section">Nenhuma consulta cadastrada.</div>'}
    </div>
    
    <!-- Cirurgias -->
    <div class="section">
        <h2>🔬 Histórico de Cirurgias</h2>
        ${(pet.cirurgias && pet.cirurgias.length > 0) ? `
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Data</th>
                        <th>Veterinário</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pet.cirurgias.sort((a, b) => new Date(b.data) - new Date(a.data)).map(c => `
                        <tr>
                            <td>${c.tipo}</td>
                            <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
                            <td>${c.veterinario}</td>
                            <td>${c.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<div class="empty-section">Nenhuma cirurgia cadastrada.</div>'}
    </div>
    
    <!-- Exames -->
    <div class="section">
        <h2>📋 Histórico de Exames</h2>
        ${(pet.exames && pet.exames.length > 0) ? `
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Data</th>
                        <th>Resultado</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pet.exames.sort((a, b) => new Date(b.data) - new Date(a.data)).map(e => `
                        <tr>
                            <td>${e.tipo}</td>
                            <td>${new Date(e.data).toLocaleDateString('pt-BR')}</td>
                            <td>${e.resultado}</td>
                            <td>${e.obs || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<div class="empty-section">Nenhum exame cadastrado.</div>'}
    </div>
    
    
    <div class="footer">
        <p>Prontuário gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>PetHouse - Sistema de Gestão de Pets</p>
    </div>
    
    <script>
        // Imprimir automaticamente ao carregar
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
        `;

        // Abrir em nova janela e imprimir
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    }
};

// Exportar para uso global
window.PDF = PDF;

