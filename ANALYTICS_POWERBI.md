# 📊 Sistema de Analytics e Integração com Power BI

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Dados Coletados](#dados-coletados)
4. [Compliance LGPD](#compliance-lgpd)
5. [Configuração do Supabase](#configuração-do-supabase)
6. [Integração com Power BI](#integração-com-power-bi)
7. [Dashboards Recomendados](#dashboards-recomendados)
8. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

O PetHouse implementa um sistema completo de coleta de estatísticas agregadas e anonimizadas para análise de dados, desenvolvimento de produtos e estratégias comerciais.

### Objetivos

- ✅ Coletar dados agregados de uso do aplicativo
- ✅ Analisar padrões de comportamento dos usuários
- ✅ Identificar espécies e raças mais populares
- ✅ Mapear problemas de saúde comuns
- ✅ Desenvolver estratégias comerciais baseadas em dados
- ✅ Precificar corretamente novos produtos e serviços
- ✅ Compliance total com LGPD

---

## 🏗️ Arquitetura

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Cliente)                      │
├─────────────────────────────────────────────────────────────┤
│  1. consent-manager.js    → Gerencia consentimento LGPD     │
│  2. terms-of-service.js   → Termos de Uso                   │
│  3. privacy-policy.js     → Política de Privacidade         │
│  4. analytics.js          → Coleta de estatísticas          │
│  5. error-logger.js       → Logs de erros                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                        │
├─────────────────────────────────────────────────────────────┤
│  • analytics_stats        → Estatísticas agregadas          │
│  • analytics_events       → Eventos detalhados              │
│  • user_consents          → Registro de consentimentos      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    ANÁLISE (Power BI)                        │
├─────────────────────────────────────────────────────────────┤
│  • Dashboards interativos                                   │
│  • Relatórios automatizados                                 │
│  • Insights de negócio                                      │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Usuário acessa o app** → Exibe tela de consentimento (primeira vez)
2. **Usuário aceita termos** → Registra consentimento no Supabase
3. **Usuário usa o app** → Coleta eventos e ações localmente
4. **A cada 24h** → Sincroniza estatísticas agregadas com Supabase
5. **Power BI** → Conecta ao Supabase e atualiza dashboards

---

## 📊 Dados Coletados

### 1. Estatísticas de Pets

```json
{
  "bySpecies": {
    "cachorro": 1250,
    "gato": 890,
    "coelho": 45
  },
  "byBreed": {
    "cachorro:Shih Tzu": 320,
    "cachorro:Golden Retriever": 180,
    "gato:Persa": 150
  },
  "byGender": {
    "M": 1100,
    "F": 1085
  },
  "ageGroups": {
    "0-1": 450,
    "1-3": 780,
    "3-7": 650,
    "7+": 305
  }
}
```

### 2. Estatísticas de Vacinas

```json
{
  "total": 5430,
  "petsWithVaccines": 1850,
  "averagePerPet": "2.48",
  "byType": {
    "V10 (Déctupla)": 1200,
    "Antirrábica": 1150,
    "Giárdia": 890
  }
}
```

### 3. Estatísticas de Vermífugos

```json
{
  "total": 3200,
  "petsWithDewormers": 1600,
  "averagePerPet": "1.46",
  "byType": {
    "Drontal Plus": 980,
    "Endogard": 750
  }
}
```

### 4. Estatísticas de Peso

```json
{
  "totalRecords": 8500,
  "byRange": {
    "0-5kg": 650,
    "5-10kg": 890,
    "10-20kg": 450,
    "20-30kg": 180,
    "30+kg": 45
  }
}
```

### 5. Estatísticas de Cios

```json
{
  "totalHeats": 1250,
  "totalBreedings": 320,
  "breedingRate": "25.6",
  "averageInterval": 180
}
```

### 6. Estatísticas Médicas

```json
{
  "totalConsultas": 4500,
  "totalCirurgias": 890,
  "totalDiagnosticos": 1200,
  "diagnosisTypes": {
    "Otite": 180,
    "Dermatite": 150,
    "Gastroenterite": 120
  },
  "surgeryTypes": {
    "Castração": 450,
    "Limpeza dentária": 180
  }
}
```

### 7. Estatísticas de Uso

```json
{
  "totalSessions": 12500,
  "totalActions": 45000,
  "actionCounts": {
    "save_data": 8900,
    "add_pet": 2185,
    "add_vaccine": 5430,
    "generate_pdf": 1250
  },
  "lastActivity": "2025-11-12T20:30:00Z"
}
```

### 8. Informações de Dispositivo

```json
{
  "deviceType": "mobile",
  "browser": "Safari",
  "platform": "iOS",
  "language": "pt-BR"
}
```

---

## 🔒 Compliance LGPD

### Consentimento Obrigatório

- ✅ Tela de boas-vindas na primeira vez
- ✅ Termos de Uso completos (baseado em Microsoft/Meta)
- ✅ Política de Privacidade detalhada
- ✅ Usuário DEVE rolar até o final dos documentos
- ✅ Usuário DEVE marcar 3 checkboxes:
  1. Aceito os Termos de Uso
  2. Aceito a Política de Privacidade
  3. Concordo com a coleta de dados
- ✅ Registro de aceite com timestamp e versão

### Direitos do Titular (Art. 18 LGPD)

Implementados via configurações do app:

- ✅ **Acesso**: Exportar dados em JSON
- ✅ **Correção**: Editar dados no app
- ✅ **Exclusão**: Deletar conta e dados
- ✅ **Portabilidade**: Download em formato estruturado
- ✅ **Revogação**: Revogar consentimento a qualquer momento

### Dados Anonimizados

- ✅ Family ID é pseudônimo (não identifica pessoa)
- ✅ Sem coleta de CPF, nome completo, endereço
- ✅ IP não é armazenado (apenas localização aproximada)
- ✅ Dados agregados não permitem identificação individual

### Segurança

- ✅ HTTPS/TLS para dados em trânsito
- ✅ Criptografia de dados sensíveis em repouso
- ✅ Row Level Security (RLS) no Supabase
- ✅ Acesso restrito apenas para service_role (admin)

---

## ⚙️ Configuração do Supabase

### Passo 1: Criar Projeto

1. Acesse https://supabase.com
2. Crie novo projeto
3. Anote a URL e API Key

### Passo 2: Executar Schema SQL

1. Vá em **SQL Editor**
2. Cole o conteúdo de `supabase_analytics_schema.sql`
3. Clique em **Run**

Isso criará:
- ✅ Tabela `analytics_stats`
- ✅ Tabela `analytics_events`
- ✅ Tabela `user_consents`
- ✅ Índices para performance
- ✅ Views para Power BI
- ✅ Políticas de segurança (RLS)

### Passo 3: Configurar Variáveis de Ambiente

Edite `js/analytics.js` e adicione suas credenciais:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon';
```

### Passo 4: Testar Conexão

```javascript
// No console do navegador
Analytics.syncToServer();
```

Verifique no Supabase se os dados foram inseridos.

---

## 📈 Integração com Power BI

### Método 1: Conexão Direta PostgreSQL

1. **Obter Credenciais do Supabase**
   - Vá em Settings → Database
   - Copie: Host, Database name, Port, User, Password

2. **Conectar no Power BI Desktop**
   - Abra Power BI Desktop
   - Get Data → PostgreSQL database
   - Server: `db.seu-projeto.supabase.co`
   - Database: `postgres`
   - Advanced → SSL Mode: `require`
   - Credenciais: User e Password do Supabase

3. **Selecionar Tabelas/Views**
   - `analytics_stats`
   - `vw_pets_summary`
   - `vw_species_distribution`
   - `vw_popular_breeds`
   - `vw_popular_vaccines`
   - `vw_heat_statistics`
   - `vw_feature_usage`
   - `vw_device_distribution`
   - `vw_common_health_issues`

### Método 2: API REST (Supabase)

1. **Obter API URL**
   - URL: `https://seu-projeto.supabase.co/rest/v1/analytics_stats`
   - Headers:
     - `apikey`: Sua service_role key
     - `Authorization`: Bearer sua-service-role-key

2. **Conectar no Power BI**
   - Get Data → Web
   - URL: API URL acima
   - Advanced → Headers: adicionar apikey e Authorization

### Método 3: Exportação CSV (Manual)

1. **Exportar do Supabase**
   - Table Editor → analytics_stats
   - Export → CSV

2. **Importar no Power BI**
   - Get Data → Text/CSV
   - Selecionar arquivo exportado

---

## 📊 Dashboards Recomendados

### Dashboard 1: Visão Geral

**KPIs Principais:**
- Total de Famílias
- Total de Pets
- Média de Pets por Família
- Taxa de Crescimento Mensal

**Gráficos:**
- Linha: Crescimento de usuários ao longo do tempo
- Pizza: Distribuição por espécie
- Barra: Top 10 raças mais populares
- Mapa: Distribuição geográfica (se disponível)

### Dashboard 2: Saúde e Cuidados

**KPIs:**
- Total de Vacinas Aplicadas
- Taxa de Vacinação (% de pets vacinados)
- Média de Consultas por Pet
- Problemas de Saúde Mais Comuns

**Gráficos:**
- Barra: Vacinas mais aplicadas
- Linha: Evolução de vacinação ao longo do tempo
- Treemap: Diagnósticos mais comuns
- Funil: Jornada de saúde do pet

### Dashboard 3: Reprodução

**KPIs:**
- Total de Cios Registrados
- Taxa de Cruzamento
- Intervalo Médio entre Cios
- Previsão de Próximos Cios

**Gráficos:**
- Linha: Ciclos reprodutivos ao longo do ano
- Barra: Taxa de cruzamento por raça
- Scatter: Correlação idade x fertilidade

### Dashboard 4: Uso do Aplicativo

**KPIs:**
- Usuários Ativos (DAU, MAU)
- Taxa de Retenção
- Funcionalidades Mais Usadas
- Tempo Médio de Sessão

**Gráficos:**
- Linha: Sessões ao longo do tempo
- Barra: Features mais usadas
- Pizza: Distribuição de dispositivos
- Heatmap: Horários de maior uso

### Dashboard 5: Insights Comerciais

**Análises:**
- Segmentação de usuários por perfil
- Propensão a pagar por features premium
- Produtos/serviços mais demandados
- Oportunidades de upsell/cross-sell

**Gráficos:**
- Matriz BCG: Raças x Popularidade x Cuidados
- Cohort Analysis: Retenção por coorte
- RFM: Recência, Frequência, Monetização

---

## 🔧 Manutenção

### Limpeza de Dados Antigos

Execute periodicamente (recomendado: trimestral):

```sql
-- Limpar eventos com mais de 1 ano
SELECT cleanup_old_analytics(365);
```

### Monitoramento

**Métricas a Acompanhar:**
- Taxa de consentimento (% de usuários que aceitam)
- Taxa de sincronização (% de dados enviados com sucesso)
- Tempo médio de sincronização
- Erros de API

**Alertas:**
- Taxa de erro > 5%
- Tempo de sincronização > 10s
- Queda de 20%+ em coleta de dados

### Backup

**Supabase faz backup automático**, mas recomendamos:

1. **Export semanal** das tabelas principais
2. **Armazenar em S3** ou Google Drive
3. **Testar restore** mensalmente

### Atualização de Schema

Quando adicionar novos campos:

1. Atualizar `analytics.js` → `collectAggregateStats()`
2. Criar migration SQL no Supabase
3. Atualizar views do Power BI
4. Incrementar versão em `privacy-policy.js`

---

## 📞 Suporte

**Encarregado de Dados (DPO):**
- Nome: Rodrigo Rocha Lima
- Email: rodrigorochalima@gmail.com

**Documentação Adicional:**
- `SISTEMA_LOGS.md` - Sistema de logs de erros
- `supabase_analytics_schema.sql` - Schema completo do banco

---

## 🎯 Próximos Passos

1. ✅ Implementar envio automático para Supabase
2. ✅ Criar dashboards no Power BI
3. ✅ Configurar alertas de anomalias
4. ✅ Implementar ML para previsões
5. ✅ Criar relatórios automatizados (PDF/Email)

---

**Versão:** 1.0.0  
**Última Atualização:** 12 de novembro de 2025  
**Autor:** Rodrigo Rocha Lima
