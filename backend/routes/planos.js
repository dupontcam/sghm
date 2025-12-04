const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePlano } = require('../middleware/validators');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTAS PARA GESTÃO DE PLANOS DE SAÚDE
 * DESCRIÇÃO: CRUD completo para operadoras e planos de saúde
 * ====================================================================
 */

/*
 * ====================================================================
 * ROTA: GET /api/planos
 * DESCRIÇÃO: Listar todos os planos de saúde
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { ativo, tipo_plano, search } = req.query;

    // Construir filtros
    const where = {};
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }
    
    if (tipo_plano && tipo_plano !== 'ALL') {
      where.tipo_plano = tipo_plano;
    }
    
    if (search) {
      where.OR = [
        { nome_plano: { contains: search, mode: 'insensitive' } },
        { codigo_operadora: { contains: search, mode: 'insensitive' } }
      ];
    }

    const planos = await prisma.planos_saude.findMany({
      where,
      orderBy: [
        { ativo: 'desc' },
        { nome_plano: 'asc' }
      ]
    });

    console.log(`GET /planos - ${planos.length} planos encontrados`);

    // Estatísticas básicas
    const stats = await prisma.planos_saude.aggregate({
      _count: { id: true },
      _avg: { 
        valor_consulta_padrao: true,
        percentual_glosa_historica: true,
        prazo_pagamento_dias: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Planos de saúde listados com sucesso',
      data: {
        planos,
        total: planos.length,
        stats: {
          total_planos: stats._count.id,
          valor_medio_consulta: stats._avg.valor_consulta_padrao,
          glosa_media: stats._avg.percentual_glosa_historica,
          prazo_medio_pagamento: stats._avg.prazo_pagamento_dias
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar planos de saúde:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/planos/:id
 * DESCRIÇÃO: Buscar plano de saúde por ID
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do plano inválido',
        code: 'INVALID_ID'
      });
    }

    const plano = await prisma.planos_saude.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { consultas: true }
        }
      }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        error: 'Plano de saúde não encontrado',
        code: 'PLAN_NOT_FOUND'
      });
    }

    // Estatísticas do plano nos últimos 30 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    const estatisticas = await prisma.honorarios.aggregate({
      where: {
        plano_saude_id: parseInt(id),
        created_at: { gte: dataLimite }
      },
      _count: { id: true },
      _sum: { 
        valor_consulta: true,
        valor_glosa: true,
        valor_liquido: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Plano de saúde encontrado',
      data: {
        plano,
        estatisticas_30_dias: {
          total_consultas: estatisticas._count.id,
          valor_total: estatisticas._sum.valor_consulta,
          valor_glosas: estatisticas._sum.valor_glosa,
          valor_liquido: estatisticas._sum.valor_liquido
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar plano de saúde:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: POST /api/planos
 * DESCRIÇÃO: Criar novo plano de saúde
 * ACESSO: Apenas administradores
 * ====================================================================
 */
