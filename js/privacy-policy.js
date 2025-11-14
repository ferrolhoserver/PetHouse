/**
 * Política de Privacidade do PetHouse
 * Compliance com LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)
 * Baseado em padrões de grandes plataformas
 */

const PrivacyPolicy = {
    version: '1.0.0',
    lastUpdated: '12 de novembro de 2025',
    
    getPolicyHTML() {
        return `
            <div class="legal-document">
                <h1>Política de Privacidade do PetHouse</h1>
                <p class="last-updated">Última atualização: ${this.lastUpdated}</p>
                
                <div class="legal-section">
                    <h2>1. INTRODUÇÃO</h2>
                    <p>
                        O PetHouse ("nós", "nosso" ou "Aplicativo") está comprometido em proteger sua privacidade 
                        e seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, 
                        divulgamos e protegemos suas informações quando você usa nosso Aplicativo.
                    </p>
                    <p>
                        Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 
                        13.709/2018) e outras leis de privacidade aplicáveis.
                    </p>
                    <p>
                        <strong>Ao usar o PetHouse, você concorda com a coleta e uso de informações de acordo 
                        com esta política.</strong>
                    </p>
                </div>

                <div class="legal-section">
                    <h2>2. DEFINIÇÕES</h2>
                    <p>
                        Para fins desta Política de Privacidade:
                    </p>
                    <ul>
                        <li><strong>Dados Pessoais:</strong> Informação relacionada a pessoa natural identificada 
                            ou identificável.</li>
                        <li><strong>Titular:</strong> Pessoa natural a quem se referem os dados pessoais.</li>
                        <li><strong>Tratamento:</strong> Toda operação realizada com dados pessoais, como coleta, 
                            produção, recepção, classificação, utilização, acesso, reprodução, transmissão, 
                            distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou 
                            controle da informação, modificação, comunicação, transferência, difusão ou extração.</li>
                        <li><strong>Controlador:</strong> Pessoa natural ou jurídica a quem competem as decisões 
                            referentes ao tratamento de dados pessoais.</li>
                        <li><strong>Operador:</strong> Pessoa natural ou jurídica que realiza o tratamento de 
                            dados pessoais em nome do controlador.</li>
                        <li><strong>Encarregado (DPO):</strong> Pessoa indicada pelo controlador para atuar como 
                            canal de comunicação entre o controlador, os titulares dos dados e a Autoridade 
                            Nacional de Proteção de Dados (ANPD).</li>
                    </ul>
                </div>

                <div class="legal-section">
                    <h2>3. CONTROLADOR E ENCARREGADO DE DADOS</h2>
                    <p>
                        <strong>Controlador de Dados:</strong><br>
                        PetHouse - Gestão de Pets<br>
                        E-mail: rodrigorochalima@gmail.com
                    </p>
                    <p>
                        <strong>Encarregado de Dados (DPO):</strong><br>
                        Rodrigo Rocha Lima<br>
                        E-mail: rodrigorochalima@gmail.com
                    </p>
                    <p>
                        O Encarregado de Dados é responsável por aceitar reclamações e comunicações dos titulares, 
                        prestar esclarecimentos e adotar providências, receber comunicações da ANPD e adotar 
                        providências, e orientar os funcionários e contratados sobre as práticas de proteção de 
                        dados.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>4. DADOS QUE COLETAMOS</h2>
                    
                    <h3>4.1 Dados Fornecidos por Você</h3>
                    <p>
                        Coletamos informações que você fornece diretamente ao usar o Aplicativo:
                    </p>
                    <ul>
                        <li><strong>Informações de Cadastro:</strong> E-mail (opcional), nome da família, 
                            código de família.</li>
                        <li><strong>Informações de Pets:</strong> Nome, espécie, raça, sexo, data de nascimento, 
                            peso, cor, características físicas, temperamento.</li>
                        <li><strong>Histórico Médico:</strong> Vacinas aplicadas (nome, data, lote, veterinário), 
                            vermífugos administrados, consultas veterinárias, cirurgias realizadas, diagnósticos, 
                            tratamentos, medicamentos, alergias.</li>
                        <li><strong>Dados Reprodutivos:</strong> Ciclos de cio (data de início, fim, duração), 
                            cruzamentos (data, macho), gestações, partos.</li>
                        <li><strong>Cuidados:</strong> Banhos, tosas, corte de unhas, limpeza de ouvidos.</li>
                        <li><strong>Observações:</strong> Notas, comentários e observações adicionais sobre seus 
                            pets.</li>
                    </ul>
                    
                    <h3>4.2 Dados Coletados Automaticamente</h3>
                    <p>
                        Quando você usa o Aplicativo, coletamos automaticamente certas informações:
                    </p>
                    <ul>
                        <li><strong>Dados de Uso:</strong> Funcionalidades acessadas, ações realizadas (adicionar 
                            pet, registrar vacina, gerar PDF, etc.), frequência de uso, tempo de sessão, 
                            sequência de ações, preferências de configuração.</li>
                        <li><strong>Dados de Dispositivo:</strong> Tipo de dispositivo, modelo, sistema 
                            operacional, versão do navegador, idioma, resolução de tela, identificadores únicos 
                            de dispositivo.</li>
                        <li><strong>Dados de Rede:</strong> Endereço IP, provedor de internet, dados de conexão.</li>
                        <li><strong>Dados de Localização:</strong> Localização aproximada baseada em endereço IP 
                            (cidade, estado, país).</li>
                        <li><strong>Dados de Desempenho:</strong> Erros, crashes, tempo de carregamento, logs de 
                            sistema.</li>
                        <li><strong>Cookies e Tecnologias Similares:</strong> Usamos localStorage e outras 
                            tecnologias de armazenamento local para salvar suas preferências e dados do Aplicativo.</li>
                    </ul>
                    
                    <h3>4.3 Dados de Terceiros</h3>
                    <p>
                        Podemos receber informações sobre você de terceiros:
                    </p>
                    <ul>
                        <li><strong>Membros da Família:</strong> Outros usuários que compartilham dados de pets 
                            com você através do código de família.</li>
                        <li><strong>Provedores de Serviços:</strong> Informações de analytics, hospedagem e 
                            outros serviços que utilizamos.</li>
                    </ul>
                </div>

                <div class="legal-section">
                    <h2>5. COMO USAMOS SEUS DADOS</h2>
                    
                    <h3>5.1 Finalidades do Tratamento</h3>
                    <p>
                        Usamos seus dados pessoais para as seguintes finalidades:
                    </p>
                    
                    <h4>a) Prestação e Melhoria do Serviço</h4>
                    <ul>
                        <li>Fornecer, operar, manter e melhorar o Aplicativo</li>
                        <li>Processar e completar transações</li>
                        <li>Enviar informações técnicas, atualizações, alertas de segurança e mensagens 
                            administrativas</li>
                        <li>Responder a seus comentários, perguntas e solicitações de suporte ao cliente</li>
                        <li>Desenvolver novos produtos, serviços, funcionalidades e recursos</li>
                        <li>Personalizar e melhorar sua experiência</li>
                    </ul>
                    
                    <h4>b) Comunicação</h4>
                    <ul>
                        <li>Enviar lembretes de vacinas e vermífugos</li>
                        <li>Notificar sobre eventos importantes (cios, consultas agendadas)</li>
                        <li>Enviar newsletters e materiais educativos (com seu consentimento)</li>
                        <li>Comunicar mudanças nos Termos de Uso ou Política de Privacidade</li>
                    </ul>
                    
                    <h4>c) Pesquisa e Análise</h4>
                    <ul>
                        <li>Monitorar e analisar tendências, uso e atividades do Aplicativo</li>
                        <li>Gerar estatísticas agregadas e anonimizadas sobre:
                            <ul>
                                <li>Distribuição de espécies e raças de pets</li>
                                <li>Padrões de vacinação e vermifugação</li>
                                <li>Problemas de saúde mais comuns por raça/idade</li>
                                <li>Padrões de crescimento e peso</li>
                                <li>Ciclos reprodutivos e fertilidade</li>
                                <li>Uso de funcionalidades do Aplicativo</li>
                                <li>Demografia de usuários</li>
                            </ul>
                        </li>
                        <li>Conduzir pesquisas de mercado e análise competitiva</li>
                        <li>Desenvolver estratégias comerciais e modelos de precificação</li>
                        <li>Identificar oportunidades de novos produtos e serviços</li>
                    </ul>
                    
                    <h4>d) Segurança e Compliance</h4>
                    <ul>
                        <li>Detectar, prevenir e combater fraudes, abusos e atividades ilegais</li>
                        <li>Proteger a segurança e integridade do Aplicativo</li>
                        <li>Cumprir obrigações legais e regulatórias</li>
                        <li>Fazer cumprir nossos Termos de Uso</li>
                        <li>Resolver disputas</li>
                    </ul>
                    
                    <h3>5.2 Base Legal para o Tratamento (LGPD)</h3>
                    <p>
                        Processamos seus dados pessoais com base nas seguintes bases legais previstas no Art. 7º 
                        da LGPD:
                    </p>
                    <ul>
                        <li><strong>I - Consentimento:</strong> Mediante fornecimento de consentimento pelo 
                            titular (ao aceitar esta Política e os Termos de Uso).</li>
                        <li><strong>V - Execução de Contrato:</strong> Quando necessário para a execução de 
                            contrato ou de procedimentos preliminares relacionados a contrato do qual seja parte 
                            o titular.</li>
                        <li><strong>VI - Exercício Regular de Direitos:</strong> Para o exercício regular de 
                            direitos em processo judicial, administrativo ou arbitral.</li>
                        <li><strong>IX - Legítimo Interesse:</strong> Quando necessário para atender aos 
                            interesses legítimos do controlador ou de terceiro, exceto no caso de prevalecerem 
                            direitos e liberdades fundamentais do titular que exijam a proteção dos dados pessoais.</li>
                    </ul>
                </div>

                <div class="legal-section">
                    <h2>6. COMPARTILHAMENTO DE DADOS</h2>
                    
                    <h3>6.1 Com Quem Compartilhamos</h3>
                    <p>
                        Podemos compartilhar seus dados pessoais nas seguintes circunstâncias:
                    </p>
                    
                    <h4>a) Membros da Família</h4>
                    <p>
                        Quando você compartilha o código de família com outros usuários, os dados dos pets 
                        compartilhados ficam acessíveis a todos os membros da família. Você controla quais 
                        dados compartilhar e com quem.
                    </p>
                    
                    <h4>b) Provedores de Serviços</h4>
                    <p>
                        Compartilhamos dados com prestadores de serviços terceirizados que nos auxiliam a operar 
                        o Aplicativo:
                    </p>
                    <ul>
                        <li><strong>Hospedagem:</strong> GitHub Pages, Supabase (armazenamento de dados)</li>
                        <li><strong>Analytics:</strong> Ferramentas de análise de uso e desempenho</li>
                        <li><strong>Infraestrutura:</strong> Serviços de nuvem e CDN</li>
                        <li><strong>Comunicação:</strong> Serviços de e-mail e notificações</li>
                    </ul>
                    <p>
                        Esses provedores têm acesso aos seus dados apenas para executar tarefas em nosso nome e 
                        são obrigados a não divulgá-los ou usá-los para outros fins.
                    </p>
                    
                    <h4>c) Dados Agregados e Anonimizados</h4>
                    <p>
                        Podemos compartilhar dados agregados e anonimizados (que não identificam você pessoalmente) 
                        com:
                    </p>
                    <ul>
                        <li>Parceiros comerciais e investidores</li>
                        <li>Pesquisadores acadêmicos</li>
                        <li>Indústria de pets e veterinária</li>
                        <li>Público em geral (relatórios e publicações)</li>
                    </ul>
                    
                    <h4>d) Requisitos Legais</h4>
                    <p>
                        Podemos divulgar seus dados se exigido por lei ou em resposta a:
                    </p>
                    <ul>
                        <li>Ordens judiciais ou intimações</li>
                        <li>Solicitações de autoridades governamentais</li>
                        <li>Processos legais</li>
                        <li>Investigações de fraude ou segurança</li>
                    </ul>
                    
                    <h4>e) Proteção de Direitos</h4>
                    <p>
                        Podemos divulgar dados para:
                    </p>
                    <ul>
                        <li>Proteger nossos direitos, propriedade ou segurança</li>
                        <li>Proteger os direitos, propriedade ou segurança de nossos usuários</li>
                        <li>Prevenir ou investigar possíveis irregularidades</li>
                        <li>Fazer cumprir nossos Termos de Uso</li>
                    </ul>
                    
                    <h4>f) Transações Comerciais</h4>
                    <p>
                        Em caso de fusão, aquisição, reorganização, venda de ativos ou falência, seus dados 
                        pessoais podem ser transferidos como parte da transação. Notificaremos você antes que 
                        seus dados sejam transferidos e fiquem sujeitos a uma política de privacidade diferente.
                    </p>
                    
                    <h3>6.2 Transferência Internacional de Dados</h3>
                    <p>
                        Seus dados podem ser transferidos e processados em países fora do Brasil, incluindo 
                        países que podem não ter leis de proteção de dados equivalentes às brasileiras.
                    </p>
                    <p>
                        Quando transferimos dados para fora do Brasil, garantimos que:
                    </p>
                    <ul>
                        <li>O país de destino oferece grau de proteção de dados adequado</li>
                        <li>Ou implementamos salvaguardas apropriadas, como cláusulas contratuais padrão</li>
                        <li>Ou obtemos seu consentimento explícito para a transferência</li>
                    </ul>
                </div>

                <div class="legal-section">
                    <h2>7. SEUS DIREITOS (LGPD)</h2>
                    <p>
                        De acordo com a LGPD (Art. 18), você tem os seguintes direitos em relação aos seus dados 
                        pessoais:
                    </p>
                    
                    <h3>7.1 Confirmação e Acesso</h3>
                    <p>
                        Você tem o direito de confirmar a existência de tratamento de dados e acessar seus dados 
                        pessoais. Você pode visualizar e exportar seus dados a qualquer momento através do 
                        Aplicativo.
                    </p>
                    
                    <h3>7.2 Correção</h3>
                    <p>
                        Você pode solicitar a correção de dados incompletos, inexatos ou desatualizados. Você 
                        pode editar a maioria dos seus dados diretamente no Aplicativo.
                    </p>
                    
                    <h3>7.3 Anonimização, Bloqueio ou Eliminação</h3>
                    <p>
                        Você pode solicitar:
                    </p>
                    <ul>
                        <li>Anonimização de dados desnecessários, excessivos ou tratados em desconformidade</li>
                        <li>Bloqueio de dados</li>
                        <li>Eliminação de dados tratados com base em consentimento</li>
                    </ul>
                    
                    <h3>7.4 Portabilidade</h3>
                    <p>
                        Você pode solicitar a portabilidade de seus dados a outro fornecedor de serviço ou produto. 
                        Fornecemos seus dados em formato estruturado e de uso comum (JSON).
                    </p>
                    
                    <h3>7.5 Informação sobre Compartilhamento</h3>
                    <p>
                        Você pode solicitar informações sobre entidades públicas e privadas com as quais 
                        compartilhamos seus dados.
                    </p>
                    
                    <h3>7.6 Informação sobre Não Consentimento</h3>
                    <p>
                        Você tem o direito de ser informado sobre a possibilidade de não fornecer consentimento 
                        e sobre as consequências da negativa. Note que, sem certos dados, podemos não conseguir 
                        fornecer todos os recursos do Aplicativo.
                    </p>
                    
                    <h3>7.7 Revogação do Consentimento</h3>
                    <p>
                        Você pode revogar seu consentimento a qualquer momento. A revogação não afeta a legalidade 
                        do tratamento realizado antes da revogação.
                    </p>
                    
                    <h3>7.8 Oposição</h3>
                    <p>
                        Você pode se opor ao tratamento de dados realizado com base em legítimo interesse, em 
                        estudos por órgão de pesquisa ou para proteção do crédito.
                    </p>
                    
                    <h3>7.9 Revisão de Decisões Automatizadas</h3>
                    <p>
                        Você pode solicitar a revisão de decisões tomadas unicamente com base em tratamento 
                        automatizado de dados pessoais que afetem seus interesses.
                    </p>
                    
                    <h3>7.10 Como Exercer Seus Direitos</h3>
                    <p>
                        Para exercer qualquer desses direitos, você pode:
                    </p>
                    <ul>
                        <li>Usar as configurações do Aplicativo (para acesso, correção e exclusão)</li>
                        <li>Entrar em contato com nosso Encarregado de Dados: rodrigorochalima@gmail.com</li>
                    </ul>
                    <p>
                        Responderemos às suas solicitações dentro do prazo legal (15 dias, prorrogáveis por mais 
                        15 dias).
                    </p>
                </div>

                <div class="legal-section">
                    <h2>8. SEGURANÇA DOS DADOS</h2>
                    <p>
                        Levamos a segurança de seus dados muito a sério e implementamos medidas técnicas e 
                        organizacionais apropriadas para protegê-los contra acesso não autorizado, alteração, 
                        divulgação ou destruição.
                    </p>
                    
                    <h3>8.1 Medidas de Segurança Técnicas</h3>
                    <ul>
                        <li><strong>Criptografia:</strong> Dados em trânsito são protegidos por HTTPS/TLS. 
                            Dados sensíveis em repouso são criptografados.</li>
                        <li><strong>Autenticação:</strong> Sistemas de autenticação segura para acesso a dados.</li>
                        <li><strong>Controle de Acesso:</strong> Acesso a dados pessoais é restrito apenas a 
                            funcionários e prestadores de serviços autorizados que precisam conhecê-los.</li>
                        <li><strong>Monitoramento:</strong> Monitoramento contínuo de sistemas para detectar 
                            atividades suspeitas.</li>
                        <li><strong>Backup:</strong> Backups regulares para prevenir perda de dados.</li>
                        <li><strong>Atualizações:</strong> Manutenção regular e atualizações de segurança.</li>
                    </ul>
                    
                    <h3>8.2 Medidas Organizacionais</h3>
                    <ul>
                        <li>Políticas e procedimentos de segurança da informação</li>
                        <li>Treinamento de funcionários em proteção de dados</li>
                        <li>Acordos de confidencialidade com funcionários e prestadores</li>
                        <li>Processos de resposta a incidentes de segurança</li>
                        <li>Auditorias regulares de segurança</li>
                    </ul>
                    
                    <h3>8.3 Limitações</h3>
                    <p>
                        Embora implementemos medidas de segurança robustas, nenhum sistema é 100% seguro. Não 
                        podemos garantir a segurança absoluta de seus dados. Você também é responsável por 
                        manter a segurança de sua conta e senha.
                    </p>
                    
                    <h3>8.4 Notificação de Violações</h3>
                    <p>
                        Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos 
                        titulares, notificaremos:
                    </p>
                    <ul>
                        <li>A Autoridade Nacional de Proteção de Dados (ANPD)</li>
                        <li>Os titulares afetados</li>
                    </ul>
                    <p>
                        A notificação será feita em prazo razoável e incluirá informações sobre:
                    </p>
                    <ul>
                        <li>Descrição da natureza dos dados afetados</li>
                        <li>Informações sobre os titulares envolvidos</li>
                        <li>Medidas técnicas e de segurança utilizadas</li>
                        <li>Riscos relacionados ao incidente</li>
                        <li>Motivos da demora, se houver</li>
                        <li>Medidas que foram ou serão adotadas para reverter ou mitigar os efeitos</li>
                    </ul>
                </div>

                <div class="legal-section">
                    <h2>9. RETENÇÃO DE DADOS</h2>
                    <p>
                        Retemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades 
                        para as quais foram coletados, incluindo requisitos legais, contábeis ou de relatório.
                    </p>
                    
                    <h3>9.1 Critérios de Retenção</h3>
                    <p>
                        Determinamos o período de retenção com base em:
                    </p>
                    <ul>
                        <li>Duração do relacionamento com você</li>
                        <li>Existência de obrigação legal de retenção</li>
                        <li>Necessidade para resolução de disputas</li>
                        <li>Diretrizes de melhores práticas do setor</li>
                    </ul>
                    
                    <h3>9.2 Períodos de Retenção</h3>
                    <ul>
                        <li><strong>Dados de Conta Ativa:</strong> Enquanto sua conta estiver ativa</li>
                        <li><strong>Dados de Conta Inativa:</strong> Até 12 meses após a última atividade</li>
                        <li><strong>Dados de Suporte:</strong> Até 5 anos após o fechamento do ticket</li>
                        <li><strong>Dados Agregados/Anonimizados:</strong> Indefinidamente (não são dados pessoais)</li>
                        <li><strong>Logs de Sistema:</strong> Até 6 meses</li>
                        <li><strong>Dados Financeiros:</strong> Conforme exigido por lei (geralmente 5 anos)</li>
                    </ul>
                    
                    <h3>9.3 Exclusão de Dados</h3>
                    <p>
                        Quando seus dados não forem mais necessários, nós:
                    </p>
                    <ul>
                        <li>Excluímos permanentemente os dados</li>
                        <li>Ou anonimizamos os dados de forma irreversível</li>
                    </ul>
                    <p>
                        Você pode solicitar a exclusão de sua conta e dados a qualquer momento através das 
                        configurações do Aplicativo ou entrando em contato conosco.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>10. COOKIES E TECNOLOGIAS SIMILARES</h2>
                    <p>
                        Usamos tecnologias de armazenamento local (localStorage, sessionStorage) para:
                    </p>
                    <ul>
                        <li>Salvar suas preferências e configurações</li>
                        <li>Armazenar dados do Aplicativo localmente</li>
                        <li>Melhorar a experiência do usuário</li>
                        <li>Analisar o uso do Aplicativo</li>
                    </ul>
                    <p>
                        Você pode limpar esses dados através das configurações do seu navegador, mas isso pode 
                        afetar a funcionalidade do Aplicativo.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>11. PRIVACIDADE DE CRIANÇAS</h2>
                    <p>
                        O PetHouse não é destinado a crianças menores de 18 anos. Não coletamos intencionalmente 
                        dados pessoais de crianças.
                    </p>
                    <p>
                        Se tomarmos conhecimento de que coletamos dados de uma criança sem o consentimento dos 
                        pais, tomaremos medidas para excluir essas informações o mais rápido possível.
                    </p>
                    <p>
                        Se você acredita que podemos ter informações de ou sobre uma criança, entre em contato 
                        conosco imediatamente.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>12. LINKS PARA SITES DE TERCEIROS</h2>
                    <p>
                        O Aplicativo pode conter links para sites de terceiros. Não somos responsáveis pelas 
                        práticas de privacidade ou conteúdo desses sites.
                    </p>
                    <p>
                        Recomendamos que você leia as políticas de privacidade de qualquer site de terceiros 
                        que visitar.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>13. ALTERAÇÕES A ESTA POLÍTICA</h2>
                    <p>
                        Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças 
                        em nossas práticas ou por outros motivos operacionais, legais ou regulatórios.
                    </p>
                    <p>
                        Notificaremos você sobre quaisquer alterações materiais publicando a nova Política de 
                        Privacidade no Aplicativo e atualizando a data de "Última atualização".
                    </p>
                    <p>
                        Para alterações significativas, forneceremos aviso mais destacado, como notificação 
                        por e-mail ou aviso no Aplicativo.
                    </p>
                    <p>
                        Recomendamos que você revise esta Política periodicamente para se manter informado sobre 
                        como protegemos seus dados.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>14. SEUS CONSENTIMENTOS</h2>
                    <p>
                        Ao aceitar esta Política de Privacidade, você consente expressamente com:
                    </p>
                    <ul>
                        <li>A coleta, uso, armazenamento e tratamento de seus dados pessoais conforme descrito 
                            nesta Política</li>
                        <li>O compartilhamento de dados com provedores de serviços e nas circunstâncias descritas</li>
                        <li>A transferência internacional de dados, quando aplicável</li>
                        <li>O uso de dados agregados e anonimizados para pesquisa e desenvolvimento comercial</li>
                        <li>O uso de tecnologias de armazenamento local</li>
                        <li>O recebimento de comunicações relacionadas ao Serviço</li>
                    </ul>
                    <p>
                        Você pode revogar seu consentimento a qualquer momento, mas isso pode afetar sua 
                        capacidade de usar o Aplicativo.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>15. AUTORIDADE DE PROTEÇÃO DE DADOS</h2>
                    <p>
                        Você tem o direito de apresentar uma reclamação à Autoridade Nacional de Proteção de 
                        Dados (ANPD) se acreditar que o tratamento de seus dados pessoais viola a LGPD.
                    </p>
                    <p>
                        <strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong><br>
                        Website: https://www.gov.br/anpd/<br>
                        E-mail: Conforme disponível no site oficial
                    </p>
                    <p>
                        No entanto, encorajamos você a entrar em contato conosco primeiro para que possamos 
                        tentar resolver sua preocupação.
                    </p>
                </div>

                <div class="legal-section">
                    <h2>16. CONTATO</h2>
                    <p>
                        Se você tiver dúvidas, comentários ou solicitações sobre esta Política de Privacidade 
                        ou sobre nossas práticas de privacidade, entre em contato conosco:
                    </p>
                    <ul>
                        <li><strong>E-mail:</strong> rodrigorochalima@gmail.com</li>
                        <li><strong>Encarregado de Dados (DPO):</strong> Rodrigo Rocha Lima</li>
                        <li><strong>Aplicativo:</strong> PetHouse - Gestão de Pets</li>
                    </ul>
                    <p>
                        Responderemos às suas solicitações dentro do prazo legal (15 dias, prorrogáveis por 
                        mais 15 dias).
                    </p>
                </div>

                <div class="legal-footer">
                    <p>
                        <strong>Ao clicar em "Aceito a Política de Privacidade", você confirma que leu, 
                        compreendeu e concordou com todas as práticas de privacidade descritas acima.</strong>
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
window.PrivacyPolicy = PrivacyPolicy;
