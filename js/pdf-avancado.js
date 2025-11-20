/**
 * Módulo Avançado de Geração de Prontuário em PDF
 * Otimizado para grandes volumes de dados (5+ anos)
 */

const PDFAvancado = {
    // Armazenar dados temporariamente
    petAtual: null,
    casaNomeAtual: null,

    /**
     * Mostra modal de opções de impressão
     */
    mostrarOpcoes(pet, casaNome) {
        // Armazenar dados para uso posterior
        this.petAtual = pet;
        this.casaNomeAtual = casaNome;
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>🖨️ Opções de Impressão</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <h3>📅 Período</h3>
                    <select id="pdf-periodo" class="form-control">
                        <option value="all">Todo o histórico</option>
                        <option value="6m">Últimos 6 meses</option>
                        <option value="1y" selected>Último ano</option>
                        <option value="2y">Últimos 2 anos</option>
                        <option value="5y">Últimos 5 anos</option>
                    </select>
                    
                    <h3 style="margin-top: 20px;">📋 Seções</h3>
                    <label><input type="checkbox" id="pdf-resumo" checked> Resumo Executivo</label><br>
                    <label><input type="checkbox" id="pdf-peso" checked> Histórico de Peso</label><br>
                    <label><input type="checkbox" id="pdf-vacinas" checked> Vacinas</label><br>
                    <label><input type="checkbox" id="pdf-vermifugos" checked> Vermífugos</label><br>
                    <label><input type="checkbox" id="pdf-banhos" checked> Banhos</label><br>
                    <label><input type="checkbox" id="pdf-tosas" checked> Tosas</label><br>
                    <label><input type="checkbox" id="pdf-cios" checked> Cios</label><br>
                    <label><input type="checkbox" id="pdf-consultas" checked> Consultas</label><br>
                    <label><input type="checkbox" id="pdf-cirurgias" checked> Cirurgias</label><br>
                    <label><input type="checkbox" id="pdf-tratamentos" checked> Tratamentos</label><br>
                    <label><input type="checkbox" id="pdf-diagnosticos" checked> Diagnósticos</label>
                    
                    <h3 style="margin-top: 20px;">⚙️ Opções</h3>
                    <label><input type="checkbox" id="pdf-indice" checked> Incluir índice</label><br>
                    <label><input type="checkbox" id="pdf-grafico" checked> Incluir gráfico de peso</label>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="btn btn-primary" onclick="window.PDFAvancado.gerarComOpcoes()">🖨️ Visualizar/Imprimir</button>
                </div>
                <p style="margin-top: 10px; font-size: 11px; color: #666; text-align: center;">
                    💡 Dica: Após visualizar, use <strong>Imprimir > Salvar como PDF</strong> para baixar
                </p>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Gera prontuário com as opções selecionadas
     */
    gerarComOpcoes() {
        console.log('gerarComOpcoes chamado');
        
        // Usar dados armazenados
        const pet = this.petAtual;
        const casaNome = this.casaNomeAtual;
        
        if (!pet) {
            alert('Erro: Dados do pet não encontrados!');
            return;
        }

        // Coletar opções
        const opcoes = {
            periodo: document.getElementById('pdf-periodo').value,
            resumo: document.getElementById('pdf-resumo').checked,
            peso: document.getElementById('pdf-peso').checked,
            vacinas: document.getElementById('pdf-vacinas').checked,
            vermifugos: document.getElementById('pdf-vermifugos').checked,
            banhos: document.getElementById('pdf-banhos').checked,
            tosas: document.getElementById('pdf-tosas').checked,
            cios: document.getElementById('pdf-cios').checked,
            consultas: document.getElementById('pdf-consultas').checked,
            cirurgias: document.getElementById('pdf-cirurgias').checked,
            tratamentos: document.getElementById('pdf-tratamentos').checked,
            diagnosticos: document.getElementById('pdf-diagnosticos').checked,
            indice: document.getElementById('pdf-indice').checked,
            grafico: document.getElementById('pdf-grafico').checked
        };

        console.log('Opções coletadas:', opcoes);

        // Fechar modal
        const modalElement = document.querySelector('.modal.show');
        if (modalElement) {
            modalElement.remove();
        }

        // Gerar prontuário
        this.gerarProntuario(pet, casaNome, opcoes);
    },



    /**
     * Filtra dados por período
     */
    filtrarPorPeriodo(dados, periodo) {
        if (!dados || dados.length === 0 || periodo === 'all') {
            return dados;
        }

        const hoje = new Date();
        let dataLimite;

        switch (periodo) {
            case '6m':
                dataLimite = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());
                break;
            case '1y':
                dataLimite = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
                break;
            case '2y':
                dataLimite = new Date(hoje.getFullYear() - 2, hoje.getMonth(), hoje.getDate());
                break;
            case '5y':
                dataLimite = new Date(hoje.getFullYear() - 5, hoje.getMonth(), hoje.getDate());
                break;
            default:
                return dados;
        }

        return dados.filter(d => new Date(d.data || d.data_inicio) >= dataLimite);
    },

    /**
     * Gera resumo executivo
     */
    gerarResumo(pet, opcoes) {
        const resumo = {
            peso: this.filtrarPorPeriodo(pet.peso || [], opcoes.periodo).length,
            vacinas: this.filtrarPorPeriodo(pet.vacinas || [], opcoes.periodo).length,
            vermifugos: this.filtrarPorPeriodo(pet.vermifugo || [], opcoes.periodo).length,
            banhos: this.filtrarPorPeriodo(pet.banhos || [], opcoes.periodo).length,
            tosas: this.filtrarPorPeriodo(pet.tosas || [], opcoes.periodo).length,
            consultas: this.filtrarPorPeriodo(pet.consultas || [], opcoes.periodo).length,
            cirurgias: this.filtrarPorPeriodo(pet.cirurgias || [], opcoes.periodo).length,
            tratamentos: this.filtrarPorPeriodo(pet.tratamentos || [], opcoes.periodo).length,
            diagnosticos: this.filtrarPorPeriodo(pet.diagnosticos || [], opcoes.periodo).length
        };

        const periodoTexto = {
            'all': 'todo o histórico',
            '6m': 'últimos 6 meses',
            '1y': 'último ano',
            '2y': 'últimos 2 anos',
            '5y': 'últimos 5 anos'
        };

        return `
            <div class="resumo-executivo">
                <h2>📊 Resumo Executivo</h2>
                <p style="margin-bottom: 15px; color: #666; font-size: 9pt;">
                    Período: <strong>${periodoTexto[opcoes.periodo]}</strong>
                </p>
                <div class="resumo-grid">
                    ${resumo.peso > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.peso}</span><span class="resumo-label">Pesagens</span></div>` : ''}
                    ${resumo.vacinas > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.vacinas}</span><span class="resumo-label">Vacinas</span></div>` : ''}
                    ${resumo.vermifugos > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.vermifugos}</span><span class="resumo-label">Vermífugos</span></div>` : ''}
                    ${resumo.banhos > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.banhos}</span><span class="resumo-label">Banhos</span></div>` : ''}
                    ${resumo.tosas > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.tosas}</span><span class="resumo-label">Tosas</span></div>` : ''}
                    ${resumo.consultas > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.consultas}</span><span class="resumo-label">Consultas</span></div>` : ''}
                    ${resumo.cirurgias > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.cirurgias}</span><span class="resumo-label">Cirurgias</span></div>` : ''}
                    ${resumo.tratamentos > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.tratamentos}</span><span class="resumo-label">Tratamentos</span></div>` : ''
                    ${resumo.diagnosticos > 0 ? `<div class="resumo-item"><span class="resumo-numero">${resumo.diagnosticos}</span><span class="resumo-label">Diagnósticos</span></div>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Gera índice
     */
    gerarIndice(pet, opcoes) {
        const secoes = [];
        
        const periodoTexto = {
            'ultimo_mes': 'Último mês',
            'ultimo_trimestre': 'Último trimestre',
            'ultimo_semestre': 'Último semestre',
            'ultimo_ano': 'Último ano',
            'todos': 'Todos os registros'
        };
        
        if (opcoes.resumo) secoes.push({ 
            icone: '📊', 
            nome: 'Resumo Executivo', 
            info: periodoTexto[opcoes.periodo] || 'Todos os registros',
            id: 'resumo' 
        });
        
        if (opcoes.peso && pet.peso && pet.peso.length > 0) secoes.push({ 
            icone: '⚖️', 
            nome: 'Histórico de Peso', 
            info: `${pet.peso.length} ${pet.peso.length === 1 ? 'registro' : 'registros'}`,
            id: 'peso' 
        });
        
        if (opcoes.vacinas && pet.vacinas && pet.vacinas.length > 0) secoes.push({ 
            icone: '💉', 
            nome: 'Vacinas', 
            info: `${pet.vacinas.length} ${pet.vacinas.length === 1 ? 'aplicação' : 'aplicações'}`,
            id: 'vacinas' 
        });
        
        if (opcoes.vermifugos && pet.vermifugo && pet.vermifugo.length > 0) secoes.push({ 
            icone: '💊', 
            nome: 'Vermífugos', 
            info: `${pet.vermifugo.length} ${pet.vermifugo.length === 1 ? 'aplicação' : 'aplicações'}`,
            id: 'vermifugos' 
        });
        
        if (opcoes.cios && pet.cios && pet.cios.length > 0) secoes.push({ 
            icone: '🌸', 
            nome: 'Cios', 
            info: `${pet.cios.length} ${pet.cios.length === 1 ? 'registro' : 'registros'}`,
            id: 'cios' 
        });
        
        if (opcoes.consultas && pet.consultas && pet.consultas.length > 0) secoes.push({ 
            icone: '🏯', 
            nome: 'Consultas', 
            info: `${pet.consultas.length} ${pet.consultas.length === 1 ? 'consulta' : 'consultas'}`,
            id: 'consultas' 
        });
        
        if (opcoes.cirurgias && pet.cirurgias && pet.cirurgias.length > 0) secoes.push({ 
            icone: '⚒️', 
            nome: 'Cirurgias', 
            info: `${pet.cirurgias.length} ${pet.cirurgias.length === 1 ? 'procedimento' : 'procedimentos'}`,
            id: 'cirurgias' 
        });
        
        if (opcoes.tratamentos && pet.tratamentos && pet.tratamentos.length > 0) secoes.push({ 
            icone: '💊', 
            nome: 'Tratamentos', 
            info: `${pet.tratamentos.length} ${pet.tratamentos.length === 1 ? 'tratamento' : 'tratamentos'}`,
            id: 'tratamentos' 
        });
        
        if (opcoes.diagnosticos && pet.diagnosticos && pet.diagnosticos.length > 0) secoes.push({ 
            icone: '🔬', 
            nome: 'Diagnósticos', 
            info: `${pet.diagnosticos.length} ${pet.diagnosticos.length === 1 ? 'diagnóstico' : 'diagnósticos'}`,
            id: 'diagnosticos' 
        });
        
        // Adicionar banhos
        if (opcoes.banhos && pet.banhos && pet.banhos.length > 0) secoes.push({ 
            icone: '🛁', 
            nome: 'Banhos', 
            info: `${pet.banhos.length} ${pet.banhos.length === 1 ? 'banho' : 'banhos'}`,
            id: 'banhos' 
        });
        
        // Adicionar tosas
        if (opcoes.tosas && pet.tosas && pet.tosas.length > 0) secoes.push({ 
            icone: '✂️', 
            nome: 'Tosas', 
            info: `${pet.tosas.length} ${pet.tosas.length === 1 ? 'tosa' : 'tosas'}`,
            id: 'tosas' 
        });

        if (secoes.length === 0) return '';

        return `
            <div class="indice">
                <h2 style="color: #1976d2; margin-bottom: 1rem; border-bottom: 2px solid #1976d2; padding-bottom: 0.5rem;">
                    📁 Índice do Prontuário
                </h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    ${secoes.map(s => `
                        <a href="#${s.id}" style="text-decoration: none; color: inherit;">
                            <div style="background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 6px; border-left: 4px solid #FF9800; transition: all 0.2s; display: flex; flex-direction: column; gap: 0.25rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.2rem;">${s.icone}</span>
                                    <span style="font-weight: 500; color: #333; font-size: 0.95rem;">${s.nome}</span>
                                </div>
                                <span style="color: #666; font-size: 0.85rem; padding-left: 1.7rem;">${s.info}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Gera HTML do prontuário
     */
    gerarHTML(pet, casaNome, opcoes) {
        // Filtrar dados
        const pesoFiltrado = this.filtrarPorPeriodo(pet.peso || [], opcoes.periodo);
        const vacinasFiltrado = this.filtrarPorPeriodo(pet.vacinas || [], opcoes.periodo);
        const vermifugosFiltrado = this.filtrarPorPeriodo(pet.vermifugo || [], opcoes.periodo);
        const consultasFiltrado = this.filtrarPorPeriodo(pet.consultas || [], opcoes.periodo);
        const cirurgiasFiltrado = this.filtrarPorPeriodo(pet.cirurgias || [], opcoes.periodo);
        const tratamentosFiltrado = this.filtrarPorPeriodo(pet.tratamentos || [], opcoes.periodo);
        const diagnosticosFiltrado = this.filtrarPorPeriodo(pet.diagnosticos || [], opcoes.periodo);

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
        const pesoAtual = (pesoFiltrado.length > 0) 
            ? pesoFiltrado.sort((a, b) => new Date(b.data) - new Date(a.data))[0].peso + ' kg'
            : 'Não registrado';

        return `
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
            </div>
        </div>
        
        <!-- Resumo Executivo -->
        ${opcoes.resumo ? this.gerarResumo(pet, opcoes) : ''}
        
        <!-- Índice -->
        ${opcoes.indice ? this.gerarIndice(pet, opcoes) : ''}
        
        <!-- Seções conforme selecionadas -->
        ${opcoes.peso && pesoFiltrado.length > 0 ? window.PDF.gerarSecaoPeso(pesoFiltrado, opcoes.grafico) : ''}
        ${opcoes.vacinas && vacinasFiltrado.length > 0 ? window.PDF.gerarSecaoVacinas(vacinasFiltrado) : ''}
        ${opcoes.vermifugos && vermifugosFiltrado.length > 0 ? window.PDF.gerarSecaoVermifugos(vermifugosFiltrado) : ''}
        ${opcoes.banhos && pet.banhos && pet.banhos.length > 0 ? this.gerarSecaoBanhos(pet.banhos) : ''}
        ${opcoes.tosas && pet.tosas && pet.tosas.length > 0 ? this.gerarSecaoTosas(pet.tosas) : ''}
        ${opcoes.cios && pet.cios && pet.cios.length > 0 ? this.gerarSecaoCios(pet.cios) : ''}
        ${opcoes.consultas && consultasFiltrado.length > 0 ? window.PDF.gerarSecaoConsultas(consultasFiltrado) : ''}
        ${opcoes.cirurgias && cirurgiasFiltrado.length > 0 ? window.PDF.gerarSecaoCirurgias(cirurgiasFiltrado) : ''}
        ${opcoes.tratamentos && tratamentosFiltrado.length > 0 ? window.PDF.gerarSecaoTratamentos(tratamentosFiltrado) : ''}
        ${opcoes.diagnosticos && diagnosticosFiltrado.length > 0 ? window.PDF.gerarSecaoDiagnosticos(diagnosticosFiltrado) : ''}
        
        <!-- Rodapé -->
        <div class="footer">
            <p><strong>Prontuário gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>PetHouse - Sistema de Gestão de Pets</p>
        </div>
        `;
    },

    /**
     * Gera prontuário completo
     */
    gerarProntuario(pet, casaNome, opcoes) {
        console.log('gerarProntuario chamado', pet, opcoes);
        
        // Usar PDF padrão se não tiver opções
        if (!opcoes) {
            return window.PDF.gerarProntuario(pet, casaNome);
        }

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
        
        /* Resumo Executivo */
        .resumo-executivo {
            background: #e3f2fd;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 12px;
            page-break-inside: avoid;
        }
        
        .resumo-executivo h2 {
            color: #1976D2;
            font-size: 12pt;
            margin-bottom: 8px;
        }
        
        .resumo-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }
        
        .resumo-item {
            text-align: center;
            background: white;
            padding: 8px;
            border-radius: 4px;
        }
        
        .resumo-numero {
            display: block;
            font-size: 18pt;
            font-weight: bold;
            color: #2196F3;
        }
        
        .resumo-label {
            display: block;
            font-size: 7pt;
            color: #666;
            margin-top: 2px;
        }
        
        /* Índice */
        .indice {
            background: #fff3e0;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 12px;
            page-break-inside: avoid;
        }
        
        .indice h2 {
            color: #F57C00;
            font-size: 11pt;
            margin-bottom: 6px;
        }
        
        .indice-lista {
            list-style: none;
            padding: 0;
            column-count: 2;
            column-gap: 15px;
            font-size: 8pt;
        }
        
        .indice-lista li {
            margin-bottom: 3px;
        }
        
        .indice-lista a {
            color: #F57C00;
            text-decoration: none;
        }
        
        .indice-lista a:hover {
            text-decoration: underline;
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
        
        tbody tr:nth-child(even) {
            background: #fafafa;
        }
        
        .vacina-detalhes {
            font-size: 7pt;
            color: #666;
            font-style: italic;
            margin-top: 1px;
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
            
            .pet-info, .resumo-executivo, .indice {
                page-break-inside: avoid;
            }
            
            /* Contador de páginas */
            @page {
                margin: 10mm;
                size: A4;
                
                @bottom-right {
                    content: "Página " counter(page) " de " counter(pages);
                    font-size: 8pt;
                    color: #666;
                }
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${this.gerarHTML(pet, casaNome, opcoes)}
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
        if (!win) {
            alert('Bloqueador de pop-ups impediu a abertura. Por favor, permita pop-ups para este site.');
            return;
        }
        
        win.document.write(html);
        win.document.close();
    },
    
    /**
     * Gera seção de cios
     */
    gerarSecaoCios(cios) {
        if (!cios || cios.length === 0) return '';
        
        // Ordenar por data de início (mais recente primeiro)
        const ciosOrdenados = [...cios].sort((a, b) => new Date(b.inicio) - new Date(a.inicio));
        
        return `
            <div class="secao" id="cios">
                <h2>🌸 Cios (${cios.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Início</th>
                            <th>Fim</th>
                            <th>Duração</th>
                            <th>Cruzamento</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ciosOrdenados.map(cio => {
                            const inicio = new Date(cio.inicio).toLocaleDateString('pt-BR');
                            const fim = cio.fim ? new Date(cio.fim).toLocaleDateString('pt-BR') : 'Em andamento';
                            const duracao = cio.fim ? Math.floor((new Date(cio.fim) - new Date(cio.inicio)) / (1000 * 60 * 60 * 24)) + ' dias' : '-';
                            const cruzamento = cio.cruzamento ? `Sim (${new Date(cio.cruzamento.data).toLocaleDateString('pt-BR')})` : 'Não';
                            
                            return `
                                <tr>
                                    <td>${inicio}</td>
                                    <td>${fim}</td>
                                    <td>${duracao}</td>
                                    <td>${cruzamento}</td>
                                    <td>${cio.observacoes || '-'}</td>
                                </tr>
                                ${cio.cruzamento && cio.cruzamento.previsaoParto ? `
                                    <tr>
                                        <td colspan="5" style="background: #E3F2FD; font-size: 0.9em;">
                                            🤰 Macho: ${cio.cruzamento.macho || 'Não informado'} | 
                                            Parto previsto: ${new Date(cio.cruzamento.previsaoParto).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ` : ''}
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Gera seção de banhos
     */
    gerarSecaoBanhos(banhos) {
        const banhosOrdenados = [...banhos].sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Gerar gráfico se disponível
        const grafico = window.GraficoBanhos ? window.GraficoBanhos.gerarGraficoPDF(banhos) : '';
        
        return `
            <div class="secao" id="banhos">
                <h2>🛁 Cuidados de Higiene - Banhos (${banhos.length})</h2>
                
                ${grafico}
                
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Local</th>
                            <th>Profissional</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${banhosOrdenados.map(banho => {
                            const data = new Date(banho.data).toLocaleDateString('pt-BR');
                            const tipo = window.BanhosTosas ? window.BanhosTosas.getTipoLabel(banho.tipo, 'banho') : banho.tipo;
                            
                            return `
                                <tr>
                                    <td>${data}</td>
                                    <td>${tipo}</td>
                                    <td>${banho.local || '-'}</td>
                                    <td>${banho.profissional || '-'}</td>
                                    <td>${banho.obs || '-'}</td>
                                </tr>
                                ${banho.produtos ? `
                                    <tr>
                                        <td colspan="5" style="background: #f8f9fa; font-size: 0.9em; padding: 6px;">
                                            <strong>Produtos:</strong> ${banho.produtos}
                                        </td>
                                    </tr>
                                ` : ''}
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Gera seção de tosas
     */
    gerarSecaoTosas(tosas) {
        const tosasOrdenadas = [...tosas].sort((a, b) => new Date(b.data) - new Date(a.data));
        
        return `
            <div class="secao" id="tosas">
                <h2>✂️ Cuidados de Higiene - Tosas (${tosas.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Estilo</th>
                            <th>Local</th>
                            <th>Profissional</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tosasOrdenadas.map(tosa => {
                            const data = new Date(tosa.data).toLocaleDateString('pt-BR');
                            const tipo = window.BanhosTosas ? window.BanhosTosas.getTipoLabel(tosa.tipo, 'tosa') : tosa.tipo;
                            
                            return `
                                <tr>
                                    <td>${data}</td>
                                    <td>${tipo}</td>
                                    <td>${tosa.estilo || '-'}</td>
                                    <td>${tosa.local || '-'}</td>
                                    <td>${tosa.profissional || '-'}</td>
                                    <td>${tosa.obs || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};

// Exportar para uso global
window.PDFAvancado = PDFAvancado;
