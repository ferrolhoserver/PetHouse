# PetHouse V2 — Arquitetura Offline-First, Privacidade e Autenticação

**Status:** plano de implementação aprovado — Opção B  
**Data:** 16 de agosto de 2026  
**Princípio:** nenhum dado existente será apagado ou regravado sem backup, migração versionada e caminho de reversão.

## 1. Objetivo da reengenharia

O PetHouse deixará de tratar um identificador local e um código de família como identidade. A versão V2 terá **perfil interno por pessoa**, cofre local criptografado, sessão persistente controlada, autenticação em dois fatores e recuperação remota opcional. O prontuário permanecerá disponível offline, enquanto e-mail, recuperação, segundo fator e backup só serão utilizados quando houver conectividade e consentimento explícito.

> A conta remota prova quem pode acessar um perfil. O cofre local protege o conteúdo de saúde e cuidados dos pets. São camadas diferentes por desenho.

| Requisito | Decisão V2 |
|---|---|
| Identidade | Conta própria do PetHouse por e-mail, independente da Manus |
| Uso offline | Dados e funcionalidades de gestão disponíveis após o primeiro desbloqueio local |
| Isolamento | Um espaço de dados exclusivo por `profileId`; nenhuma leitura cruzada entre perfis |
| Proteção local | Banco IndexedDB, envelope criptográfico AES-GCM e chave derivada com PBKDF2 |
| Sessão | Sessão local bloqueável, expiração por inatividade e desbloqueio por PIN/senha/biometria quando suportada |
| Segunda camada | TOTP obrigatório para contas remotas e reautenticação para ações sensíveis |
| Recuperação | E-mail confirmado para reset de conta + kit de recuperação para acesso a cofre criptografado em novo aparelho |
| Sincronização | Backup remoto opcional, versionado e criptografado no cliente antes do envio |
| Exclusão | Exclusão local imediata e solicitação de exclusão de conta/dados remotos dentro do app |

## 2. Limite de segurança e transparência

Não é possível oferecer simultaneamente criptografia ponta a ponta, reset de senha por e-mail e recuperação automática de todo o conteúdo criptografado sem guardar uma cópia da chave em um servidor. A V2 preservará a confidencialidade: o reset por e-mail recuperará a **conta**, enquanto o **kit de recuperação** será necessário para abrir um backup criptografado em um novo dispositivo.

Em dispositivo já autorizado, o usuário poderá gerar um novo kit de recuperação ou alterar a senha sem perder o cofre. Se perder senha, kit e todos os dispositivos autorizados, o conteúdo criptografado não poderá ser restaurado — esse é o custo explícito de não entregar a chave de leitura ao servidor.

## 3. Componentes e fronteiras

| Camada | Responsabilidade | Regra de segurança |
|---|---|---|
| `core/` | Tipos, validação, datas, IDs, eventos de domínio | Sem DOM, sem rede e sem estado global |
| `security/` | Derivação de chave, criptografia, hash, lock de sessão, suporte WebAuthn | Nunca gravar senha, PIN ou chave de cofre em texto simples |
| `storage/` | IndexedDB, versão de esquema, backup local, migração e rollback | Transações atômicas e dados separados por perfil |
| `identity/` | Perfil local, sessão, conta remota, e-mail, 2FA e autorização | Todo acesso remoto requer usuário autenticado e verificado |
| `sync/` | Fila offline, envelope de backup, resolução de conflitos e estado de sincronização | Nunca enviar prontuário sem cifrar no dispositivo |
| `features/` | Pets, peso, vacinas, vermífugos, higiene, consultas, exames e alertas | Receber um repositório de perfil, não acessar `localStorage` diretamente |
| `ui/` | Componentes de tela, design system, acessibilidade e transições | Sem regras de segurança implementadas apenas na interface |
| `server/` | Rotas de autenticação/confirmacão e políticas de dados | Segredos somente no servidor; cookies e respostas de auth sem cache |

Essa estrutura possibilita reaproveitar regras de domínio e contratos de dados numa futura camada Swift/SwiftUI, mantendo a UI web e as integrações isoladas.

## 4. Modelo de dados local

### 4.1 Bancos IndexedDB

| Store | Chave | Conteúdo |
|---|---|---|
| `profiles` | `profileId` | Nome de exibição, e-mail mascarado, preferências, estado de migração e metadados não sensíveis |
| `vaults` | `profileId` | Cofre cifrado, IV, versão do algoritmo, sal e histórico de esquema |
| `devices` | `deviceId` | Dispositivo autorizado, última utilização, capacidade biométrica e chave pública quando aplicável |
| `outbox` | `operationId` | Operações cifradas pendentes de backup/sincronização |
| `audit` | `eventId` | Eventos pseudonimizados, locais e sem dados clínicos em texto |
| `settings` | `key` | Preferências gerais não sensíveis e versão do app |

### 4.2 Envelope criptográfico

1. Durante a criação de perfil, gerar um `profileId` UUID, sal criptográfico e chave aleatória de cofre.
2. Derivar uma chave de proteção da senha usando PBKDF2-SHA-256 com alto número de iterações e sal exclusivo.
3. Cifrar o cofre em AES-GCM com IV novo para cada gravação.
4. Cifrar a chave do cofre por uma chave derivada da senha e, opcionalmente, por uma credencial de dispositivo enrolada.
5. Gerar kit de recuperação de alta entropia e exibi-lo uma única vez, com confirmação de armazenamento pelo usuário.
6. Limpar buffers de chaves e dados abertos ao bloquear a sessão.

## 5. Identidade, sessão e segunda verificação

