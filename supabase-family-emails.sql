-- Tabela para armazenar emails e códigos de família
-- Permite recuperação de acesso por email

CREATE TABLE IF NOT EXISTS family_emails (
    id BIGSERIAL PRIMARY KEY,
    family_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_family_emails_email ON family_emails(email);

-- Índice para busca rápida por family_id
CREATE INDEX IF NOT EXISTS idx_family_emails_family_id ON family_emails(family_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE family_emails ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode ler (para recuperação de código)
CREATE POLICY "Permitir leitura pública" ON family_emails
    FOR SELECT
    USING (true);

-- Política: Qualquer pessoa pode inserir (para criar família)
CREATE POLICY "Permitir inserção pública" ON family_emails
    FOR INSERT
    WITH CHECK (true);

-- Política: Qualquer pessoa pode atualizar (para atualizar email)
CREATE POLICY "Permitir atualização pública" ON family_emails
    FOR UPDATE
    USING (true);
