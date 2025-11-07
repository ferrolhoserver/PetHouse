/**
 * Módulo de Revacinação Automática
 * Calcula automaticamente datas de reforço e próximas doses
 */

const Revacinacao = {
    /**
     * Protocolos de vacinação por tipo
     */
    protocolos: {
        // Vacinas polivalentes (V8, V10, V12)
        polivalente: {
            doses_iniciais: 3,
            intervalo_doses: 21, // dias
            idade_primeira_dose: 45, // dias
            reforco_anual: true,
            reforco_dias: 365
        },
        
        // Antirrábica
        antirrabica: {
            doses_iniciais: 1,
            idade_primeira_dose: 120, // dias (4 meses)
            reforco_anual: true,
            reforco_dias: 365
        },
        
        // Gripe canina / Tosse dos canis
        gripe_canina: {
            doses_iniciais: 1,
            reforco_anual: true,
            reforco_dias: 365
        },
        
        // Leishmaniose
        leishmaniose: {
            doses_iniciais: 3,
            intervalo_doses: 21,
            reforco_anual: true,
            reforco_dias: 365
        },
        
        // Giárdia
        giardia: {
            doses_iniciais: 2,
            intervalo_doses: 21,
            reforco_anual: true,
            reforco_dias: 365
        },
        
        // FeLV (Leucemia Felina)
        felv: {
            doses_iniciais: 2,
            intervalo_doses: 21,
            reforco_anual: true,
            reforco_dias: 365
        }
    },

    /**
     * Mapeia vacina para protocolo
     */
    mapearProtocolo(vacinaId) {
        if (vacinaId.includes('v8') || vacinaId.includes('v10') || vacinaId.includes('v12') ||
            vacinaId.includes('v3') || vacinaId.includes('v4') || vacinaId.includes('v5')) {
            return this.protocolos.polivalente;
        }
        if (vacinaId.includes('antirrabica')) {
            return this.protocolos.antirrabica;
        }
        if (vacinaId.includes('gripe') || vacinaId.includes('kc')) {
            return this.protocolos.gripe_canina;
        }
        if (vacinaId.includes('leishmaniose')) {
            return this.protocolos.leishmaniose;
        }
        if (vacinaId.includes('giardia')) {
            return this.protocolos.giardia;
        }
        if (vacinaId.includes('felv')) {
            return this.protocolos.felv;
        }
        
        // Padrão: reforço anual
        return {
            doses_iniciais: 1,
            reforco_anual: true,
            reforco_dias: 365
        };
    },

    /**
     * Calcula próxima dose baseado no protocolo
     */
    calcularProximaDose(vacinaId, doseAtual, dataAplicacao) {
        const protocolo = this.mapearProtocolo(vacinaId);
        const data = new Date(dataAplicacao);
        
        // Se é reforço, próxima dose é daqui a 1 ano
        if (doseAtual === 'reforco') {
            data.setDate(data.getDate() + protocolo.reforco_dias);
            return {
                data: data.toISOString().split('T')[0],
                tipo: 'reforco',
                descricao: 'Reforço anual'
            };
        }
        
        // Se ainda está nas doses iniciais
        const doseNum = parseInt(doseAtual);
        if (doseNum < protocolo.doses_iniciais) {
            // Próxima dose é após o intervalo
            data.setDate(data.getDate() + (protocolo.intervalo_doses || 21));
            return {
                data: data.toISOString().split('T')[0],
                tipo: 'dose',
                numero: doseNum + 1,
                descricao: `${doseNum + 1}ª dose`
            };
        }
        
        // Completou as doses iniciais, próximo é reforço anual
        if (protocolo.reforco_anual) {
            data.setDate(data.getDate() + protocolo.reforco_dias);
            return {
                data: data.toISOString().split('T')[0],
                tipo: 'reforco',
                descricao: 'Reforço anual'
            };
        }
        
        return null;
    },

    /**
     * Calcula todas as doses futuras de um protocolo
     */
    calcularProtocoloCompleto(vacinaId, dataPrimeiraDose, nascimentoPet) {
        const protocolo = this.mapearProtocolo(vacinaId);
        const doses = [];
        
        let dataAtual = new Date(dataPrimeiraDose);
        
        // Doses iniciais
        for (let i = 1; i <= protocolo.doses_iniciais; i++) {
            doses.push({
                numero: i,
                data: dataAtual.toISOString().split('T')[0],
                tipo: 'dose_inicial',
                descricao: `${i}ª dose`
            });
            
            if (i < protocolo.doses_iniciais && protocolo.intervalo_doses) {
                dataAtual.setDate(dataAtual.getDate() + protocolo.intervalo_doses);
            }
        }
        
        // Reforços anuais (próximos 5 anos)
        if (protocolo.reforco_anual) {
            dataAtual = new Date(dataPrimeiraDose);
            dataAtual.setDate(dataAtual.getDate() + protocolo.reforco_dias);
            
            for (let i = 1; i <= 5; i++) {
                doses.push({
                    numero: protocolo.doses_iniciais + i,
                    data: dataAtual.toISOString().split('T')[0],
                    tipo: 'reforco',
                    descricao: `Reforço ${i}º ano`
                });
                dataAtual.setDate(dataAtual.getDate() + protocolo.reforco_dias);
            }
        }
        
        return doses;
    },

    /**
     * Verifica se uma vacina está atrasada
     */
    verificarAtraso(proximaData) {
        if (!proximaData) return false;
        const hoje = new Date();
        const dataProxima = new Date(proximaData);
        return dataProxima < hoje;
    },

    /**
     * Calcula dias até a próxima dose
     */
    diasAteProxima(proximaData) {
        if (!proximaData) return null;
        const hoje = new Date();
        const dataProxima = new Date(proximaData);
        const diff = Math.ceil((dataProxima - hoje) / (1000 * 60 * 60 * 24));
        return diff;
    },

    /**
     * Gera mensagem de alerta baseado nos dias
     */
    gerarMensagemAlerta(dias) {
        if (dias < 0) {
            return {
                tipo: 'atrasado',
                cor: '#f44336',
                icone: '⚠️',
                mensagem: `Atrasado há ${Math.abs(dias)} dias`
            };
        }
        if (dias <= 7) {
            return {
                tipo: 'urgente',
                cor: '#ff9800',
                icone: '🔔',
                mensagem: `Faltam apenas ${dias} dias`
            };
        }
        if (dias <= 30) {
            return {
                tipo: 'proximo',
                cor: '#2196F3',
                icone: '📅',
                mensagem: `Faltam ${dias} dias`
            };
        }
        return {
            tipo: 'futuro',
            cor: '#4caf50',
            icone: '✓',
            mensagem: `Faltam ${dias} dias`
        };
    },

    /**
     * Calcula próxima vermifugação
     */
    calcularProximaVermifugacao(dataUltima, idadePet) {
        const data = new Date(dataUltima);
        
        // Filhotes (até 3 meses): a cada 15 dias
        if (idadePet < 90) {
            data.setDate(data.getDate() + 15);
        }
        // Jovens (3-6 meses): mensal
        else if (idadePet < 180) {
            data.setDate(data.getDate() + 30);
        }
        // Adultos: trimestral (90 dias)
        else {
            data.setDate(data.getDate() + 90);
        }
        
        return data.toISOString().split('T')[0];
    },

    /**
     * Importa dados do cartão de vacinação físico
     */
    importarCartaoFisico() {
        return `
            <div class="modal-header">
                <h2>📋 Importar Cartão de Vacinação</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <p style="margin: 0 0 1rem 0; color: #666;">
                    Importe os dados do cartão de vacinação físico do seu pet:
                </p>
                
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                        💡 <strong>Dica:</strong> Tire uma foto do cartão e preencha os dados abaixo. O sistema calculará automaticamente as próximas doses e reforços.
                    </p>
                </div>

                <form id="importar-cartao-form" onsubmit="event.preventDefault(); Revacinacao.processarImportacao();">
                    <div class="form-group">
                        <label>Vacina Aplicada *</label>
                        <select id="vacina-importar" required>
                            <option value="">Selecione...</option>
                            <option value="v8">V8 (Óctupla)</option>
                            <option value="v10">V10 (Déctupla)</option>
                            <option value="v12">V12</option>
                            <option value="antirrabica">Antirrábica</option>
                            <option value="gripe_canina">Gripe Canina</option>
                            <option value="leishmaniose">Leishmaniose</option>
                            <option value="v3">V3 (Tríplice Felina)</option>
                            <option value="v4">V4 (Quádrupla Felina)</option>
                            <option value="v5">V5 (Quíntupla Felina)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Data da Aplicação *</label>
                        <input type="date" id="data-importar" required>
                    </div>

                    <div class="form-group">
                        <label>Data da Revacinação/Próxima Dose</label>
                        <input type="date" id="revacinacao-importar">
                        <small style="color: #666;">Se estiver escrito no cartão</small>
                    </div>

                    <div class="form-group">
                        <label>Lote</label>
                        <input type="text" id="lote-importar" placeholder="Ex: L12345">
                    </div>

                    <div class="form-group">
                        <label>Veterinário</label>
                        <input type="text" id="vet-importar" placeholder="Nome do veterinário">
                    </div>

                    <div class="flex justify-end" style="gap: 0.5rem;">
                        <button type="button" class="btn" onclick="app.closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">✅ Importar</button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Processa importação do cartão
     */
    processarImportacao() {
        const vacinaId = document.getElementById('vacina-importar').value;
        const dataAplicacao = document.getElementById('data-importar').value;
        const dataRevacinacao = document.getElementById('revacinacao-importar').value;
        const lote = document.getElementById('lote-importar').value;
        const veterinario = document.getElementById('vet-importar').value;

        // Usar data de revacinação do cartão ou calcular automaticamente
        const proximaDose = dataRevacinacao || this.calcularProximaDose(vacinaId, 1, dataAplicacao).data;

        // Criar registro (será implementado na integração)
        const registro = {
            vacina: vacinaId,
            data: dataAplicacao,
            proxima: proximaDose,
            lote: lote,
            veterinario: veterinario,
            importado: true
        };

        console.log('Registro importado:', registro);
        app.showToast('✅ Dados importados com sucesso!', 'success');
        app.closeModal();
    }
};

// Exportar para uso global
window.Revacinacao = Revacinacao;
