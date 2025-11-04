const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: GET /api/estatisticas/resumo
 * DESCRIÇÃO: Estatísticas gerais rápidas para cards do dashboard
 * ====================================================================
 */
router.get('/resumo', async (req, res) => {
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
 * DESCRIÇÃO: Top 5 médicos por faturamento
 * ====================================================================
 */
router.get('/medicos-top', async (req, res) => {
  try {
    const topMedicos = await prisma.consultas.groupBy({
      by: ['medico_id'],
      _sum: {
        valor_bruto: true,
        valor_recebido: true
      },
      _count: true,
      orderBy: {
        _sum: {
          valor_bruto: 'desc'
        }
      },
      take: 5
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
          total_consultas: item._count,
          valor_faturado: parseFloat(item._sum.valor_bruto || 0),
          valor_recebido: parseFloat(item._sum.valor_recebido || 0)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: medicosComNomes
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
 * ROTA: GET /api/estatisticas/faturamento-mensal
 * DESCRIÇÃO: Faturamento dos últimos 12 meses
 * ====================================================================
 */
router.get('/faturamento-mensal', async (req, res) => {
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