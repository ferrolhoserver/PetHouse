# PetHouse — preparação para iOS e App Store

**Versão técnica:** 2.0.0  
**Atualização:** 18 de agosto de 2026  
**Estado:** projeto iOS gerado e sincronizado; publicação depende da validação final em macOS/Xcode e da conta Apple Developer.

> O PetHouse foi preparado para empacotamento nativo com Capacitor, mas nenhuma ferramenta pode prometer aprovação pela Apple. A decisão de aprovação pertence exclusivamente à App Review e exige binário final, metadados e testes em aparelho físico.[1]

## O que já está pronto

| Área | Situação | Evidência técnica |
|---|---|---|
| Base nativa | Pronta | Projeto `ios/` criado e sincronizado via Capacitor 8. |
| Aplicação instalável | Pronta | Manifesto, ícones de fonte 1024×1024, modo `standalone` e service worker presentes. |
| Uso offline | Pronto após a primeira instalação | Dados ficam no cofre local; os recursos essenciais e o OCR local entram no cache. |
| Privacidade | Pronta para o modo local | Sem telemetria ativa, sem CDN e sem envio automático de prontuários. |
| Exclusão de perfil | Pronta | Centro de Segurança permite excluir cofre, prontuários e cópia legada migrada após confirmação textual. |
| Conta remota | Não ativada | A infraestrutura Supabase antiga está indisponível e foi desligada; recuperação atual ocorre pelo kit local. |

## Procedimento de publicação no Mac

| Etapa | Ação necessária | Responsável |
|---|---|---|
| 1 | Instalar Xcode atualizado e entrar com a conta Apple Developer. | Proprietário do app |
| 2 | Clonar o repositório e executar `pnpm install` seguido de `pnpm run sync:ios`. | Desenvolvimento |
| 3 | Abrir `ios/App/App.xcworkspace` no Xcode, definir equipe, assinatura e o identificador definitivo. | Proprietário do app |
| 4 | Preencher o catálogo de ícones do Xcode a partir da imagem-fonte em `icons/icon-192.png` ou `icons/icon-512.png`, ambas com 1024×1024. | Desenvolvimento/design |
| 5 | Testar em iPhone físico: criação, desbloqueio, bloqueio, recuperação por kit, exclusão, OCR, modo avião e reinstalação. | QA |
| 6 | Criar o Archive, enviar ao App Store Connect e distribuir primeiro via TestFlight. | Proprietário do app |
| 7 | Enviar a versão de produção somente após concluir metadados, capturas reais e as notas de revisão. | Proprietário do app |

## Requisitos de App Review aplicáveis

A Apple requer um app funcional, URLs e metadados completos, além de testes de estabilidade antes do envio. Quando há funcionalidade baseada em conta, a revisão precisa conseguir acesso completo por meio de uma conta de demonstração ou de um modo de demonstração equivalente.[1]

O PetHouse evita esse bloqueio no modo atual porque cria perfis inteiramente locais, diretamente no aparelho e sem cadastro remoto. Ainda assim, o revisor deve receber nas notas a instrução para criar um perfil de teste e salvar o kit de recuperação exibido uma única vez.

A Apple exige que aplicativos que suportam criação de conta permitam iniciar a exclusão dentro do app. O fluxo local do PetHouse atende ao caso atual: ele está em **Segurança e Recuperação → Excluir perfil deste aparelho**, pede confirmação explícita e exclui todos os dados do perfil presentes naquele dispositivo.[2]

> Se uma futura versão ativar vínculo por e-mail, backup em nuvem ou autenticação remota, ela deverá incluir também a exclusão da conta e dos backups remotos no próprio aplicativo. A exclusão local sozinha não será suficiente para essa versão.[2]

## Metadados e notas sugeridos

| Campo | Conteúdo sugerido |
|---|---|
| Nome | `PetHouse` |
| Subtítulo | `Prontuário privado do seu pet` |
| Categoria | Lifestyle ou Productivity, a confirmar conforme o escopo final do App Store Connect. |
| Classificação etária | Responder o questionário com base no conteúdo final; não declarar a categoria infantil sem cumprir as regras específicas. |
| Política de privacidade | URL pública: `/privacy.html` na hospedagem de produção. |
| URL de suporte | URL pública: `/support.html` na hospedagem de produção. |
| Notas para revisão | “O PetHouse funciona offline. Na primeira abertura, crie um perfil local de teste e guarde o kit de recuperação apresentado. Não há login em servidor, anúncios ou telemetria ativa nesta versão.” |

## Validação obrigatória antes do envio

A preparação técnica não substitui estas verificações manuais no aparelho real:

1. Criar perfil com e sem migração de dados legados e confirmar que cada perfil enxerga apenas o próprio cofre.
2. Usar Face ID/Touch ID ou o código do dispositivo para ativar a segunda camada local e confirmar o comportamento após bloquear o app.
3. Testar perda de senha e redefinição com o kit de recuperação em uma cópia de teste.
4. Testar exclusão após exportar backup; confirmar que o perfil não reaparece.
5. Ativar o modo avião após a primeira abertura e validar criação de pet, vacina, peso, banho, gráfico e OCR.
6. Confirmar que a política de privacidade e a tela de suporte carregam pelas URLs públicas finais.
7. Executar a avaliação de acessibilidade do Xcode e testar VoiceOver, texto ampliado e contraste.

## Referências

[1] [Apple — App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)  
[2] [Apple — Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/)  
[3] [Capacitor — Building Progressive Web Apps](https://capacitorjs.com/docs/web/progressive-web-apps)  
[4] [Capacitor — Deploying an iOS App to the App Store](https://capacitorjs.com/docs/ios/deploying-to-app-store/)
