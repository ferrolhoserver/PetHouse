# 📋 TRACKING DE DESENVOLVIMENTO - PetHouse

**Versão:** 1.0  
**Última Atualização:** 29/11/2025  
**Status:** Em Desenvolvimento (Protótipo)

---

## 🎯 OBJETIVO DO PROJETO

**PetHouse** é um aplicativo web PWA para gestão familiar de pets com:
- Cadastro completo de pets (dados, fotos, histórico)
- Controle de vacinas, vermífugos, consultas, cirurgias
- Histórico de peso e cios
- Cuidados de higiene (banhos e tosas)
- Prontuário médico em PDF profissional
- Sincronização em nuvem (Supabase)
- Compartilhamento familiar
- OCR de cartões de vacina
- Analytics e estatísticas (Power BI)

---

## 🚨 DIRETRIZES RÍGIDAS (INVIOLÁVEIS)

### 1. **COMPATIBILIDADE iOS SAFARI**
- ❌ **NUNCA** usar `position: fixed` ou `position: sticky` em overlays
- ❌ **NUNCA** usar `z-index` muito alto (máx: 1000)
- ✅ **SEMPRE** testar scroll nativo do iOS
- ✅ **SEMPRE** usar `-webkit-overflow-scrolling: touch`
- ✅ **SEMPRE** evitar modals complexos com múltiplas camadas

### 2. **EVENTOS E FUNÇÕES GLOBAIS**
- ❌ **NUNCA** usar aspas simples dentro de aspas simples em `onclick`
- ✅ **SEMPRE** usar aspas duplas externas: `onclick="funcao()"`
- ✅ **SEMPRE** garantir que funções chamadas em `onclick` existam no escopo global
- ✅ **SEMPRE** adicionar funções ao protótipo do PetHouse: `Object.assign(PetHouse.prototype, {...})`
- ✅ **SEMPRE** verificar se arquivos JS estão incluídos no `index.html`

### 3. **ESTRUTURA DE DADOS**
- ✅ **SEMPRE** usar `id` numérico (timestamp) para registros
- ✅ **SEMPRE** inicializar arrays vazios se não existirem: `if (!pet.banhos) pet.banhos = []`
- ✅ **SEMPRE** converter IDs para número ao comparar: `typeof id === 'string' ? parseFloat(id) : id`
- ✅ **SEMPRE** salvar dados após qualquer alteração: `this.saveData()`

### 4. **DEPLOY E VERSIONAMENTO**
- ✅ **SEMPRE** testar localmente ANTES de fazer deploy
- ✅ **SEMPRE** usar `?v=timestamp` nos scripts para cache-busting
- ✅ **SEMPRE** aguardar 2-3 minutos após push para GitHub Pages processar
- ✅ **SEMPRE** limpar cache do navegador ao testar: `Ctrl+Shift+R` ou Settings > Clear Cache

### 5. **MIGRAÇÃO DE DADOS**
- ✅ **SEMPRE** manter compatibilidade com versões anteriores
- ✅ **SEMPRE** fazer migração automática e silenciosa
- ✅ **SEMPRE** preservar IDs originais ao migrar
- ❌ **NUNCA** deletar dados antigos sem migrar

---

## 📚 ARQUITETURA DO PROJETO

### **Estrutura de Arquivos**

