# 🤖 Sistema de Conhecimento Colaborativo com IA

## 📋 Visão Geral

O PetHouse agora possui um **sistema de conhecimento colaborativo** que permite que toda a comunidade de usuários contribua com informações sobre:

- 💉 **Vacinas**
- 🐛 **Vermífugos**
- 💊 **Medicamentos/Tratamentos**
- 🏥 **Procedimentos**
- 🔬 **Exames**
- 📋 **Outros**

Este sistema utiliza **banco de dados vetorial** (pgvector) e está preparado para **busca semântica com IA** e **aprendizado contínuo**.

---

## 🎯 Funcionalidades

### 1. Contribuição da Comunidade
- Usuários podem adicionar novos itens ao banco de dados
- Sistema de aprovação para garantir qualidade
- Votos positivos/negativos da comunidade
- Feedback contínuo para melhorar o sistema

### 2. Aprendizado Contínuo
- **Score de qualidade** calculado automaticamente
- **Taxa de acerto** baseada em feedback dos usuários
- **Contador de uso** para identificar itens mais úteis
- Sistema aprende com cada interação

### 3. Busca Inteligente
- **Busca tradicional**: por nome, aliases e keywords
- **Busca vetorial** (preparado): busca semântica com embeddings
- **Busca híbrida**: combina texto + vetorial + scores de qualidade
- Entende sinônimos e variações de nomes

### 4. Integração com OCR
- OCR de vacinas agora busca no banco colaborativo
- Reconhece vacinas adicionadas pela comunidade
- Aprende automaticamente com novos cartões escaneados
- Registra uso e feedback para melhorar reconhecimento

---

## 🗄️ Estrutura do Banco de Dados

### Tabela Principal: `conhecimento_colaborativo`

```sql
CREATE TABLE conhecimento_colaborativo (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50),              -- vacinas, vermifugos, medicamentos, etc.
    nome VARCHAR(255),              -- Nome do item
    fabricante VARCHAR(255),        -- Laboratório/fabricante
    descricao TEXT,                 -- Descrição detalhada
    aliases TEXT[],                 -- Nomes alternativos
    keywords TEXT[],                -- Palavras-chave para busca
    embedding vector(1536),         -- Vetor para busca semântica (IA)
    metadados JSONB,                -- Dados específicos por tipo
    status VARCHAR(20),             -- pendente, aprovado, rejeitado
    contribuidor_id VARCHAR(100),   -- ID anônimo do contribuidor
    votos_positivos INTEGER,        -- Votos da comunidade
    votos_negativos INTEGER,
    score_qualidade FLOAT,          -- Score calculado automaticamente
    vezes_usado INTEGER,            -- Quantas vezes foi útil
    taxa_acerto FLOAT,              -- % de sucesso
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabelas Auxiliares

- **`conhecimento_logs`**: Registra todas as ações (criação, uso, aprovação)
- **`conhecimento_feedback`**: Feedback dos usuários sobre cada item

---

## 🚀 Como Usar

### Para Usuários

#### 1. Contribuir com Novo Conhecimento

Quando o OCR não reconhecer uma vacina/medicamento:

1. Clique no botão **"Adicionar Nova [Vacina/Medicamento/etc]"**
2. Preencha o formulário:
   - **Tipo**: Selecione o tipo correto
   - **Nome**: Nome comercial do produto
   - **Fabricante**: Laboratório (opcional)
   - **Descrição**: Informações úteis
   - **Aliases**: Outros nomes conhecidos
   - **Keywords**: Palavras-chave para busca
3. Clique em **"Enviar Contribuição"**
4. Sua contribuição será revisada e, se aprovada, ficará disponível para todos!

#### 2. Dar Feedback

Quando o sistema reconhecer algo corretamente ou incorretamente:
- Use os botões de **👍 Útil** ou **👎 Não útil**
- Isso ajuda o sistema a aprender e melhorar

---

## 🔧 Para Desenvolvedores

### Arquitetura

```
┌─────────────────────────────────────────┐
│         Interface do Usuário            │
│  (OCR, Formulários, Contribuições)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   conhecimento-colaborativo.js          │
│  (Gerencia contribuições e interface)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      conhecimento-ia.js                 │
│  (Busca semântica e aprendizado)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Supabase (PostgreSQL)           │
│    + pgvector (busca vetorial)          │
└─────────────────────────────────────────┘
```

### Módulos JavaScript

#### 1. `conhecimento-colaborativo.js`

Gerencia contribuições e interface:

```javascript
// Buscar por tipo
const vacinas = await ConhecimentoColaborativo.buscarPorTipo('vacinas');

// Contribuir
await ConhecimentoColaborativo.contribuir({
    tipo: 'vacinas',
    nome: 'Vanguard Plus',
    fabricante: 'Zoetis',
    aliases: ['Vanguard', 'V5'],
    keywords: ['cinomose', 'parvo']
});

// Mostrar modal de contribuição
ConhecimentoColaborativo.mostrarModalContribuicao('vacinas', 'texto do OCR');
```

#### 2. `conhecimento-ia.js`

Busca inteligente e aprendizado:

```javascript
// Busca semântica (com IA quando disponível)
const resultados = await conhecimentoIA.buscarSemantica('vanguard', 'vacinas');

// Busca para OCR
const vacinas = await conhecimentoIA.buscarParaOCR(textoExtraido, 'vacinas');

