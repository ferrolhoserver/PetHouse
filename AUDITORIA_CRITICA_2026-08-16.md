# Auditoria crítica — PetHouse

## Escopo verificado

A versão publicada está em `https://pet-house-sigma.vercel.app/` e a fonte está no repositório público `ferrolhoserver/PetHouse`.

## Achados críticos iniciais

| ID | Severidade | Achado | Evidência técnica | Impacto |
|---|---|---|---|---|
| SEC-01 | Crítica | Não há autenticação efetiva no fluxo principal. | `app.js` cria `pethouse_userId` aleatório em `localStorage`; `PetHouseAuth` não é chamado pelo aplicativo principal. | Não há identidade, sessão ou controle de acesso por pessoa. |
| SEC-02 | Crítica | A sincronização permite leitura e escrita por código de família sem verificação de propriedade. | `supabase-sync.js` aceita qualquer `familyId`; `supabase-setup.sql` possui política RLS pública `USING (true) WITH CHECK (true)`. | Um código de família exposto pode permitir acesso e alteração de dados de terceiros. |
| SEC-03 | Alta | O projeto declara recursos de segurança que não existem na arquitetura atual. | Termos citam criptografia, RBAC e auditoria; o armazenamento real usa JSON em `localStorage` sem proteção de segredo. | Risco de inconformidade e expectativa enganosa sobre proteção de dados. |
| SEC-04 | Alta | Não existe registro de service worker e dependências essenciais vêm de CDNs. | `index.html` não registra `serviceWorker`; Supabase, Chart.js e Tesseract são carregados remotamente. | O aplicativo não funciona de forma integral offline e não tem cache de aplicativo robusto. |
| SEC-05 | Alta | Persistência fragmentada em múltiplas chaves incompatíveis. | São usadas `pethouse_data_${userId}`, `pethouse_data`, `petHouseData`, `familyId`, `pethouse_familyId` e outras. | Falhas de migração, restauração e exclusão; risco de dados parecerem “sumir”. |
| SEC-06 | Média | Bibliotecas e scripts são carregados globalmente em sequência, sem modularização de fronteiras. | `index.html` carrega 54 scripts globais; não existe manifesto de dependências ou módulos ES. | Maior risco de colisões, regressões e degradação de desempenho no celular. |
| SEC-07 | Média | A tela de consentimento bloqueia a entrada e exige concordância com coleta de dados para uso. | Fluxo atual exibido em produção obriga três caixas, inclusive uma de coleta/análise de dados. | Experiência frágil, incompatível com objetivo de funcionamento privado e offline-first. |

## Estado de testes até aqui

| Verificação | Resultado |
|---|---|
| Sintaxe dos 54 arquivos JavaScript | Aprovada por `node --check` |
| Existência de service worker registrado | Não encontrado |
| Página publicada no Vercel | Acessível |
| Fluxo de acesso publicado | Interrompido por consentimento obrigatório antes de qualquer perfil/conta |

## Regra de continuidade

Nenhuma exclusão, redefinição, migração destrutiva de dados ou troca de credenciais será realizada sem: exportação local de segurança, versão de esquema, migração reversível e teste de recuperação.

## Próxima decisão arquitetural

Para satisfazer ao mesmo tempo “offline total”, “senha/reset” e “dupla verificação”, o sistema precisará separar:

1. **Perfil local protegido** para uso sem rede, bloqueado por PIN/senha e biometria/WebAuthn quando o dispositivo suportar;
2. **Backup e recuperação opcional**, que necessariamente requer um serviço remoto e confirmação por canal externo; e
3. **Isolamento de dados por perfil**, com banco local estruturado e criptografia derivada da credencial do usuário.

Essa divisão será proposta antes da implementação para evitar prometer recuperação de senha em um aplicativo que não pode consultar nenhum serviço externo.

---

*Registro técnico interno de auditoria. Não contém dados de usuários.*

## Falha observada em produção durante o teste

Após a aceitação completa dos termos no ambiente isolado de teste, a página publicada ficou completamente em branco, sem controles visíveis. O evento foi reproduzido ao aguardar a renderização subsequente. Esse comportamento é coerente com uma exceção de inicialização ou bloqueio assíncrono antes da chamada de renderização do aplicativo.

