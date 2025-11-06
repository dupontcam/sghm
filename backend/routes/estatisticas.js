const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: GET /api/estatisticas/resumo
 * DESCRIÇÃO: Estatísticas gerais rápidas para cards do dashboard
 * ====================================================================
 */
router.get('/resumo', authenticateToken, async (req, res) => {
  try {
    const [
      totalConsultas,
      totalMedicos,
      totalPacientes,
      consultasPendentes,
      consultasPagas,
      consultasGlosadas,
      valoresTotais
    ] = await Promise.all([
      prisma.consultas.count(),
      prisma.medicos.count(),
      prisma.pacientes.count(),
      prisma.consultas.count({ where: { status_pagamento: 'PENDENTE' } }),
      prisma.consultas.count({ where: { status_pagamento: 'PAGO' } }),
      prisma.consultas.count({ where: { status_pagamento: 'GLOSA' } }),
      prisma.consultas.aggregate({
        _sum: {
          valor_bruto: true,
          valor_recebido: true,
          valor_glosa: true
        }
      })
    ]);

    const valorTotal = parseFloat(valoresTotais._sum.valor_bruto || 0);
    const valorPago = parseFloat(valoresTotais._sum.valor_recebido || 0);
    const valorGlosado = parseFloat(valoresTotais._sum.valor_glosa || 0);
    const valorPendente = valorTotal - valorPago - valorGlosado;
    
    const taxaGlosa = valorTotal > 0 ? ((valorGlosado / valorTotal) * 100).toFixed(1) : '0.0';

    res.status(200).json({
      success: true,
      data: {
        contadores: {
          totalConsultas,
          totalMedicos,
          totalPacientes,
          consultasPendentes,
          consultasPagas,
          consultasGlosadas
        },
        financeiro: {
          valorTotal,
          valorPago,
          valorGlosado,
          valorPendente,
          taxaGlosa: parseFloat(taxaGlosa)
        },
        gerado_em: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao gerar estatísticas.',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/estatisticas/medicos-top
 * DESCRIÇÃO: Top médicos por número de consultas (com parâmetro limit opcional)
 * ====================================================================
 */
router.get('/medicos-top', authenticateToken, async (req, res) => {
  try {
    // Pega o parâmetro limit da query string (padrão: 5)
    const limit = parseInt(req.query.limit) || 5;
    
    console.log(`[API] Buscando top ${limit} médicos por número de consultas`);
    
    const topMedicos = await prisma.consultas.groupBy({
      by: ['medico_id'],
      _sum: {
        valor_bruto: true,
        valor_recebido: true
      },
      _count: true,
      orderBy: [
        {
          _count: {
            medico_id: 'desc'  // Ordenar pela contagem de medico_id
          }
        }
      ],
      take: limit
    });

    // Buscar nomes dos médicos
    const medicosComNomes = await Promise.all(
      topMedicos.map(async (item) => {
        const medico = await prisma.medicos.findUnique({
          where: { id: item.medico_id },
          select: { nome_medico: true, especialidade: true }
        });

        return {
          medico_id: item.medico_id,
          nome: medico?.nome_medico || 'Não encontrado',
          especialidade: medico?.especialidade || 'N/A',
          total_consultas: item._count,  // Quando _count: true, retorna um número
          valor_faturado: parseFloat(item._sum.valor_bruto || 0),
          valor_recebido: parseFloat(item._sum.valor_recebido || 0),
          posicao: null  // Será preenchido depois
        };
      })
    );

    // Adicionar posição no ranking
    const medicosComPosicao = medicosComNomes.map((medico, index) => ({
      ...medico,
      posicao: index + 1
    }));

    console.log(`[API] Retornando top ${medicosComPosicao.length} médicos`);

    res.status(200).json({
      success: true,
      data: medicosComPosicao,
      total_retornados: medicosComPosicao.length,
      limite_solicitado: limit
    });

  } catch (error) {
    console.error('Erro ao buscar top médicos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar top médicos.',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/estatisticas/medicos-faturamento
 * DESCRIÇÃO: Top médicos por faturamento (valor_bruto)
 * ====================================================================
 */
router.get('/medicos-faturamento', authenticateToken, async (req, res) => {
  try {
    // Pega o parâmetro limit da query string (padrão: 5)
    const limit = parseInt(req.query.limit) || 5;
    
    console.log(`[API] Buscando top ${limit} médicos por faturamento`);
    
    const topMedicos = await prisma.consultas.groupBy({
      by: ['medico_id'],
      _sum: {
        valor_bruto: true,
        valor_recebido: true
      },
      _count: true,
      orderBy: [
        {
          _sum: {
            valor_bruto: 'desc'  // Ordenar por faturamento (descendente)
          }
        }
      ],
      take: limit
    });

    // Buscar nomes dos médicos
    const medicosComNomes = await Promise.all(
      topMedicos.map(async (item) => {
        const medico = await prisma.medicos.findUnique({
          where: { id: item.medico_id },
          select: { nome_medico: true, especialidade: true }
        });

        return {
          medico_id: item.medico_id,
          nome: medico?.nome_medico || 'Não encontrado',
          especialidade: medico?.especialidade || 'N/A',
          total_consultas: item._count,  // Quando _count: true, retorna um número
          valor_faturado: parseFloat(item._sum.valor_bruto || 0),
          valor_recebido: parseFloat(item._sum.valor_recebido || 0),
          posicao: null
        };
      })
    );

    // Adicionar posição no ranking
    const medicosComPosicao = medicosComNomes.map((medico, index) => ({
      ...medico,
      posicao: index + 1
    }));

    console.log(`[API] Retornando top ${medicosComPosicao.length} médicos por faturamento`);

    res.status(200).json({
      success: true,
      data: medicosComPosicao,
      total_retornados: medicosComPosicao.length,
      limite_solicitado: limit
    });

  } catch (error) {
    console.error('Erro ao buscar top médicos por faturamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar top médicos por faturamento.',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/estatisticas/faturamento-mensal
 * DESCRIÇÃO: Faturamento dos últimos 12 meses
 * ====================================================================
 */
router.get('/faturamento-mensal', authenticateToken, async (req, res) => {
  try {
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    const faturamentoPorMes = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(data_consulta, 'YYYY-MM') as mes,
        COUNT(*) as total_consultas,
        SUM(valor_bruto) as faturamento,
        SUM(CASE WHEN status_pagamento = 'PAGO' THEN valor_recebido ELSE 0 END) as recebido,
        SUM(CASE WHEN status_pagamento = 'GLOSA' THEN valor_glosa ELSE 0 END) as glosado,
        SUM(CASE WHEN status_pagamento = 'PENDENTE' THEN valor_bruto ELSE 0 END) as pendente
      FROM consultas 
      WHERE data_consulta >= ${umAnoAtras}
      GROUP BY TO_CHAR(data_consulta, 'YYYY-MM')
      ORDER BY mes DESC
      LIMIT 12
    `;

    // Formatar dados para o frontend
    const dadosFormatados = faturamentoPorMes.reverse().map(item => ({
      mes: item.mes,
      nome_mes: new Date(item.mes + '-01').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }),
      total_consultas: parseInt(item.total_consultas),
      faturamento: parseFloat(item.faturamento || 0),
      recebido: parseFloat(item.recebido || 0),
      glosado: parseFloat(item.glosado || 0),
      pendente: parseFloat(item.pendente || 0)
    }));

    res.status(200).json({
      success: true,
      data: dadosFormatados
    });

  } catch (error) {
    console.error('Erro ao buscar faturamento mensal:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar faturamento mensal.',
      details: error.message
    });
  }
});

module.exports = router;