```
PetHouse/
├── index.html                          # Página principal
├── manifest.json                       # PWA manifest
├── service-worker.js                   # Service Worker para PWA
├── css/
│   ├── style.css                       # Estilos principais
│   └── consent.css                     # Estilos do consentimento LGPD
├── js/
│   ├── app.js                          # Core do aplicativo (classe PetHouse)
│   ├── consent-manager.js              # Gerenciador de consentimento LGPD
│   ├── family-limit.js                 # Sistema de limite de 20 famílias
│   ├── supabase-sync.js                # Sincronização com Supabase
│   ├── analytics.js                    # Coleta de analytics
│   ├── pdf-avancado.js                 # Geração de prontuário PDF
│   ├── vacinas-rapido.js               # Cadastro rápido de vacinas
│   ├── vermifugos-rapido.js            # Cadastro rápido de vermífugos
│   ├── banhos-tosas.js                 # Módulo de banhos e tosas
│   ├── grafico-banhos.js               # Gráfico de frequência de banhos
│   ├── app-banhos-tosas-extension.js   # Extensão do app para banhos/tosas
│   └── cuidados.js                     # Módulo de cuidados (vacinas/vermífugos)
├── img/                                # Imagens e ícones
├── supabase_analytics_schema.sql       # Schema do banco Supabase
└── dados-teste.html                    # Página para adicionar dados fictícios
```

### **Ordem de Carregamento dos Scripts**

```html
<!-- ORDEM CRÍTICA - NÃO ALTERAR -->
<script src="./js/consent-manager.js"></script>
<script src="./js/family-limit.js"></script>
<script src="./js/supabase-sync.js"></script>
<script src="./js/analytics.js"></script>
<script src="./js/app.js"></script>
<script src="./js/pdf-avancado.js"></script>
<script src="./js/cuidados.js"></script>
<script src="./js/banhos-tosas.js"></script>
<script src="./js/grafico-banhos.js"></script>
<script src="./js/app-banhos-tosas-extension.js"></script>
<script src="./js/vacinas-rapido.js"></script>
<script src="./js/vermifugos-rapido.js"></script>
```

---

## ✅ CHECKLIST DE DESENVOLVIMENTO

### **Fase 1: Setup Inicial**
- [x] Criar estrutura de arquivos
- [x] Configurar PWA (manifest + service worker)
- [x] Implementar classe PetHouse base
- [x] Sistema de armazenamento local (localStorage)
- [x] Tela de boas-vindas e cadastro de família

### **Fase 2: Funcionalidades Core**
- [x] Cadastro de pets (nome, espécie, raça, sexo, nascimento, foto)
- [x] Histórico de peso com gráfico
- [x] Vacinas (cadastro manual e rápido)
- [x] Vermífugos (cadastro manual e rápido)
- [x] Cios (para fêmeas)
- [x] Consultas veterinárias
- [x] Cirurgias
- [x] Diagnósticos
- [x] Tratamentos

### **Fase 3: Cuidados de Higiene**
- [x] Módulo de banhos
- [x] Módulo de tosas
- [x] Gráfico de frequência de banhos
- [x] Estatísticas e recomendações
- [ ] **PENDENTE:** Botões de editar/deletar funcionando

### **Fase 4: Prontuário PDF**
- [x] Geração de PDF profissional
- [x] Índice em 2 colunas
- [x] Resumo executivo
- [x] Seções: Peso, Vacinas, Vermífugos, Cios, Consultas, Cirurgias, Diagnósticos
- [x] Seção de Cuidados de Higiene (Banhos e Tosas)
- [x] Gráficos incluídos no PDF
- [x] Modal de seleção de seções

### **Fase 5: OCR de Vacinas**
- [x] Upload de foto do cartão
- [x] Processamento com Tesseract.js
- [x] Extração de dados (vacina, data, lote, validade)
- [ ] **PENDENTE:** Validar com cartões reais do usuário

### **Fase 6: Sincronização e Compartilhamento**
- [x] Integração com Supabase
- [x] Sincronização automática
- [x] Código de família para compartilhamento
- [x] Backup e restauração

### **Fase 7: LGPD e Consentimento**
- [x] Tela de consentimento
- [x] Termos de Uso
- [x] Política de Privacidade
- [x] Salvamento de consentimento no Supabase
- [x] **CORRIGIDO:** Tela funcional no iOS Safari

### **Fase 8: Analytics e Protótipo**
- [x] Sistema de coleta de estatísticas
- [x] Tabelas no Supabase (analytics_stats, analytics_events, user_consents, waitlist)
- [x] Badge de "PROTÓTIPO - VAGAS LIMITADAS"
- [x] Sistema de limite de 20 famílias
- [x] Tela de "Vagas Esgotadas" com lista de espera
- [x] Views para Power BI

