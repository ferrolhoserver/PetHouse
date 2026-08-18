/* PetHouse V2 — Centro de segurança e recuperação de conta */
(function () {
    'use strict';

    let overlay = null;
    let activeApp = null;
    let enrolledFactor = null;

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
    }

    function showToast(message, type = 'info') {
        if (activeApp?.showToast) activeApp.showToast(message, type);
    }

    function close() {
        overlay?.remove();
        overlay = null;
        enrolledFactor = null;
    }

    function download(name, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function renderDeviceFactorState() {
        const target = overlay?.querySelector('#ph-device-factor-state');
        const session = window.PetHouseIdentity.getSession();
        if (!target || !session) return;
        if (session.profile.localMfa) {
            target.innerHTML = `<div class="ph-security-status ph-security-status--success"><strong>Confirmação do dispositivo ativada</strong><span>Além da senha, este perfil pede Face ID, Touch ID ou o código deste dispositivo ao desbloquear.</span></div><button type="button" class="ph-text-button" data-security-action="disable-device-factor">Remover confirmação deste dispositivo</button>`;
            return;
        }
        if (!window.PetHouseIdentity.deviceFactorSupported()) {
            target.innerHTML = '<div class="ph-security-status ph-security-status--neutral"><strong>Confirmação do dispositivo indisponível</strong><span>Use um navegador ou aparelho compatível com Face ID, Touch ID ou bloqueio seguro para ativar a segunda camada local.</span></div>';
            return;
        }
        target.innerHTML = '<div class="ph-security-status ph-security-status--neutral"><strong>Segunda camada local recomendada</strong><span>Exija Face ID, Touch ID ou o código deste dispositivo após digitar a senha do perfil.</span></div><button type="button" class="ph-secondary-button" data-security-action="enable-device-factor">Ativar confirmação deste dispositivo</button>';
    }

    async function renderRemoteState() {
        const target = overlay?.querySelector('#ph-remote-state');
        if (!target) return;
        target.textContent = 'Verificando proteção remota…';
        try {
            const session = await window.PetHouseRemoteAuth.getSession();
            if (session.configured === false) {
                target.innerHTML = `<div class="ph-security-status ph-security-status--neutral"><strong>Recuperação remota ainda não configurada</strong><span>Seu cofre local permanece protegido e funciona offline. A vinculação por e-mail estará disponível após concluir a configuração segura do servidor.</span></div>`;
                return;
            }
            if (!session.authenticated) {
                target.innerHTML = `
                    <div class="ph-security-status ph-security-status--neutral"><strong>Perfil local sem conta remota vinculada</strong><span>Você pode continuar offline. Vincule um e-mail para recuperação e segundo fator em novos aparelhos.</span></div>
                    <form id="ph-remote-signup" class="ph-security-form">
                        <label class="ph-field"><span>E-mail para recuperação</span><input id="ph-remote-email" type="email" autocomplete="email" required placeholder="voce@exemplo.com"></label>
                        <label class="ph-field"><span>Senha da conta</span><input id="ph-remote-password" type="password" autocomplete="new-password" required minlength="12"></label>
                        <button class="ph-primary-button" type="submit">Vincular e-mail com confirmação</button>
                    </form>
                    <button type="button" class="ph-text-button" data-security-action="request-reset">Já tenho uma conta ou preciso redefinir a senha</button>`;
                bindRemoteForms();
                return;
            }
            target.innerHTML = `
                <div class="ph-security-status ph-security-status--success"><strong>E-mail vinculado</strong><span>${escapeHtml(session.user?.email || 'Conta verificada')} · sessão protegida por cookie seguro.</span></div>
                <div id="ph-mfa-status" class="ph-security-status ph-security-status--neutral">Verificando segundo fator…</div>
                <div class="ph-security-actions">
                    <button type="button" class="ph-secondary-button" data-security-action="setup-mfa">Configurar aplicativo autenticador</button>
                    <button type="button" class="ph-text-button" data-security-action="remote-signout">Sair da conta remota</button>
                </div>`;
            await renderMfaStatus();
        } catch (error) {
            target.innerHTML = `<div class="ph-security-status ph-security-status--neutral"><strong>Recuperação remota indisponível neste momento</strong><span>Seu cofre continua protegido e utilizável offline. A vinculação por e-mail será habilitada assim que a infraestrutura de recuperação estiver configurada.</span></div>`;
            console.warn('Recuperação remota indisponível:', error.message);
        }
    }

    async function renderMfaStatus() {
        const target = overlay?.querySelector('#ph-mfa-status');
        if (!target) return;
        try {
            const state = await window.PetHouseRemoteAuth.mfaStatus();
            const hasFactor = state.factors?.length > 0;
            target.className = `ph-security-status ${state.currentLevel === 'aal2' ? 'ph-security-status--success' : 'ph-security-status--neutral'}`;
            target.innerHTML = state.currentLevel === 'aal2'
                ? '<strong>Segundo fator confirmado</strong><span>Esta sessão está no nível reforçado de segurança.</span>'
                : hasFactor
                    ? '<strong>Segundo fator pendente nesta sessão</strong><span>Confirme o código do autenticador antes de sincronizar ou gerenciar dispositivos.</span>'
                    : '<strong>Segundo fator ainda não ativado</strong><span>Ative o autenticador antes de habilitar backup remoto.</span>';
            if (hasFactor && state.currentLevel !== 'aal2') {
                const actions = overlay.querySelector('.ph-security-actions');
                if (actions && !actions.querySelector('[data-security-action="verify-mfa"]')) actions.insertAdjacentHTML('afterbegin', '<button type="button" class="ph-primary-button" data-security-action="verify-mfa">Confirmar código do autenticador</button>');
            }
        } catch (error) {
            target.className = 'ph-security-status ph-security-status--danger';
            target.textContent = error.message;
        }
    }

    function qrDataUrl(qrCode) {
        if (String(qrCode).startsWith('data:image/')) return qrCode;
        const safeSvg = String(qrCode);
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(safeSvg)))}`;
    }

    async function setupMfa() {
        const target = overlay?.querySelector('#ph-remote-state');
        if (!target) return;
        try {
            const result = await window.PetHouseRemoteAuth.mfaEnroll('PetHouse');
            enrolledFactor = result.factor.id;
            const setup = document.createElement('section');
            setup.className = 'ph-mfa-setup';
            setup.id = 'ph-mfa-setup';
            setup.innerHTML = `
                <h3>Ative o segundo fator</h3>
                <p>Escaneie o código com seu aplicativo autenticador. Em seguida, informe o código de seis dígitos para concluir.</p>
                <label class="ph-field"><span>Chave manual</span><input id="ph-mfa-secret" readonly value="${escapeHtml(result.totp.secret)}"></label>
                <label class="ph-field"><span>Código do autenticador</span><input id="ph-mfa-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" maxlength="8" placeholder="000000"></label>
                <button type="button" class="ph-primary-button" data-security-action="complete-mfa-enrollment">Ativar segundo fator</button>`;
            const image = document.createElement('img');
            image.className = 'ph-mfa-qr';
            image.alt = 'Código QR para configurar o autenticador';
            image.src = qrDataUrl(result.totp.qrCode);
            setup.insertBefore(image, setup.querySelector('.ph-field'));
            target.appendChild(setup);
        } catch (error) { showToast(error.message, 'error'); }
    }

    function showResetForm() {
        const target = overlay?.querySelector('#ph-remote-state');
        if (!target || target.querySelector('#ph-reset-form')) return;
        const form = document.createElement('form');
        form.id = 'ph-reset-form';
        form.className = 'ph-security-form';
        form.innerHTML = '<label class="ph-field"><span>E-mail de recuperação</span><input id="ph-reset-email" type="email" autocomplete="email" required placeholder="voce@exemplo.com"></label><button type="button" class="ph-secondary-button" data-security-action="submit-reset">Enviar instruções de redefinição</button>';
        target.appendChild(form);
    }

    function showDeleteProfileForm() {
        const target = overlay?.querySelector('#ph-delete-profile');
        if (!target || target.querySelector('form')) return;
        target.innerHTML = `<form class="ph-security-form ph-delete-form"><p>Esta ação exclui o cofre, os prontuários e a cópia legada migrada deste aparelho. Exporte um backup cifrado antes, se precisar preservar os dados.</p><label class="ph-field"><span>Digite <strong>EXCLUIR</strong> para confirmar</span><input id="ph-delete-confirm" autocomplete="off" spellcheck="false" required></label><button type="button" class="ph-danger-button" data-security-action="confirm-delete-profile">Excluir perfil e dados deste aparelho</button></form>`;
    }

    function showVerifyMfaForm() {
        const target = overlay?.querySelector('#ph-remote-state');
        if (!target || target.querySelector('#ph-mfa-verify-form')) return;
        const form = document.createElement('form');
        form.id = 'ph-mfa-verify-form';
        form.className = 'ph-security-form';
        form.innerHTML = '<label class="ph-field"><span>Código do autenticador</span><input id="ph-mfa-existing-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" maxlength="8" required placeholder="000000"></label><button type="button" class="ph-primary-button" data-security-action="submit-mfa-code">Confirmar segundo fator</button>';
        target.appendChild(form);
    }

    async function verifyMfa(code) {
        let factorId = enrolledFactor;
        if (!factorId) {
            const state = await window.PetHouseRemoteAuth.mfaStatus();
            factorId = state.factors?.[0]?.id;
        }
        if (!factorId) throw new Error('Nenhum autenticador configurado.');
        const challenge = await window.PetHouseRemoteAuth.mfaChallenge(factorId);
        await window.PetHouseRemoteAuth.mfaVerify(factorId, challenge.challengeId, code);
        enrolledFactor = null;
        overlay?.querySelector('#ph-mfa-setup')?.remove();
        showToast('Segundo fator confirmado.', 'success');
        await renderMfaStatus();
    }

    function bindRemoteForms() {
        overlay?.querySelector('#ph-remote-signup')?.addEventListener('submit', async event => {
            event.preventDefault();
            const button = event.currentTarget.querySelector('button');
            button.disabled = true;
            try {
                const response = await window.PetHouseRemoteAuth.signUp(
                    overlay.querySelector('#ph-remote-email').value,
                    overlay.querySelector('#ph-remote-password').value
                );
                showToast(response.message, 'success');
            } catch (error) { showToast(error.message, 'error'); }
            finally { button.disabled = false; }
        });
    }

    function bindActions() {
        overlay.addEventListener('click', async event => {
            const action = event.target.closest('[data-security-action]')?.dataset.securityAction;
            if (!action) return;
            try {
                if (action === 'close') close();
                if (action === 'export-secure') {
                    const session = window.PetHouseIdentity.getSession();
                    const backup = await window.PetHouseSecureStore.exportSecureProfile(session.profile.profileId);
                    download(`pethouse-seguro-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), 'application/json');
                    showToast('Backup cifrado exportado.', 'success');
                }
                if (action === 'lock') { window.PetHouseIdentity.lock('manual'); close(); window.location.reload(); }
                if (action === 'enable-device-factor') {
                    await window.PetHouseIdentity.enableDeviceFactor();
                    renderDeviceFactorState();
                    showToast('Confirmação do dispositivo ativada.', 'success');
                }
                if (action === 'disable-device-factor') {
                    await window.PetHouseIdentity.disableDeviceFactor();
                    renderDeviceFactorState();
                    showToast('Confirmação do dispositivo removida.', 'success');
                }
                if (action === 'request-delete-profile') showDeleteProfileForm();
                if (action === 'confirm-delete-profile') {
                    if (overlay.querySelector('#ph-delete-confirm')?.value.trim().toLocaleUpperCase('pt-BR') !== 'EXCLUIR') throw new Error('Digite EXCLUIR para confirmar a remoção definitiva.');
                    await window.PetHouseIdentity.deleteCurrentProfile();
                    close();
                    window.location.reload();
                    return;
                }
                if (action === 'request-reset') showResetForm();
                if (action === 'submit-reset') {
                    const email = overlay.querySelector('#ph-reset-email').value.trim();
                    if (!email) throw new Error('Informe seu e-mail de recuperação.');
                    showToast((await window.PetHouseRemoteAuth.requestPasswordReset(email)).message, 'success');
                }
                if (action === 'remote-signout') { await window.PetHouseRemoteAuth.signOut(); await renderRemoteState(); showToast('Sessão remota encerrada.', 'success'); }
                if (action === 'setup-mfa') await setupMfa();
                if (action === 'complete-mfa-enrollment') await verifyMfa(overlay.querySelector('#ph-mfa-code').value.trim());
                if (action === 'verify-mfa') showVerifyMfaForm();
                if (action === 'submit-mfa-code') await verifyMfa(overlay.querySelector('#ph-mfa-existing-code').value.trim());
            } catch (error) { showToast(error.message || 'Não foi possível concluir a ação.', 'error'); }
        });
    }

    function open(app) {
        activeApp = app;
        const session = window.PetHouseIdentity.getSession();
        if (!session) { showToast('Desbloqueie o perfil para abrir a segurança.', 'warning'); return; }
        close();
        overlay = document.createElement('div');
        overlay.className = 'ph-security-overlay';
        overlay.innerHTML = `
            <section class="ph-security-panel" role="dialog" aria-modal="true" aria-labelledby="ph-security-title">
                <header><div><p class="ph-eyebrow">SEGURANÇA E RECUPERAÇÃO</p><h2 id="ph-security-title">Perfil ${escapeHtml(session.profile.displayName)}</h2></div><button type="button" class="ph-security-close" aria-label="Fechar" data-security-action="close">×</button></header>
                <section class="ph-security-section"><h3>Cofre neste dispositivo</h3><div class="ph-security-status ph-security-status--success"><strong>Dados cifrados e isolados</strong><span>O prontuário funciona offline e não é enviado automaticamente.</span></div><div class="ph-security-actions"><button type="button" class="ph-secondary-button" data-security-action="export-secure">Exportar backup cifrado</button><button type="button" class="ph-text-button" data-security-action="lock">Bloquear agora</button></div></section>
                <section class="ph-security-section"><h3>Senha + confirmação do dispositivo</h3><div id="ph-device-factor-state"></div></section>
                <section class="ph-security-section"><h3>Recuperação por e-mail e autenticador</h3><div id="ph-remote-state"></div></section>
                <section class="ph-security-section ph-security-section--danger"><h3>Excluir perfil deste aparelho</h3><p class="ph-security-copy">A exclusão remove este perfil e todos os prontuários deste dispositivo. Ela não pode ser desfeita sem um backup exportado.</p><button type="button" class="ph-text-button ph-text-button--danger" data-security-action="request-delete-profile">Iniciar exclusão definitiva</button><div id="ph-delete-profile"></div></section>
            </section>`;
        document.body.appendChild(overlay);
        bindActions();
        renderDeviceFactorState();
        renderRemoteState();
    }

    window.PetHouseSecurityCenter = Object.freeze({ open, close });
}());