| Teste | Resultado |
|---|---|
| Tela de consentimento | Carrega |
| Aceitação das três caixas | Aceita |
| Continuidade para o aplicativo | Falha: tela branca |

A investigação da exceção no console e da sequência de inicialização será tratada como incidente bloqueador antes de qualquer migração de identidade ou alteração visual.

## Diagnóstico refinado do incidente visual

A inspeção do DOM após o consentimento confirmou que `window.app` foi inicializado e que a tela de escolha de família foi renderizada dentro de `#app` (aprox. 8.517 caracteres, área visível de 1.276 × 1.200 px). Portanto, não houve tela branca por interrupção do JavaScript; a captura visual vazia é uma inconsistência de renderização do ambiente de teste, não uma prova de perda de dados.

Mesmo assim, o fluxo real encontrado é inadequado para produção: ele oferece criação/entrada por família antes de apresentar um perfil autenticado, depende de `familyId` como credencial de acesso e ainda executa sincronização automática antes de a identidade do usuário estar validada.

## Achados adicionais de segurança

| ID | Severidade | Achado | Evidência | Tratamento necessário |
|---|---|---|---|---|
| SEC-08 | Crítica | Há uma chave de API de OCR exposta diretamente no JavaScript público. | `ocr-cartao-v2.js` contém `OCR_SPACE_API_KEY` literal e envia imagens de cartões para API externa. | Revogar a chave atual, remover o fallback externo do modo offline e trocar por OCR local ou por função protegida opcional. |
| SEC-09 | Alta | A proteção de dados em repouso não existe. | Não há uso de Web Crypto, PBKDF2, AES-GCM ou WebAuthn para dados de prontuário. | Introduzir banco local versionado e criptografia por perfil. |
| SEC-10 | Alta | As políticas SQL auxiliares usam autorização pública ou referências administrativas que não são verificadas pelo cliente. | Scripts SQL de dados colaborativos e `supabase-setup.sql` contêm políticas permissivas. | Recriar políticas com identidade autenticada e papéis aplicados no banco, nunca no cliente. |
| SEC-11 | Média | Não há cabeçalhos de segurança específicos para a aplicação. | A resposta do Vercel só apresentou HSTS e cache; não havia CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` ou `Permissions-Policy`. | Configurar cabeçalhos no deploy e restringir origens, frames, mídia e conectividade. |
| SEC-12 | Média | O registro de scripts usa dependências remotas sem garantia offline. | Bibliotecas principais são carregadas de CDNs no bootstrap. | Empacotar dependências locais, criar cache versionado e testar o app em modo avião. |

> Observação: uma chave anônima do Supabase não é, por si só, um segredo. Neste caso, porém, a chave se combina a políticas públicas de leitura/escrita e torna o banco exposto por desenho. A chave de OCR, por outro lado, deve ser tratada como segredo operacional e removida do cliente.

## Requisitos oficiais relevantes para futura distribuição no iPhone

A Apple requer uma versão final, URLs funcionais, testes de estabilidade e credenciais/demo de revisão para apps com login. Caso o app permita criação de conta, deve permitir iniciar a exclusão da conta dentro do próprio app. A exclusão pode exigir reautenticação e confirmação de identidade, desde que não seja artificialmente dificultada. A documentação também exige que sejam declaradas no App Store Connect as práticas de coleta de dados do app e de todo SDK de terceiros.

Para o PetHouse, isso significa que a versão para iPhone deve incluir: modo de demonstração ou conta de revisão; exclusão de perfil e dados; política de privacidade coerente com o comportamento efetivo; inventário de dados enviados para fora do dispositivo; e remoção ou declaração explícita de qualquer SDK de analytics, OCR em nuvem e sincronização.

**Fontes oficiais:**

1. Apple, [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
2. Apple, [Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
3. Apple, [App privacy details on the App Store](https://developer.apple.com/app-store/app-privacy-details/).

## Arquitetura escolhida — Opção B

A implementação seguirá um modelo **offline-first com recuperação remota opcional**, independente de serviços de autenticação da Manus:

1. O prontuário será armazenado localmente e associado a um perfil interno isolado.
2. O aplicativo permanecerá utilizável sem rede após o primeiro acesso local.
3. A conta remota servirá para confirmar e-mail, reset de senha, 2FA TOTP e backup opcional de conteúdo criptografado.
4. A conta remota não será autorizada a ler dados de outro usuário; o banco aplicará RLS por `auth.uid()` e exigirá nível de autenticação reforçado para operações sensíveis.
5. O reset de senha recuperará a identidade da conta; para recuperar um cofre criptografado em outro dispositivo, o usuário também precisará do kit de recuperação. Isso preserva a confidencialidade do conteúdo, em vez de criar uma cópia de chave secreta no servidor.
6. Operações críticas — adição de dispositivo, exportação de backup, alteração de senha, exclusão de perfil e ativação/desativação de 2FA — exigirão reautenticação e confirmação adicional.

A escolha por Supabase Auth é uma implementação independente da Manus e já oferece fluxos de senha, confirmação de e-mail, recuperação, MFA TOTP e enforcement de nível de autenticação no banco. Para integração segura em Vercel, as rotas de autenticação precisarão usar fluxo PKCE e impedir cache em respostas que definam cookies.

**Fontes oficiais:**

4. Supabase, [Password-based Auth](https://supabase.com/docs/guides/auth/passwords).
5. Supabase, [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa).
6. Supabase, [Advanced guide for server-side auth](https://supabase.com/docs/guides/auth/server-side/advanced-guide).

## Ambiente de teste V2

Um servidor estático local foi criado exclusivamente para validação. O teste usa armazenamento isolado do navegador de automação e não acessa, altera ou exporta dados de usuários reais. O consentimento de teste foi configurado apenas nesse ambiente para permitir a verificação do fluxo de criação/desbloqueio de perfil.

## Validação inicial do cofre por perfil

No ambiente local isolado, foi criado um perfil fictício com senha forte, kit de recuperação e cofre local. Após confirmar a guarda do kit, o aplicativo legado iniciou normalmente já conectado ao perfil V2, exibindo a casa associada e sem enviar o fluxo para sincronização legada. Esse teste confirma o encadeamento: criação de perfil → chave de cofre → persistência cifrada → desbloqueio → inicialização do aplicativo.

## Teste de persistência de domínio

No perfil fictício protegido, foi criado o pet de teste “Luna” com espécie, sexo e nascimento. O registro foi renderizado corretamente no dashboard e o aplicativo apresentou a confirmação “Dados protegidos neste dispositivo”, exercitando a rota `app.saveData()` no modo seguro. O teste foi realizado somente no armazenamento isolado do navegador de automação.

A reabertura do aplicativo exibiu a tela de desbloqueio do perfil, e o desbloqueio com a senha de teste restaurou corretamente o pet fictício. Isso valida, no ambiente isolado: bloqueio após recarregar, ausência de sessão aberta no armazenamento simples e recuperação de dados a partir do cofre cifrado.

## Referência de segundo fator

A documentação oficial do Supabase confirma que MFA TOTP segue o fluxo **enrolar fator → exibir QR/segredo → criar desafio → verificar código**, e que a aplicação deve consultar o nível de garantia da sessão antes de liberar dados sensíveis. Sessões com primeiro fator ficam em `aal1`; após TOTP validado, atingem `aal2`. As políticas remotas da V2 exigirão `aal2` para ler ou gravar backups cifrados. A implementação evitará supor endpoints REST não documentados: o backend usará a biblioteca oficial/rotas documentadas ou o servidor será validado diretamente antes do deploy.

**Fonte:** [Supabase — Multi-Factor Authentication (TOTP)](https://supabase.com/docs/guides/auth/auth-mfa/totp).

## Validação do centro de segurança

Depois de recarregar e desbloquear o perfil fictício, o dashboard preservou o pet de teste e exibiu o atalho **Segurança** apenas no modo protegido. A ação será testada em seguida contra a ausência proposital de configuração remota, para assegurar que o modo offline não falhe nem tente enviar dados sem uma vinculação explícita.

O reteste local confirmou novamente que o perfil V2 exige desbloqueio após a recarga e restaura o pet fictício após a senha correta. A versão atualizada será usada para validar que a indisponibilidade da infraestrutura remota é apresentada como estado offline controlado, sem comprometer o cofre.

## Triagem de instâncias MacDusk na Vercel

O painel da Vercel está autenticado. A busca por `mcdusk` confirma o projeto canônico **`mcdusk-dashboard`**, publicado em `mcdusk-dashboard.vercel.app` e ligado ao repositório `rodrigorochalima/mcdusk-dashboard`. Na listagem geral também surgiram dois projetos distintos com o mesmo repositório e o mesmo commit de junho: **`portfolio_dashboard`** (`portfoliodashboard-seven.vercel.app`) e **`dashboard-investimentos`** (`dashboard-investimentos-nine.vercel.app`). Eles são fortes candidatos a instâncias duplicadas; antes de qualquer remoção serão comparados domínios, status de produção e configurações para evitar apagar a instância canônica.

A comparação direta no painel confirmou que os três projetos estão ativos, apontam para a branch `main` do mesmo repositório `rodrigorochalima/mcdusk-dashboard` e estão fixados no mesmo commit `5848608` de 9 de junho. O projeto **`mcdusk-dashboard`** é o único com nome e domínio canônicos (`mcdusk-dashboard.vercel.app`); **`portfolio_dashboard`** e **`dashboard-investimentos`** possuem domínios próprios, mas não apresentam tráfego recente nem configurações distinguíveis na visão geral. São, portanto, cópias de deploy redundantes ligadas ao mesmo código-fonte, e não ambientes independentes.

## Consolidação de deploy MacDusk

Com confirmação explícita do responsável, o projeto **`dashboard-investimentos`** foi excluído no painel da Vercel; a plataforma retornou à lista de projetos sem essa instância. Em seguida, foi iniciada a exclusão de **`portfolio_dashboard`**, com os dois textos de confirmação exigidos pela Vercel. A operação está sendo aguardada e será verificada antes de retomar o desenvolvimento do PetHouse.

A verificação final da lista de projetos da Vercel confirma a exclusão de **`dashboard-investimentos`** e **`portfolio_dashboard`**. Entre os projetos ligados ao repositório MacDusk, permaneceu somente o projeto canônico **`mcdusk-dashboard`**, em `mcdusk-dashboard.vercel.app`. Nenhum repositório GitHub foi removido.

A validação de migração foi preparada em uma origem local independente (`127.0.0.1:4174`). A página iniciou no consentimento, mas o contexto automatizado do navegador recusou acesso a `localStorage` durante a injeção de dados fictícios. Nenhum dado real foi tocado. O teste será refeito por meio de um harness local de navegador/DOM que controle explicitamente a origem, mantendo a mesma cobertura de detecção, cifragem, duplicidade e reversão.

## Teste de migração e reversão — aprovado

O harness executado no navegador em origem isolada concluiu com sucesso todos os cenários: gravação e descoberta da origem legada, criação de perfil cifrado, preservação da cópia original, integridade de peso/vacina/banho dentro do cofre, bloqueio de migração duplicada, reversão controlada e conferência de que a fonte legada continua disponível após remover o perfil de teste. Nenhum dado de usuário foi usado nesse teste.

A recuperação local pelo kit já foi validada em navegador. Para concluir a recuperação opcional por e-mail, MFA TOTP e as políticas RLS de backup cifrado, falta aplicar a migração no projeto Supabase existente. O painel Supabase requer autenticação e não há sessão ativa no navegador; nenhuma credencial foi solicitada ou exposta.

## Verificação da referência Supabase legada

A configuração antiga do repositório aponta para um projeto Supabase específico. A verificação passiva do endpoint de autenticação falhou na resolução DNS (`HTTP 000`), o que indica que esse endereço não está ativo ou não é mais publicamente resolvível. Somado à ausência do projeto na conta autenticada, essa referência será tratada como **legada e não confiável**. Nenhuma migração será aplicada nela, e o PetHouse continuará seguro e plenamente funcional no modo local enquanto a infraestrutura remota correta não for identificada ou criada de forma controlada.

## Teste de OCR offline — aprovado

As bibliotecas de gráfico e OCR foram empacotadas no repositório. O motor Tesseract, worker, núcleo WebAssembly e idioma português foram servidos localmente. Em navegador isolado, uma imagem de referência contendo `VACINA V8`, data e clínica foi lida integralmente sem chamada a API externa. O fluxo antigo de OCR.space foi substituído por reconhecimento no dispositivo.

O manifesto e o service worker foram adicionados para instalação offline. A primeira verificação automatizada no navegador não encontrou um registro ativo imediatamente após o carregamento; a ativação será testada explicitamente antes de considerar o cache PWA concluído.

## Cache PWA — aprovado

O service worker foi registrado e ativado no navegador de teste. O cache offline contém 29 recursos essenciais, incluindo o modelo de idioma português do OCR. A instalação poderá manter o shell e os recursos já visitados disponíveis sem conexão após o primeiro carregamento.

O consentimento V2 foi validado visualmente no navegador: apresenta apenas aceite dos Termos e da Política de Privacidade, identifica o modo privado/offline e não condiciona o acesso à coleta de dados ou a um limite de famílias.

Após o aceite no ambiente isolado, a porta segura detectou corretamente a origem legada de teste (`Casa Migração`, 1 pet), ofereceu backup antes da migração e apresentou a criação de perfil protegido. A tela confirma que a migração ocorre somente por escolha explícita, sem remover a fonte original.

A criação do perfil de teste migrado foi concluída e o aplicativo exibiu o kit de recuperação uma única vez, exigindo confirmação explícita de armazenamento antes de liberar a entrada. O código exibido pertence exclusivamente ao ambiente isolado de testes e não foi reutilizado em produção.

O perfil de teste foi aberto com sucesso após a migração. O dashboard exibiu o pet legado, o peso e o banho preservados, e disponibilizou o Centro de Segurança. Isso confirma a integração do cofre com a interface principal sem descarregar os registros para a sincronização legada.

Após a atualização de versão dos módulos protegidos e do cache PWA, o perfil de teste foi desbloqueado novamente com sucesso e o pet migrado permaneceu disponível. Isso confirma que a atualização não invalidou o cofre ou o caminho de entrada existente.

Foi identificado que o cache inicial ignorava parâmetros de versão e podia servir um módulo antigo. A estratégia foi corrigida para respeitar a URL completa, o cache foi versionado novamente e a verificação no navegador confirmou o carregamento da API de confirmação por dispositivo (`deviceFactorSupported`).

Na execução do aplicativo, os módulos de entrada manual e de conhecimento local foram encontrados e a sincronização legada permaneceu bloqueada. A verificação confirmou que não há cliente Supabase ativo no modo protegido.

## Desempenho do OCR — aprovado

O motor OCR deixou de ser carregado na tela inicial. O harness confirmou que ele inicia ausente, é carregado localmente somente quando solicitado e reconhece a imagem de referência corretamente. O cache foi ajustado para respeitar versões de módulos, evitando que uma versão anterior do runtime seja reutilizada.

A tela de desbloqueio foi reavaliada visualmente no navegador em dimensão móvel. Os controles mantêm áreas de toque amplas, contraste legível, hierarquia clara e adaptação à área segura do dispositivo.

O Centro de Segurança passou a expor a exclusão local de forma acessível. O fluxo foi validado até a segunda etapa: explica o escopo da remoção, recomenda exportação de backup e exige a digitação explícita de `EXCLUIR` antes de habilitar a operação destrutiva.

## Exclusão local de perfil — aprovada

Com a confirmação textual `EXCLUIR`, o perfil fictício foi removido e o aplicativo voltou à tela de criação de um perfil novo. A antiga origem legada de teste também deixou de ser oferecida para migração, confirmando a remoção do cofre e dos dados associados naquele dispositivo isolado.

As páginas públicas `privacy.html` e `support.html` foram validadas no servidor local. Ambas exibem o contato, a política do modo offline, instruções de recuperação e exclusão de dados, e estão incluídas na sincronização do pacote iOS.

A regressão final de criação de perfil foi executada no navegador isolado: a senha validada criou o cofre, exibiu o kit uma única vez, exigiu confirmação explícita e abriu o dashboard vazio do novo perfil sem erros. O cenário confirma a operação de um perfil novo sem qualquer dependência da infraestrutura legada.

## Correção de compatibilidade entre módulos — aprovada

A auditoria final identificou que o `id="app"` do contêiner HTML mascarava a instância JavaScript usada por módulos legados via `window.app`. O contêiner foi renomeado para `app-root`, a instância passou a ser exposta explicitamente em `window.app` e `window.PetHouseApp`, e a confirmação no navegador retornou os métodos `saveData` e `renderPet` da classe `PetHouse`. Isso restaura a integração dos handlers que atualizam peso, banho, vacinas, cio e toasts.

O cadastro completo de um pet fictício (`Nina Teste`) foi executado no dashboard protegido após a correção de `window.app`. O card foi renderizado e o aviso de dados protegidos apareceu, comprovando que o fluxo de registro e salvamento voltou a operar no cofre do perfil.

Após reabrir o aplicativo e desbloquear o mesmo perfil, o card de `Nina Teste` continuou disponível. Isso confirma a persistência do registro no cofre local entre sessões, sem backend e sem depender do armazenamento legado.

O fluxo de peso foi validado em ponta a ponta no perfil protegido: foi adicionado um registro de 8.400 g, o peso atual passou a refletir o valor, o gráfico foi renderizado, o histórico exibiu data e observação, e os controles de editar/excluir apareceram sem diálogo nativo.

A regressão de cuidados foi concluída: uma segunda vacina apareceu imediatamente na timeline e reduziu a contagem de pendências sem recarregamento. Em seguida, o modal customizado de exclusão removeu somente o registro fictício selecionado, atualizou a timeline e recalculou os alertas. Não houve uso de `confirm()` nativo.

## Bloqueio de publicação identificado

Em 18 de agosto de 2026, a sessão GitHub autenticada no navegador (`rodrigorochalima`) abriu `https://github.com/ferrolhoserver/PetHouse/edit/main/VERSION.txt` e recebeu a mensagem de que não possui permissão de edição direta no repositório `ferrolhoserver/PetHouse`; o GitHub oferece apenas a criação de fork e pull request. O `git push` local também está bloqueado porque o conector GitHub desta sessão está com credencial expirada. O commit local pronto para publicação é `1bd776a`.

