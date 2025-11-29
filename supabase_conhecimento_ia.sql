-- ============================================
-- SISTEMA DE CONHECIMENTO COLABORATIVO COM IA
-- ============================================
-- Banco de dados vetorial para aprendizado contínuo
-- Suporta busca semântica com embeddings
-- Preparado para RAG (Retrieval Augmented Generation)
-- ============================================

-- Habilitar extensão pgvector (para embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABELA PRINCIPAL DE CONHECIMENTO
-- ============================================
CREATE TABLE IF NOT EXISTS conhecimento_colaborativo (
    -- Identificação
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vacinas', 'vermifugos', 'medicamentos', 'procedimentos', 'exames', 'outros')),
    
    -- Informações básicas
    nome VARCHAR(255) NOT NULL,
    fabricante VARCHAR(255),
    descricao TEXT,
    
    -- Busca tradicional
    aliases TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    
    -- Busca vetorial (IA)
    embedding vector(1536),  -- OpenAI ada-002 ou similar
    texto_completo TEXT GENERATED ALWAYS AS (
        nome || ' ' || 
        COALESCE(fabricante, '') || ' ' || 
        COALESCE(descricao, '') || ' ' ||
        COALESCE(array_to_string(aliases, ' '), '') || ' ' ||
        COALESCE(array_to_string(keywords, ' '), '')
    ) STORED,
    
    -- Metadados flexíveis
    metadados JSONB DEFAULT '{}',
    
    -- Controle de qualidade
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    contribuidor_id VARCHAR(100) NOT NULL,
    votos_positivos INTEGER DEFAULT 0,
    votos_negativos INTEGER DEFAULT 0,
    score_qualidade FLOAT DEFAULT 0,  -- Score calculado por IA
    
    -- Aprendizado contínuo
    vezes_usado INTEGER DEFAULT 0,
    ultima_vez_usado TIMESTAMP WITH TIME ZONE,
    taxa_acerto FLOAT DEFAULT 0,  -- % de vezes que foi útil
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aprovado_por VARCHAR(100),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    
    -- Constraint
    CONSTRAINT conhecimento_nome_tipo_unique UNIQUE (nome, tipo)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices tradicionais
CREATE INDEX IF NOT EXISTS idx_conhecimento_tipo ON conhecimento_colaborativo(tipo);
CREATE INDEX IF NOT EXISTS idx_conhecimento_status ON conhecimento_colaborativo(status);
CREATE INDEX IF NOT EXISTS idx_conhecimento_tipo_status ON conhecimento_colaborativo(tipo, status);
CREATE INDEX IF NOT EXISTS idx_conhecimento_nome ON conhecimento_colaborativo USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_conhecimento_aliases ON conhecimento_colaborativo USING gin(aliases);
CREATE INDEX IF NOT EXISTS idx_conhecimento_keywords ON conhecimento_colaborativo USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_conhecimento_metadados ON conhecimento_colaborativo USING gin(metadados);
CREATE INDEX IF NOT EXISTS idx_conhecimento_texto_completo ON conhecimento_colaborativo USING gin(to_tsvector('portuguese', texto_completo));

-- Índice vetorial (para busca semântica com IA)
CREATE INDEX IF NOT EXISTS idx_conhecimento_embedding ON conhecimento_colaborativo 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índices de aprendizado
CREATE INDEX IF NOT EXISTS idx_conhecimento_score ON conhecimento_colaborativo(score_qualidade DESC);
CREATE INDEX IF NOT EXISTS idx_conhecimento_vezes_usado ON conhecimento_colaborativo(vezes_usado DESC);
CREATE INDEX IF NOT EXISTS idx_conhecimento_taxa_acerto ON conhecimento_colaborativo(taxa_acerto DESC);

-- ============================================
-- TABELA DE LOGS (APRENDIZADO)
-- ============================================
CREATE TABLE IF NOT EXISTS conhecimento_logs (
    id BIGSERIAL PRIMARY KEY,
    conhecimento_id BIGINT REFERENCES conhecimento_colaborativo(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL,
    usuario_id VARCHAR(100),
    detalhes JSONB DEFAULT '{}',
    foi_util BOOLEAN,  -- Feedback do usuário
    contexto TEXT,  -- Contexto da busca/uso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_conhecimento_id ON conhecimento_logs(conhecimento_id);
CREATE INDEX IF NOT EXISTS idx_logs_acao ON conhecimento_logs(acao);
CREATE INDEX IF NOT EXISTS idx_logs_foi_util ON conhecimento_logs(foi_util) WHERE foi_util IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON conhecimento_logs(created_at DESC);

-- ============================================
-- TABELA DE FEEDBACK (APRENDIZADO CONTÍNUO)
-- ============================================
CREATE TABLE IF NOT EXISTS conhecimento_feedback (
    id BIGSERIAL PRIMARY KEY,
    conhecimento_id BIGINT REFERENCES conhecimento_colaborativo(id) ON DELETE CASCADE,
    usuario_id VARCHAR(100),
    tipo_feedback VARCHAR(50) NOT NULL,  -- 'util', 'inutil', 'incorreto', 'sugestao'
    comentario TEXT,
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_conhecimento_id ON conhecimento_feedback(conhecimento_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tipo ON conhecimento_feedback(tipo_feedback);

-- ============================================
-- FUNÇÕES DE BUSCA INTELIGENTE
-- ============================================

-- Função de busca híbrida (texto + vetorial)
CREATE OR REPLACE FUNCTION buscar_conhecimento_hibrido(
    query_text TEXT,
    query_embedding vector(1536) DEFAULT NULL,
    tipo_filtro VARCHAR(50) DEFAULT NULL,
    limite INTEGER DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    tipo VARCHAR(50),
    nome VARCHAR(255),
    fabricante VARCHAR(255),
    descricao TEXT,
    score FLOAT,
    metadados JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.tipo,
        c.nome,
        c.fabricante,
        c.descricao,
        -- Score híbrido: combina busca textual + vetorial + qualidade
        (
            COALESCE(ts_rank(to_tsvector('portuguese', c.texto_completo), plainto_tsquery('portuguese', query_text)), 0) * 0.3 +
            CASE 
                WHEN query_embedding IS NOT NULL THEN 
                    (1 - (c.embedding <=> query_embedding)) * 0.5
                ELSE 0 
            END +
            (c.score_qualidade / 100.0) * 0.1 +
            (c.taxa_acerto / 100.0) * 0.1
        ) as score,
        c.metadados
    FROM conhecimento_colaborativo c
    WHERE 
        c.status = 'aprovado'
        AND (tipo_filtro IS NULL OR c.tipo = tipo_filtro)
        AND (
            to_tsvector('portuguese', c.texto_completo) @@ plainto_tsquery('portuguese', query_text)
            OR query_embedding IS NOT NULL
        )
    ORDER BY score DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar score de qualidade
CREATE OR REPLACE FUNCTION atualizar_score_qualidade()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcula score baseado em votos, uso e taxa de acerto
    NEW.score_qualidade := (
        (NEW.votos_positivos - NEW.votos_negativos) * 10 +
        LEAST(NEW.vezes_usado, 100) * 0.5 +
        NEW.taxa_acerto * 0.3
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para registrar uso
CREATE OR REPLACE FUNCTION registrar_uso_conhecimento(
    p_conhecimento_id BIGINT,
    p_foi_util BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Incrementa contador de uso
    UPDATE conhecimento_colaborativo
    SET 
        vezes_usado = vezes_usado + 1,
        ultima_vez_usado = NOW(),
        taxa_acerto = CASE 
            WHEN p_foi_util IS NOT NULL THEN
                ((taxa_acerto * vezes_usado) + CASE WHEN p_foi_util THEN 100 ELSE 0 END) / (vezes_usado + 1)
            ELSE taxa_acerto
        END
    WHERE id = p_conhecimento_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar score de qualidade
DROP TRIGGER IF EXISTS trigger_atualizar_score ON conhecimento_colaborativo;
CREATE TRIGGER trigger_atualizar_score
    BEFORE INSERT OR UPDATE OF votos_positivos, votos_negativos, vezes_usado, taxa_acerto
    ON conhecimento_colaborativo
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_score_qualidade();

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_updated_at ON conhecimento_colaborativo;
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON conhecimento_colaborativo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS ANALÍTICAS
-- ============================================

-- View de conhecimento mais usado
CREATE OR REPLACE VIEW vw_conhecimento_popular AS
SELECT 
    tipo,
    nome,
    fabricante,
    vezes_usado,
    taxa_acerto,
    score_qualidade,
    votos_positivos - votos_negativos as votos_liquidos
FROM conhecimento_colaborativo
WHERE status = 'aprovado'
ORDER BY vezes_usado DESC, score_qualidade DESC
LIMIT 100;

-- View de estatísticas por tipo
CREATE OR REPLACE VIEW vw_stats_por_tipo AS
SELECT 
    tipo,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'aprovado') as aprovados,
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
    AVG(score_qualidade) as score_medio,
    AVG(taxa_acerto) as taxa_acerto_media,
    SUM(vezes_usado) as total_usos
FROM conhecimento_colaborativo
GROUP BY tipo;

-- View de top contribuidores
CREATE OR REPLACE VIEW vw_top_contribuidores AS
SELECT 
    contribuidor_id,
    COUNT(*) as total_contribuicoes,
    COUNT(*) FILTER (WHERE status = 'aprovado') as aprovadas,
    AVG(score_qualidade) FILTER (WHERE status = 'aprovado') as score_medio,
    SUM(vezes_usado) as total_usos
FROM conhecimento_colaborativo
GROUP BY contribuidor_id
ORDER BY aprovadas DESC, score_medio DESC;

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Vacinas
INSERT INTO conhecimento_colaborativo (tipo, nome, fabricante, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos, score_qualidade) VALUES
('vacinas', 'Vanguard Plus 5', 'Zoetis', 'Vacina polivalente contra cinomose, adenovírus tipo 2, parainfluenza e parvovírus', 
 ARRAY['Vanguard', 'Vanguard Plus', 'V5'], 
 ARRAY['cinomose', 'parvo', 'adenovirus', 'parainfluenza'],
 '{"tipo_vacina": "V5", "especies": ["cão"], "doencas": ["cinomose", "adenovirus", "parainfluenza", "parvovirus"]}'::jsonb,
 'aprovado', 'sistema', 10, 85),

('vacinas', 'BronchiGuard', 'Zoetis', 'Vacina intranasal contra tosse dos canis (Bordetella bronchiseptica)', 
 ARRAY['Bronchi Guard', 'Bronchi-Guard'], 
 ARRAY['tosse', 'canis', 'bordetella', 'gripe', 'intranasal'],
 '{"tipo_vacina": "Gripe Canina", "especies": ["cão"], "via": "intranasal", "doencas": ["bordetella", "tosse dos canis"]}'::jsonb,
 'aprovado', 'sistema', 8, 78),

('vacinas', 'GiardiaVax', 'Zoetis', 'Vacina contra Giardia lamblia', 
 ARRAY['Giardia Vax', 'Giardia-Vax'], 
 ARRAY['giardia', 'giardíase', 'lamblia'],
 '{"tipo_vacina": "Giárdia", "especies": ["cão"], "doencas": ["giardia"]}'::jsonb,
 'aprovado', 'sistema', 7, 72),

('vacinas', 'Defensor 3', 'Zoetis', 'Vacina antirrábica inativada', 
 ARRAY['Defensor', 'Defensor III'], 
 ARRAY['raiva', 'antirrabica', 'rabies'],
 '{"tipo_vacina": "Antirrábica", "especies": ["cão", "gato"], "doencas": ["raiva"]}'::jsonb,
 'aprovado', 'sistema', 12, 92),

('vacinas', 'Nobivac DHPPi', 'MSD', 'Vacina polivalente V5 com proteção contra cinomose, hepatite, parvovirose e parainfluenza', 
 ARRAY['Nobivac', 'DHPPi', 'Nobivac V5'], 
 ARRAY['cinomose', 'hepatite', 'parvo', 'parainfluenza', 'adenovirus'],
 '{"tipo_vacina": "V5", "especies": ["cão"], "doencas": ["cinomose", "hepatite", "parvovirus", "parainfluenza"]}'::jsonb,
 'aprovado', 'sistema', 9, 82),

('vacinas', 'Recombitek C6', 'Merial', 'Vacina polivalente V6 com leptospirose', 
 ARRAY['Recombitek', 'Recombitek C4'], 
 ARRAY['cinomose', 'parvo', 'leptospirose', 'adenovirus'],
 '{"tipo_vacina": "V6", "especies": ["cão"], "doencas": ["cinomose", "parvovirus", "leptospirose", "adenovirus"]}'::jsonb,
 'aprovado', 'sistema', 6, 75);

-- Vermífugos
INSERT INTO conhecimento_colaborativo (tipo, nome, fabricante, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos, score_qualidade) VALUES
('vermifugos', 'Drontal Plus', 'Bayer', 'Vermífugo de amplo espectro para cães', 
 ARRAY['Drontal', 'Drontal +', 'Drontal Dog'], 
 ARRAY['verme', 'vermifugo', 'praziquantel', 'pirantel', 'febantel'],
 '{"principio_ativo": "Praziquantel + Pirantel + Febantel", "especies": ["cão"], "parasitas": ["nematoides", "cestoides"]}'::jsonb,
 'aprovado', 'sistema', 15, 88),

('vermifugos', 'Endogard', 'Virbac', 'Vermífugo de amplo espectro', 
 ARRAY['Endo Guard', 'Endo-Guard'], 
 ARRAY['verme', 'vermifugo', 'praziquantel', 'oxantel'],
 '{"principio_ativo": "Praziquantel + Pirantel + Febantel + Oxantel", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 12, 84),

('vermifugos', 'Milbemax', 'Elanco', 'Vermífugo de amplo espectro para cães e gatos', 
 ARRAY['Milbe Max', 'Milbe-Max'], 
 ARRAY['verme', 'vermifugo', 'milbemicina', 'praziquantel'],
 '{"principio_ativo": "Milbemicina + Praziquantel", "especies": ["cão", "gato"]}'::jsonb,
 'aprovado', 'sistema', 14, 86);

-- Medicamentos
INSERT INTO conhecimento_colaborativo (tipo, nome, fabricante, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos, score_qualidade) VALUES
('medicamentos', 'Rimadyl', 'Zoetis', 'Anti-inflamatório não esteroidal (AINE) para dor e inflamação', 
 ARRAY['Rimadil', 'Carprofeno', 'Carprofen'], 
 ARRAY['anti-inflamatorio', 'dor', 'artrite', 'aine'],
 '{"categoria": "Anti-inflamatório", "principio_ativo": "Carprofeno", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 10, 80),

('medicamentos', 'Apoquel', 'Zoetis', 'Tratamento para prurido e dermatite alérgica', 
 ARRAY['Apoquel 5.4', 'Apoquel 16', 'Oclacitinib'], 
 ARRAY['alergia', 'coceira', 'dermatite', 'prurido'],
 '{"categoria": "Antialérgico", "principio_ativo": "Oclacitinib", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 11, 83),

('medicamentos', 'Simparic', 'Zoetis', 'Antipulgas e carrapatos de uso oral', 
 ARRAY['Simparica', 'Simparic Trio', 'Sarolaner'], 
 ARRAY['pulga', 'carrapato', 'parasita', 'ectoparasita'],
 '{"categoria": "Antipulgas", "principio_ativo": "Sarolaner", "especies": ["cão"]}'::jsonb,
 'aprovado', 'sistema', 13, 85);

-- Procedimentos
INSERT INTO conhecimento_colaborativo (tipo, nome, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos, score_qualidade) VALUES
('procedimentos', 'Castração', 'Esterilização cirúrgica para controle reprodutivo', 
 ARRAY['Esterilização', 'Orquiectomia', 'Ovariohisterectomia', 'OSH'], 
 ARRAY['cirurgia', 'esterilizacao', 'castracao', 'reproducao'],
 '{"tipo": "Cirúrgico", "especies": ["cão", "gato"], "anestesia": true}'::jsonb,
 'aprovado', 'sistema', 20, 95),

('procedimentos', 'Limpeza Dentária', 'Profilaxia dental com remoção de tártaro', 
 ARRAY['Profilaxia Dental', 'Limpeza de Dentes', 'Destartarização'], 
 ARRAY['dente', 'dental', 'tartaro', 'profilaxia'],
 '{"tipo": "Preventivo", "especies": ["cão", "gato"], "anestesia": true}'::jsonb,
 'aprovado', 'sistema', 18, 90),

('procedimentos', 'Microchipagem', 'Implante subcutâneo de microchip de identificação', 
 ARRAY['Chip', 'Implante de Chip', 'Identificação Eletrônica'], 
 ARRAY['identificacao', 'chip', 'rastreamento', 'registro'],
 '{"tipo": "Identificação", "especies": ["cão", "gato"], "anestesia": false}'::jsonb,
 'aprovado', 'sistema', 16, 88);

-- Exames
INSERT INTO conhecimento_colaborativo (tipo, nome, descricao, aliases, keywords, metadados, status, contribuidor_id, votos_positivos, score_qualidade) VALUES
('exames', 'Hemograma Completo', 'Análise quantitativa e qualitativa das células sanguíneas', 
 ARRAY['Hemograma', 'Exame de Sangue', 'CBC'], 
 ARRAY['sangue', 'hemograma', 'laboratorio', 'hemacias', 'leucocitos'],
 '{"tipo": "Laboratorial", "especies": ["cão", "gato"], "jejum": false}'::jsonb,
 'aprovado', 'sistema', 22, 92),

('exames', 'Ultrassom Abdominal', 'Exame de imagem ultrassonográfico do abdômen', 
 ARRAY['USG Abdominal', 'Ultrassonografia', 'US Abdomen'], 
 ARRAY['ultrassom', 'imagem', 'abdomen', 'orgaos'],
 '{"tipo": "Imagem", "especies": ["cão", "gato"], "preparo": "jejum recomendado"}'::jsonb,
 'aprovado', 'sistema', 19, 89),

('exames', 'Raio-X', 'Exame radiográfico para avaliação óssea e de tecidos', 
 ARRAY['Radiografia', 'RX', 'Radiologia'], 
 ARRAY['raio', 'radiografia', 'osso', 'imagem'],
 '{"tipo": "Imagem", "especies": ["cão", "gato"], "sedacao": "pode ser necessária"}'::jsonb,
 'aprovado', 'sistema', 21, 91);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

ALTER TABLE conhecimento_colaborativo ENABLE ROW LEVEL SECURITY;
ALTER TABLE conhecimento_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conhecimento_feedback ENABLE ROW LEVEL SECURITY;

-- Leitura: todos podem ler conhecimento aprovado
CREATE POLICY "Permitir leitura de conhecimento aprovado" ON conhecimento_colaborativo
    FOR SELECT USING (status = 'aprovado');

-- Inserção: todos podem contribuir
CREATE POLICY "Permitir inserção de contribuições" ON conhecimento_colaborativo
    FOR INSERT WITH CHECK (true);

-- Logs: todos podem ler e inserir
CREATE POLICY "Permitir leitura de logs" ON conhecimento_logs
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de logs" ON conhecimento_logs
    FOR INSERT WITH CHECK (true);

-- Feedback: todos podem ler e inserir
CREATE POLICY "Permitir leitura de feedback" ON conhecimento_feedback
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de feedback" ON conhecimento_feedback
    FOR INSERT WITH CHECK (true);

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE conhecimento_colaborativo IS 'Base de conhecimento vetorial com aprendizado contínuo via IA';
COMMENT ON COLUMN conhecimento_colaborativo.embedding IS 'Vetor de embedding (1536 dims) para busca semântica';
COMMENT ON COLUMN conhecimento_colaborativo.texto_completo IS 'Texto completo gerado automaticamente para busca';
COMMENT ON COLUMN conhecimento_colaborativo.score_qualidade IS 'Score de qualidade calculado automaticamente';
COMMENT ON COLUMN conhecimento_colaborativo.taxa_acerto IS 'Taxa de acerto baseada em feedback dos usuários';
COMMENT ON FUNCTION buscar_conhecimento_hibrido IS 'Busca híbrida combinando texto tradicional, vetorial e scores de qualidade';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
