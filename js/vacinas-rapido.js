/**
 * Módulo de Registro Rápido de Vacinas
 * Sistema profissional e modular para seleção rápida de vacinas
 */

const VacinasRapido = {
    /**
     * Banco de dados completo de vacinas veterinárias
     */
    vacinas: {
        caes: [
            {
                id: 'v8',
                nome: 'V8 (Óctupla)',
                nomes_alternativos: ['V8', 'Óctupla', 'Polivalente 8'],
                descricao: 'Cinomose, Parvovirose, Hepatite, Adenovirose, Parainfluenza, Coronavirose, Leptospirose (2 cepas)',
                doses: 3,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#4caf50'
            },
            {
                id: 'v10',
                nome: 'V10 (Déctupla)',
                nomes_alternativos: ['V10', 'Déctupla', 'Polivalente 10'],
                descricao: 'V8 + Leptospirose (4 cepas)',
                doses: 3,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#2196F3'
            },
            {
                id: 'v12',
                nome: 'V12',
                descricao: 'V10 + Leptospirose (6 cepas)',
                doses: 3,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#9c27b0'
            },
            {
                id: 'antirrabica',
                nome: 'Antirrábica',
                nomes_alternativos: ['Raiva', 'Anti-rábica', 'Rábica'],
                descricao: 'Proteção contra raiva (obrigatória por lei)',
                doses: 1,
                reforco_anual: true,
                cor: '#f44336'
            },
            {
                id: 'gripe_canina',
                nome: 'Gripe Canina',
                nomes_alternativos: ['Tosse dos Canis', 'KC', 'Kennel Cough', 'Traqueobronquite Infecciosa'],
                descricao: 'Proteção contra Bordetella bronchiseptica e Para influenza canina',
                doses: 1,
                reforco_anual: true,
                cor: '#ff9800'
            },
            {
                id: 'leishmaniose',
                nome: 'Leishmaniose',
                nomes_alternativos: ['Leish', 'Calazar', 'Leishmaniose Visceral'],
                descricao: 'Proteção contra Leishmaniose Visceral (recomendada em regiões endêmicas)',
                doses: 3,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#795548'
            },
            {
                id: 'giardia',
                nome: 'Giárdia',
                nomes_alternativos: ['Giardia', 'Giardiáase'],
                descricao: 'Proteção contra Giardia (parasita intestinal)',
                doses: 2,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#607d8b'
            }
        ],
        gatos: [
            {
                id: 'v3',
                nome: 'V3 (Tríplice Felina)',
                nomes_alternativos: ['V3', 'Tríplice', 'Tríplice Viral Felina'],
                descricao: 'Panleucopenia, Rinotraqueíte, Calicivirose',
                doses: 3,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#4caf50'
            },
            {
                id: 'v4',
                nome: 'V4 (Quádrupla Felina)',
                nomes_alternativos: ['V4', 'Quádrupla', 'Polivalente Felina'],
                descricao: 'V3 + Clamidiose',
                doses: 3,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#2196F3'
            },
            {
                id: 'v5',
                nome: 'V5 (Quíntupla Felina)',
                nomes_alternativos: ['V5', 'Quíntupla'],
                descricao: 'V4 + Leucemia Felina (FeLV)',
                doses: 3,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#9c27b0'
            },
            {
                id: 'antirrabica_felina',
                nome: 'Antirrábica Felina',
                nomes_alternativos: ['Raiva Felina', 'Anti-rábica Gato'],
                descricao: 'Proteção contra raiva (obrigatória por lei)',
                doses: 1,
                reforco_anual: true,
                cor: '#f44336'
            },
            {
                id: 'felv',
                nome: 'FeLV (Leucemia Felina)',
                nomes_alternativos: ['Leucemia Felina', 'FeLV', 'Leukemia'],
                descricao: 'Proteção contra Leucemia Felina',
                doses: 2,
                intervalo_dias: 21,
                reforco_anual: true,
                cor: '#ff9800'
            }
        ]
    },

    /**
     * Renderiza modal de seleção rápida de vacina
     */
    mostrarSelecao(pet) {
        const especie = pet.especie.toLowerCase();
        const ehCao = especie.includes('cao') || especie.includes('cão') || especie.includes('cachorro');
        const listaVacinas = ehCao ? this.vacinas.caes : this.vacinas.gatos;

        const vacinasHTML = listaVacinas.map(v => `
            <div class="vacina-card" style="background: white; border-left: 4px solid ${v.cor}; padding: 1rem; margin-bottom: 0.75rem; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;"
                 onclick="VacinasRapido.selecionarVacina('${pet.id}', '${v.id}')">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.25rem 0; color: ${v.cor};">${v.nome}</h4>
                        ${v.nomes_alternativos ? `<p style="margin: 0.25rem 0; font-size: 0.75rem; color: #999; font-style: italic;">Também conhecida como: ${v.nomes_alternativos.join(', ')}</p>` : ''}
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #666;">${v.descricao}</p>
                        <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #999;">
                            ${v.doses > 1 ? `📅 ${v.doses} doses (intervalo de ${v.intervalo_dias} dias)` : '📅 Dose única'}
                            ${v.reforco_anual ? ' • 🔄 Reforço anual' : ''}
                        </div>
                    </div>
                    <div style="color: ${v.cor}; font-size: 1.5rem;">→</div>
                </div>
            </div>
        `).join('');

        const modalContent = `
            <div class="modal-header">
                <h2>💉 Selecionar Vacina</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <p style="margin: 0 0 1rem 0; color: #666;">
                    Selecione a vacina aplicada em <strong>${pet.nome}</strong>:
                </p>
                ${vacinasHTML}
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal').classList.add('show');
    },

    /**
     * Após selecionar vacina, mostra formulário de data e dose
     */
    selecionarVacina(petId, vacinaId) {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) return;

        const especie = pet.especie.toLowerCase();
        const ehCao = especie.includes('cao') || especie.includes('cão') || especie.includes('cachorro');
        const listaVacinas = ehCao ? this.vacinas.caes : this.vacinas.gatos;
        const vacina = listaVacinas.find(v => v.id === vacinaId);

        if (!vacina) return;

        // Gerar opções de dose
        const dosesHTML = vacina.doses > 1 
            ? Array.from({length: vacina.doses}, (_, i) => `
                <option value="${i + 1}">${i + 1}ª dose</option>
            `).join('') + '<option value="reforco">Reforço anual</option>'
            : '<option value="1">Dose única</option><option value="reforco">Reforço anual</option>';

        const modalContent = `
            <div class="modal-header">
                <h2>💉 ${vacina.nome}</h2>
                <button class="modal-close" onclick="app.closeModal()">×</button>
            </div>
            <div style="padding: 1rem;">
                <form id="vacina-rapida-form" onsubmit="event.preventDefault(); VacinasRapido.salvarVacina('${petId}', '${vacinaId}');">
                    <div style="background: ${vacina.cor}15; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                        <p style="margin: 0; font-size: 0.9rem; color: #333;">
                            <strong>${vacina.descricao}</strong>
                        </p>
                    </div>

                    <div class="form-group">
                        <label>Dose Aplicada *</label>
                        <select id="dose-aplicada" required>
                            ${dosesHTML}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Data da Aplicação *</label>
                        <input type="date" id="data-aplicacao" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>

                    <div class="form-group">
                        <label>Lote da Vacina</label>
                        <input type="text" id="lote-vacina" placeholder="Ex: L12345">
                    </div>

                    <div class="form-group">
                        <label>Veterinário Responsável</label>
                        <input type="text" id="veterinario" placeholder="Nome do veterinário">
                    </div>

                    <div class="form-group">
                        <label>Observações</label>
                        <textarea id="obs-vacina" rows="2" placeholder="Reações, observações..."></textarea>
                    </div>

                    ${vacina.intervalo_dias ? `
                        <div style="background: #e3f2fd; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
                            <p style="margin: 0; font-size: 0.85rem; color: #1976d2;">
                                💡 <strong>Próxima dose:</strong> Agendar para ${vacina.intervalo_dias} dias após esta aplicação
                            </p>
                        </div>
                    ` : ''}

                    <div class="flex justify-end" style="gap: 0.5rem;">
                        <button type="button" class="btn" onclick="app.closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">✅ Registrar Vacina</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
    },

    /**
     * Salva a vacina no prontuário do pet
     */
    salvarVacina(petId, vacinaId) {
        const pet = app.data.pets.find(p => p.id === petId);
        if (!pet) return;

        const especie = pet.especie.toLowerCase();
        const ehCao = especie.includes('cao') || especie.includes('cão') || especie.includes('cachorro');
        const listaVacinas = ehCao ? this.vacinas.caes : this.vacinas.gatos;
        const vacina = listaVacinas.find(v => v.id === vacinaId);

        const doseAplicada = document.getElementById('dose-aplicada').value;
        const dataAplicacao = document.getElementById('data-aplicacao').value;
        const lote = document.getElementById('lote-vacina').value;
        const veterinario = document.getElementById('veterinario').value;
        const obs = document.getElementById('obs-vacina').value;

        // VALIDAÇÃO 1: Verificar duplicatas (mesma vacina na mesma data)
        if (!pet.vacinas) pet.vacinas = [];
        const duplicata = pet.vacinas.find(v => {
            const nomeVacina = v.nome || v.vacinaNome || '';
            return nomeVacina.toLowerCase().includes(vacina.nome.toLowerCase()) && v.data === dataAplicacao;
        });
        
        if (duplicata) {
            app.showToast('⚠️ Já existe um registro desta vacina nesta data!', 'error');
            return;
        }

        // VALIDAÇÃO 2: Verificar se está muito cedo (antes do prazo)
        const ultimaAplicacao = pet.vacinas
            .filter(v => {
                const nomeVacina = v.nome || v.vacinaNome || '';
                return nomeVacina.toLowerCase().includes(vacina.nome.toLowerCase());
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
        
        if (ultimaAplicacao && vacina.intervalo_dias) {
            const dataUltima = new Date(ultimaAplicacao.data);
            const dataNova = new Date(dataAplicacao);
            const diasEntre = Math.floor((dataNova - dataUltima) / (1000 * 60 * 60 * 24));
            const prazoMinimo = vacina.intervalo_dias - 3; // Tolerância de 3 dias
            
            if (diasEntre < prazoMinimo) {
                const confirmar = confirm(
                    `⚠️ ATENÇÃO!\n\n` +
                    `Esta dose está sendo aplicada ANTES do prazo recomendado.\n\n` +
                    `Última aplicação: ${new Date(ultimaAplicacao.data).toLocaleDateString('pt-BR')}\n` +
                    `Intervalo recomendado: ${vacina.intervalo_dias} dias\n` +
                    `Intervalo atual: ${diasEntre} dias\n\n` +
                    `Deseja continuar mesmo assim?`
                );
                
                if (!confirmar) {
                    return;
                }
            }
        }

        // Calcular próxima dose usando sistema de revacinação
        let proximaDose = null;
        let proximaDoseInfo = null;
        
        if (window.Revacinacao) {
            proximaDoseInfo = window.Revacinacao.calcularProximaDose(vacinaId, doseAplicada, dataAplicacao);
            proximaDose = proximaDoseInfo ? proximaDoseInfo.data : null;
        } else {
            // Fallback para cálculo simples
            if (vacina.intervalo_dias && doseAplicada !== 'reforco') {
                const dataProx = new Date(dataAplicacao);
                dataProx.setDate(dataProx.getDate() + vacina.intervalo_dias);
                proximaDose = dataProx.toISOString().split('T')[0];
            } else if (vacina.reforco_anual) {
                const dataProx = new Date(dataAplicacao);
                dataProx.setFullYear(dataProx.getFullYear() + 1);
                proximaDose = dataProx.toISOString().split('T')[0];
            }
        }

        // Criar registro
        const registro = {
            id: Date.now().toString(),
            nome: `${vacina.nome}${doseAplicada !== 'reforco' && vacina.doses > 1 ? ` (${doseAplicada}ª dose)` : doseAplicada === 'reforco' ? ' (Reforço)' : ''}`,
            data: dataAplicacao,
            proxima: proximaDose,
            lote: lote || '',
            veterinario: veterinario || '',
            obs: obs || '',
            cor: vacina.cor,
            tipo: 'vacina'
        };

        // Adicionar ao pet
        pet.vacinas.push(registro);

        // Criar alarme automático se houver próxima dose
        if (proximaDose && window.Alarmes) {
            window.Alarmes.agendarAlarme(
                pet.nome,
                'vacina',
                proximaDose,
                `${registro.nome} - Próxima dose`
            );
        }
        
        // Salvar
        app.saveData();
        app.closeModal();
        app.showToast('✅ Vacina registrada com sucesso!' + (proximaDose ? ' Alarme criado!' : ''), 'success');
        app.render();
    }
};

// Exportar para uso global
window.VacinasRapido = VacinasRapido;
