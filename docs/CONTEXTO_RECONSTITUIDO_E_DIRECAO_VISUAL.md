# PetHouse — Contexto Reconstituído e Direção Visual

**Status:** fonte de verdade do produto para as próximas evoluções.  
**Atualizado em:** 19 de agosto de 2026.  
**Escopo:** aplicativo de organização de cuidados e prontuários de pets, com prioridade absoluta para uso no celular, privacidade e continuidade dos registros.

## Propósito preservado

O **PetHouse** não é um sistema veterinário clínico e não substitui atendimento profissional. Ele é o espaço pessoal ou familiar no qual a pessoa responsável acompanha, em um só lugar, a rotina e a história de cada pet: perfil, peso, vacinas, vermífugos, banho e tosa, consultas, documentos, alertas e observações.

A referência útil em prontuários pessoais é a possibilidade de a própria pessoa manter, visualizar e complementar registros relevantes fora de uma consulta. Estudos sobre prontuários móveis apontam a importância de permitir que o usuário registre e organize os dados que considera relevantes, em vez de limitar a experiência a dados previamente selecionados por uma instituição.[1] O PetHouse aplica esse princípio ao cuidado cotidiano de pets, mas sem se apresentar como diagnóstico ou orientação veterinária.

| Aspecto | Decisão permanente |
|---|---|
| Público principal | Pessoas responsáveis por pets, utilizando principalmente celular. |
| Papel do aplicativo | Organização, memória, acompanhamento e lembretes de cuidados. |
| Dados essenciais | Perfil do pet, peso, vacinas, vermífugos, higiene, consultas, documentos e observações. |
| Fonte de verdade | Cofre cifrado no dispositivo da pessoa usuária. |
| Conectividade | Recursos principais funcionam offline após a instalação. |
| Conselho clínico | Não é oferecido; alertas e calendários são apenas organizacionais. |

## Comportamentos que não podem regredir

A navegação deve continuar curta, explícita e voltada a ações frequentes. O usuário precisa chegar ao pet, ao histórico e aos controles de registro sem reaprender o aplicativo. As correções já consolidadas permanecem obrigatórias: registro, edição e exclusão de peso; adição e exclusão de vacinas; timeline de cuidados; alertas compactos e clicáveis; banho e tosa; gráficos; e atualização imediata dos dados sem recarregar a página.

| Fluxo | Critério de qualidade |
|---|---|
| Criar perfil | Nome, senha forte e kit de recuperação local; nenhum cadastro remoto obrigatório. |
| Abrir aplicativo | Consentimento claro, perfil protegido, desbloqueio por senha e, quando ativada, confirmação do dispositivo. |
| Registrar cuidado | Ação curta, confirmação visual e reflexo imediato no prontuário, alertas e gráficos relacionados. |
| Trocar de aparelho | Backup cifrado exportado pela pessoa usuária e kit de recuperação, sem sincronização automática. |
| Esquecer senha | Recuperação local pelo kit, sem e-mail, servidor ou dependência da Manus. |
| Excluir dados | Confirmação explícita com a palavra `EXCLUIR`; opção de exportar backup antes da remoção. |

## Arquitetura e privacidade

O app usa um **perfil local** por pessoa, com cofre cifrado persistido no armazenamento local do navegador. A senha não é mantida em texto simples; a chave do cofre fica somente em memória enquanto o perfil está desbloqueado. O kit de recuperação permite criar uma nova senha para o mesmo cofre local. A confirmação por dispositivo usa a capacidade compatível do navegador/aparelho, como Face ID, Touch ID ou bloqueio seguro do dispositivo.

> A decisão de produto é **offline-first de verdade**: não há conta remota, recuperação por e-mail, telemetria, analytics, anúncio, sincronização automática ou envio de prontuários. O código, a documentação e os artefatos reprodutíveis ficam versionados no GitHub; o ambiente de desenvolvimento não é uma dependência do funcionamento do usuário final.

Essa escolha privilegia controle e clareza. Prontuários móveis de qualidade precisam ser centrados nas necessidades reais da pessoa, com requisitos definidos no contexto de uso, soluções avaliadas e ajustes com base no uso observado.[2]

## Linguagem visual: “companheiro de cuidado”

A experiência deve transmitir vínculo e leveza, não a austeridade de um sistema hospitalar. A interface usa uma tipografia arredondada disponível localmente no dispositivo — `ui-rounded`, `SF Pro Rounded` e `Avenir Next` como prioridades — evitando fontes externas e preservando a operação offline. O objetivo é ter proximidade visual semelhante a aplicativos de relacionamento e rotina, com legibilidade suficiente para um prontuário.

| Elemento | Decisão visual |
|---|---|
| Fundo | Creme rosado claro e gradientes suaves, criando conforto sem reduzir contraste. |
| Cor principal | Violeta `#6C63FF`, para marca, foco e chamadas principais. |
| Cor afetiva | Coral `#FF6B81`, para destaques, vínculos e ações com energia. |
| Cor de celebração | Dourado `#F7B84B`, usado de modo pontual para conquistas e atenção não crítica. |
| Cor de cuidado positivo | Menta `#38C6A6`, para registros concluídos e estados seguros. |
| Tipografia | Formas arredondadas, títulos densos e curtos, texto de leitura simples. |
| Componentes | Cartões com espaço respirável, abas em pílula, botões altos para toque e feedback imediato. |
| Movimento | Transições suaves e curtas; todo movimento é reduzido quando a preferência do sistema pede menos animação. |

A pesquisa de interface de prontuários destaca justamente o risco de telas superlotadas, navegação ambígua e excesso de informações em um mesmo momento. Também recomenda visualização de tendências, consistência, espaço em branco, ações frequentes próximas e testes de usabilidade.[3] No PetHouse, isso se traduz em cards menores, hierarquia de uma ação principal por área, alertas compactos e gráficos diretamente ligados ao pet selecionado.

## Princípios de evolução

As próximas mudanças devem preservar os dados existentes, serem reversíveis quando afetam armazenamento e incluir teste do fluxo completo impactado. Cada novo recurso precisa responder a três perguntas: **qual cuidado ele organiza, em qual tela ele aparece e qual outro ponto do app precisa refletir a mudança?**

Uma evolução visual só é aprovada se mantiver contraste, foco visível, alvos de toque confortáveis, texto escalável e desempenho offline. O objetivo não é reproduzir um prontuário humano: é trazer sua clareza de histórico, categorias e linha do tempo para uma experiência de cuidado afetuosa e adequada a pets.

## Referências

[1] [Zhou L, DeAlmeida D, Parmanto B. *Applying a User-Centered Approach to Building a Mobile Personal Health Record App: Development and Usability Study*. JMIR mHealth and uHealth, 2019.](https://pmc.ncbi.nlm.nih.gov/articles/PMC6640070/)

[2] [Nimmanterdwong Z, Boonviriya S, Tangkijvanich P. *Human-Centered Design of Mobile Health Apps for Older Adults: Systematic Review and Narrative Synthesis*. JMIR mHealth and uHealth, 2022.](https://pmc.ncbi.nlm.nih.gov/articles/PMC8800094/)

[3] [Purrweb. *How to design user-friendly EMR/EHR interfaces*, atualizado em 2026.](https://www.purrweb.com/blog/emr-ehr-interface-design/)
