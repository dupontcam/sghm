const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: GET /api/relatorios/financeiro
 * DESCRIÇÃO: Gera relatório financeiro com filtros
 * QUERY PARAMS: medico_id, data_inicio, data_fim, status_pagamento
 * ====================================================================
 */
router.get('/financeiro', authenticateToken, async (req, res) => {
  const { medico_id, data_inicio, data_fim, status_pagamento } = req.query;

  try {
    // Construir filtros dinâmicos
    const where = {};

    if (medico_id && medico_id !== '0') {
      where.medico_id = parseInt(medico_id);
    }

    if (data_inicio) {
      where.data_consulta = {
        ...where.data_consulta,
        gte: new Date(data_inicio)
      };
    }

    if (data_fim) {
      where.data_consulta = {
        ...where.data_consulta,
        lte: new Date(data_fim)
      };
    }

    if (status_pagamento && status_pagamento !== '') {
      where.status_pagamento = status_pagamento;
    }

    // Buscar consultas com filtros
    const consultas = await prisma.consultas.findMany({
      where,
      include: {
        medico: true,
        paciente: true,
      },
      orderBy: {
        data_consulta: 'desc'
      }
    });

    // Calcular resumo financeiro
    const resumo = {
      faturado: 0,
      pago: 0,
      glosado: 0,
      aReceber: 0,
      totalConsultas: consultas.length
    };

    consultas.forEach(consulta => {
      const valor = parseFloat(consulta.valor_bruto);
      resumo.faturado += valor;

      switch (consulta.status_pagamento) {
        case 'PAGO':
          resumo.pago += parseFloat(consulta.valor_recebido || 0);
          break;
        case 'GLOSA':
          resumo.glosado += parseFloat(consulta.valor_glosa || 0);
          break;
        case 'PENDENTE':
          resumo.aReceber += valor;
          break;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        consultas,
        resumo,
        filtros: {
          medico_id: medico_id || null,
          data_inicio: data_inicio || null,
          data_fim: data_fim || null,
          status_pagamento: status_pagamento || null
        },
        gerado_em: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao gerar relatório financeiro.',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/relatorios/dashboard
 * DESCRIÇÃO: Dados para o dashboard (estatísticas gerais)
 * ====================================================================
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Estatísticas gerais
    const [
      totalConsultas,
      consultasPendentes,
      consultasPagas,
      consultasGlosadas,
      valorTotal,
      valorPago,
      valorGlosa,
      valorPendente
    ] = await Promise.all([
      // Total de consultas
      prisma.consultas.count(),
      
      // Consultas por status
      prisma.consultas.count({ where: { status_pagamento: 'PENDENTE' } }),
      prisma.consultas.count({ where: { status_pagamento: 'PAGO' } }),
      prisma.consultas.count({ where: { status_pagamento: 'GLOSA' } }),
      
      // Somas de valores
      prisma.consultas.aggregate({
        _sum: { valor_bruto: true }
      }),
      prisma.consultas.aggregate({
        where: { status_pagamento: 'PAGO' },
        _sum: { valor_recebido: true }
      }),
      prisma.consultas.aggregate({
        where: { status_pagamento: 'GLOSA' },
        _sum: { valor_glosa: true }
      }),
      prisma.consultas.aggregate({
        where: { status_pagamento: 'PENDENTE' },
        _sum: { valor_bruto: true }
      })
    ]);

    // Dados para gráfico de pizza (status dos pagamentos)
    const pieData = [
      { name: 'Pendente', value: consultasPendentes, color: '#ffc107' },
      { name: 'Pago', value: consultasPagas, color: '#28a745' },
      { name: 'Glosado', value: consultasGlosadas, color: '#dc3545' }
    ].filter(item => item.value > 0);

    // Faturamento por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const faturamentoPorMes = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(data_consulta, 'YYYY-MM') as mes,
        SUM(valor_bruto) as faturamento,
        SUM(CASE WHEN status_pagamento = 'GLOSA' THEN valor_glosa ELSE 0 END) as glosado
      FROM consultas 
      WHERE data_consulta >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(data_consulta, 'YYYY-MM')
      ORDER BY mes
    `;

    // Taxa de glosa
    const taxaGlosa = valorTotal._sum.valor_bruto > 0 
      ? ((valorGlosa._sum.valor_glosa || 0) / valorTotal._sum.valor_bruto * 100).toFixed(1)
      : '0.0';

    res.status(200).json({
      success: true,
      data: {
        estatisticas: {
          totalConsultas,
          totalFaturado: valorTotal._sum.valor_bruto || 0,
          totalPago: valorPago._sum.valor_recebido || 0,
          totalGlosado: valorGlosa._sum.valor_glosa || 0,
          totalPendente: valorPendente._sum.valor_bruto || 0,
          taxaGlosa: parseFloat(taxaGlosa)
        },
        pieData,
        faturamentoPorMes,
        gerado_em: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar dados do dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao gerar dados do dashboard.',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/relatorios/resumo-periodo
 * DESCRIÇÃO: Resumo financeiro por período específico
 * QUERY PARAMS: data_inicio, data_fim
 * ====================================================================
 */
router.get('/resumo-periodo', authenticateToken, async (req, res) => {
  const { data_inicio, data_fim } = req.query;

  if (!data_inicio || !data_fim) {
    return res.status(400).json({
      success: false,
      error: 'Parâmetros data_inicio e data_fim são obrigatórios'
    });
  }

  try {
    const where = {
      data_consulta: {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      }
    };

    const [resumo, consultas] = await Promise.all([
      prisma.consultas.groupBy({
        by: ['status_pagamento'],
        where,
        _sum: {
          valor_bruto: true,
          valor_recebido: true,
          valor_glosa: true
        },
        _count: true
      }),
      prisma.consultas.findMany({
        where,
        include: {
          medico: { select: { nome_medico: true } },
          paciente: { select: { nome_paciente: true } }
        },
        orderBy: { data_consulta: 'desc' }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        periodo: {
          inicio: data_inicio,
          fim: data_fim
        },
        resumo,
        consultas,
        gerado_em: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar resumo por período:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao gerar resumo por período.',
      details: error.message
    });
  }
});

module.exports = router;