// Registrar uso
await conhecimentoIA.registrarUso(conhecimentoId, foiUtil);

// Registrar feedback
await conhecimentoIA.registrarFeedback(conhecimentoId, 'util', 'Funcionou perfeitamente!');
```

### Integração com OCR

O OCR v2 agora busca automaticamente no banco colaborativo:

```javascript
// Em ocr-cartao-v2.js
async analisarVacinas(texto, textoLower, linhas, datas) {
    // 🤖 BUSCA COM IA (se disponível)
    if (typeof conhecimentoIA !== 'undefined') {
        const resultadosIA = await conhecimentoIA.buscarParaOCR(texto, 'vacinas');
        
        // Adiciona vacinas encontradas ao banco local
        resultadosIA.forEach(item => {
            this.vacinasConhecidas[chave] = {
                nome: item.nome,
                tipo: item.metadados?.tipo_vacina,
                laboratorio: item.fabricante,
                fonte: 'ia'
            };
            
            // Registra uso
            conhecimentoIA.registrarUso(item.id, true);
        });
    }
    
    // Continua com busca tradicional...
}
```

---

## 📊 Funções do Banco de Dados

### 1. Busca Híbrida

```sql
SELECT * FROM buscar_conhecimento_hibrido(
    'vanguard',           -- Texto da busca
    NULL,                 -- Embedding (opcional)
    'vacinas',            -- Tipo (opcional)
    10                    -- Limite de resultados
);
```

**Score híbrido** combina:
- 30% busca textual (nome, aliases, keywords)
- 50% busca vetorial (similaridade semântica)
- 10% score de qualidade
- 10% taxa de acerto

### 2. Registrar Uso

```sql
SELECT registrar_uso_conhecimento(
    123,    -- ID do conhecimento
    true    -- Foi útil? (opcional)
);
```

Atualiza automaticamente:
- `vezes_usado` (incrementa)
- `ultima_vez_usado` (timestamp)
- `taxa_acerto` (média móvel)
- `score_qualidade` (recalculado)

---

## 🎓 Aprendizado Contínuo

### Como o Sistema Aprende

1. **Uso**: Cada vez que um item é usado, incrementa `vezes_usado`
2. **Feedback**: Usuários marcam se foi útil (👍/👎)
3. **Taxa de Acerto**: Calculada como média móvel dos feedbacks
4. **Score de Qualidade**: Fórmula automática:

```
score_qualidade = 
    (votos_positivos - votos_negativos) × 10 +
    min(vezes_usado, 100) × 0.5 +
    taxa_acerto × 0.3
```

5. **Ranking**: Itens com maior score aparecem primeiro nas buscas

### Ciclo de Melhoria

```
┌─────────────┐
│   Usuário   │
│  contribui  │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│  Pendente   │─────▶│   Aprovado   │
│  (revisão)  │      │ (disponível) │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Usado por  │
                     │   comunidade │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Feedback   │
                     │  (útil/não)  │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    Score     │
                     │  atualizado  │
                     └──────────────┘
```

---

## 🔮 Futuro: Embeddings e RAG

### Fase 1 (Atual) ✅
- ✅ Banco vetorial criado (pgvector)
- ✅ Busca tradicional funcionando
- ✅ Sistema de contribuição ativo
- ✅ Aprendizado contínuo implementado

### Fase 2 (Próxima) 🚧
- 🔄 Implementar Edge Function para gerar embeddings
- 🔄 Busca semântica com OpenAI
- 🔄 Entender sinônimos automaticamente
- 🔄 Sugestões inteligentes

### Fase 3 (Futuro) 🔮
- 📝 RAG (Retrieval Augmented Generation)
- 🤖 Chatbot que responde perguntas sobre pets
- 💬 Recomendações personalizadas
- 🧠 IA que aprende com cada usuário

---

## 📈 Métricas e Analytics

### Views Disponíveis

#### 1. Conhecimento Popular
```sql
SELECT * FROM vw_conhecimento_popular;
```
Mostra os 100 itens mais usados e com melhor score.

#### 2. Estatísticas por Tipo
```sql
SELECT * FROM vw_stats_por_tipo;
```
Estatísticas agregadas: total, aprovados, pendentes, score médio, etc.

#### 3. Top Contribuidores
```sql
SELECT * FROM vw_top_contribuidores;
```
Ranking dos usuários que mais contribuíram.

---

## 🛡️ Segurança e Privacidade

### Row Level Security (RLS)

- ✅ **Leitura**: Todos podem ler itens aprovados
- ✅ **Inserção**: Todos podem contribuir (status = pendente)
- ✅ **Atualização**: Apenas admins podem aprovar/rejeitar
- ✅ **Deleção**: Apenas admins podem deletar

### Anonimização

- IDs de contribuidores são gerados localmente
- Não armazenamos dados pessoais
- Conformidade com LGPD

---

## 🎯 Próximos Passos

1. **Testar OCR** com cartões de vacina reais
2. **Adicionar mais dados iniciais** (seed)
3. **Implementar Edge Function** para embeddings
4. **Criar painel de admin** para revisar contribuições
5. **Adicionar gamificação** (badges, ranking)

---

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte o TRACKING_DESENVOLVIMENTO.md
- Verifique os logs no console do navegador

---

**Desenvolvido com ❤️ para a comunidade PetHouse**