## Implantação temporária validada

Em 19 de agosto de 2026, a versão commitada `1bd776a` foi implantada anonimamente pela Vercel CLI em `https://temporary-racing-sienna-ra2y4o1.vercel.app`. A página pública carregou a tela de consentimento PetHouse 2.0, com Termos de Uso, Política de Privacidade e a indicação de funcionamento privado/offline. A conta GitHub ativa no navegador permanece `rodrigorochalima` e não oferece uma segunda conta no seletor; ela não possui permissão administrativa nem de escrita no repositório `ferrolhoserver/PetHouse`.

## Validação após deploy oficial

Após o push do commit `55d5617`, a URL oficial `https://pet-house-sigma.vercel.app/?release=55d5617` carregou a versão 2.0.0. No navegador isolado foram validados: consentimento de termos e privacidade, criação de perfil local protegido, geração e confirmação do kit de recuperação apenas para o perfil fictício, e entrada no dashboard sem qualquer sincronização remota automática.
A regressão pública foi concluída no perfil fictício: o cadastro de `Luna Publicação` (cachorro, fêmea, nascimento em 11/04/2021) foi salvo na URL oficial, exibiu o card do pet, os indicadores iniciais de peso/vacinação/banho e a confirmação de que os dados foram protegidos neste dispositivo.

