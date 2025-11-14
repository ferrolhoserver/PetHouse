-- ============================================================================
-- SCHEMA DE ANALYTICS PARA SUPABASE
-- Sistema de Coleta de Estatísticas do PetHouse
-- ============================================================================

-- Tabela principal de estatísticas agregadas
CREATE TABLE IF NOT EXISTS analytics_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Totais gerais
    total_pets INTEGER DEFAULT 0,
    
    -- Estatísticas de pets (JSONB para flexibilidade)
    pet_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Estatísticas de vacinas
    vaccine_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Estatísticas de vermífugos
    dewormer_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Estatísticas de peso
    weight_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Estatísticas de cios
    heat_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Estatísticas médicas
    medical_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Estatísticas de uso
    usage_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Informações do dispositivo
    device_info JSONB DEFAULT '{}'::jsonb,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_family ON analytics_stats(family_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_stats(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_stats(created_at);

-- Índices GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_pet_stats ON analytics_stats USING GIN (pet_stats);
CREATE INDEX IF NOT EXISTS idx_vaccine_stats ON analytics_stats USING GIN (vaccine_stats);
CREATE INDEX IF NOT EXISTS idx_device_info ON analytics_stats USING GIN (device_info);

-- ============================================================================
-- Tabela de eventos de uso (para análise detalhada)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'session', 'action', 'error'
    event_name TEXT, -- Nome da ação
    event_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Informações de contexto
    user_agent TEXT,
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    browser TEXT,
    platform TEXT,
    language TEXT,
    screen_resolution TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_family ON analytics_events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at);

-- ============================================================================
-- Tabela de consentimentos (compliance LGPD)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id TEXT NOT NULL UNIQUE,
    
    -- Versões aceitas
    terms_version TEXT NOT NULL,
    privacy_version TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    
    -- Status
    accepted BOOLEAN DEFAULT TRUE,
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Revogação
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    
    -- Informações do aceite
    user_agent TEXT,
    ip_address INET,
    language TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_consents_family ON user_consents(family_id);
CREATE INDEX IF NOT EXISTS idx_consents_accepted ON user_consents(accepted);
CREATE INDEX IF NOT EXISTS idx_consents_revoked ON user_consents(revoked);

-- ============================================================================
-- Views para análise no Power BI
-- ============================================================================

-- View: Resumo geral de pets
CREATE OR REPLACE VIEW vw_pets_summary AS
SELECT 
    COUNT(DISTINCT family_id) as total_families,
    SUM(total_pets) as total_pets,
    AVG(total_pets) as avg_pets_per_family,
    DATE_TRUNC('day', timestamp) as date
FROM analytics_stats
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- View: Distribuição de espécies
CREATE OR REPLACE VIEW vw_species_distribution AS
SELECT 
    jsonb_object_keys(pet_stats->'bySpecies') as species,
    SUM((pet_stats->'bySpecies'->>jsonb_object_keys(pet_stats->'bySpecies'))::int) as count,
    DATE_TRUNC('month', timestamp) as month
FROM analytics_stats
WHERE pet_stats->'bySpecies' IS NOT NULL
GROUP BY species, month
ORDER BY month DESC, count DESC;

-- View: Raças mais populares
CREATE OR REPLACE VIEW vw_popular_breeds AS
SELECT 
    jsonb_object_keys(pet_stats->'byBreed') as breed_key,
    SPLIT_PART(jsonb_object_keys(pet_stats->'byBreed'), ':', 1) as species,
    SPLIT_PART(jsonb_object_keys(pet_stats->'byBreed'), ':', 2) as breed,
    SUM((pet_stats->'byBreed'->>jsonb_object_keys(pet_stats->'byBreed'))::int) as count
FROM analytics_stats
WHERE pet_stats->'byBreed' IS NOT NULL
GROUP BY breed_key
ORDER BY count DESC
LIMIT 100;

-- View: Vacinas mais aplicadas
CREATE OR REPLACE VIEW vw_popular_vaccines AS
SELECT 
    jsonb_object_keys(vaccine_stats->'byType') as vaccine_name,
    SUM((vaccine_stats->'byType'->>jsonb_object_keys(vaccine_stats->'byType'))::int) as count,
    DATE_TRUNC('month', timestamp) as month
FROM analytics_stats
WHERE vaccine_stats->'byType' IS NOT NULL
GROUP BY vaccine_name, month
ORDER BY month DESC, count DESC;

-- View: Estatísticas de cios
CREATE OR REPLACE VIEW vw_heat_statistics AS
SELECT 
    AVG((heat_stats->>'totalHeats')::numeric) as avg_heats_per_family,
    AVG((heat_stats->>'averageInterval')::numeric) as avg_interval_days,
    AVG((heat_stats->>'breedingRate')::numeric) as avg_breeding_rate,
    DATE_TRUNC('month', timestamp) as month
FROM analytics_stats
WHERE heat_stats IS NOT NULL
GROUP BY month
ORDER BY month DESC;

-- View: Uso de funcionalidades
CREATE OR REPLACE VIEW vw_feature_usage AS
SELECT 
    jsonb_object_keys(usage_stats->'actionCounts') as feature,
    SUM((usage_stats->'actionCounts'->>jsonb_object_keys(usage_stats->'actionCounts'))::int) as usage_count,
    DATE_TRUNC('week', timestamp) as week
FROM analytics_stats
WHERE usage_stats->'actionCounts' IS NOT NULL
GROUP BY feature, week
ORDER BY week DESC, usage_count DESC;

-- View: Distribuição de dispositivos
CREATE OR REPLACE VIEW vw_device_distribution AS
SELECT 
    device_info->>'deviceType' as device_type,
    device_info->>'browser' as browser,
    device_info->>'platform' as platform,
    COUNT(*) as count,
    DATE_TRUNC('day', timestamp) as date
FROM analytics_stats
WHERE device_info IS NOT NULL
GROUP BY device_type, browser, platform, date
ORDER BY date DESC, count DESC;

-- View: Problemas de saúde mais comuns
CREATE OR REPLACE VIEW vw_common_health_issues AS
SELECT 
    jsonb_object_keys(medical_stats->'diagnosisTypes') as diagnosis,
    SUM((medical_stats->'diagnosisTypes'->>jsonb_object_keys(medical_stats->'diagnosisTypes'))::int) as count,
    DATE_TRUNC('month', timestamp) as month
FROM analytics_stats
WHERE medical_stats->'diagnosisTypes' IS NOT NULL
GROUP BY diagnosis, month
ORDER BY month DESC, count DESC;

-- ============================================================================
-- Funções auxiliares
-- ============================================================================

-- Função para limpar dados antigos (GDPR/LGPD compliance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_analytics_stats_updated_at
    BEFORE UPDATE ON analytics_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at
    BEFORE UPDATE ON user_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Políticas de segurança (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE analytics_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserção para todos (dados agregados)
CREATE POLICY "Permitir inserção de analytics" ON analytics_stats
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir inserção de eventos" ON analytics_events
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir inserção de consentimentos" ON user_consents
    FOR INSERT
    WITH CHECK (true);

-- Política: Permitir leitura apenas para admin (via service role)
CREATE POLICY "Admin pode ler analytics" ON analytics_stats
    FOR SELECT
    USING (auth.role() = 'service_role');

CREATE POLICY "Admin pode ler eventos" ON analytics_events
    FOR SELECT
    USING (auth.role() = 'service_role');

CREATE POLICY "Admin pode ler consentimentos" ON user_consents
    FOR SELECT
    USING (auth.role() = 'service_role');

-- ============================================================================
-- Comentários para documentação
-- ============================================================================

COMMENT ON TABLE analytics_stats IS 'Estatísticas agregadas e anonimizadas de uso do PetHouse';
COMMENT ON TABLE analytics_events IS 'Eventos detalhados de uso para análise de comportamento';
COMMENT ON TABLE user_consents IS 'Registro de consentimentos LGPD dos usuários';

COMMENT ON COLUMN analytics_stats.family_id IS 'ID da família (anonimizado se necessário)';
COMMENT ON COLUMN analytics_stats.pet_stats IS 'Estatísticas de pets: espécies, raças, idades, etc';
COMMENT ON COLUMN analytics_stats.vaccine_stats IS 'Estatísticas de vacinação';
COMMENT ON COLUMN analytics_stats.heat_stats IS 'Estatísticas de ciclos reprodutivos';

-- ============================================================================
-- Dados de exemplo (opcional, remover em produção)
-- ============================================================================

-- Inserir exemplo de estatística
-- INSERT INTO analytics_stats (family_id, total_pets, pet_stats, device_info) VALUES
-- ('example_family_123', 2, 
--  '{"bySpecies": {"cachorro": 1, "gato": 1}, "byGender": {"M": 1, "F": 1}}'::jsonb,
--  '{"deviceType": "mobile", "browser": "Safari", "platform": "iOS"}'::jsonb
-- );

-- ============================================================================
-- Grants (ajustar conforme necessário)
-- ============================================================================

-- Permitir acesso anônimo para inserção (dados agregados)
GRANT INSERT ON analytics_stats TO anon;
GRANT INSERT ON analytics_events TO anon;
GRANT INSERT ON user_consents TO anon;

-- Permitir leitura para service_role (admin/Power BI)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

-- Para executar este script no Supabase:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script
-- 4. Clique em "Run"