---

## ❌ ERROS COMUNS E SOLUÇÕES

### **Erro 1: Botões não funcionam no iOS**
**Causa:** `z-index` alto ou overlay bloqueando toques  
**Solução:** Remover overlays complexos, usar página full-screen nativa

### **Erro 2: Funções `undefined` em onclick**
**Causa:** Função não está no escopo global ou arquivo JS não carregado  
**Solução:**  
1. Verificar se arquivo está em `index.html`
2. Adicionar função ao protótipo: `Object.assign(PetHouse.prototype, {...})`
3. Verificar ordem de carregamento dos scripts

### **Erro 3: IDs não correspondem ao deletar**
**Causa:** ID vem como string mas comparação é com número  
**Solução:** Converter sempre: `const numId = typeof id === 'string' ? parseFloat(id) : id`

### **Erro 4: Aspas quebradas em HTML**
**Causa:** Aspas simples dentro de aspas simples: `onclick='funcao('${id}')'`  
**Solução:** Usar aspas duplas externas: `onclick="funcao(${id})"`

### **Erro 5: Dados não aparecem após migração**
**Causa:** Lógica de migração incorreta ou campos não inicializados  
**Solução:**  
1. Inicializar arrays: `if (!pet.banhos) pet.banhos = []`
2. Verificar lógica de identificação (palavras-chave)
3. Adicionar IDs se não existirem

### **Erro 6: Cache do navegador**
**Causa:** Navegador carrega versão antiga dos arquivos  
**Solução:**  
1. Adicionar `?v=timestamp` nos scripts
2. Limpar cache: Ctrl+Shift+R ou Settings > Clear Cache
3. Aguardar 2-3 min após deploy do GitHub Pages

---

## 🔧 PROBLEMAS ATUAIS E STATUS

### **🚨 CRÍTICO: Botões de Editar/Deletar não funcionam**

**Sintomas:**
- Botões aparecem (✏️ e 🗑️)
- Botões são clicáveis
- Nada acontece ao clicar
- Sem erro no console

**Diagnóstico:**
- ✅ Funções existem em `app-banhos-tosas-extension.js`
- ✅ Arquivo está incluído no `index.html`
- ✅ Botões estão sendo renderizados corretamente
- ❓ **INVESTIGAR:** Por que `app.showEditBanho()` não executa

**Próximos Passos:**
1. Testar se `app` está definido globalmente
2. Verificar se `PetHouse.prototype` tem as funções
3. Testar chamada direta no console: `app.showEditBanho(123)`
4. Verificar se há erro silencioso sendo engolido

**Solução Proposta:**
- Mover funções para escopo global temporariamente
- Ou usar event listeners em vez de onclick inline

---

### **⚠️ PENDENTE: Validação OCR com Cartões Reais**

**Cartões Recebidos:**
- 4 fotos de cartões de vacina
- Marcas: Vanguard Plus, BronchiGuard, GiardiaVax, Defensor
- Datas manuscritas e etiquetas impressas
- Diferentes formatos e layouts

**Tarefas:**
1. Analisar visualmente as fotos
2. Testar OCR com Tesseract.js
3. Verificar taxa de acerto
4. Ajustar regex e lógica de extração se necessário
5. Adicionar suporte para:
   - Datas manuscritas
   - Etiquetas de diferentes formatos
   - Nomes de vacinas variados

---

## 📊 ESTRUTURA DE DADOS

### **LocalStorage: `petHouseData`**

