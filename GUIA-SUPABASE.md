# 📘 Guia de Configuração do Supabase - PetHouse

## 🎯 Objetivo
Criar a tabela no banco de dados do Supabase para permitir sincronização automática entre dispositivos.

---

## 📱 Passo a Passo (no celular)

### **Passo 1: Acessar o SQL Editor**
1. Abra o navegador e vá para: https://supabase.com
2. Faça login na sua conta
3. Clique no projeto **"PEP PetHouse"**
4. No menu lateral esquerdo, procure por **"SQL Editor"** (ícone de banco de dados 🗄️)
5. Clique em **"SQL Editor"**

### **Passo 2: Criar Nova Query**
1. Clique no botão **"+ New query"** (ou "+ Nova consulta")
2. Você verá um editor de texto em branco

### **Passo 3: Copiar e Colar o SQL**
Copie TODO o texto abaixo e cole no editor:

```sql
-- Script de configuração do banco de dados Supabase para PetHouse

-- Criar tabela para armazenar dados das famílias
CREATE TABLE IF NOT EXISTS pethouse_data (
    id BIGSERIAL PRIMARY KEY,
    family_id TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pethouse_family_id ON pethouse_data(family_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE pethouse_data ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode ler e escrever (modo público simples)
CREATE POLICY "Permitir acesso público" ON pethouse_data
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

### **Passo 4: Executar o SQL**
1. Depois de colar o código, procure o botão **"Run"** (▶️ Executar)
2. Clique em **"Run"**
3. Aguarde alguns segundos
4. Você deve ver uma mensagem de **"Success"** (Sucesso) ✅

### **Passo 5: Verificar se funcionou**
1. No menu lateral, clique em **"Table Editor"** (Editor de Tabelas)
2. Você deve ver uma nova tabela chamada **"pethouse_data"**
3. Se vir a tabela, está tudo certo! 🎉

---

## ✅ Pronto!

Depois de executar o SQL, o PetHouse estará configurado para:
- ☁️ **Sincronizar automaticamente** os dados na nuvem
- 👥 **Compartilhar** dados entre dispositivos usando código da família
- 🔄 **Atualizar em tempo real** quando você ou sua esposa fizerem alterações

---

## 🆘 Problemas?

Se algo der errado:
1. Tire um print da tela de erro
2. Me envie o print
3. Eu te ajudo a resolver!

---

## 🔐 Segurança

- Seus dados estão protegidos no Supabase (plataforma profissional)
- Apenas quem tem o código da família pode acessar
- Você pode mudar para modo privado no futuro (com login)
