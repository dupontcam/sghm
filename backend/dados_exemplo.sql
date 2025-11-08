-- Script para popular o banco com dados de exemplo
-- Data: 08/11/2025
-- Objetivo: Criar dados de demonstração para o protótipo SGHM

-- ================================================
-- 1. INSERIR DADOS DE EXEMPLO EM CONSULTAS
-- ================================================

-- Inserir algumas consultas de exemplo com planos de saúde
INSERT INTO consultas (
    data_consulta, 
    protocolo, 
    medico_id, 
    paciente_id, 
    plano_saude_id,
    numero_carteirinha,
    descricao_procedimento,
    tem_honorario,
    usuario_inclusao_id,
    usuario_alteracao_id,
    created_at
) VALUES 
-- Consultas Outubro 2025
('2025-10-15', 'CONS-2025-001', 2, 2, 2, '123456789', 'Consulta Cardiologia', false, 2, 2, '2025-10-15 10:30:00'),
('2025-10-18', 'CONS-2025-002', 2, 3, 3, '987654321', 'Consulta Cardiologia', false, 2, 2, '2025-10-18 14:15:00'),
('2025-10-20', 'CONS-2025-003', 3, 4, 1, NULL, 'Consulta Dermatologia', false, 2, 2, '2025-10-20 09:45:00'),
('2025-10-22', 'CONS-2025-004', 2, 5, 4, '456789123', 'Consulta Cardiologia', false, 2, 2, '2025-10-22 16:20:00'),
('2025-10-25', 'CONS-2025-005', 6, 6, 2, '789123456', 'Consulta Clínica Geral', false, 2, 2, '2025-10-25 11:30:00'),
('2025-10-28', 'CONS-2025-006', 3, 2, 5, '321654987', 'Consulta Dermatologia', false, 2, 2, '2025-10-28 15:45:00'),
('2025-10-30', 'CONS-2025-007', 2, 3, 3, '654987321', 'Consulta Cardiologia', false, 2, 2, '2025-10-30 08:20:00'),

-- Consultas Novembro 2025
('2025-11-02', 'CONS-2025-008', 6, 4, 6, 'SUS123456', 'Consulta Clínica Geral', false, 2, 2, '2025-11-02 10:00:00'),
('2025-11-05', 'CONS-2025-009', 3, 5, 1, NULL, 'Consulta Dermatologia', false, 2, 2, '2025-11-05 14:30:00'),
('2025-11-08', 'CONS-2025-010', 2, 6, 2, '147258369', 'Consulta Cardiologia', false, 2, 2, '2025-11-08 09:15:00')

ON CONFLICT (protocolo) DO NOTHING;

-- ================================================
-- 2. INSERIR HONORÁRIOS DE EXEMPLO
-- ================================================

-- Buscar IDs das consultas inseridas para criar honorários
INSERT INTO honorarios (
    consulta_id,
    plano_saude_id,
    valor_consulta,
    valor_glosa,
    valor_repasse_medico,
    status_pagamento,
    data_pagamento,
    numero_guia,
    observacoes,
    created_at
)
SELECT 
    c.id as consulta_id,
    c.plano_saude_id,
    ps.valor_consulta_padrao as valor_consulta,
    CASE 
        WHEN c.protocolo = 'CONS-2025-002' THEN 15.50  -- Glosa na consulta Bradesco
        WHEN c.protocolo = 'CONS-2025-006' THEN 22.30  -- Glosa na consulta Amil
        ELSE 0.00
    END as valor_glosa,
    -- Calcular repasse baseado no percentual do médico (70% do valor líquido)
    ROUND(
        ((ps.valor_consulta_padrao - 
          CASE 
              WHEN c.protocolo = 'CONS-2025-002' THEN 15.50
              WHEN c.protocolo = 'CONS-2025-006' THEN 22.30
              ELSE 0.00
          END
        ) * COALESCE(m.percentual_repasse, 70.00) / 100), 2
    ) as valor_repasse_medico,
    -- Status baseado na data e situação
    CASE 
        WHEN c.protocolo IN ('CONS-2025-001', 'CONS-2025-003', 'CONS-2025-004') THEN 'PAGO'::status_pagamento_novo
        WHEN c.protocolo IN ('CONS-2025-002', 'CONS-2025-006') THEN 'GLOSADO'::status_pagamento_novo
        WHEN c.protocolo IN ('CONS-2025-005', 'CONS-2025-007') THEN 'ENVIADO'::status_pagamento_novo
        ELSE 'PENDENTE'::status_pagamento_novo
    END as status_pagamento,
    -- Data de pagamento para consultas pagas
    CASE 
        WHEN c.protocolo = 'CONS-2025-001' THEN '2025-11-01'::date
        WHEN c.protocolo = 'CONS-2025-003' THEN '2025-11-03'::date
        WHEN c.protocolo = 'CONS-2025-004' THEN '2025-11-05'::date
        ELSE NULL
    END as data_pagamento,
    -- Número da guia (para convênios)
    CASE 
        WHEN ps.tipo_plano = 'PARTICULAR' THEN NULL
        WHEN ps.tipo_plano = 'SUS' THEN 'SUS' || LPAD(c.id::text, 6, '0')
        ELSE ps.codigo_operadora || '-' || LPAD(c.id::text, 6, '0')
    END as numero_guia,
    -- Observações específicas
    CASE 
        WHEN c.protocolo = 'CONS-2025-002' THEN 'Glosa: Falta de documentação complementar'
        WHEN c.protocolo = 'CONS-2025-006' THEN 'Glosa: Código de procedimento não autorizado'
        WHEN c.protocolo IN ('CONS-2025-005', 'CONS-2025-007') THEN 'Enviado para processamento'
        WHEN c.protocolo IN ('CONS-2025-001', 'CONS-2025-003', 'CONS-2025-004') THEN 'Pagamento realizado conforme prazo'
        ELSE 'Aguardando processamento'
    END as observacoes,
    c.created_at