```javascript
{
  familyId: "family_123456",
  familyName: "Família Silva",
  familyEmail: "silva@email.com",
  currentPet: 1,
  pets: [
    {
      id: 1,
      nome: "Rex",
      especie: "Cachorro",
      raca: "Golden Retriever",
      sexo: "Macho",
      nascimento: "2020-01-15",
      foto: "data:image/jpeg;base64,...",
      peso: [
        { id: 1732881600000, data: "2025-11-15", peso: 25.5, obs: "Saudável" }
      ],
      vacinas: [
        {
          id: 1732881600000,
          data: "2025-11-15",
          vacina: "V10",
          lote: "ABC123",
          validade: "2026-11-15",
          veterinario: "Dr. João",
          local: "Clínica Pet",
          obs: "Primeira dose"
        }
      ],
      vermifugos: [...],
      cios: [...],
      consultas: [...],
      cirurgias: [...],
      diagnosticos: [...],
      tratamentos: [...],
      banhos: [
        {
          id: 1732881600000,
          data: "2025-11-15",
          tipo: "completo",
          local: "Pet Shop ABC",
          profissional: "Maria",
          produtos: "Shampoo hipoalergênico",
          obs: "Comportou-se bem"
        }
      ],
      tosas: [
        {
          id: 1732881600000,
          data: "2025-11-15",
          tipo: "higienica",
          local: "Pet Shop ABC",
          profissional: "João",
          estilo: "Tosa higiênica completa",
          obs: "Ficou lindo"
        }
      ]
    }
  ]
}
```

### **Supabase: Tabelas**

#### **`pethouse_data`**
- `id` (UUID, PK)
- `family_id` (TEXT, UNIQUE)
- `data` (JSONB) - Cópia completa do localStorage
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### **`family_emails`**
- `id` (INT8, PK)
- `family_id` (TEXT, UNIQUE)
- `email` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### **`analytics_stats`**
- `id` (UUID, PK)
- `family_id` (TEXT)
- `timestamp` (TIMESTAMPTZ)
- `total_pets` (INT)
- `pet_stats` (JSONB)
- `vaccine_stats` (JSONB)
- `dewormer_stats` (JSONB)
- `weight_stats` (JSONB)
- `heat_stats` (JSONB)
- `medical_stats` (JSONB)
- `usage_stats` (JSONB)
- `device_info` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### **`analytics_events`**
- `id` (UUID, PK)
- `family_id` (TEXT)
- `event_type` (TEXT)
- `event_data` (JSONB)
- `timestamp` (TIMESTAMPTZ)

#### **`user_consents`**
- `id` (UUID, PK)
- `family_id` (TEXT, UNIQUE)
- `terms_version` (TEXT)
- `privacy_version` (TEXT)
- `consent_version` (TEXT)
- `accepted` (BOOLEAN)
- `accepted_at` (TIMESTAMPTZ)
- `user_agent` (TEXT)
- `language` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### **`waitlist`**
- `id` (UUID, PK)
- `email` (TEXT, UNIQUE)
- `name` (TEXT)
- `phone` (TEXT)
- `notified` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

---

## 🎨 PADRÕES DE CÓDIGO

### **Nomenclatura**
- **Variáveis:** camelCase (`currentPet`, `familyId`)
- **Funções:** camelCase (`showAddBanho`, `deleteRecord`)
- **Classes:** PascalCase (`PetHouse`, `ConsentManager`)
- **Constantes:** UPPER_SNAKE_CASE (`STORAGE_KEY`, `API_URL`)
- **Arquivos:** kebab-case (`banhos-tosas.js`, `pdf-avancado.js`)

### **Comentários**
```javascript
/**
 * Descrição da função
 * @param {tipo} nome - Descrição do parâmetro
 * @returns {tipo} Descrição do retorno
 */
```

### **Estrutura de Funções**
```javascript
functionName(params) {
    // 1. Validação de parâmetros
    if (!params) return;
    
    // 2. Obter dados necessários
    const pet = this.data.pets.find(p => p.id === this.currentPet);
    if (!pet) return;
    
    // 3. Lógica principal
    // ...
    
    // 4. Salvar dados
    this.saveData();
    
    // 5. Atualizar UI
    this.render();
    
    // 6. Feedback ao usuário
    this.showToast('Operação concluída!', 'success');
}
```