| Fluxo | Etapas |
|---|---|
| Primeiro uso offline | Criar perfil local → senha forte → gerar kit de recuperação → criar cofre → opcionalmente habilitar biometria/dispositivo |
| Cadastro remoto opcional | Desbloquear perfil → e-mail e senha → confirmação por e-mail → vínculo da conta ao perfil, sem enviar o cofre em aberto |
| Login em dispositivo novo | Conta e senha → TOTP → fornecer kit de recuperação ou importar backup protegido → registrar dispositivo |
| Login no mesmo dispositivo | Sessão persistente curta → desbloqueio local por PIN/senha/biometria → acesso ao cofre |
| Reset de senha | Link/OTP de e-mail → nova senha para a conta → solicitar kit de recuperação para reabrir backup em novo aparelho |
| Ação sensível | Reautenticação recente + TOTP quando a conta remota estiver vinculada |
| Troca/perda de dispositivo | Revogar o dispositivo pelo painel de segurança e invalidar sessões remotas |

### Política de senha

A senha de conta deverá ter no mínimo 12 caracteres, com verificação de comprimento, mistura de tipos de caracteres e bloqueio de senhas notoriamente fracas. A UI terá indicação de força, botão de exibir/ocultar, suporte a gerenciadores de senhas e campos com `autocomplete` correto. A validação no cliente é apenas feedback; a validação definitiva será aplicada no serviço de identidade.

## 6. Banco remoto e autorização

A infraestrutura remota será usada somente para identidade e para blobs de backup já cifrados.

| Recurso | Regra |
|---|---|
| `profiles` | Uma linha por `auth.uid()`; o usuário só lê/edita a própria linha |
| `encrypted_vaults` | Um ou mais snapshots por dono; `owner_id = auth.uid()` em toda política RLS |
| `devices` | Vínculo exclusivo por usuário autenticado |
| `security_events` | Leitura exclusiva pelo dono; sem conteúdo de prontuário |
| Operações críticas | Política RLS restritiva exigindo `aal2` (MFA concluído) |
| Chaves de serviço | Exclusivamente em variáveis do ambiente do servidor; nunca no HTML/JS |

A tabela pública atual `pethouse_data` não receberá novas gravações. Será preservada até que cada perfil tenha exportado/migrado seus dados com confirmação explícita. Após a janela de migração, suas políticas públicas serão removidas e o acesso será encerrado.

## 7. Migração sem perda e reversão

1. Detectar todos os formatos legados: `pethouse_data_${userId}`, `pethouse_data`, `petHouseData` e variantes.
2. Criar um backup JSON local imutável com checksum antes de qualquer conversão.
3. Exibir ao usuário a origem, a contagem de pets e o tamanho do backup; não migrar automaticamente dados ambíguos.
4. Normalizar esquemas de vacinas, pesos, banhos, vermífugos, exames e cuidados para contratos V2.
5. Criar o cofre novo e registrar `migrationVersion`, `sourceKeys`, checksum e data.
6. Validar quantidade de pets e registros antes/depois da migração.
7. Manter dados legados em modo somente leitura por duas versões do app; disponibilizar ação de reversão enquanto não houver confirmação de descarte.
8. Exportar backup legível e backup criptografado após conclusão.

## 8. Operação offline e desempenho

A V2 substituirá dependências críticas de CDN por arquivos empacotados ou cache gerenciado. Um service worker versionado adotará estratégia de precache para estrutura, estilos, scripts, ícones e bibliotecas. A fila de sincronização será reexecutada somente quando houver conectividade e sessão válida, sem bloquear o uso local.

A interface deve respeitar `prefers-reduced-motion`, safe areas do iPhone e metas de toque de pelo menos 44 × 44 px. Animações serão baseadas em `transform` e `opacity`, evitando animações de propriedades que causam reflow. Todos os fluxos devem ter estados de carregamento, erro e vazio visíveis.

## 9. Checklist de conformidade para iOS

| Tema | Entrega V2 |
|---|---|
| Conta | Login funcional, recuperação, 2FA, e modo demonstrativo para revisão |
| Exclusão | Ação em Configurações para excluir perfil local e iniciar exclusão de conta remota |
| Privacidade | Inventário real de coleta e política alinhada; sem analytics obrigatório para usar o app |
| Dados de saúde de pets | Linguagem de apoio e acompanhamento; sem promessas de diagnóstico veterinário |
| Offline | Funcionalidades essenciais sem rede após instalação e primeiro desbloqueio |
| Permissões | Solicitar câmera/arquivos apenas no momento de uso e explicar a finalidade |
| Distribuição | Manifest PWA completo, ícones e splash; futura casca nativa via Capacitor/Swift somente após testes web completos |

## 10. Critérios de aceite

A reengenharia só será considerada pronta quando todos os itens abaixo passarem em testes:

- Cadastro, confirmação de e-mail, login, logout e reset de senha.
- Perfil A não consegue listar, ler ou editar dados do Perfil B.
- MFA é exigido para backup, registro de dispositivo e ações críticas.
- Perda de rede não impede adicionar/editar/excluir dados locais.
- Migração preserva a contagem e o conteúdo dos registros legados.
- Reversão restaura o backup pré-migração.
- Service worker permite reiniciar em modo avião após a instalação.
- Não há credenciais operacionais no cliente.
- Cabeçalhos de segurança são enviados e rotas de autenticação não são cacheáveis.
- Navegação, peso, vacina, banho/tosa e exclusões passam no teste de regressão mobile.

## Referências

[1] [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).  
[2] [Apple — Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/).  
[3] [Apple — App privacy details on the App Store](https://developer.apple.com/app-store/app-privacy-details/).  
[4] [Supabase — Password-based Auth](https://supabase.com/docs/guides/auth/passwords).  
[5] [Supabase — Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa).  
[6] [Supabase — Advanced server-side Auth guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide).
