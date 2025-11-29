-- ============================================================================
-- TABELA DE VACINAS APRENDIDAS (SISTEMA COLABORATIVO)
-- ============================================================================

-- Tabela principal
CREATE TABLE IF NOT EXISTS vacinas_aprendidas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Informações da vacina
    nome_comercial TEXT NOT NULL,
    nome_normalizado TEXT NOT NULL UNIQUE,
    tipo_vacina TEXT NOT NULL,
    laboratorio TEXT,
    
    -- Arrays de strings
    keywords TEXT[] DEFAULT '{}',
    aliases TEXT[] DEFAULT '{}',
    
    -- Controle
    aprovada BOOLEAN DEFAULT FALSE,
    criado_por TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    aprovado_por TEXT,
    aprovado_em TIMESTAMPTZ,
    
    -- Estatísticas
    vezes_usada INTEGER DEFAULT 0,
    vezes_reportada INTEGER DEFAULT 0
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vacinas_nome_norm ON vacinas_aprendidas(nome_normalizado);
CREATE INDEX IF NOT EXISTS idx_vacinas_aprovada ON vacinas_aprendidas(aprovada);
CREATE INDEX IF NOT EXISTS idx_vacinas_tipo ON vacinas_aprendidas(tipo_vacina);
CREATE INDEX IF NOT EXISTS idx_vacinas_criado ON vacinas_aprendidas(criado_em);

-- RLS (Row Level Security)
ALTER TABLE vacinas_aprendidas ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (usuários podem adicionar vacinas)
CREATE POLICY "Permitir inserção de vacinas" ON vacinas_aprendidas
    FOR INSERT
    WITH CHECK (true);

-- Política: Qualquer um pode ler vacinas aprovadas
CREATE POLICY "Permitir leitura de vacinas aprovadas" ON vacinas_aprendidas
    FOR SELECT
    USING (aprovada = true);

-- Política: Admin pode ler todas
CREATE POLICY "Admin pode ler todas as vacinas" ON vacinas_aprendidas
    FOR SELECT
    USING (auth.role() = 'service_role');

-- Política: Admin pode atualizar
CREATE POLICY "Admin pode atualizar vacinas" ON vacinas_aprendidas
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Grant
GRANT INSERT ON vacinas_aprendidas TO anon;
GRANT SELECT ON vacinas_aprendidas TO anon;
GRANT ALL ON vacinas_aprendidas TO service_role;

-- Comentário
COMMENT ON TABLE vacinas_aprendidas IS 'Banco de dados colaborativo de vacinas aprendidas pelos usuários';

-- ============================================================================
-- FUNÇÃO PARA APROVAR VACINA
-- ============================================================================

CREATE OR REPLACE FUNCTION aprovar_vacina(vacina_id UUID, admin_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE vacinas_aprendidas
    SET 
        aprovada = TRUE,
        aprovado_por = admin_id,
        aprovado_em = NOW()
    WHERE id = vacina_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO PARA INCREMENTAR USO
-- ============================================================================

CREATE OR REPLACE FUNCTION incrementar_uso_vacina(vacina_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE vacinas_aprendidas
    SET vezes_usada = vezes_usada + 1
    WHERE id = vacina_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW PARA ESTATÍSTICAS
-- ============================================================================

CREATE OR REPLACE VIEW vacinas_estatisticas AS
SELECT 
    tipo_vacina,
    COUNT(*) as total,
    SUM(CASE WHEN aprovada THEN 1 ELSE 0 END) as aprovadas,
    SUM(CASE WHEN NOT aprovada THEN 1 ELSE 0 END) as pendentes,
    SUM(vezes_usada) as total_usos
FROM vacinas_aprendidas
GROUP BY tipo_vacina
ORDER BY total_usos DESC;

-- Grant na view
GRANT SELECT ON vacinas_estatisticas TO service_role;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
