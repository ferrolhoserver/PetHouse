# 📋 Sistema de Logs e Relatório de Erros - PetHouse

## 🎯 Visão Geral

Sistema completo e automático de captura, armazenamento e envio de logs de erros do PetHouse.

---

## ⚙️ Configuração

### Arquivo: `js/error-logger.js`

No topo do arquivo, você encontra a seção de configuração:

```javascript
// ========================================
// CONFIGURAÇÃO - MODIFIQUE AQUI
// ========================================
emailDestino: 'rodrigorochalima@gmail.com', // E-mail para receber relatórios
maxLogs: 100, // Máximo de logs armazenados
```

### Como Modificar:

1. **Mudar e-mail de destino:**
   ```javascript
   emailDestino: 'seuemail@exemplo.com',
   ```

2. **Aumentar/diminuir quantidade de logs:**
   ```javascript
   maxLogs: 200, // Armazena até 200 logs
   ```

---

## 🚀 Como Funciona

### 1. Captura Automática de Erros

O sistema captura automaticamente:
- ✅ Erros JavaScript (syntax errors, runtime errors)
- ✅ Promises rejeitadas não tratadas
- ✅ Erros de rede
- ✅ Erros de localStorage

### 2. Registro de Ações

Registra ações importantes:
- Salvar dados
- Adicionar pet
- Editar registro
- Excluir registro

### 3. Armazenamento

Logs são salvos em:
- **localStorage** (`pethouse_logs`)
- Mantém últimos **100 eventos** (configurável)
- Persiste entre sessões

### 4. Envio de Relatório

Quando o usuário clica em **"🐛 Reportar"**:

1. Gera relatório completo em TXT
2. Abre cliente de e-mail com:
   - **Destinatário:** rodrigorochalima@gmail.com
   - **Assunto:** `PetHouse - Erro #12345 - Família: family_xxx`
   - **Corpo:** Relatório completo formatado
3. Baixa arquivo TXT automaticamente

---

## 📊 Estrutura do Relatório

```
═══════════════════════════════════════════════════════
           PETHOUSE - RELATÓRIO DE LOGS
═══════════════════════════════════════════════════════

📱 INFORMAÇÕES DO SISTEMA
─────────────────────────────────────────────────────
Data do Relatório: 12/11/2025, 17:50:00
Navegador: Safari
Sistema Operacional: iOS
Versão do App: 1.0.0
URL Atual: https://ferrolhoserver.github.io/PetHouse/
Total de Logs: 15

📋 HISTÓRICO DE LOGS
─────────────────────────────────────────────────────

[1] 2025-11-12T20:45:30.123Z
Tipo: JavaScript Error
Mensagem: Cannot read property 'id' of undefined
Arquivo: app.js:123:45
Stack Trace:
  at app.viewPet (app.js:123:45)
  at HTMLButtonElement.onclick (index.html:1:1)
URL: https://ferrolhoserver.github.io/PetHouse/

─────────────────────────────────────────────────────

[2] 2025-11-12T20:46:15.456Z
Tipo: Ação do Usuário
Ação: Dados salvos
Detalhes: {"totalPets":2,"familyId":"family_123"}
URL: https://ferrolhoserver.github.io/PetHouse/

─────────────────────────────────────────────────────
```

---

## 🔢 Sistema de Numeração

### Número Sequencial

Cada relatório recebe um **número único e crescente**:
- Armazenado em `localStorage` (`pethouse_log_numero`)
- Incrementa automaticamente a cada envio
- Formato: `#1`, `#2`, `#3`, etc.

### ID da Família

Identifica qual família está reportando:
- Extraído de `petHouseData.familyId`
- Formato: `family_1761685957128_y17c5z2m7`
- Permite rastrear problemas por usuário

---

## 📧 Formato do E-mail

### Assunto
```
PetHouse - Erro #12345 - Família: family_1761685957128_y17c5z2m7
```

### Corpo
```
Olá,

Estou enviando um relatório de erro do PetHouse.

IDENTIFICAÇÃO:
- Número do Relatório: #12345
- ID da Família: family_1761685957128_y17c5z2m7
- Data/Hora: 12/11/2025, 17:50:00

INFORMAÇÕES DO SISTEMA:
- Navegador: Safari
- Sistema Operacional: iOS
- Total de Logs: 15
- URL: https://ferrolhoserver.github.io/PetHouse/

OBSERVAÇÕES:
(Descreva aqui o que estava fazendo quando o erro ocorreu)

─────────────────────────────────────────────────────

RELATÓRIO COMPLETO:

[Relatório detalhado aqui]
```

