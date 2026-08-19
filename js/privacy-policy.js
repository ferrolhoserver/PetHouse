/**
 * PetHouse — Política de Privacidade para a arquitetura offline-first.
 * Rascunho operacional: revisar juridicamente antes da publicação comercial.
 */
const PrivacyPolicy = {
    version: '2.0.0',
    lastUpdated: '17 de agosto de 2026',

    getPolicyHTML() {
        return `
            <article class="legal-document">
                <h1>Política de Privacidade do PetHouse</h1>
                <p class="last-updated">Versão ${this.version} · Atualizada em ${this.lastUpdated}</p>

                <section class="legal-section" style="background:#eef8ff;border-left:4px solid #2196f3;padding:1.25rem;border-radius:8px;margin-bottom:1.5rem;">
                    <h2 style="margin-top:0;">Resumo de privacidade</h2>
                    <p>Os prontuários que você registra ficam no seu dispositivo, dentro de um cofre protegido. O PetHouse não envia automaticamente o conteúdo clínico de seus pets, nem usa analytics ou telemetria de uso nesta versão.</p>
                </section>

                <section class="legal-section">
                    <h2>1. Dados tratados no dispositivo</h2>
                    <p>O aplicativo processa localmente os dados que você escolhe registrar, como nome e características do pet, peso, vacinas, cuidados, consultas, documentos e observações. Também guarda localmente dados técnicos indispensáveis ao funcionamento, como a preferência de consentimento e metadados do perfil protegido.</p>
                    <p>A senha não é guardada em texto simples. O conteúdo do cofre é cifrado antes de ser persistido no armazenamento do navegador.</p>
                </section>

                <section class="legal-section">
                    <h2>2. Finalidade e não compartilhamento automático</h2>
                    <p>Os dados locais são utilizados para exibir seu prontuário, gerar gráficos, alertas, documentos e backups no próprio aparelho. Esta versão não envia automaticamente registros clínicos, histórico de navegação ou eventos de uso para servidores de analytics, publicidade, pesquisa ou parceiros.</p>
                    <p>O provedor de hospedagem pode processar dados técnicos mínimos de uma visita, como endereço IP e informações de conexão, para entregar os arquivos do aplicativo. Esses dados não incluem o conteúdo do seu cofre local.</p>
                </section>

                <section class="legal-section">
                    <h2>3. Seus controles</h2>
                    <ul>
                        <li><strong>Acesso:</strong> os registros podem ser consultados no aplicativo após desbloquear o perfil.</li>
                        <li><strong>Portabilidade:</strong> você pode exportar um backup cifrado do cofre.</li>
                        <li><strong>Correção:</strong> os dados podem ser editados nos módulos correspondentes do prontuário.</li>
                        <li><strong>Eliminação:</strong> você pode apagar o perfil e seus dados locais pelo dispositivo; exporte um backup antes, se desejar preservá-los.</li>
                        <li><strong>Consentimento:</strong> o aceite dos documentos fica salvo localmente e poderá ser revogado ao limpar os dados do aplicativo ou por controles futuros do perfil.</li>
                    </ul>
                </section>

                <section class="legal-section">
                    <h2>4. Backup e recuperação</h2>
                    <p>O backup exportado é cifrado e deve ser guardado por você em local seguro. O kit de recuperação também deve ser mantido em sigilo. Quem possuir o kit e o arquivo de backup pode ter condições de restaurar o acesso, portanto não os compartilhe.</p>
                    <p>A recuperação de acesso é feita localmente com o kit criado junto ao perfil. Para mover registros entre aparelhos, use somente o backup cifrado e o kit de recuperação; não há sincronização automática, e-mail de redefinição ou cópia remota do prontuário nesta versão.</p>
                </section>

                <section class="legal-section">
                    <h2>5. Segurança</h2>
                    <p>O PetHouse usa criptografia local para reduzir a exposição de prontuários em caso de acesso comum ao armazenamento do navegador. Nenhum sistema oferece garantia absoluta: mantenha o sistema operacional atualizado, use senha forte, bloqueio de tela e cópias de segurança protegidas.</p>
                </section>

                <section class="legal-section">
                    <h2>6. Contato e revisão</h2>
                    <p>Para dúvidas sobre privacidade ou para solicitar esclarecimentos, entre em contato por <strong>rodrigorochalima@gmail.com</strong>.</p>
                    <p>Esta política deve ser revisada antes de uma publicação comercial, especialmente se o aplicativo passar a oferecer qualquer serviço de nuvem, sincronização ou recuperação fora do próprio dispositivo.</p>
                </section>

                <footer class="legal-footer"><p><strong>Ao aceitar, você confirma que leu esta Política de Privacidade.</strong></p></footer>
            </article>`;
    }
};

window.PrivacyPolicy = PrivacyPolicy;
