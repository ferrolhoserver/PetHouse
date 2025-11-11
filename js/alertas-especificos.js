/**
 * Sistema de alertas específicos baseados em sexo, idade e raça
 * Gera recomendações personalizadas para cada pet
 */

const AlertasEspecificos = {
    /**
     * Gera alertas específicos para um pet
     * @param {Object} pet - Objeto do pet com dados completos
     * @returns {Array} - Lista de alertas específicos
     */
    gerarAlertas(pet) {
        const alertas = [];
        const idade = this.calcularIdade(pet.nascimento);
        const raca = window.RacasDB?.[pet.especie]?.find(r => r.nome === pet.raca);
        
        // Alertas de cio (fêmeas)
        if (pet.sexo === 'Fêmea') {
            alertas.push(...this.alertasDeCio(pet, idade));
        }
        
        // Alertas por sexo
        alertas.push(...this.alertasPorSexo(pet, idade));
        
        // Alertas por idade
        alertas.push(...this.alertasPorIdade(pet, idade));
        
        // Alertas por raça (se aplicável)
        if (raca) {
            alertas.push(...this.alertasPorRaca(pet, idade, raca));
        }
        
        return alertas;
    },
    
    /**
     * Alertas baseados no ciclo de cio
     */
    alertasDeCio(pet, idadeMeses) {
        const alertas = [];
        const status = window.CalculosCio?.gerarStatusCio(pet);
        
        if (!status || status.status === 'nao_aplicavel') {
            return alertas;
        }
        
        // Alerta de período fértil
        if (status.status === 'periodo_fertil') {
            alertas.push({
                tipo: 'cio',
                titulo: '🌟 Período Fértil Ativo!',
                mensagem: `${pet.nome} está no período fértil (dia ${status.dias} do cio). Este é o melhor momento para cruzamento, se desejado.`,
                prioridade: 'alta',
                categoria: 'Reprodução'
            });
        }
        
        // Alerta de cio ativo
        if (status.status === 'em_cio') {
            alertas.push({
                tipo: 'cio',
                titulo: '🌸 Cio Ativo',
                mensagem: `${pet.nome} está no cio (dia ${status.dias}). Redobrar cuidados e supervisão. Evitar contato com machos se não deseja cruzamento.`,
                prioridade: 'alta',
                categoria: 'Reprodução'
            });
        }
        
        // Alerta de próximo cio
        if (status.status === 'proximo') {
            alertas.push({
                tipo: 'cio',
                titulo: '🔔 Próximo Cio Próximo',
                mensagem: status.mensagem + '. Prepare-se para redobrar cuidados.',
                prioridade: 'media',
                categoria: 'Reprodução'
            });
        }
        
        // Alerta de cio atrasado
        if (status.status === 'atrasado') {
            alertas.push({
                tipo: 'cio',
                titulo: '⚠️ Cio Atrasado',
                mensagem: status.mensagem + '. Consulte o veterinário para verificar se há algum problema.',
                prioridade: 'alta',
                categoria: 'Saúde Reprodutiva'
            });
        }
        
        return alertas;
    },
    
    /**
     * Calcula idade em meses
     */
    calcularIdade(nascimento) {
        const hoje = new Date();
        const nasc = new Date(nascimento);
        const meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + 
                      (hoje.getMonth() - nasc.getMonth());
        return meses;
    },
    
    /**
     * Alertas baseados no sexo
     */
    alertasPorSexo(pet, idadeMeses) {
        const alertas = [];
        
        if (pet.especie !== 'Cachorro' && pet.especie !== 'Gato') {
            return alertas;
        }
        
        // Fêmea não castrada
        if (pet.sexo === 'Fêmea') {
            // Primeiro cio (6-12 meses)
            if (idadeMeses >= 6 && idadeMeses <= 12) {
                alertas.push({
                    tipo: 'reproducao',
                    titulo: '🌸 Primeiro Cio Esperado',
                    mensagem: `${pet.nome} está na idade do primeiro cio (6-12 meses). Considere conversar com o veterinário sobre castração.`,
                    prioridade: 'media',
                    categoria: 'Reprodução'
                });
            }
            
            // Cio regular (a cada 6 meses após o primeiro)
            if (idadeMeses > 12 && idadeMeses % 6 === 0) {
                alertas.push({
                    tipo: 'reproducao',
                    titulo: '🌸 Período de Cio',
                    mensagem: `${pet.nome} pode estar entrando no período de cio. Redobrar cuidados e supervisão.`,
                    prioridade: 'alta',
                    categoria: 'Reprodução'
                });
            }
            
            // Piometra (após 5 anos, não castrada)
            if (idadeMeses >= 60) {
                alertas.push({
                    tipo: 'saude',
                    titulo: '⚠️ Risco de Piometra',
                    mensagem: `Fêmeas não castradas acima de 5 anos têm maior risco de piometra (infecção uterina). Considere castração preventiva.`,
                    prioridade: 'alta',
                    categoria: 'Saúde Preventiva'
                });
            }
        }
        
        // Macho não castrado
        if (pet.sexo === 'Macho') {
            // Comportamento territorial (8-12 meses)
            if (idadeMeses >= 8 && idadeMeses <= 18) {
                alertas.push({
                    tipo: 'comportamento',
                    titulo: '🐕 Maturidade Sexual',
                    mensagem: `${pet.nome} está atingindo a maturidade sexual. Pode apresentar marcação territorial e comportamento dominante. Considere castração.`,
                    prioridade: 'media',
                    categoria: 'Comportamento'
                });
            }
            
            // Próstata (após 7 anos, não castrado)
            if (idadeMeses >= 84) {
                alertas.push({
                    tipo: 'saude',
                    titulo: '⚠️ Risco de Problemas Prostáticos',
                    mensagem: `Machos não castrados acima de 7 anos têm maior risco de hiperplasia prostática. Consulte o veterinário sobre exames preventivos.`,
                    prioridade: 'alta',
                    categoria: 'Saúde Preventiva'
                });
            }
        }
        
        return alertas;
    },
    
    /**
     * Alertas baseados na idade
     */
    alertasPorIdade(pet, idadeMeses) {
        const alertas = [];
        
        // Filhote (0-12 meses)
        if (idadeMeses < 12) {
            if (idadeMeses >= 2 && idadeMeses <= 4) {
                alertas.push({
                    tipo: 'desenvolvimento',
                    titulo: '🍼 Fase de Socialização',
                    mensagem: `${pet.nome} está na fase crítica de socialização. Exponha a diferentes pessoas, animais e ambientes de forma positiva.`,
                    prioridade: 'alta',
                    categoria: 'Desenvolvimento'
                });
            }
            
            if (idadeMeses >= 4 && idadeMeses <= 6) {
                alertas.push({
                    tipo: 'desenvolvimento',
                    titulo: '🦷 Troca de Dentes',
                    mensagem: `${pet.nome} está na fase de troca de dentes. Ofereça brinquedos apropriados para roer.`,
                    prioridade: 'media',
                    categoria: 'Desenvolvimento'
                });
            }
        }
        
        // Adulto jovem (1-7 anos para cães, 1-10 para gatos)
        const idadeAdultoSenior = pet.especie === 'Gato' ? 120 : 84;
        if (idadeMeses >= 12 && idadeMeses < idadeAdultoSenior) {
            // Check-up anual
            if (idadeMeses % 12 === 0) {
                alertas.push({
                    tipo: 'saude',
                    titulo: '🏥 Check-up Anual',
                    mensagem: `${pet.nome} completou ${Math.floor(idadeMeses / 12)} ano(s). Agende check-up completo com exames de sangue.`,
                    prioridade: 'alta',
                    categoria: 'Saúde Preventiva'
                });
            }
        }
        
        // Senior (7+ anos para cães, 10+ para gatos)
        if (idadeMeses >= idadeAdultoSenior) {
            alertas.push({
                tipo: 'saude',
                titulo: '👴 Pet Sênior - Cuidados Especiais',
                mensagem: `${pet.nome} é considerado sênior. Recomenda-se check-up a cada 6 meses, atenção à mobilidade e dieta adequada.`,
                prioridade: 'alta',
                categoria: 'Geriatria'
            });
            
            // Alertas específicos de idade avançada
            if (idadeMeses >= 96) { // 8+ anos
                alertas.push({
                    tipo: 'saude',
                    titulo: '🦴 Monitorar Articulações',
                    mensagem: `Pets idosos têm maior risco de artrite e problemas articulares. Observe sinais de dor ou dificuldade de locomoção.`,
                    prioridade: 'media',
                    categoria: 'Geriatria'
                });
            }
            
            if (idadeMeses >= 108) { // 9+ anos
                alertas.push({
                    tipo: 'saude',
                    titulo: '🧠 Saúde Cognitiva',
                    mensagem: `Pets muito idosos podem desenvolver disfunção cognitiva. Observe mudanças de comportamento, desorientação ou alterações no sono.`,
                    prioridade: 'media',
                    categoria: 'Geriatria'
                });
            }
        }
        
        return alertas;
    },
    
    /**
     * Alertas baseados na raça
     */
    alertasPorRaca(pet, idadeMeses, raca) {
        const alertas = [];
        
        // Cães
        if (pet.especie === 'Cachorro') {
            // Raças braquicefálicas (problemas respiratórios)
            if (raca.braquicefalico) {
                alertas.push({
                    tipo: 'saude',
                    titulo: '😮‍💨 Raça Braquicefálica',
                    mensagem: `${pet.nome} é de raça braquicefálica. Evite exercícios intensos em dias quentes e fique atento a sinais de dificuldade respiratória.`,
                    prioridade: 'alta',
                    categoria: 'Cuidados Especiais'
                });
            }
            
            // Raças grandes/gigantes (displasia, torção gástrica)
            if (raca.porte === 'grande' || raca.porte === 'gigante') {
                if (idadeMeses >= 60) { // 5+ anos
                    alertas.push({
                        tipo: 'saude',
                        titulo: '🦴 Risco de Displasia',
                        mensagem: `Raças grandes têm maior predisposição a displasia de quadril e cotovelo. Considere exames radiográficos preventivos.`,
                        prioridade: 'media',
                        categoria: 'Ortopedia'
                    });
                }
                
                alertas.push({
                    tipo: 'saude',
                    titulo: '🍽️ Prevenção de Torção Gástrica',
                    mensagem: `Raças grandes têm risco de torção gástrica. Evite exercícios logo após refeições e ofereça comida em porções menores.`,
                    prioridade: 'alta',
                    categoria: 'Cuidados Especiais'
                });
            }
            
            // Raças pequenas (problemas dentários, luxação de patela)
            if (raca.porte === 'pequeno') {
                if (idadeMeses >= 24) { // 2+ anos
                    alertas.push({
                        tipo: 'saude',
                        titulo: '🦷 Saúde Dental',
                        mensagem: `Raças pequenas têm maior predisposição a problemas dentários. Escove os dentes regularmente e faça limpezas periódicas.`,
                        prioridade: 'media',
                        categoria: 'Odontologia'
                    });
                }
                
                if (idadeMeses >= 36) { // 3+ anos
                    alertas.push({
                        tipo: 'saude',
                        titulo: '🦵 Luxação de Patela',
                        mensagem: `Raças pequenas podem desenvolver luxação de patela. Observe se ${pet.nome} apresenta claudicação ou "pula" em uma perna.`,
                        prioridade: 'media',
                        categoria: 'Ortopedia'
                    });
                }
            }
        }
        
        // Gatos
        if (pet.especie === 'Gato') {
            // Raças de pelo longo (bolas de pelo)
            if (raca.pelo === 'longo') {
                alertas.push({
                    tipo: 'cuidado',
                    titulo: '🪮 Escovação Regular',
                    mensagem: `${pet.nome} tem pelo longo. Escove diariamente para evitar nós e bolas de pelo. Considere suplementos para eliminação de pelos.`,
                    prioridade: 'media',
                    categoria: 'Higiene'
                });
            }
            
            // Raças braquicefálicas (Persa, Exótico, Himalaio)
            if (raca.braquicefalico) {
                alertas.push({
                    tipo: 'saude',
                    titulo: '👁️ Cuidados com os Olhos',
                    mensagem: `Raças de face achatada têm maior risco de problemas oculares. Limpe os olhos diariamente e fique atento a lacrimejamento excessivo.`,
                    prioridade: 'media',
                    categoria: 'Cuidados Especiais'
                });
            }
        }
        
        return alertas;
    },
    
    /**
     * Renderiza alertas específicos na interface
     */
    renderizar(pet, containerId) {
        const alertas = this.gerarAlertas(pet);
        const container = document.getElementById(containerId);
        
        if (!container || alertas.length === 0) return;
        
        let html = '<div class="alertas-especificos" style="margin-top: 1rem;">';
        html += '<h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #1976d2;">📋 Alertas Personalizados</h3>';
        
        // Agrupar por categoria
        const porCategoria = {};
        alertas.forEach(alerta => {
            if (!porCategoria[alerta.categoria]) {
                porCategoria[alerta.categoria] = [];
            }
            porCategoria[alerta.categoria].push(alerta);
        });
        
        // Renderizar por categoria
        Object.entries(porCategoria).forEach(([categoria, alertasCategoria]) => {
            html += `<div style="margin-bottom: 1rem;">`;
            html += `<h4 style="font-size: 0.95rem; color: #666; margin-bottom: 0.5rem;">${categoria}</h4>`;
            
            alertasCategoria.forEach(alerta => {
                const cor = alerta.prioridade === 'alta' ? '#f44336' : 
                           alerta.prioridade === 'media' ? '#ff9800' : '#2196F3';
                
                html += `
                    <div style="border-left: 4px solid ${cor}; padding: 0.75rem; background: #f9f9f9; border-radius: 4px; margin-bottom: 0.5rem;">
                        <div style="font-weight: bold; color: ${cor}; font-size: 0.9rem;">${alerta.titulo}</div>
                        <div style="font-size: 0.85rem; color: #555; margin-top: 0.25rem;">${alerta.mensagem}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};

// Exportar para uso global
window.AlertasEspecificos = AlertasEspecificos;