## Revisão offline local e identidade visual acolhedora

Em origem isolada, a versão revisada exibiu termos coerentes com recuperação local, criação de perfil protegido, geração de kit de recuperação e dashboard. O Centro de Segurança mostrou somente: cofre cifrado no dispositivo, exportação de backup cifrado, confirmação por Face ID/Touch ID/código do dispositivo quando disponível, recuperação pelo kit local e exclusão confirmada. Não foram exibidos campos de e-mail, sincronização ou autenticação remota.

A revisão visual foi validada em viewport móvel: cabeçalho em gradiente violeta–coral, elementos de toque altos, cartões com bordas arredondadas, tipografia arredondada local e estados semânticos menta/azul. O fluxo preserva os rótulos e as ações funcionais do prontuário.

## PWA e empacotamento iOS

O service worker foi registrado e ativado em origem de teste, com cache `pethouse-offline-v2-20260819a`. O projeto Capacitor iOS foi sincronizado após a revisão: o pacote nativo contém o tema acolhedor, o centro de segurança local e os recursos estáticos necessários ao funcionamento offline.

## Regressão de execução da revisão local

No navegador de teste, `PetHouseIdentity` e `PetHouseSecureStore` estavam carregados, o perfil fictício permaneceu desbloqueado e `PetHouseRemoteAuth` não foi carregado. O cache ativo continha `/index.html`, `/css/companion-theme.css?v=2` e `/js/ui/security-center.js?v=5`. A checagem de sintaxe cobriu os módulos JavaScript, as rotas e os scripts de preparação; a verificação de integridade do diff não encontrou espaços em branco ou conflitos.

