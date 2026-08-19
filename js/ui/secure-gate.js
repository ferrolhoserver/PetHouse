/*
 * PetHouse V2 — Porta de entrada segura.
 * Mantém a interface de autenticação independente do app legado e só inicia
 * os módulos de pets depois de um perfil criptografado estar desbloqueado.
 */
(function () {
    'use strict';

    let onUnlocked = null;
    let root = null;
    let legacyCandidates = [];
    let pendingRecovery = null;

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
    }

    function passwordField(id, label, autocomplete) {
        return `
            <label class="ph-field" for="${id}">
                <span>${label}</span>
                <span class="ph-password-wrap">
                    <input id="${id}" name="${id}" type="password" autocomplete="${autocomplete}" required minlength="12" spellcheck="false">
                    <button type="button" class="ph-password-toggle" data-toggle-password="${id}" aria-label="Mostrar senha">Mostrar</button>
                </span>
            </label>`;
    }

    function renderShell(content) {
        root.innerHTML = `
            <main class="ph-secure-gate" aria-live="polite">
                <section class="ph-auth-card" aria-labelledby="secure-title">
                    <header class="ph-auth-header">
                        <div class="ph-brand-mark" aria-hidden="true">🐾</div>
                        <div>
                            <p class="ph-eyebrow">PETHOUSE PRIVADO</p>
                            <h1 id="secure-title">Seu espaço, protegido.</h1>
                            <p class="ph-auth-subtitle">Prontuários armazenados com segurança neste dispositivo.</p>
                        </div>
                    </header>
                    <div id="ph-auth-message" class="ph-auth-message" role="status"></div>
                    ${content}
                    <footer class="ph-auth-footer">
                        <span class="ph-status-dot" aria-hidden="true"></span>
                        <span>Modo offline pronto para uso</span>
                    </footer>
                </section>
            </main>`;
        bindEvents();
    }

    function showMessage(message, type = 'error') {
        const target = document.getElementById('ph-auth-message');
        if (!target) return;
        target.textContent = message;
        target.dataset.type = type;
    }

    function createForm(candidate) {
        const source = candidate ? `
            <div class="ph-migration-note">
                <strong>Dados encontrados neste aparelho</strong>
                <span>${escapeHtml(candidate.casaNome)} · ${candidate.pets} pet${candidate.pets === 1 ? '' : 's'}</span>
                <button type="button" class="ph-text-button" data-action="download-legacy">Baixar cópia de segurança</button>
            </div>` : `
            <div class="ph-migration-note ph-migration-note--clean">
                <strong>Novo perfil privado</strong>
                <span>Você poderá adicionar seus pets e registros de forma totalmente offline.</span>
            </div>`;
        return `
            <form id="ph-create-profile" class="ph-auth-form">
                ${source}
                <label class="ph-field" for="ph-display-name"><span>Como devemos chamar você?</span><input id="ph-display-name" name="displayName" autocomplete="name" required minlength="2" maxlength="50" placeholder="Ex.: Rodrigo"></label>
                ${passwordField('ph-new-password', 'Crie uma senha forte', 'new-password')}
                ${passwordField('ph-confirm-password', 'Confirme a senha', 'new-password')}
                <p class="ph-password-hint">Mínimo de 12 caracteres, com letra maiúscula, minúscula, número e símbolo.</p>
                <button type="submit" class="ph-primary-button">Criar perfil protegido</button>
                ${legacyCandidates.length > 1 ? '<button type="button" class="ph-secondary-button" data-action="choose-legacy">Escolher outros dados encontrados</button>' : ''}
                ${candidate ? '<button type="button" class="ph-text-button ph-block" data-action="start-clean">Criar perfil vazio em vez disso</button>' : ''}
            </form>`;
    }

    async function renderEntry() {
        legacyCandidates = await window.PetHouseLegacyMigration.discover();
        const profiles = await window.PetHouseIdentity.listProfiles();
        if (profiles.length) return renderUnlock(profiles);
        renderShell(createForm(legacyCandidates[0] || null));
    }

    function renderUnlock(profiles) {
        const profileCards = profiles.map((profile, index) => `
            <button type="button" class="ph-profile-choice${index === 0 ? ' is-selected' : ''}" data-profile-id="${escapeHtml(profile.profileId)}" aria-pressed="${index === 0 ? 'true' : 'false'}">
                <span class="ph-profile-avatar">${escapeHtml(profile.displayName.slice(0, 1).toUpperCase())}</span>
                <span><strong>${escapeHtml(profile.displayName)}</strong><small>${profile.remote?.emailMasked || 'Somente neste dispositivo'}</small></span>
            </button>`).join('');
        renderShell(`
            <form id="ph-unlock-profile" class="ph-auth-form">
                <div class="ph-profile-list" role="listbox" aria-label="Perfis disponíveis">${profileCards}</div>
                <input type="hidden" id="ph-selected-profile" value="${escapeHtml(profiles[0].profileId)}">
                ${passwordField('ph-unlock-password', 'Senha do perfil', 'current-password')}
                <button type="submit" class="ph-primary-button">Desbloquear PetHouse</button>
                <button type="button" class="ph-text-button ph-block" data-action="show-recovery">Esqueci minha senha</button>
                <button type="button" class="ph-secondary-button" data-action="create-profile">Criar outro perfil neste aparelho</button>
            </form>`);
    }

    function renderRecovery() {
        renderShell(`
            <form id="ph-recovery-form" class="ph-auth-form">
                <div class="ph-migration-note"><strong>Recuperação local</strong><span>Use o kit de recuperação criado ao configurar este perfil. O código nunca é enviado para a internet.</span></div>
                <label class="ph-field" for="ph-recovery-profile"><span>Perfil</span><select id="ph-recovery-profile" required></select></label>
                <label class="ph-field" for="ph-recovery-code"><span>Kit de recuperação</span><textarea id="ph-recovery-code" required autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Cole o código de recuperação"></textarea></label>
                ${passwordField('ph-recovery-password', 'Nova senha forte', 'new-password')}
                ${passwordField('ph-recovery-confirm', 'Confirme a nova senha', 'new-password')}
                <button type="submit" class="ph-primary-button">Redefinir senha local</button>
                <button type="button" class="ph-text-button ph-block" data-action="back-unlock">Voltar ao acesso</button>
            </form>`);
        window.PetHouseIdentity.listProfiles().then(profiles => {
            const select = document.getElementById('ph-recovery-profile');
            if (!select) return;
            select.innerHTML = profiles.map(profile => `<option value="${escapeHtml(profile.profileId)}">${escapeHtml(profile.displayName)}</option>`).join('');
        });
    }

    function renderRecoveryKit(profile, recoveryCode, session) {
        pendingRecovery = { profile, recoveryCode, session };
        renderShell(`
            <section class="ph-auth-form ph-recovery-kit">
                <div class="ph-success-mark" aria-hidden="true">✓</div>
                <h2>Perfil protegido criado</h2>
                <p>Guarde este kit em local seguro. Ele será necessário apenas para recuperar seus dados em outro aparelho ou redefinir a senha local.</p>
                <label class="ph-field" for="ph-recovery-display"><span>Kit de recuperação</span><textarea id="ph-recovery-display" readonly aria-label="Kit de recuperação">${escapeHtml(recoveryCode)}</textarea></label>
                <p class="ph-password-hint">Por segurança, este código não será exibido de novo. Faça uma cópia agora.</p>
                <div class="ph-action-row"><button type="button" class="ph-secondary-button" data-action="copy-recovery">Copiar</button><button type="button" class="ph-secondary-button" data-action="download-recovery">Salvar arquivo</button></div>
                <label class="ph-check"><input id="ph-recovery-confirmed" type="checkbox"> <span>Guardei meu kit de recuperação.</span></label>
                <button type="button" class="ph-primary-button" data-action="finish-profile" disabled>Entrar no PetHouse</button>
            </section>`);
    }

    async function finishUnlock(result) {
        if (!onUnlocked) throw new Error('O aplicativo não está pronto para iniciar.');
        root.innerHTML = '';
        await onUnlocked(result);
    }

    function selectedCandidate() {
        const selectedKey = root.dataset.selectedLegacy;
        if (selectedKey === '') return null;
        if (selectedKey) return legacyCandidates.find(candidate => candidate.key === selectedKey) || null;
        return legacyCandidates[0] || null;
    }

    function downloadRecovery(code) {
        const content = `PetHouse — Kit de Recuperação\n\nGuarde este código em um local seguro. Não compartilhe com ninguém.\n\n${code}\n`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'pethouse-kit-de-recuperacao.txt';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    function bindEvents() {
        root.querySelectorAll('[data-toggle-password]').forEach(button => {
            button.addEventListener('click', () => {
                const input = document.getElementById(button.dataset.togglePassword);
                const hidden = input.type === 'password';
                input.type = hidden ? 'text' : 'password';
                button.textContent = hidden ? 'Ocultar' : 'Mostrar';
                button.setAttribute('aria-label', hidden ? 'Ocultar senha' : 'Mostrar senha');
            });
        });

        root.querySelectorAll('.ph-profile-choice').forEach(button => {
            button.addEventListener('click', () => {
                root.querySelectorAll('.ph-profile-choice').forEach(item => { item.classList.remove('is-selected'); item.setAttribute('aria-pressed', 'false'); });
                button.classList.add('is-selected');
                button.setAttribute('aria-pressed', 'true');
                document.getElementById('ph-selected-profile').value = button.dataset.profileId;
            });
        });

        const create = document.getElementById('ph-create-profile');
        if (create) create.addEventListener('submit', async event => {
            event.preventDefault();
            const submit = create.querySelector('[type="submit"]');
            submit.disabled = true;
            try {
                const candidate = selectedCandidate();
                const password = document.getElementById('ph-new-password').value;
                const credentials = {
                    displayName: document.getElementById('ph-display-name').value,
                    password,
                    confirmation: document.getElementById('ph-confirm-password').value
                };
                const result = candidate
                    ? await window.PetHouseLegacyMigration.migrate(candidate, credentials)
                    : await window.PetHouseIdentity.createProfile(credentials);
                const session = await window.PetHouseIdentity.unlock(result.profile.profileId, password);
                renderRecoveryKit(result.profile, result.recoveryCode, session);
            } catch (error) {
                showMessage(error.message || 'Não foi possível criar o perfil.');
                submit.disabled = false;
            }
        });

        const unlock = document.getElementById('ph-unlock-profile');
        if (unlock) unlock.addEventListener('submit', async event => {
            event.preventDefault();
            const submit = unlock.querySelector('[type="submit"]');
            submit.disabled = true;
            try {
                const result = await window.PetHouseIdentity.unlock(
                    document.getElementById('ph-selected-profile').value,
                    document.getElementById('ph-unlock-password').value
                );
                await finishUnlock(result);
            } catch (error) {
                showMessage(error.message || 'Não foi possível desbloquear o perfil.');
                submit.disabled = false;
            }
        });

        const recovery = document.getElementById('ph-recovery-form');
        if (recovery) recovery.addEventListener('submit', async event => {
            event.preventDefault();
            const submit = recovery.querySelector('[type="submit"]');
            submit.disabled = true;
            try {
                await window.PetHouseIdentity.restorePasswordWithRecovery(
                    document.getElementById('ph-recovery-profile').value,
                    document.getElementById('ph-recovery-code').value,
                    document.getElementById('ph-recovery-password').value,
                    document.getElementById('ph-recovery-confirm').value
                );
                showMessage('Senha redefinida. Agora desbloqueie seu perfil.', 'success');
                window.setTimeout(() => window.PetHouseIdentity.listProfiles().then(renderUnlock), 600);
            } catch (error) {
                showMessage(error.message || 'Não foi possível redefinir a senha.');
                submit.disabled = false;
            }
        });

        root.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', async () => {
            const action = button.dataset.action;
            if (action === 'create-profile' || action === 'start-clean') { root.dataset.selectedLegacy = ''; renderShell(createForm(null)); }
            if (action === 'back-unlock') window.PetHouseIdentity.listProfiles().then(renderUnlock);
            if (action === 'show-recovery') renderRecovery();
            if (action === 'download-legacy') { const candidate = selectedCandidate(); if (candidate) window.PetHouseLegacyMigration.exportCandidate(candidate); }
            if (action === 'choose-legacy') { renderShell(`<section class="ph-auth-form"><h2>Escolha os dados a migrar</h2>${legacyCandidates.map(candidate => `<button type="button" class="ph-profile-choice" data-select-legacy="${escapeHtml(candidate.key)}"><span class="ph-profile-avatar">🐾</span><span><strong>${escapeHtml(candidate.casaNome)}</strong><small>${candidate.pets} pet${candidate.pets === 1 ? '' : 's'} encontrados</small></span></button>`).join('')}<button type="button" class="ph-text-button ph-block" data-action="start-clean">Criar perfil vazio</button></section>`); root.querySelectorAll('[data-select-legacy]').forEach(choice => choice.addEventListener('click', () => { root.dataset.selectedLegacy = choice.dataset.selectLegacy; renderShell(createForm(selectedCandidate())); })); }
            if (action === 'copy-recovery' && pendingRecovery) { await navigator.clipboard?.writeText(pendingRecovery.recoveryCode); showMessage('Kit copiado. Guarde-o em um local seguro.', 'success'); }
            if (action === 'download-recovery' && pendingRecovery) downloadRecovery(pendingRecovery.recoveryCode);
            if (action === 'finish-profile' && pendingRecovery) {
                await finishUnlock(pendingRecovery.session);
                pendingRecovery = null;
            }
        }));

        const confirmation = document.getElementById('ph-recovery-confirmed');
        if (confirmation) confirmation.addEventListener('change', () => {
            const finish = root.querySelector('[data-action="finish-profile"]');
            if (finish) finish.disabled = !confirmation.checked;
        });
    }

    async function start(callback) {
        onUnlocked = callback;
        root = document.getElementById('app-root');
        if (!root) throw new Error('Área principal do PetHouse não encontrada.');
        await renderEntry();
    }

    async function startMigration(callback) {
        onUnlocked = callback || onUnlocked;
        root = document.getElementById('app-root');
        if (!root) throw new Error('Área principal do PetHouse não encontrada.');
        legacyCandidates = await window.PetHouseLegacyMigration.discover();
        const candidate = legacyCandidates[0] || null;
        if (!candidate) {
            await renderEntry();
            return;
        }
        root.dataset.selectedLegacy = candidate.key;
        renderShell(createForm(candidate));
    }

    window.PetHouseSecureGate = Object.freeze({ start, startMigration, renderEntry });
}());