---

## 🛠️ API do ErrorLogger

### Métodos Disponíveis

```javascript
// Registrar erro manualmente
ErrorLogger.logError({
    tipo: 'Meu Erro',
    mensagem: 'Descrição do erro',
    stack: 'Stack trace...'
});

// Registrar ação
ErrorLogger.logAction('Nome da Ação', {
    detalhe1: 'valor1',
    detalhe2: 'valor2'
});

// Obter todos os logs
const logs = ErrorLogger.getLogs();

// Limpar logs
ErrorLogger.limparLogs();

// Gerar relatório TXT
const relatorio = ErrorLogger.gerarRelatorio();

// Baixar relatório
ErrorLogger.baixarRelatorio();

// Enviar por e-mail
ErrorLogger.enviarPorEmail(); // Usa e-mail configurado
ErrorLogger.enviarPorEmail('outro@email.com'); // E-mail customizado
```

---

## 📱 Interface do Usuário

### Botão no Menu Principal

Localização: Header (topo da página)

```html
<button class="btn btn-danger btn-small" 
        onclick="ErrorLogger.enviarPorEmail()" 
        title="Reportar problema ou erro">
    🐛 Reportar
</button>
```

**Estilo:**
- Cor: Vermelho (`btn-danger`)
- Ícone: 🐛 (bug)
- Texto: "Reportar"
- Tooltip: "Reportar problema ou erro"

---

## 🔍 Análise de Logs

### Como Analisar Relatórios Recebidos

1. **Identificar Família:**
   - Use o `familyId` para rastrear usuário
   - Correlacione com outros relatórios da mesma família

2. **Verificar Padrões:**
   - Mesmo erro em múltiplos relatórios?
   - Navegador/SO específico?
   - URL específica?

3. **Priorizar:**
   - Erros que impedem uso do app
   - Erros recorrentes
   - Erros em funcionalidades críticas

4. **Reproduzir:**
   - Use as informações do sistema
   - Siga os passos descritos nas observações
   - Verifique stack trace

---

## 🔧 Manutenção

### Limpar Logs de Teste

No console do navegador:
```javascript
ErrorLogger.limparLogs();
```

### Resetar Numeração

No console do navegador:
```javascript
localStorage.removeItem('pethouse_log_numero');
```

### Desativar Temporariamente

Comente a linha no `index.html`:
```html
<!-- <script src="./js/error-logger.js?v=..."></script> -->
```

---

## 📊 Estatísticas

### Armazenamento

- **Logs:** ~5KB por 100 logs
- **Número sequencial:** ~10 bytes
- **Total:** ~5KB no localStorage

### Performance

- **Impacto:** Mínimo (<1ms por log)
- **Inicialização:** Automática
- **Captura:** Assíncrona (não bloqueia UI)

---

## 🚨 Troubleshooting

### Logs não estão sendo capturados

1. Verifique se `error-logger.js` está carregado:
   ```javascript
   console.log(window.ErrorLogger);
   ```

2. Verifique console para mensagem de inicialização:
   ```
   ✅ Sistema de logs inicializado
   ```

### E-mail não abre

- **Mobile:** Certifique-se de ter app de e-mail configurado
- **Desktop:** Configure cliente de e-mail padrão
- **Alternativa:** Use botão de download do arquivo TXT

### Arquivo TXT não baixa

- Verifique permissões de download no navegador
- Tente em modo anônimo/privado
- Verifique bloqueadores de pop-up

---

## 📝 Changelog

### v1.0.0 (12/11/2025)
- ✅ Sistema de captura automática de erros
- ✅ Armazenamento em localStorage
- ✅ Geração de relatório TXT
- ✅ Envio por e-mail com numeração sequencial
- ✅ Identificação por família
- ✅ Botão no menu principal
- ✅ Logs de ações importantes

---

## 📞 Suporte

Para dúvidas ou problemas com o sistema de logs:
- **E-mail:** rodrigorochalima@gmail.com
- **Repositório:** https://github.com/ferrolhoserver/PetHouse

---

**Desenvolvido com ❤️ para o PetHouse**