## Validação pública após o commit c5306fc

A URL de produção `https://pet-house-sigma.vercel.app/?release=c5306fc` carregou o tema violeta–coral, reconheceu o perfil fictício criado no navegador de teste e realizou o desbloqueio com sucesso. O dashboard mostrou o pet de validação e seus indicadores, confirmando que o cofre local e a interface publicada estão operacionais na hospedagem oficial.

## Regressão de continuidade — correção em validação

Em uma origem limpa, dados fictícios no formato legado `pethouse_data` passaram a abrir diretamente na casa e no pet, sem criação de perfil nem desbloqueio adicional. O mesmo cenário confirmou a correção da unidade: um registro histórico de `12.4` é apresentado como `12,4 kg` no card principal, em vez de `12.400 g`. A proteção do cofre permanece disponível como ação opcional `Proteger dados`.

## Regressão final — experiência restaurada

Na origem limpa final, a casa legada abriu diretamente após o consentimento, preservando os comandos conhecidos: adicionar pet, salvar, restaurar, compartilhar, reportar e o novo atalho opcional de proteção. O card do pet e o cabeçalho exibiram corretamente `12,4 kg`; o dashboard, gráfico e histórico usam a mesma normalização sem reescrever a origem legada.

A regressão funcional confirmou a abertura do pet legado, os alertas, o gráfico de peso, o histórico e o formulário de novo peso. O formulário mantém a entrada em gramas (`12.600`) e a camada de leitura normaliza a apresentação para quilogramas.

A regressão de peso aprovou a gravação de `12.600` g, atualizando imediatamente cabeçalho (`12,6 kg`), card de tendência, gráfico e histórico com dois registros. A aba Cuidados também exibiu sem recarregar a vacina legada V10, sua próxima dose e a ação de exclusão protegida.

A aba Cuidados de Higiene carregou a frequência, a recomendação de próximo banho, a timeline e o formulário completo de Adicionar Banho/Tosa sem erros no perfil legado de teste.

Após reabrir a aplicação, o peso recém-salvo (`12,6 kg`) permaneceu no card do pet. A persistência continuou na origem legada, sem criar novo perfil nem exigir desbloqueio.

## Validação pública da correção 6243e93

O HTML entregue pelo servidor de produção confirmou `app.js?v=4`, `weight-utils.js?v=1`, `secure-gate.js?v=4` e `dashboard-peso.js?v=3`. Após atualizar somente o cache do navegador sandbox, a URL oficial abriu diretamente uma casa legada fictícia (`Casa Pública Legada`) e exibiu o pet Nina com `4,2 kg`, sem exigir criação ou desbloqueio de perfil.
