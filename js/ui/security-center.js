/* PetHouse V2 — Centro de segurança local e recuperação de perfil */
(function () {
    'use strict';

    let overlay = null;
    let activeApp = null;

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
    }

    function showToast(message, type = 'info') {
        if (activeApp?.showToast) activeApp.showToast(message, type);
    }

    function close() {
        overlay?.remove();
        overlay = null;
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

    function renderRecoveryState() {
        const target = overlay?.querySelector('#ph-local-recovery-state');
        if (!target) return;
        target.innerHTML = '<div class="ph-security-status ph-security-status--neutral"><strong>Recuperação sem servidor</strong><span>O kit de recuperação criado com este perfil é a sua chave para redefinir a senha local. Ele não é enviado por e-mail nem armazenado em um servidor.</span></div><p class="ph-security-copy">Se você esquecer a senha, bloqueie o perfil e use a opção <strong>“Recuperar acesso com o kit”</strong> na tela inicial. Exporte um backup cifrado antes de trocar ou apagar o aparelho.</p>';
    }

    function showDeleteProfileForm() {
        const target = overlay?.querySelector('#ph-delete-profile');
        if (!target || target.querySelector('form')) return;
        target.innerHTML = `<form class="ph-security-form ph-delete-form"><p>Esta ação exclui o cofre, os prontuários e a cópia legada migrada deste aparelho. Exporte um backup cifrado antes, se precisar preservar os dados.</p><label class="ph-field"><span>Digite <strong>EXCLUIR</strong> para confirmar</span><input id="ph-delete-confirm" autocomplete="off" spellcheck="false" required></label><button type="button" class="ph-danger-button" data-security-action="confirm-delete-profile">Excluir perfil e dados deste aparelho</button></form>`;
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
                if (action === 'lock') {
                    window.PetHouseIdentity.lock('manual');
                    close();
                    window.location.reload();
                    return;
                }
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
                    if (overlay.querySelector('#ph-delete-confirm')?.value.trim().toLocaleUpperCase('pt-BR') !== 'EXCLUIR') {
                        throw new Error('Digite EXCLUIR para confirmar a remoção definitiva.');
                    }
                    await window.PetHouseIdentity.deleteCurrentProfile();
                    close();
                    window.location.reload();
                }
            } catch (error) {
                showToast(error.message || 'Não foi possível concluir a ação.', 'error');
            }
        });
    }

    function open(app) {
        activeApp = app;
        const session = window.PetHouseIdentity.getSession();
        if (!session) {
            showToast('Desbloqueie o perfil para abrir a segurança.', 'warning');
            return;
        }

        close();
        overlay = document.createElement('div');
        overlay.className = 'ph-security-overlay';
        overlay.innerHTML = `
            <section class="ph-security-panel" role="dialog" aria-modal="true" aria-labelledby="ph-security-title">
                <header><div><p class="ph-eyebrow">SEGURANÇA E RECUPERAÇÃO</p><h2 id="ph-security-title">Perfil ${escapeHtml(session.profile.displayName)}</h2></div><button type="button" class="ph-security-close" aria-label="Fechar" data-security-action="close">×</button></header>
                <section class="ph-security-section"><h3>Cofre neste dispositivo</h3><div class="ph-security-status ph-security-status--success"><strong>Dados cifrados e isolados</strong><span>O prontuário funciona offline e não é enviado automaticamente.</span></div><div class="ph-security-actions"><button type="button" class="ph-secondary-button" data-security-action="export-secure">Exportar backup cifrado</button><button type="button" class="ph-text-button" data-security-action="lock">Bloquear agora</button></div></section>
                <section class="ph-security-section"><h3>Senha + confirmação do dispositivo</h3><div id="ph-device-factor-state"></div></section>
                <section class="ph-security-section"><h3>Kit de recuperação local</h3><div id="ph-local-recovery-state"></div></section>
                <section class="ph-security-section ph-security-section--danger"><h3>Excluir perfil deste aparelho</h3><p class="ph-security-copy">A exclusão remove este perfil e todos os prontuários deste dispositivo. Ela não pode ser desfeita sem um backup exportado.</p><button type="button" class="ph-text-button ph-text-button--danger" data-security-action="request-delete-profile">Iniciar exclusão definitiva</button><div id="ph-delete-profile"></div></section>
            </section>`;
        document.body.appendChild(overlay);
        bindActions();
        renderDeviceFactorState();
        renderRecoveryState();
    }

    window.PetHouseSecurityCenter = Object.freeze({ open, close });
}());