router.post('/', authenticateToken, requireAdmin, validatePlano.create, async (req, res) => {
  try {
    console.log('POST /planos - Body recebido:', JSON.stringify(req.body, null, 2));
    
    const {
      nome_plano,
      codigo_operadora,
      tipo_plano,
      prazo_pagamento_dias,
      valor_consulta_padrao,
      percentual_glosa_historica
    } = req.body;

    // Validação básica
    if (!nome_plano) {
      return res.status(400).json({
        success: false,
        error: 'Nome do plano é obrigatório',
        code: 'MISSING_PLAN_NAME'
      });
    }

    if (!valor_consulta_padrao || valor_consulta_padrao <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor da consulta deve ser maior que zero',
        code: 'INVALID_CONSULTATION_VALUE'
      });
    }

    // Verificar se já existe plano com o mesmo nome ou código
    const planoExistente = await prisma.planos_saude.findFirst({
      where: {
        OR: [
          { nome_plano: { equals: nome_plano, mode: 'insensitive' } },
          ...(codigo_operadora ? [{ codigo_operadora }] : [])
        ]
      }
    });

    if (planoExistente) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um plano com este nome ou código de operadora',
        code: 'PLAN_ALREADY_EXISTS'
      });
    }

    // Criar novo plano
    const novoPlano = await prisma.planos_saude.create({
      data: {
        nome_plano: nome_plano.trim(),
        codigo_operadora: codigo_operadora?.trim(),
        tipo_plano: tipo_plano || 'CONVENIO',
        prazo_pagamento_dias: prazo_pagamento_dias || 30,
        valor_consulta_padrao: parseFloat(valor_consulta_padrao),
        percentual_glosa_historica: percentual_glosa_historica ? parseFloat(percentual_glosa_historica) : 5.00
      }
    });

    res.status(201).json({
      success: true,
      message: 'Plano de saúde criado com sucesso',
      data: { plano: novoPlano }
    });

  } catch (error) {
    console.error('Erro ao criar plano de saúde:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      details: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/planos/:id
 * DESCRIÇÃO: Atualizar plano de saúde
 * ACESSO: Apenas administradores
 * ====================================================================
 */
router.put('/:id', authenticateToken, requireAdmin, validatePlano.update, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_plano,
      codigo_operadora,
      tipo_plano,
      prazo_pagamento_dias,
      valor_consulta_padrao,
      percentual_glosa_historica,
      ativo
    } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do plano inválido',
        code: 'INVALID_ID'
      });
    }

    // Verificar se o plano existe
    const planoExistente = await prisma.planos_saude.findUnique({
      where: { id: parseInt(id) }
    });

    if (!planoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Plano de saúde não encontrado',
        code: 'PLAN_NOT_FOUND'
      });
    }

    // Verificar duplicidade (excluindo o próprio registro)
    if (nome_plano || codigo_operadora) {
      const duplicado = await prisma.planos_saude.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            {
              OR: [
                ...(nome_plano ? [{ nome_plano: { equals: nome_plano, mode: 'insensitive' } }] : []),
                ...(codigo_operadora ? [{ codigo_operadora }] : [])
              ]
            }
          ]
        }
      });

      if (duplicado) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um plano com este nome ou código',
          code: 'PLAN_ALREADY_EXISTS'
        });
      }
    }

    // Atualizar plano
    const dadosAtualizacao = {};
    if (nome_plano) dadosAtualizacao.nome_plano = nome_plano.trim();
    if (codigo_operadora !== undefined) dadosAtualizacao.codigo_operadora = codigo_operadora?.trim();
    if (tipo_plano) dadosAtualizacao.tipo_plano = tipo_plano;
    if (prazo_pagamento_dias !== undefined) dadosAtualizacao.prazo_pagamento_dias = parseInt(prazo_pagamento_dias);
    if (valor_consulta_padrao !== undefined) dadosAtualizacao.valor_consulta_padrao = parseFloat(valor_consulta_padrao);
    if (percentual_glosa_historica !== undefined) dadosAtualizacao.percentual_glosa_historica = parseFloat(percentual_glosa_historica);
    if (ativo !== undefined) dadosAtualizacao.ativo = Boolean(ativo);

    const planoAtualizado = await prisma.planos_saude.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao
    });

    res.status(200).json({
      success: true,
      message: 'Plano de saúde atualizado com sucesso',
      data: { plano: planoAtualizado }
    });

  } catch (error) {
    console.error('Erro ao atualizar plano de saúde:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: DELETE /api/planos/:id
 * DESCRIÇÃO: Desativar plano de saúde
 * ACESSO: Apenas administradores
 * ====================================================================
 */
router.delete('/:id', authenticateToken, requireAdmin, validatePlano.delete, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do plano inválido',
        code: 'INVALID_ID'
      });
    }

    // Verificar se o plano existe
    const plano = await prisma.planos_saude.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { consultas: true }
        }
      }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        error: 'Plano de saúde não encontrado',
        code: 'PLAN_NOT_FOUND'
      });
    }

    // Se tem consultas vinculadas, apenas desativar
    if (plano._count.consultas > 0) {
      const planoDesativado = await prisma.planos_saude.update({
        where: { id: parseInt(id) },
        data: { ativo: false }
      });

      return res.status(200).json({
        success: true,
        message: 'Plano de saúde desativado (possui consultas vinculadas)',
        data: { 
          plano: planoDesativado,
          consultas_vinculadas: plano._count.consultas
        }
      });
    } else {
      // Se não tem consultas, pode excluir permanentemente
      await prisma.planos_saude.delete({
        where: { id: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Plano de saúde excluído permanentemente',
        data: { id: parseInt(id) }
      });
    }

  } catch (error) {
    console.error('Erro ao excluir plano de saúde:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/planos/stats/dashboard
 * DESCRIÇÃO: Estatísticas dos planos para dashboard
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/stats/dashboard', authenticateToken, requireAuth, async (req, res) => {
  try {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    // Estatísticas por plano nos últimos 30 dias
    const estatisticasPorPlano = await prisma.planos_saude.findMany({
      where: { ativo: true },
      include: {
        _count: {
          select: { 
            consultas: {
              where: {
                created_at: { gte: dataLimite }
              }
            }
          }
        },
        honorarios: {
          where: {
            created_at: { gte: dataLimite }
          },
          select: {
            valor_consulta: true,
            valor_glosa: true,
            valor_liquido: true,
            status_pagamento: true
          }
        }
      },
      orderBy: { nome_plano: 'asc' }
    });

    const resumoPorPlano = estatisticasPorPlano.map(plano => {
      const totalConsultas = plano._count.consultas;
      const totalValor = plano.honorarios.reduce((sum, h) => sum + parseFloat(h.valor_consulta), 0);
      const totalGlosas = plano.honorarios.reduce((sum, h) => sum + parseFloat(h.valor_glosa), 0);
      const totalPago = plano.honorarios
        .filter(h => h.status_pagamento === 'PAGO')
        .reduce((sum, h) => sum + parseFloat(h.valor_liquido), 0);

      return {
        id: plano.id,
        nome_plano: plano.nome_plano,
        tipo_plano: plano.tipo_plano,
        total_consultas: totalConsultas,
        valor_total: totalValor,
        valor_glosas: totalGlosas,
        valor_pago: totalPago,
        taxa_glosa: totalValor > 0 ? (totalGlosas / totalValor) * 100 : 0,
        valor_pendente: totalValor - totalGlosas - totalPago
      };
    });

    res.status(200).json({
      success: true,
      message: 'Estatísticas dos planos carregadas',
      data: {
        periodo: '30 dias',
        planos: resumoPorPlano,
        totais: {
          planos_ativos: estatisticasPorPlano.length,
          total_consultas: resumoPorPlano.reduce((sum, p) => sum + p.total_consultas, 0),
          valor_total: resumoPorPlano.reduce((sum, p) => sum + p.valor_total, 0),
          valor_glosas: resumoPorPlano.reduce((sum, p) => sum + p.valor_glosas, 0),
          valor_pago: resumoPorPlano.reduce((sum, p) => sum + p.valor_pago, 0)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao carregar estatísticas dos planos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;