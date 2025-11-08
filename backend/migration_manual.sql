-- Migration Manual para adicionar tabelas planos_saude e honorarios
-- Data: 08/11/2025
-- Objetivo: Implementar esquema simplificado para protótipo SGHM

-- ================================================
-- 1. CRIAR NOVOS TIPOS ENUM
-- ================================================

-- Tipo para planos de saúde
CREATE TYPE "tipo_plano_enum" AS ENUM ('PARTICULAR', 'CONVENIO', 'SUS');

-- Tipo para status de pagamento (atualizado)
DO $$ 
BEGIN
    -- Verifica se o tipo já existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pagamento_novo') THEN
        CREATE TYPE "status_pagamento_novo" AS ENUM ('PENDENTE', 'ENVIADO', 'PAGO', 'GLOSADO', 'CANCELADO');
    END IF;
END $$;

-- ================================================
-- 2. CRIAR TABELA PLANOS_SAUDE
-- ================================================

CREATE TABLE IF NOT EXISTS "planos_saude" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "nome_plano" VARCHAR(100) NOT NULL,
    "codigo_operadora" VARCHAR(20),
    "tipo_plano" "tipo_plano_enum" NOT NULL DEFAULT 'CONVENIO',
    "prazo_pagamento_dias" INTEGER NOT NULL DEFAULT 30,
    "valor_consulta_padrao" DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    "percentual_glosa_historica" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para planos_saude
CREATE INDEX IF NOT EXISTS "planos_saude_nome_plano_idx" ON "planos_saude"("nome_plano");
CREATE INDEX IF NOT EXISTS "planos_saude_ativo_idx" ON "planos_saude"("ativo");

-- ================================================
-- 3. CRIAR TABELA HONORARIOS
-- ================================================

CREATE TABLE IF NOT EXISTS "honorarios" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "consulta_id" INTEGER NOT NULL,
    "plano_saude_id" INTEGER NOT NULL,
    "valor_consulta" DECIMAL(10,2) NOT NULL,
    "valor_glosa" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "valor_liquido" DECIMAL(10,2) GENERATED ALWAYS AS ("valor_consulta" - "valor_glosa") STORED,
    "valor_repasse_medico" DECIMAL(10,2),
    "status_pagamento" "status_pagamento_novo" NOT NULL DEFAULT 'PENDENTE',
    "data_pagamento" DATE,
    "motivo_glosa" VARCHAR(255),
    "data_glosa" DATE,
    "numero_guia" VARCHAR(50),
    "observacoes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT "honorarios_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "consultas"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "honorarios_plano_saude_id_fkey" FOREIGN KEY ("plano_saude_id") REFERENCES "planos_saude"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Índices para honorarios
CREATE INDEX IF NOT EXISTS "honorarios_consulta_id_idx" ON "honorarios"("consulta_id");
CREATE INDEX IF NOT EXISTS "honorarios_plano_saude_id_idx" ON "honorarios"("plano_saude_id");
CREATE INDEX IF NOT EXISTS "honorarios_status_pagamento_idx" ON "honorarios"("status_pagamento");
CREATE INDEX IF NOT EXISTS "honorarios_data_pagamento_idx" ON "honorarios"("data_pagamento");

-- ================================================
-- 4. ATUALIZAR TABELA MEDICOS
-- ================================================

-- Adicionar novos campos à tabela médicos
ALTER TABLE "medicos" 
ADD COLUMN IF NOT EXISTS "percentual_repasse" DECIMAL(5,2) DEFAULT 70.00,
ADD COLUMN IF NOT EXISTS "dados_bancarios" TEXT;

-- Comentários para os novos campos
COMMENT ON COLUMN "medicos"."percentual_repasse" IS 'Percentual padrão de repasse para o médico (ex: 70.00 = 70%)';
COMMENT ON COLUMN "medicos"."dados_bancarios" IS 'Dados bancários em formato JSON: {"banco":"001","agencia":"1234","conta":"12345-6"}';

-- ================================================
-- 5. ATUALIZAR TABELA CONSULTAS
-- ================================================

-- Adicionar novos campos à tabela consultas
ALTER TABLE "consultas" 
ADD COLUMN IF NOT EXISTS "plano_saude_id" INTEGER,
ADD COLUMN IF NOT EXISTS "numero_carteirinha" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "tem_honorario" BOOLEAN DEFAULT FALSE;

-- Adicionar foreign key para plano_saude_id (após criar a tabela planos_saude)
DO $$ 
BEGIN
    -- Verifica se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'consultas_plano_saude_id_fkey'
    ) THEN
        ALTER TABLE "consultas" 
        ADD CONSTRAINT "consultas_plano_saude_id_fkey" 
        FOREIGN KEY ("plano_saude_id") REFERENCES "planos_saude"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Índice para plano_saude_id
CREATE INDEX IF NOT EXISTS "consultas_plano_saude_id_idx" ON "consultas"("plano_saude_id");

-- ================================================
-- 6. INSERIR DADOS DE EXEMPLO
-- ================================================

-- Inserir planos de saúde de exemplo
INSERT INTO "planos_saude" (
    "nome_plano", 
    "codigo_operadora", 
    "tipo_plano", 
    "prazo_pagamento_dias", 
    "valor_consulta_padrao", 
    "percentual_glosa_historica"
) VALUES 
    ('Particular', 'PART', 'PARTICULAR', 0, 200.00, 0.00),
    ('Unimed', '123456', 'CONVENIO', 45, 120.00, 8.50),
    ('Bradesco Saúde', '789012', 'CONVENIO', 60, 110.00, 12.30),
    ('SulAmérica', '345678', 'CONVENIO', 30, 130.00, 6.20),
    ('Amil', '567890', 'CONVENIO', 45, 115.00, 9.80),
    ('SUS', 'SUS', 'SUS', 90, 50.00, 25.00)
ON CONFLICT DO NOTHING;

-- Atualizar médicos existentes com percentual padrão
UPDATE "medicos" 
SET 
    "percentual_repasse" = 70.00,
    "dados_bancarios" = '{"banco": "Banco do Brasil", "agencia": "1234-5", "conta": "67890-1", "tipo": "Corrente"}'
WHERE "percentual_repasse" IS NULL;

-- ================================================
-- 7. CRIAR FUNÇÕES AUXILIARES
-- ================================================

-- Função para calcular valor de repasse automaticamente
CREATE OR REPLACE FUNCTION calcular_valor_repasse(
    p_valor_liquido DECIMAL(10,2),
    p_percentual_repasse DECIMAL(5,2)
) RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN ROUND(p_valor_liquido * p_percentual_repasse / 100, 2);
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas novas tabelas
DROP TRIGGER IF EXISTS update_planos_saude_updated_at ON "planos_saude";
CREATE TRIGGER update_planos_saude_updated_at
    BEFORE UPDATE ON "planos_saude"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_honorarios_updated_at ON "honorarios";
CREATE TRIGGER update_honorarios_updated_at
    BEFORE UPDATE ON "honorarios"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- VERIFICAÇÕES FINAIS
-- ================================================

-- Verificar se as tabelas foram criadas
SELECT 'planos_saude' as tabela, COUNT(*) as registros FROM "planos_saude"
UNION ALL
SELECT 'honorarios' as tabela, COUNT(*) as registros FROM "honorarios"
UNION ALL
SELECT 'medicos_atualizados' as tabela, COUNT(*) as registros FROM "medicos" WHERE "percentual_repasse" IS NOT NULL;

-- Verificar estrutura das novas tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('planos_saude', 'honorarios')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;