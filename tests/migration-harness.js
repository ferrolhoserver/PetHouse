(async function () {
  'use strict';
  const output = document.querySelector('#result');
  const steps = [];
  const record = (name, passed, detail = '') => steps.push({ name, passed: Boolean(passed), detail });
  const render = () => {
    output.textContent = JSON.stringify({ passed: steps.every(step => step.passed), steps }, null, 2);
    document.body.dataset.status = steps.every(step => step.passed) ? 'passed' : 'failed';
    window.__migrationHarness = { passed: steps.every(step => step.passed), steps };
  };
  const closeDb = () => new Promise(resolve => {
    const request = indexedDB.deleteDatabase('pethouse_secure_v2');
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });

  try {
    await closeDb();
    localStorage.clear();
    const legacy = {
      casaNome: 'Casa Migração',
      pets: [{
        id: 'pet-legado-1', nome: 'Nina', especie: 'Cachorro', raca: 'SRD',
        peso: [{ data: '2026-08-01', peso: 8.4 }],
        vacinas_wizard: [{ id: 'vac-1', vacinaNome: 'V8', data: '2026-07-01' }],
        banho_tosa: [{ id: 'banho-1', data: '2026-08-05', tipo: 'Banho' }]
      }],
      membros: [{ id: 'membro-1', nome: 'Responsável de Teste' }]
    };
    localStorage.setItem('pethouse_data', JSON.stringify(legacy));
    record('origem legada gravada', localStorage.getItem('pethouse_data') === JSON.stringify(legacy));

    const candidates = await window.PetHouseLegacyMigration.discover();
    record('descoberta encontra a origem legada', candidates.length === 1 && candidates[0].pets === 1 && candidates[0].casaNome === 'Casa Migração');

    const created = await window.PetHouseLegacyMigration.migrate(candidates[0], {
      displayName: 'Perfil Migrado', password: 'Teste#Seguro2026', confirmation: 'Teste#Seguro2026'
    });
    record('perfil cifrado criado', Boolean(created.profile?.profileId) && Boolean(created.recoveryCode));
    record('origem legada preservada', localStorage.getItem('pethouse_data') === JSON.stringify(legacy));

    const unlocked = await window.PetHouseIdentity.unlock(created.profile.profileId, 'Teste#Seguro2026');
    record('conteúdo do pet preservado no cofre', unlocked.data.pets?.[0]?.nome === 'Nina' && unlocked.data.pets?.[0]?.vacinas_wizard?.[0]?.vacinaNome === 'V8' && unlocked.data.pets?.[0]?.banho_tosa?.[0]?.tipo === 'Banho');

    window.PetHouseIdentity.lock('test-recovery');
    await window.PetHouseIdentity.restorePasswordWithRecovery(created.profile.profileId, created.recoveryCode, 'Nova#Senha2026', 'Nova#Senha2026');
    const afterRecovery = await window.PetHouseIdentity.unlock(created.profile.profileId, 'Nova#Senha2026');
    record('redefinição local pelo kit de recuperação', afterRecovery.data.pets?.[0]?.nome === 'Nina');

    let duplicateBlocked = false;
    try {
      await window.PetHouseLegacyMigration.migrate(candidates[0], {
        displayName: 'Duplicado', password: 'Teste#Seguro2026', confirmation: 'Teste#Seguro2026'
      });
    } catch (error) { duplicateBlocked = /já foram migrados/i.test(error.message); }
    record('duplicidade de migração bloqueada', duplicateBlocked);

    const rollback = await window.PetHouseLegacyMigration.rollback(created.profile.profileId);
    record('reversão concluída', rollback.rolledBack === true && rollback.sourcePets === 1);
    record('origem permanece após reversão', localStorage.getItem('pethouse_data') === JSON.stringify(legacy));
    record('perfil de migração removido após reversão', !(await window.PetHouseSecureStore.getProfile(created.profile.profileId)));
  } catch (error) {
    record('execução do harness', false, error?.stack || error?.message || String(error));
  }
  render();
}());
