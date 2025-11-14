/**
 * Termos de Uso do PetHouse
 * Baseado em padrões de grandes plataformas (Microsoft, Meta, Google)
 * Compliance com LGPD (Lei Geral de Proteção de Dados)
 */

const TermsOfService = {
    version: '1.0.0',
    lastUpdated: '12 de novembro de 2025',
    
    getTermsHTML() {
        return `
            <div class="legal-document">
                <h1>Termos de Uso do PetHouse</h1>
                <p class="last-updated">Última atualização: ${this.lastUpdated}</p>
                
                <div class="legal-section">
                    <h2>1. ACEITAÇÃO DOS TERMOS</h2>
                    <p>
                        Bem-vindo ao PetHouse ("nós", "nosso" ou "Aplicativo"). Ao acessar ou usar nosso aplicativo, 
                        você ("Usuário", "você" ou "seu") concorda em ficar vinculado a estes Termos de Uso 
                        ("Termos"). Se você não concordar com estes Termos, não use o Aplicativo.
                    </p>
                    <p>
                        Estes Termos constituem um acordo legal vinculativo entre você e o PetHouse. Ao criar uma 
                        conta, acessar ou usar qualquer parte do Aplicativo, você confirma que leu, compreendeu e 
                        concordou com todos os termos e condições aqui estabelecidos.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>2. DESCRIÇÃO DO SERVIÇO</h2>
                    <p>
                        O PetHouse é um aplicativo de gestão familiar de pets que permite aos usuários:
                    </p>
                    <ul>
                        <li>Cadastrar e gerenciar informações de seus animais de estimação</li>
                        <li>Registrar vacinas, vermífugos, consultas, cirurgias e diagnósticos</li>
                        <li>Acompanhar o peso e crescimento dos pets</li>
                        <li>Controlar ciclos reprodutivos (cios)</li>
                        <li>Gerar prontuários veterinários em PDF</li>
                        <li>Compartilhar dados com membros da família</li>
                        <li>Sincronizar dados na nuvem</li>
                    </ul>
                    <p>
                        Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do Serviço 
                        a qualquer momento, com ou sem aviso prévio.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>3. ELEGIBILIDADE E CADASTRO</h2>
                    <h3>3.1 Idade Mínima</h3>
                    <p>
                        Você deve ter pelo menos 18 (dezoito) anos de idade para usar o PetHouse. Ao usar o 
                        Aplicativo, você declara e garante que tem pelo menos 18 anos de idade.
                    </p>
                    
                    <h3>3.2 Informações de Cadastro</h3>
                    <p>
                        Ao criar uma conta, você concorda em fornecer informações precisas, atuais e completas. 
                        Você é responsável por manter a confidencialidade de sua conta e senha e por todas as 
                        atividades que ocorram em sua conta.
                    </p>
                    
                    <h3>3.3 Responsabilidade da Conta</h3>
                    <p>
                        Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua 
                        conta. Não seremos responsáveis por quaisquer perdas decorrentes do uso não autorizado 
                        de sua conta.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>4. COLETA E USO DE DADOS</h2>
                    <h3>4.1 Dados Coletados</h3>
                    <p>
                        Ao usar o PetHouse, coletamos e processamos os seguintes tipos de dados:
                    </p>
                    <ul>
                        <li><strong>Dados de Pets:</strong> Nome, espécie, raça, data de nascimento, peso, 
                            histórico médico, vacinas, vermífugos, consultas, cirurgias, diagnósticos, 
                            ciclos reprodutivos e outras informações relacionadas aos seus pets.</li>
                        <li><strong>Dados de Uso:</strong> Informações sobre como você usa o Aplicativo, 
                            incluindo funcionalidades acessadas, frequência de uso, tempo de sessão, 
                            ações realizadas e preferências.</li>
                        <li><strong>Dados Técnicos:</strong> Tipo de dispositivo, sistema operacional, 
                            navegador, endereço IP, identificadores únicos de dispositivo, dados de 
                            localização aproximada e informações de diagnóstico.</li>
                        <li><strong>Dados de Família:</strong> Informações sobre membros da família 
                            com quem você compartilha dados de pets, incluindo códigos de família e 
                            permissões de acesso.</li>
                    </ul>
                    
                    <h3>4.2 Finalidade da Coleta</h3>
                    <p>
                        Coletamos e usamos seus dados para as seguintes finalidades:
                    </p>
                    <ul>
                        <li><strong>Prestação do Serviço:</strong> Fornecer, operar, manter e melhorar 
                            o Aplicativo e suas funcionalidades.</li>
                        <li><strong>Pesquisa e Desenvolvimento:</strong> Analisar padrões de uso, 
                            tendências e estatísticas agregadas para desenvolver novos produtos, 
                            serviços e funcionalidades.</li>
                        <li><strong>Análise Estatística:</strong> Gerar métricas agregadas e 
                            anonimizadas sobre uso do Aplicativo, distribuição de espécies e raças, 
                            padrões de saúde animal e outras estatísticas para fins de pesquisa 
                            e desenvolvimento comercial.</li>
                        <li><strong>Melhoria Contínua:</strong> Identificar e corrigir bugs, melhorar 
                            a experiência do usuário e otimizar o desempenho do Aplicativo.</li>
                        <li><strong>Comunicação:</strong> Enviar notificações importantes sobre o 
                            Serviço, atualizações, alertas de vacinas e outras comunicações 
                            relacionadas ao uso do Aplicativo.</li>
                        <li><strong>Segurança:</strong> Detectar, prevenir e combater fraudes, abusos 
                            e atividades ilegais.</li>
                        <li><strong>Compliance Legal:</strong> Cumprir obrigações legais, regulatórias 
                            e contratuais.</li>
                    </ul>
                    
                    <h3>4.3 Dados Agregados e Anonimizados</h3>
                    <p>
                        Podemos agregar e anonimizar seus dados para criar estatísticas e insights que 
                        não identificam você pessoalmente. Esses dados agregados podem ser usados para:
                    </p>
                    <ul>
                        <li>Análise de mercado e tendências do setor de pets</li>
                        <li>Desenvolvimento de estratégias comerciais</li>
                        <li>Precificação de produtos e serviços</li>
                        <li>Pesquisa acadêmica e científica</li>
                        <li>Compartilhamento com parceiros comerciais e investidores</li>
                    </ul>
                    <p>
                        Dados agregados e anonimizados não são considerados dados pessoais sob a LGPD 
                        e podem ser usados sem restrições adicionais.
                    </p>
                    
                    <h3>4.4 Base Legal (LGPD)</h3>
                    <p>
                        O processamento de seus dados pessoais é baseado nas seguintes bases legais 
                        previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
                    </p>
                    <ul>
                        <li><strong>Consentimento (Art. 7º, I):</strong> Ao aceitar estes Termos, você 
                            consente expressamente com a coleta e uso de seus dados conforme descrito.</li>
                        <li><strong>Execução de Contrato (Art. 7º, V):</strong> O processamento é 
                            necessário para a execução do contrato de prestação de serviços.</li>
                        <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> Temos legítimo interesse 
                            em melhorar nossos serviços, desenvolver novos produtos e conduzir pesquisas 
                            de mercado.</li>
                    </ul>
                </div>

                <div class="legal-section">
                    <h2>5. COMPARTILHAMENTO DE DADOS</h2>
                    <h3>5.1 Compartilhamento com Terceiros</h3>
                    <p>
                        Não vendemos seus dados pessoais. Podemos compartilhar seus dados nas seguintes 
                        circunstâncias:
                    </p>
                    <ul>
                        <li><strong>Provedores de Serviços:</strong> Compartilhamos dados com prestadores 
                            de serviços que nos ajudam a operar o Aplicativo (ex: hospedagem, analytics, 
                            suporte técnico).</li>
                        <li><strong>Membros da Família:</strong> Dados de pets podem ser compartilhados 
                            com membros da família que você autorizar através do código de família.</li>
                        <li><strong>Requisitos Legais:</strong> Podemos divulgar dados se exigido por lei, 
                            ordem judicial ou processo legal.</li>
                        <li><strong>Proteção de Direitos:</strong> Podemos divulgar dados para proteger 
                            nossos direitos, propriedade ou segurança, ou os de nossos usuários.</li>
                        <li><strong>Transações Comerciais:</strong> Em caso de fusão, aquisição ou venda 
                            de ativos, seus dados podem ser transferidos como parte da transação.</li>
                    </ul>
                    
                    <h3>5.2 Transferência Internacional</h3>
                    <p>
                        Seus dados podem ser transferidos e processados em países fora do Brasil. Quando 
                        isso ocorrer, garantiremos que medidas adequadas de proteção estejam em vigor, 
                        conforme exigido pela LGPD.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>6. SEUS DIREITOS (LGPD)</h2>
                    <p>
                        De acordo com a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
                    </p>
                    <ul>
                        <li><strong>Confirmação e Acesso:</strong> Confirmar a existência de tratamento e 
                            acessar seus dados.</li>
                        <li><strong>Correção:</strong> Solicitar a correção de dados incompletos, inexatos 
                            ou desatualizados.</li>
                        <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> Solicitar a anonimização, 
                            bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em 
                            desconformidade.</li>
                        <li><strong>Portabilidade:</strong> Solicitar a portabilidade de seus dados a outro 
                            fornecedor de serviço.</li>
                        <li><strong>Eliminação:</strong> Solicitar a eliminação de dados tratados com base 
                            em consentimento.</li>
                        <li><strong>Informação:</strong> Obter informações sobre entidades públicas e privadas 
                            com as quais compartilhamos dados.</li>
                        <li><strong>Informação sobre Consentimento:</strong> Ser informado sobre a possibilidade 
                            de não fornecer consentimento e sobre as consequências da negativa.</li>
                        <li><strong>Revogação do Consentimento:</strong> Revogar o consentimento a qualquer 
                            momento.</li>
                    </ul>
                    <p>
                        Para exercer qualquer desses direitos, entre em contato conosco através do e-mail: 
                        <strong>rodrigorochalima@gmail.com</strong>
                    </p>
                </div>

                <div class="legal-section">
                    <h2>7. SEGURANÇA DOS DADOS</h2>
                    <p>
                        Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados 
                        contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
                    </p>
                    <ul>
                        <li>Criptografia de dados em trânsito e em repouso</li>
                        <li>Controles de acesso baseados em função</li>
                        <li>Monitoramento e auditoria de segurança</li>
                        <li>Backup regular de dados</li>
                        <li>Treinamento de equipe em segurança da informação</li>
                    </ul>
                    <p>
                        No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 
                        100% seguro. Não podemos garantir segurança absoluta de seus dados.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>8. RETENÇÃO DE DADOS</h2>
                    <p>
                        Retemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades 
                        para as quais foram coletados, incluindo requisitos legais, contábeis ou de relatório.
                    </p>
                    <p>
                        Dados agregados e anonimizados podem ser retidos indefinidamente para fins de pesquisa 
                        e análise estatística.
                    </p>
                    <p>
                        Você pode solicitar a exclusão de sua conta e dados a qualquer momento. Após a exclusão, 
                        seus dados pessoais serão permanentemente removidos, exceto quando a retenção for exigida 
                        por lei.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>9. PROPRIEDADE INTELECTUAL</h2>
                    <p>
                        O Aplicativo e todo o seu conteúdo, funcionalidades e recursos (incluindo, mas não se 
                        limitando a, informações, software, texto, displays, imagens, vídeo e áudio, e o design, 
                        seleção e arranjo dos mesmos) são de propriedade do PetHouse, seus licenciadores ou 
                        outros provedores de tal material e são protegidos por leis de direitos autorais, marcas 
                        registradas, patentes, segredos comerciais e outras leis de propriedade intelectual.
                    </p>
                    <p>
                        Você não pode reproduzir, distribuir, modificar, criar trabalhos derivados, exibir 
                        publicamente, executar publicamente, republicar, baixar, armazenar ou transmitir qualquer 
                        material do nosso Aplicativo sem nossa permissão prévia por escrito.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>10. CONDUTA DO USUÁRIO</h2>
                    <p>
                        Você concorda em NÃO:
                    </p>
                    <ul>
                        <li>Usar o Aplicativo para qualquer finalidade ilegal ou não autorizada</li>
                        <li>Violar quaisquer leis locais, estaduais, nacionais ou internacionais</li>
                        <li>Infringir ou violar nossos direitos de propriedade intelectual ou os de terceiros</li>
                        <li>Assediar, abusar, insultar, prejudicar, difamar, caluniar, depreciar, intimidar ou 
                            discriminar com base em gênero, orientação sexual, religião, etnia, raça, idade, 
                            nacionalidade ou deficiência</li>
                        <li>Enviar informações falsas ou enganosas</li>
                        <li>Fazer upload ou transmitir vírus ou qualquer outro tipo de código malicioso</li>
                        <li>Coletar ou rastrear informações pessoais de outros</li>
                        <li>Fazer spam, phishing, pharming, pretexting, spidering, crawling ou scraping</li>
                        <li>Usar o Aplicativo para qualquer finalidade obscena ou imoral</li>
                        <li>Interferir ou contornar os recursos de segurança do Aplicativo</li>
                    </ul>
                </div>

                <div class="legal-section">
                    <h2>11. ISENÇÃO DE GARANTIAS</h2>
                    <p>
                        O APLICATIVO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL", SEM GARANTIAS DE QUALQUER 
                        TIPO, EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO SE LIMITANDO A, GARANTIAS IMPLÍCITAS 
                        DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA, NÃO VIOLAÇÃO OU DESEMPENHO.
                    </p>
                    <p>
                        NÃO GARANTIMOS QUE O APLICATIVO SERÁ ININTERRUPTO, OPORTUNO, SEGURO OU LIVRE DE ERROS. 
                        NÃO GARANTIMOS QUE OS RESULTADOS QUE PODEM SER OBTIDOS DO USO DO APLICATIVO SERÃO PRECISOS 
                        OU CONFIÁVEIS.
                    </p>
                    <p>
                        <strong>IMPORTANTE:</strong> O PetHouse NÃO é um substituto para cuidados veterinários 
                        profissionais. As informações fornecidas são apenas para fins informativos e de 
                        gerenciamento. Sempre consulte um veterinário qualificado para diagnóstico e tratamento.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>12. LIMITAÇÃO DE RESPONSABILIDADE</h2>
                    <p>
                        EM NENHUMA CIRCUNSTÂNCIA O PETHOUSE, SEUS DIRETORES, FUNCIONÁRIOS, PARCEIROS, AGENTES, 
                        FORNECEDORES OU AFILIADOS SERÃO RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, 
                        ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, INCLUINDO, SEM LIMITAÇÃO, PERDA DE LUCROS, DADOS, 
                        USO, GOODWILL OU OUTRAS PERDAS INTANGÍVEIS, RESULTANTES DE:
                    </p>
                    <ul>
                        <li>Seu acesso ou uso ou incapacidade de acessar ou usar o Aplicativo</li>
                        <li>Qualquer conduta ou conteúdo de terceiros no Aplicativo</li>
                        <li>Qualquer conteúdo obtido do Aplicativo</li>
                        <li>Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo</li>
                    </ul>
                    <p>
                        NOSSA RESPONSABILIDADE TOTAL POR TODAS AS REIVINDICAÇÕES RELACIONADAS AO APLICATIVO NÃO 
                        EXCEDERÁ O VALOR QUE VOCÊ NOS PAGOU NOS ÚLTIMOS 12 MESES (SE HOUVER).
                    </p>
                </div>

                <div class="legal-section">
                    <h2>13. INDENIZAÇÃO</h2>
                    <p>
                        Você concorda em defender, indenizar e isentar o PetHouse e seus licenciadores e 
                        licenciados, e seus respectivos diretores, funcionários, contratados, agentes, 
                        licenciadores, fornecedores, sucessores e cessionários de e contra quaisquer 
                        reivindicações, responsabilidades, danos, julgamentos, prêmios, perdas, custos, 
                        despesas ou honorários (incluindo honorários advocatícios razoáveis) decorrentes de 
                        ou relacionados à sua violação destes Termos ou seu uso do Aplicativo.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>14. MODIFICAÇÕES DOS TERMOS</h2>
                    <p>
                        Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes 
                        Termos a qualquer momento. Se uma revisão for material, forneceremos aviso prévio de 
                        pelo menos 30 dias antes de quaisquer novos termos entrarem em vigor.
                    </p>
                    <p>
                        Ao continuar a acessar ou usar nosso Aplicativo após essas revisões se tornarem efetivas, 
                        você concorda em ficar vinculado aos termos revisados. Se você não concordar com os novos 
                        termos, pare de usar o Aplicativo.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>15. RESCISÃO</h2>
                    <p>
                        Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio ou 
                        responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.
                    </p>
                    <p>
                        Você pode encerrar sua conta a qualquer momento excluindo-a através das configurações do 
                        Aplicativo ou entrando em contato conosco.
                    </p>
                    <p>
                        Após a rescisão, seu direito de usar o Aplicativo cessará imediatamente. Todas as 
                        disposições dos Termos que, por sua natureza, devam sobreviver à rescisão, sobreviverão, 
                        incluindo, sem limitação, disposições de propriedade, isenções de garantia, indenização 
                        e limitações de responsabilidade.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>16. LEI APLICÁVEL E JURISDIÇÃO</h2>
                    <p>
                        Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa 
                        do Brasil, sem considerar suas disposições sobre conflitos de leis.
                    </p>
                    <p>
                        Nossa falha em fazer cumprir qualquer direito ou disposição destes Termos não será 
                        considerada uma renúncia a esses direitos. Se qualquer disposição destes Termos for 
                        considerada inválida ou inexequível por um tribunal, as disposições restantes destes 
                        Termos permanecerão em vigor.
                    </p>
                    <p>
                        Quaisquer disputas decorrentes ou relacionadas a estes Termos ou ao uso do Aplicativo 
                        serão resolvidas exclusivamente pelos tribunais competentes do Brasil.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>17. DISPOSIÇÕES GERAIS</h2>
                    <h3>17.1 Acordo Integral</h3>
                    <p>
                        Estes Termos constituem o acordo integral entre você e o PetHouse em relação ao uso do 
                        Aplicativo e substituem todos os acordos anteriores e contemporâneos, sejam escritos ou 
                        orais.
                    </p>
                    
                    <h3>17.2 Cessão</h3>
                    <p>
                        Você não pode ceder ou transferir estes Termos, por força de lei ou de outra forma, sem 
                        nosso consentimento prévio por escrito. Podemos ceder ou transferir estes Termos, no todo 
                        ou em parte, sem restrição.
                    </p>
                    
                    <h3>17.3 Renúncia</h3>
                    <p>
                        Nenhuma renúncia por qualquer das partes a qualquer violação ou inadimplemento sob estes 
                        Termos será considerada uma renúncia a qualquer violação ou inadimplemento anterior ou 
                        subsequente.
                    </p>
                    
                    <h3>17.4 Divisibilidade</h3>
                    <p>
                        Se qualquer disposição destes Termos for considerada inválida, ilegal ou inexequível, 
                        essa disposição será limitada ou eliminada na medida mínima necessária, e as disposições 
                        restantes permanecerão em pleno vigor e efeito.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>18. CONTATO</h2>
                    <p>
                        Se você tiver dúvidas sobre estes Termos, entre em contato conosco:
                    </p>
                    <ul>
                        <li><strong>E-mail:</strong> rodrigorochalima@gmail.com</li>
                        <li><strong>Aplicativo:</strong> PetHouse - Gestão de Pets</li>
                    </ul>
                    <p>
                        <strong>Encarregado de Dados (DPO):</strong> Para questões relacionadas à proteção de 
                        dados e LGPD, entre em contato através do e-mail acima.
                    </p>
                </div>

                <div class="legal-footer">
                    <p>
                        <strong>Ao clicar em "Aceito os Termos de Uso", você confirma que leu, compreendeu e 
                        concordou com todos os termos e condições acima.</strong>
                    </p>
                    <p class="version-info">
                        Versão ${this.version} | Última atualização: ${this.lastUpdated}
                    </p>
                </div>
            </div>
        `;
    }
};

// Exportar para uso global
window.TermsOfService = TermsOfService;
