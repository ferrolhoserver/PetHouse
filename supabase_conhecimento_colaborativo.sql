-- ============================================
-- SISTEMA DE CONHECIMENTO COLABORATIVO
-- ============================================
-- Tabela unificada para armazenar conhecimento
-- contribuído pela comunidade sobre:
-- - Vacinas 💉
-- - Vermífugos 🐛
-- - Medicamentos/Tratamentos 💊
-- - Procedimentos 🏥
-- - Exames 🔬
-- - Outros 📋
-- ============================================

-- Criar tabela de conhecimento colaborativo
CREATE TABLE IF NOT EXISTS conhecimento_colaborativo (
    -- Identificação
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vacinas', 'vermifugos', 'medicamentos', 'procedimentos', 'exames', 'outros')),
    
    -- Informações básicas
    nome VARCHAR(255) NOT NULL,
    fabricante VARCHAR(255),
    descricao TEXT,
    
    -- Busca e reconhecimento
    aliases TEXT[] DEFAULT '{}',  -- Nomes alternativos
    keywords TEXT[] DEFAULT '{}', -- Palavras-chave para busca
    
    -- Metadados específicos por tipo (JSON flexível)
    metadados JSONB DEFAULT '{}',
    
    -- Controle de qualidade
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    contribuidor_id VARCHAR(100) NOT NULL,
    votos_positivos INTEGER DEFAULT 0,
    votos_negativos INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aprovado_por VARCHAR(100),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    
    -- Índices para busca rápida
    CONSTRAINT conhecimento_nome_tipo_unique UNIQUE (nome, tipo)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conhecimento_tipo ON conhecimento_colaborativo(tipo);
CREATE INDEX IF NOT EXISTS idx_conhecimento_status ON conhecimento_colaborativo(status);
CREATE INDEX IF NOT EXISTS idx_conhecimento_tipo_status ON conhecimento_colaborativo(tipo, status);
CREATE INDEX IF NOT EXISTS idx_conhecimento_nome ON conhecimento_colaborativo USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_conhecimento_aliases ON conhecimento_colaborativo USING gin(aliases);
CREATE INDEX IF NOT EXISTS idx_conhecimento_keywords ON conhecimento_colaborativo USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_conhecimento_metadados ON conhecimento_colaborativo USING gin(metadados);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_conhecimento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_conhecimento_updated_at ON conhecimento_colaborativo;
CREATE TRIGGER trigger_update_conhecimento_updated_at
    BEFORE UPDATE ON conhecimento_colaborativo
    FOR EACH ROW
    EXECUTE FUNCTION update_conhecimento_updated_at();

-- ============================================
-- TABELA DE LOGS DE CONHECIMENTO
-- ============================================
-- Registra todas as ações no conhecimento colaborativo
CREATE TABLE IF NOT EXISTS conhecimento_logs (
    id BIGSERIAL PRIMARY KEY,
    conhecimento_id BIGINT REFERENCES conhecimento_colaborativo(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL, -- 'criado', 'aprovado', 'rejeitado', 'editado', 'voto_positivo', 'voto_negativo'
    usuario_id VARCHAR(100),
    detalhes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conhecimento_logs_conhecimento_id ON conhecimento_logs(conhecimento_id);
CREATE INDEX IF NOT EXISTS idx_conhecimento_logs_acao ON conhecimento_logs(acao);
CREATE INDEX IF NOT EXISTS idx_conhecimento_logs_created_at ON conhecimento_logs(created_at);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de conhecimento aprovado por tipo
CREATE OR REPLACE VIEW vw_conhecimento_aprovado AS
SELECT 
    tipo,
    COUNT(*) as total,
    COUNT(DISTINCT fabricante) as fabricantes_unicos,
    AVG(votos_positivos) as media_votos_positivos,
    MAX(created_at) as ultima_contribuicao
FROM conhecimento_colaborativo
WHERE status = 'aprovado'
GROUP BY tipo;

-- View de contribuidores mais ativos
CREATE OR REPLACE VIEW vw_top_contribuidores AS
SELECT 
    contribuidor_id,
    COUNT(*) as total_contribuicoes,
    COUNT(*) FILTER (WHERE status = 'aprovado') as aprovadas,
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE status = 'rejeitado') as rejeitadas,
    SUM(votos_positivos) as total_votos_positivos,
    SUM(votos_negativos) as total_votos_negativos
FROM conhecimento_colaborativo
GROUP BY contribuidor_id
ORDER BY total_contribuicoes DESC;

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Vacinas conhecidas
INSERT INTO conhecimento_colaborativo (tipo, nome, fabricante, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos) VALUES
('vacinas', 'Vanguard Plus 5', 'Zoetis', 'Vacina polivalente contra cinomose, adenovírus tipo 2, parainfluenza e parvovírus', 
 ARRAY['Vanguard', 'Vanguard Plus', 'V5'], 
 ARRAY['cinomose', 'parvo', 'adenovirus', 'parainfluenza'],
 '{"tipo_vacina": "V5", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 10),

('vacinas', 'BronchiGuard', 'Zoetis', 'Vacina contra tosse dos canis (Bordetella bronchiseptica)', 
 ARRAY['Bronchi Guard', 'Bronchi-Guard'], 
 ARRAY['tosse', 'canis', 'bordetella', 'gripe'],
 '{"tipo_vacina": "Gripe Canina", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 8),

('vacinas', 'GiardiaVax', 'Zoetis', 'Vacina contra Giardia', 
 ARRAY['Giardia Vax', 'Giardia-Vax'], 
 ARRAY['giardia', 'giardíase'],
 '{"tipo_vacina": "Giárdia", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 7),

('vacinas', 'Defensor', 'Zoetis', 'Vacina antirrábica', 
 ARRAY['Defensor 3', 'Defensor III'], 
 ARRAY['raiva', 'antirrabica', 'rabies'],
 '{"tipo_vacina": "Antirrábica", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 12),

('vacinas', 'Nobivac DHPPi', 'MSD', 'Vacina polivalente V5', 
 ARRAY['Nobivac', 'DHPPi'], 
 ARRAY['cinomose', 'hepatite', 'parvo', 'parainfluenza'],
 '{"tipo_vacina": "V5", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 9),

('vacinas', 'Recombitek', 'Merial', 'Vacina polivalente', 
 ARRAY['Recombitek C4', 'Recombitek C6'], 
 ARRAY['cinomose', 'parvo', 'leptospirose'],
 '{"tipo_vacina": "V6", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 6);

-- Vermífugos conhecidos
INSERT INTO conhecimento_colaborativo (tipo, nome, fabricante, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos) VALUES
('vermifugos', 'Drontal Plus', 'Bayer', 'Vermífugo de amplo espectro', 
 ARRAY['Drontal', 'Drontal +'], 
 ARRAY['verme', 'vermifugo', 'praziquantel', 'pirantel'],
 '{"principio_ativo": "Praziquantel + Pirantel + Febantel", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 15),

('vermifugos', 'Endogard', 'Virbac', 'Vermífugo de amplo espectro', 
 ARRAY['Endo Guard', 'Endo-Guard'], 
 ARRAY['verme', 'vermifugo', 'praziquantel'],
 '{"principio_ativo": "Praziquantel + Pirantel + Febantel + Oxantel", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 12),

('vermifugos', 'Milbemax', 'Elanco', 'Vermífugo de amplo espectro', 
 ARRAY['Milbe Max', 'Milbe-Max'], 
 ARRAY['verme', 'vermifugo', 'milbemicina'],
 '{"principio_ativo": "Milbemicina + Praziquantel", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 14);

-- Medicamentos comuns
INSERT INTO conhecimento_colaborativo (tipo, nome, fabricante, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos) VALUES
('medicamentos', 'Rimadyl', 'Zoetis', 'Anti-inflamatório não esteroidal', 
 ARRAY['Rimadil', 'Carprofeno'], 
 ARRAY['anti-inflamatorio', 'dor', 'artrite'],
 '{"categoria": "Anti-inflamatório", "principio_ativo": "Carprofeno", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 10),

('medicamentos', 'Apoquel', 'Zoetis', 'Tratamento para coceira e alergia', 
 ARRAY['Apoquel 5.4', 'Apoquel 16'], 
 ARRAY['alergia', 'coceira', 'dermatite'],
 '{"categoria": "Antialérgico", "principio_ativo": "Oclacitinib", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 11),

('medicamentos', 'Simparic', 'Zoetis', 'Antipulgas e carrapatos', 
 ARRAY['Simparica', 'Simparic Trio'], 
 ARRAY['pulga', 'carrapato', 'parasita'],
 '{"categoria": "Antipulgas", "principio_ativo": "Sarolaner", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 13);

-- Procedimentos comuns
INSERT INTO conhecimento_colaborativo (tipo, nome, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos) VALUES
('procedimentos', 'Castração', 'Esterilização cirúrgica', 
 ARRAY['Esterilização', 'Orquiectomia', 'Ovariohisterectomia'], 
 ARRAY['cirurgia', 'esterilizacao', 'castracao'],
 '{"tipo": "Cirúrgico", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 20),

('procedimentos', 'Limpeza Dentária', 'Profilaxia dental', 
 ARRAY['Profilaxia Dental', 'Limpeza de Dentes'], 
 ARRAY['dente', 'dental', 'tartaro'],
 '{"tipo": "Preventivo", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 18),

('procedimentos', 'Microchipagem', 'Implante de microchip de identificação', 
 ARRAY['Chip', 'Implante de Chip'], 
 ARRAY['identificacao', 'chip', 'rastreamento'],
 '{"tipo": "Identificação", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 16);

-- Exames comuns
INSERT INTO conhecimento_colaborativo (tipo, nome, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos) VALUES
('exames', 'Hemograma Completo', 'Análise detalhada do sangue', 
 ARRAY['Hemograma', 'Exame de Sangue'], 
 ARRAY['sangue', 'hemograma', 'laboratorio'],
 '{"tipo": "Laboratorial", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 22),

('exames', 'Ultrassom Abdominal', 'Exame de imagem do abdômen', 
 ARRAY['USG Abdominal', 'Ultrassonografia'], 
 ARRAY['ultrassom', 'imagem', 'abdomen'],
 '{"tipo": "Imagem", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 19),

('exames', 'Raio-X', 'Exame radiográfico', 
 ARRAY['Radiografia', 'RX'], 
 ARRAY['raio', 'radiografia', 'osso'],
 '{"tipo": "Imagem", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 21);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE conhecimento_colaborativo ENABLE ROW LEVEL SECURITY;
ALTER TABLE conhecimento_logs ENABLE ROW LEVEL SECURITY;

-- Política de leitura: todos podem ler conhecimento aprovado
CREATE POLICY "Permitir leitura de conhecimento aprovado" ON conhecimento_colaborativo
    FOR SELECT
    USING (status = 'aprovado');

-- Política de inserção: todos podem contribuir
CREATE POLICY "Permitir inserção de contribuições" ON conhecimento_colaborativo
    FOR INSERT
    WITH CHECK (true);

-- Política de leitura de logs: todos podem ler
CREATE POLICY "Permitir leitura de logs" ON conhecimento_logs
    FOR SELECT
    USING (true);

-- Política de inserção de logs: todos podem inserir
CREATE POLICY "Permitir inserção de logs" ON conhecimento_logs
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE conhecimento_colaborativo IS 'Armazena conhecimento colaborativo sobre vacinas, vermífugos, medicamentos, procedimentos e exames';
COMMENT ON COLUMN conhecimento_colaborativo.tipo IS 'Tipo de conhecimento: vacinas, vermifugos, medicamentos, procedimentos, exames, outros';
COMMENT ON COLUMN conhecimento_colaborativo.aliases IS 'Nomes alternativos para ajudar no reconhecimento';
COMMENT ON COLUMN conhecimento_colaborativo.keywords IS 'Palavras-chave para busca e OCR';
COMMENT ON COLUMN conhecimento_colaborativo.metadados IS 'Dados específicos por tipo (JSON flexível)';
COMMENT ON COLUMN conhecimento_colaborativo.status IS 'Status da contribuição: pendente, aprovado, rejeitado';
COMMENT ON COLUMN conhecimento_colaborativo.votos_positivos IS 'Votos positivos da comunidade';
COMMENT ON COLUMN conhecimento_colaborativo.votos_negativos IS 'Votos negativos da comunidade';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
