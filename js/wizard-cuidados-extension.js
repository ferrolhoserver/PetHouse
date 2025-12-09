/**
 * Extensão para adicionar botão Wizard Vacinas na aba Cuidados
 */

// Interceptar renderContent do módulo Cuidados
const _originalCuidadosRender = Cuidados.renderContent;
Cuidados.renderContent = function(pet) {
    try {
        if (!pet) return '';
        const originalHTML = _originalCuidadosRender.call(this, pet);
    
    // Adicionar botão wizard no topo
    const botaoWizard = `
        <button onclick="WizardVacinas.iniciar()" 
                style="width:100%;padding:1.25rem;margin-bottom:1rem;border:none;border-radius:16px;background:linear-gradient(135deg,#2196F3,#42A5F5);color:white;font-size:1.2rem;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(33,150,243,0.3);transition:all 0.2s"
                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 24px rgba(33,150,243,0.4)'"
                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(33,150,243,0.3)'">
            💉 Adicionar Vacina (Wizard)
        </button>
    `;
    
        // Inserir botão após o <h3>
        return originalHTML.replace(
            '<h3 style="margin-bottom: 1rem;">💝 Cuidados</h3>',
            `<h3 style="margin-bottom: 1rem;">💝 Cuidados</h3>${botaoWizard}`
        );
    } catch (error) {
        console.error('Erro ao renderizar extensão cuidados:', error);
        return _originalCuidadosRender.call(this, pet);
    }
};

// Renderizar lista de vacinas do wizard
function renderVacinasWizard(pet) {
    try {
        if (!pet || !pet.vacinas_wizard || pet.vacinas_wizard.length === 0) return '';
    
    const lista = pet.vacinas_wizard.sort((a,b) => new Date(b.data) - new Date(a.data)).map(v => {
        const dataFormatada = new Date(v.data).toLocaleDateString('pt-BR');
        const proximaDoseHTML = v.proximaDose ? 
            `<div style="margin-top:0.5rem;padding:0.5rem;background:#fff3e0;border-radius:8px;font-size:0.85rem">
                📅 Próxima dose: <strong>${new Date(v.proximaDose).toLocaleDateString('pt-BR')}</strong>
            </div>` : '';
        
        return `
            <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:4px solid ${v.vacinaCor}">
                <div style="display:flex;justify-content:space-between;align-items:start">
                    <div style="flex:1">
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
                            <span style="font-size:1.5rem">${v.vacinaIcon}</span>
                            <strong style="font-size:1.1rem">${v.vacinaNome}</strong>
                            <span style="background:${v.vacinaCor};color:white;padding:0.25rem 0.5rem;border-radius:12px;font-size:0.75rem">${v.dose}/${v.totalDoses}</span>
                        </div>
                        <div style="color:#666;font-size:0.95rem">
                            <div style="margin-bottom:0.25rem">📅 ${dataFormatada}</div>
                            <div style="display:flex;align-items:center;gap:0.5rem">
                                <span>${v.localIcon}</span>
                                <span>${v.localNome}</span>
                            </div>
                            ${v.lote ? `<div style="margin-top:0.25rem">🏷️ Lote: ${v.lote}</div>` : ''}
                            ${v.veterinario ? `<div>👨‍⚕️ ${v.veterinario}</div>` : ''}
                        </div>
                        ${proximaDoseHTML}
                    </div>
                    <button onclick="if(confirm('Deletar?')){const pet=app.data.pets.find(p=>p.id===app.currentPet);pet.vacinas_wizard=pet.vacinas_wizard.filter(x=>x.id!==${v.id});app.saveData();app.render()}" 
                            style="background:#f44336;color:white;padding:0.5rem 0.75rem;border-radius:8px;border:none;cursor:pointer;font-size:1.2rem">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    return `
            <h3 style="margin:2rem 0 1rem 0;color:#2196F3;font-size:1.3rem">💉 Vacinas (Wizard) - ${pet.vacinas_wizard.length}</h3>
            ${lista}
        `;
    } catch (error) {
        console.error('Erro ao renderizar vacinas wizard:', error);
        return '';
    }
}

// Adicionar renderização das vacinas wizard no final da aba
const _originalCuidadosRender2 = Cuidados.renderContent;
Cuidados.renderContent = function(pet) {
    const originalHTML = _originalCuidadosRender2.call(this, pet);
    
    // Inicializar array se não existir
    if (!pet.vacinas_wizard) pet.vacinas_wizard = [];
    
    // Adicionar lista de vacinas wizard antes do </div> final
    const vacinasWizardHTML = renderVacinasWizard(pet);
    
    return originalHTML.replace('</div>', `${vacinasWizardHTML}</div>`);
};

console.log('✅ Wizard Cuidados Extension carregado');