---

## 🧪 TESTES E VALIDAÇÃO

### **Checklist de Teste Antes do Deploy**

#### **Desktop (Chrome/Firefox)**
- [ ] Criar família
- [ ] Adicionar pet
- [ ] Adicionar registros (vacinas, peso, banhos, etc.)
- [ ] Editar registros
- [ ] Deletar registros
- [ ] Gerar PDF
- [ ] Fazer backup
- [ ] Restaurar backup
- [ ] Compartilhar família

#### **Mobile (iOS Safari)**
- [ ] Aceitar termos (scroll funciona?)
- [ ] Criar família
- [ ] Adicionar pet
- [ ] Adicionar foto
- [ ] Adicionar registros
- [ ] Editar registros (botões funcionam?)
- [ ] Deletar registros (botões funcionam?)
- [ ] Gerar PDF
- [ ] OCR de vacina (câmera funciona?)

#### **Funcionalidades Específicas**
- [ ] Gráfico de peso aparece
- [ ] Gráfico de banhos aparece (se houver 1+ banhos)
- [ ] Alertas de vacinas vencidas
- [ ] Alertas de vermífugos vencidos
- [ ] Cálculo de próximo cio
- [ ] Sincronização com Supabase
- [ ] Analytics sendo enviado

---

## 📝 LIÇÕES APRENDIDAS

### **1. iOS Safari é Especial**
- Comportamento diferente de outros navegadores
- Scroll nativo é sensível
- Overlays complexos não funcionam bem
- Sempre testar em dispositivo real

### **2. Aspas em HTML**
- Template literals com aspas simples quebram onclick
- Sempre usar aspas duplas externas
- Ou remover aspas ao redor de números

### **3. Escopo de Funções**
- Funções em onclick precisam estar no escopo global
- Adicionar ao protótipo: `Object.assign(PetHouse.prototype, {...})`
- Verificar ordem de carregamento dos scripts

### **4. IDs e Comparações**
- IDs numéricos (timestamp) são melhores que strings
- Sempre converter ao comparar: `parseFloat(id)`
- Usar `===` para comparações estritas

### **5. Migração de Dados**
- Sempre manter compatibilidade
- Migração automática e silenciosa
- Preservar IDs originais
- Testar com dados reais

### **6. Cache é Inimigo**
- Sempre usar `?v=timestamp`
- Limpar cache ao testar
- Aguardar GitHub Pages processar (2-3 min)

### **7. Deploy Incremental**
- Testar localmente ANTES
- Deploy pequeno e frequente
- Validar cada mudança
- Não acumular muitas alterações

---

## 🚀 PRÓXIMAS FUNCIONALIDADES (Roadmap)

### **Curto Prazo**
- [ ] Corrigir botões de editar/deletar
- [ ] Validar OCR com cartões reais
- [ ] Adicionar consultas rápidas
- [ ] Melhorar gráfico de peso (zoom, anotações)
- [ ] Exportar dados em JSON

### **Médio Prazo**
- [ ] Notificações push (vacinas, vermífugos)
- [ ] Integração com calendário
- [ ] Lembretes personalizados
- [ ] Modo offline completo
- [ ] Dark mode

### **Longo Prazo**
- [ ] App nativo (React Native)
- [ ] Integração com clínicas veterinárias
- [ ] Marketplace de serviços pet
- [ ] Comunidade de usuários
- [ ] IA para recomendações

---

## 📞 SUPORTE E CONTATO

**Repositório:** https://github.com/ferrolhoserver/PetHouse  
**Deploy:** https://ferrolhoserver.github.io/PetHouse  
**Supabase:** https://supabase.com/dashboard/project/vaylmepocuppvfkixeoj

---

## 📄 LICENÇA

Proprietário - Todos os direitos reservados

---

**Última Atualização:** 29/11/2025 - 12:10 BRT