FROM consultas c
JOIN planos_saude ps ON c.plano_saude_id = ps.id
JOIN medicos m ON c.medico_id = m.id
WHERE c.protocolo LIKE 'CONS-2025-%'
  AND NOT EXISTS (
    SELECT 1 FROM honorarios h WHERE h.consulta_id = c.id
  );

-- ================================================
-- 3. ATUALIZAR FLAG TEM_HONORARIO NAS CONSULTAS
-- ================================================

UPDATE consultas 
SET tem_honorario = true 
WHERE id IN (
    SELECT DISTINCT consulta_id FROM honorarios
);

-- ================================================
-- 4. INSERIR DADOS ADICIONAIS PARA RELATÓRIOS
-- ================================================

-- Adicionar mais algumas consultas dos últimos meses para ter dados para relatórios
INSERT INTO consultas (
    data_consulta, 
    protocolo, 
    medico_id, 
    paciente_id, 
    plano_saude_id,
    numero_carteirinha,
    descricao_procedimento,
    tem_honorario,
    usuario_inclusao_id,
    usuario_alteracao_id,
    created_at
) VALUES 
-- Setembro 2025
('2025-09-15', 'CONS-2025-011', 2, 2, 2, '123456789', 'Consulta Cardiologia - Retorno', false, 1, 1, '2025-09-15 10:30:00'),
('2025-09-20', 'CONS-2025-012', 3, 3, 3, '987654321', 'Consulta Dermatologia', false, 1, 1, '2025-09-20 14:15:00'),
('2025-09-25', 'CONS-2025-013', 6, 4, 1, NULL, 'Consulta Clínica Geral', false, 1, 1, '2025-09-25 09:45:00'),

-- Agosto 2025
('2025-08-10', 'CONS-2025-014', 2, 5, 4, '456789123', 'Consulta Cardiologia', false, 1, 1, '2025-08-10 16:20:00'),
('2025-08-15', 'CONS-2025-015', 3, 6, 5, '789123456', 'Consulta Dermatologia', false, 1, 1, '2025-08-15 11:30:00'),
('2025-08-20', 'CONS-2025-016', 6, 2, 6, 'SUS789456', 'Consulta Clínica Geral', false, 1, 1, '2025-08-20 15:45:00')

ON CONFLICT (protocolo) DO NOTHING;

-- Criar honorários para essas consultas históricas (todas pagas)
INSERT INTO honorarios (
    consulta_id,
    plano_saude_id,
    valor_consulta,
    valor_glosa,
    valor_repasse_medico,
    status_pagamento,
    data_pagamento,
    numero_guia,
    observacoes,
    created_at
)
SELECT 
    c.id as consulta_id,
    c.plano_saude_id,
    ps.valor_consulta_padrao as valor_consulta,
    -- Algumas glosas históricas
    CASE 
        WHEN c.protocolo = 'CONS-2025-012' THEN 8.20
        WHEN c.protocolo = 'CONS-2025-015' THEN 12.50
        ELSE 0.00
    END as valor_glosa,
    ROUND(
        ((ps.valor_consulta_padrao - 
          CASE 
              WHEN c.protocolo = 'CONS-2025-012' THEN 8.20
              WHEN c.protocolo = 'CONS-2025-015' THEN 12.50
              ELSE 0.00
          END
        ) * COALESCE(m.percentual_repasse, 70.00) / 100), 2
    ) as valor_repasse_medico,
    'PAGO'::status_pagamento_novo as status_pagamento,
    -- Data de pagamento baseada na data da consulta + prazo do plano
    (c.data_consulta + INTERVAL '1 day' * ps.prazo_pagamento_dias)::date as data_pagamento,
    CASE 
        WHEN ps.tipo_plano = 'PARTICULAR' THEN NULL
        WHEN ps.tipo_plano = 'SUS' THEN 'SUS' || LPAD(c.id::text, 6, '0')
        ELSE ps.codigo_operadora || '-' || LPAD(c.id::text, 6, '0')
    END as numero_guia,
    CASE 
        WHEN c.protocolo = 'CONS-2025-012' THEN 'Glosa parcial - divergência de valores'
        WHEN c.protocolo = 'CONS-2025-015' THEN 'Glosa - código não coberto'
        ELSE 'Pagamento realizado dentro do prazo'
    END as observacoes,
    c.created_at
