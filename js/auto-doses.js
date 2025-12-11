/**
 * Sistema de Geração Automática de Doses
 * Ao adicionar 1ª dose, gera automaticamente 2ª e 3ª doses conforme protocolo
 */

const AutoDoses = {
    /**
     * Gerar doses automáticas após adicionar uma vacina
     * @param {Object} pet - Pet que recebeu a vacina
     * @param {Object} vacinaAdicionada - Vacina que foi adicionada
     */
    gerarDosesAutomaticas(pet, vacinaAdicionada) {
        // Obter protocolo da vacina
        const protocolo = ProtocolosVacinas.obter(vacinaAdicionada.vacina);
        if (!protocolo) {
            console.warn('[AutoDoses] Protocolo não encontrado para:', vacinaAdicionada.vacina);
            return;
        }
        
        // Se a vacina tem apenas 1 dose, não precisa gerar automático
        if (protocolo.doses <= 1) {
            console.log('[AutoDoses] Vacina de dose única, não precisa gerar automático');
            return;
        }
        
        // Verificar se já existem outras doses desta vacina
        const vacinasMesmoTipo = (pet.vacinas || []).filter(v => 
            v.vacina === vacinaAdicionada.vacina
        );
        
        // Se já tem todas as doses, não gerar
        if (vacinasMesmoTipo.length >= protocolo.doses) {
            console.log('[AutoDoses] Todas as doses já existem');
            return;
        }
        
        console.log(`[AutoDoses] Gerando ${protocolo.doses - vacinasMesmoTipo.length} dose(s) automática(s)`);
        
        // Gerar doses faltantes
        const dosesGeradas = [];
        for (let i = vacinasMesmoTipo.length + 1; i <= protocolo.doses; i++) {
            const doseAnterior = i === 1 ? vacinaAdicionada : dosesGeradas[dosesGeradas.length - 1];
            const dataAnterior = doseAnterior.data;
            const proximaData = UtilsData.adicionarDias(dataAnterior, protocolo.intervalo);
            
            const novaDose = {
                id: Date.now() + i, // ID único
                vacina: vacinaAdicionada.vacina,
                nome: vacinaAdicionada.nome,
                icon: vacinaAdicionada.icon,
                cor: vacinaAdicionada.cor,
                local: vacinaAdicionada.local,
                localIcon: vacinaAdicionada.localIcon,
                data: proximaData,
                dose: i,
                totalDoses: protocolo.doses,
                proximaDose: i < protocolo.doses ? UtilsData.adicionarDias(proximaData, protocolo.intervalo) : null,
                lote: '',
                veterinario: vacinaAdicionada.veterinario || '',
                geradaAutomaticamente: true, // Flag para identificar doses automáticas
                status: 'pendente' // Status: pendente, aplicada, atrasada
            };
            
            dosesGeradas.push(novaDose);
        }
        
        // Adicionar doses geradas ao pet
        if (!pet.vacinas) pet.vacinas = [];
        pet.vacinas.push(...dosesGeradas);
        
        console.log(`[AutoDoses] ${dosesGeradas.length} dose(s) gerada(s) automaticamente`);
        
        return dosesGeradas;
    },
    
    /**
     * Atualizar status das doses (pendente, aplicada, atrasada)
     * @param {Object} pet - Pet para atualizar
     */
    atualizarStatus(pet) {
        if (!pet.vacinas || pet.vacinas.length === 0) return;
        
        const hoje = UtilsData.hoje();
        
        pet.vacinas.forEach(vacina => {
            // Se foi gerada automaticamente e ainda não foi aplicada
            if (vacina.geradaAutomaticamente) {
                if (UtilsData.ehPassado(vacina.data)) {
                    vacina.status = 'atrasada';
                } else {
                    vacina.status = 'pendente';
                }
            } else {
                // Doses aplicadas manualmente
                vacina.status = 'aplicada';
            }
        });
    },
    
    /**
     * Marcar dose automática como aplicada
     * @param {Object} pet - Pet
     * @param {number} vacinaId - ID da vacina
     * @param {Object} dadosAplicacao - Dados da aplicação (lote, veterinário, etc)
     */
    marcarComoAplicada(pet, vacinaId, dadosAplicacao = {}) {
        const vacina = pet.vacinas.find(v => v.id === vacinaId);
        if (!vacina) {
            console.warn('[AutoDoses] Vacina não encontrada:', vacinaId);
            return false;
        }
        
        // Atualizar dados
        vacina.status = 'aplicada';
        vacina.geradaAutomaticamente = false;
        vacina.lote = dadosAplicacao.lote || vacina.lote;
        vacina.veterinario = dadosAplicacao.veterinario || vacina.veterinario;
        vacina.local = dadosAplicacao.local || vacina.local;
        vacina.localIcon = dadosAplicacao.localIcon || vacina.localIcon;
        
        // Se a data foi alterada, atualizar
        if (dadosAplicacao.data) {
            vacina.data = dadosAplicacao.data;
            
            // Recalcular próxima dose
            const protocolo = ProtocolosVacinas.obter(vacina.vacina);
            if (protocolo && vacina.dose < protocolo.doses) {
                vacina.proximaDose = UtilsData.adicionarDias(vacina.data, protocolo.intervalo);
            }
        }
        
        console.log('[AutoDoses] Dose marcada como aplicada:', vacinaId);
        return true;
    },
    
    /**
     * Remover doses automáticas pendentes de um tipo de vacina
     * @param {Object} pet - Pet
     * @param {string} tipoVacina - Tipo da vacina (v10, raiva, etc)
     */
    removerDosesPendentes(pet, tipoVacina) {
        if (!pet.vacinas) return 0;
        
        const quantidadeAntes = pet.vacinas.length;
        
        pet.vacinas = pet.vacinas.filter(v => 
            !(v.vacina === tipoVacina && v.geradaAutomaticamente && v.status === 'pendente')
        );
        
        const removidas = quantidadeAntes - pet.vacinas.length;
        console.log(`[AutoDoses] ${removidas} dose(s) pendente(s) removida(s)`);
        
        return removidas;
    },
    
    /**
     * Reorganizar doses após mudanças
     * Garante que as doses estejam numeradas corretamente (1, 2, 3...)
     * @param {Object} pet - Pet
     * @param {string} tipoVacina - Tipo da vacina
     */
    reorganizarDoses(pet, tipoVacina) {
        if (!pet.vacinas) return;
        
        // Filtrar vacinas do tipo especificado
        const vacinasTipo = pet.vacinas.filter(v => v.vacina === tipoVacina);
        
        if (vacinasTipo.length === 0) return;
        
        // Ordenar por data
        vacinasTipo.sort((a, b) => UtilsData.diferencaDias(b.data, a.data));
        
        // Renumerar doses
        vacinasTipo.forEach((vac, index) => {
            vac.dose = index + 1;
        });
        
        console.log(`[AutoDoses] Doses reorganizadas para ${tipoVacina}`);
    },
    
    /**
     * Obter próximas doses pendentes
     * @param {Object} pet - Pet
     * @returns {Array} - Lista de doses pendentes ordenadas por data
     */
    obterProximasPendentes(pet) {
        if (!pet.vacinas) return [];
        
        return pet.vacinas
            .filter(v => v.geradaAutomaticamente && v.status === 'pendente')
            .sort((a, b) => UtilsData.diferencaDias(b.data, a.data));
    },
    
    /**
     * Obter doses atrasadas
     * @param {Object} pet - Pet
     * @returns {Array} - Lista de doses atrasadas
     */
    obterAtrasadas(pet) {
        if (!pet.vacinas) return [];
        
        this.atualizarStatus(pet);
        
        return pet.vacinas
            .filter(v => v.status === 'atrasada')
            .sort((a, b) => UtilsData.diferencaDias(b.data, a.data));
    }
};

// Exportar globalmente
window.AutoDoses = AutoDoses;

console.log('[AutoDoses] Sistema de doses automáticas carregado');
