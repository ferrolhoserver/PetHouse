-- Script de configuração do banco de dados Supabase para PetHouse
-- Execute este script no SQL Editor do Supabase

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
-- Nota: Em produção, você deveria usar autenticação
CREATE POLICY "Permitir acesso público" ON pethouse_data
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Comentários
COMMENT ON TABLE pethouse_data IS 'Armazena dados de prontuários veterinários por família';
COMMENT ON COLUMN pethouse_data.family_id IS 'Identificador único da família (compartilhado entre dispositivos)';
COMMENT ON COLUMN pethouse_data.data IS 'Dados completos do PetHouse em formato JSON';