FROM consultas c
JOIN planos_saude ps ON c.plano_saude_id = ps.id
JOIN medicos m ON c.medico_id = m.id
WHERE c.protocolo IN ('CONS-2025-011', 'CONS-2025-012', 'CONS-2025-013', 'CONS-2025-014', 'CONS-2025-015', 'CONS-2025-016')
  AND NOT EXISTS (
    SELECT 1 FROM honorarios h WHERE h.consulta_id = c.id
  );

-- Atualizar flag tem_honorario
UPDATE consultas 
SET tem_honorario = true 
WHERE protocolo IN ('CONS-2025-011', 'CONS-2025-012', 'CONS-2025-013', 'CONS-2025-014', 'CONS-2025-015', 'CONS-2025-016');

-- ================================================
-- 5. VERIFICAÇÕES E ESTATÍSTICAS FINAIS
-- ================================================

-- Verificar dados inseridos
SELECT 'Resumo dos dados inseridos:' as info;

SELECT 
    'Total de consultas com honorários' as metrica,
    COUNT(*) as valor
FROM consultas WHERE tem_honorario = true

UNION ALL

SELECT 
    'Total de honorários criados' as metrica,
    COUNT(*) as valor
FROM honorarios

UNION ALL

SELECT 
    'Valor total em honorários' as metrica,
    ROUND(SUM(valor_consulta), 2) as valor
FROM honorarios

UNION ALL

SELECT 
    'Valor total em glosas' as metrica,
    ROUND(SUM(valor_glosa), 2) as valor
FROM honorarios

UNION ALL

SELECT 
    'Valor total líquido' as metrica,
    ROUND(SUM(valor_liquido), 2) as valor
FROM honorarios;

-- Resumo por status de pagamento
SELECT 
    status_pagamento,
    COUNT(*) as quantidade,
    ROUND(SUM(valor_consulta), 2) as valor_total,
    ROUND(SUM(valor_glosa), 2) as total_glosas,
    ROUND(SUM(valor_liquido), 2) as valor_liquido
FROM honorarios
GROUP BY status_pagamento
ORDER BY quantidade DESC;

-- Resumo por plano de saúde
SELECT 
    ps.nome_plano,
    ps.tipo_plano,
    COUNT(h.id) as consultas,
    ROUND(SUM(h.valor_consulta), 2) as valor_total,
    ROUND(AVG(h.valor_consulta), 2) as valor_medio,
    ROUND(SUM(h.valor_glosa), 2) as total_glosas,
    ROUND(
        CASE 
            WHEN SUM(h.valor_consulta) > 0 THEN (SUM(h.valor_glosa) / SUM(h.valor_consulta)) * 100 
            ELSE 0 
        END, 2
    ) as taxa_glosa_pct
FROM planos_saude ps
LEFT JOIN honorarios h ON ps.id = h.plano_saude_id
GROUP BY ps.id, ps.nome_plano, ps.tipo_plano
ORDER BY consultas DESC;

-- Resumo por médico
SELECT 
    m.nome_medico,
    m.especialidade,
    m.percentual_repasse,
    COUNT(h.id) as consultas,
    ROUND(SUM(h.valor_consulta), 2) as valor_bruto,
    ROUND(SUM(h.valor_repasse_medico), 2) as valor_repasse,
    ROUND(SUM(h.valor_glosa), 2) as valor_glosas
FROM medicos m
LEFT JOIN consultas c ON m.id = c.medico_id AND c.tem_honorario = true
LEFT JOIN honorarios h ON c.id = h.consulta_id
GROUP BY m.id, m.nome_medico, m.especialidade, m.percentual_repasse
ORDER BY consultas DESC;