/**
 * PetHouse — Termos de Uso para a arquitetura offline-first.
 * Rascunho operacional: revisar juridicamente antes da publicação comercial.
 */
const TermsOfService = {
    version: '2.0.0',
    lastUpdated: '17 de agosto de 2026',

    getTermsHTML() {
        return `
            <article class="legal-document">
                <h1>Termos de Uso do PetHouse</h1>
                <p class="last-updated">Versão ${this.version} · Atualizado em ${this.lastUpdated}</p>

                <section class="legal-section" style="background:#eef8ff;border-left:4px solid #2196f3;padding:1.25rem;border-radius:8px;margin-bottom:1.5rem;">
                    <h2 style="margin-top:0;">Uso privado e offline</h2>
                    <p>O PetHouse organiza informações que você registra sobre seus pets. Nesta versão, os prontuários são guardados localmente neste dispositivo, em um cofre protegido, e não são enviados automaticamente para um servidor.</p>
                </section>

                <section class="legal-section">
                    <h2>1. Aceitação e escopo</h2>
                    <p>Ao usar o PetHouse, você concorda com estes Termos e com a Política de Privacidade exibida no aplicativo. Caso não concorde, não prossiga com o uso.</p>
                    <p>O aplicativo é uma ferramenta de organização pessoal ou familiar. Ele não substitui orientação, diagnóstico, tratamento ou atendimento veterinário profissional.</p>
                </section>

                <section class="legal-section">
                    <h2>2. Dados e responsabilidade pelo dispositivo</h2>
                    <p>Você controla os registros incluídos no PetHouse. A senha do perfil, o kit de recuperação e os backups cifrados são necessários para proteger e recuperar o cofre local. Guarde-os com segurança e não os compartilhe.</p>
                    <p>Você é responsável por manter acesso ao seu dispositivo e por exportar backups antes de trocar, restaurar, perder ou descartar o aparelho. A perda simultânea do dispositivo, da senha e do kit de recuperação pode impedir a abertura do cofre.</p>
                </section>

                <section class="legal-section">
                    <h2>3. Funcionalidades</h2>
                    <p>O PetHouse pode permitir cadastro de pets, peso, cuidados, vacinas, vermífugos, consultas, documentos e backups. Recursos de recuperação remota, sincronização ou compartilhamento somente serão ativados mediante ação expressa da pessoa responsável e apresentação clara das condições aplicáveis.</p>
                    <p>O aplicativo pode ser atualizado para corrigir falhas, reforçar a segurança ou melhorar a compatibilidade. Quando uma alteração relevante modificar estes Termos, será solicitado um novo aceite local.</p>
                </section>

                <section class="legal-section">
                    <h2>4. Uso adequado</h2>
                    <p>Você concorda em usar o aplicativo de forma lícita, proteger as credenciais do perfil e não tentar contornar controles de segurança. Não registre dados de terceiros sem autorização adequada.</p>
                </section>

                <section class="legal-section">
                    <h2>5. Exportação, exclusão e encerramento</h2>
                    <p>Você pode exportar um backup cifrado e remover dados locais pelo próprio dispositivo. A exclusão do perfil local remove o cofre deste aparelho; faça backup antes dessa ação caso queira preservar os registros.</p>
                    <p>Se no futuro você vincular uma conta remota, os controles de exclusão dessa conta serão apresentados dentro do aplicativo, de acordo com o serviço de recuperação escolhido.</p>
                </section>

                <section class="legal-section">
                    <h2>6. Limites e cuidados veterinários</h2>
                    <p>Informações, lembretes, gráficos e recomendações de calendário são apenas organizacionais. Confirme vacinas, doses, sintomas, tratamentos e emergências com profissional veterinário qualificado.</p>
                </section>

                <section class="legal-section">
                    <h2>7. Contato</h2>
                    <p>Para dúvidas sobre estes Termos ou privacidade, entre em contato por <strong>rodrigorochalima@gmail.com</strong>.</p>
                </section>

                <footer class="legal-footer"><p><strong>Ao aceitar, você confirma que leu e compreendeu estes Termos de Uso.</strong></p></footer>
            </article>`;
    }
};

window.TermsOfService = TermsOfService;
