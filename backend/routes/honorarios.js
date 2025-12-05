const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAuth, requireAdmin } = require('../middleware/auth');
const { validateHonorario } = require('../middleware/validators');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTAS PARA GESTÃO DE HONORÁRIOS MÉDICOS
 * DESCRIÇÃO: CRUD completo para controle de honorários pós-atendimento
 * ====================================================================
 */

/*
 * ====================================================================
 * ROTA: GET /api/honorarios
 * DESCRIÇÃO: Listar honorários com filtros
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status_pagamento,
      plano_saude_id,
      medico_id,
      data_inicio,
      data_fim,
      tem_glosa
    } = req.query;

    // Construir filtros
    const where = {};

    if (status_pagamento && status_pagamento !== 'ALL') {
      where.status_pagamento = status_pagamento;
    }

    if (plano_saude_id) {
      where.plano_saude_id = parseInt(plano_saude_id);
    }

    if (tem_glosa === 'true') {
      where.valor_glosa = { gt: 0 };
    }

    if (data_inicio || data_fim) {
      where.created_at = {};
      if (data_inicio) where.created_at.gte = new Date(data_inicio);
      if (data_fim) {
        const dataFim = new Date(data_fim);
        dataFim.setHours(23, 59, 59, 999);
        where.created_at.lte = dataFim;
      }
    }

    // Se medico_id for fornecido, filtrar através da consulta
    if (medico_id) {
      where.consulta = {
        medico_id: parseInt(medico_id)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [honorarios, total] = await Promise.all([
      prisma.honorarios.findMany({
        where,
        include: {
          consulta: {
            include: {
              medico: { select: { id: true, nome_medico: true, especialidade: true } },
              paciente: { select: { id: true, nome_paciente: true, cpf: true } }
            }
          },
          plano_saude: { select: { id: true, nome_plano: true, tipo_plano: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.honorarios.count({ where })
    ]);

    // Estatísticas dos resultados filtrados
    const estatisticas = await prisma.honorarios.aggregate({
      where,
      _count: { id: true },
      _sum: {
        valor_consulta: true,
        valor_glosa: true,
        valor_liquido: true,
        valor_repasse_medico: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Honorários listados com sucesso',
      data: {
        honorarios,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / parseInt(limit)),
          total_records: total,
          records_per_page: parseInt(limit)
        },
        estatisticas: {
          total_honorarios: estatisticas._count.id,
          valor_total: estatisticas._sum.valor_consulta || 0,
          valor_glosas: estatisticas._sum.valor_glosa || 0,
          valor_liquido: estatisticas._sum.valor_liquido || 0,
          valor_repasses: estatisticas._sum.valor_repasse_medico || 0
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar honorários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/honorarios/dashboard
 * DESCRIÇÃO: Dados para dashboard de honorários
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/dashboard', authenticateToken, requireAuth, async (req, res) => {
  try {
    // Últimos 30 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    // Estatísticas gerais
    const estatisticasGerais = await prisma.honorarios.aggregate({
      where: { created_at: { gte: dataLimite } },
      _count: { id: true },
      _sum: {
        valor_consulta: true,
        valor_glosa: true,
        valor_liquido: true,
        valor_repasse_medico: true
      }
    });

    // Estatísticas por status
    const honorariosPorStatus = await prisma.honorarios.groupBy({
      by: ['status_pagamento'],
      where: { created_at: { gte: dataLimite } },
      _count: { id: true },
      _sum: {
        valor_consulta: true,
        valor_liquido: true
      }
    });

    // Top 5 planos por volume
    const topPlanos = await prisma.honorarios.groupBy({
      by: ['plano_saude_id'],
      where: { created_at: { gte: dataLimite } },
      _count: { id: true },
      _sum: {
        valor_consulta: true,
        valor_glosa: true
      },
      orderBy: { _sum: { valor_consulta: 'desc' } },
      take: 5
    });

    // Buscar nomes dos planos
    const planosIds = topPlanos.map(tp => tp.plano_saude_id);
    const planos = await prisma.planos_saude.findMany({
      where: { id: { in: planosIds } },
      select: { id: true, nome_plano: true }
    });

    const topPlanosComNomes = topPlanos.map(tp => ({
      ...tp,
      plano_nome: planos.find(p => p.id === tp.plano_saude_id)?.nome_plano || 'Desconhecido'
    }));

    // Evolução diária (últimos 7 dias)
    const ultimaSemanaDatas = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      ultimaSemanaDatas.push({
        data: data.toISOString().split('T')[0],
        inicio: new Date(data.setHours(0, 0, 0, 0)),
        fim: new Date(data.setHours(23, 59, 59, 999))
      });
    }

    const evolucaoDiaria = await Promise.all(
      ultimaSemanaDatas.map(async (dia) => {
        const stats = await prisma.honorarios.aggregate({
          where: {
            created_at: {
              gte: dia.inicio,
              lte: dia.fim
            }
          },
          _count: { id: true },
          _sum: { valor_consulta: true }
        });

        return {
          data: dia.data,
          consultas: stats._count.id,
          valor: stats._sum.valor_consulta || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Dados do dashboard carregados',
      data: {
        periodo: '30 dias',
        estatisticas_gerais: {
          total_consultas: estatisticasGerais._count.id,
          valor_total: estatisticasGerais._sum.valor_consulta || 0,
          valor_glosas: estatisticasGerais._sum.valor_glosa || 0,
          valor_liquido: estatisticasGerais._sum.valor_liquido || 0,
          valor_repasses: estatisticasGerais._sum.valor_repasse_medico || 0,
          taxa_glosa: estatisticasGerais._sum.valor_consulta > 0
            ? (estatisticasGerais._sum.valor_glosa / estatisticasGerais._sum.valor_consulta) * 100
            : 0
        },
        consultas_por_status: honorariosPorStatus,
        top_planos: topPlanosComNomes,
        evolucao_diaria: evolucaoDiaria
      }
    });

  } catch (error) {
    console.error('Erro ao carregar dashboard de honorários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/honorarios/:id
 * DESCRIÇÃO: Buscar honorário por ID
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do honorário inválido',
        code: 'INVALID_ID'
      });
    }

    const honorario = await prisma.honorarios.findUnique({
      where: { id: parseInt(id) },
      include: {
        consulta: {
          include: {
            medico: true,
            paciente: true
          }
        },
        plano_saude: true
      }
    });

    if (!honorario) {
      return res.status(404).json({
        success: false,
        error: 'Honorário não encontrado',
        code: 'HONORARIO_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Honorário encontrado',
      data: { honorario }
    });

  } catch (error) {
    console.error('Erro ao buscar honorário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: POST /api/honorarios
 * DESCRIÇÃO: Criar novo honorário
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.post('/', authenticateToken, requireAuth, validateHonorario.create, async (req, res) => {
  try {
    const {
      consulta_id,
      plano_saude_id,
      valor_consulta,
      valor_glosa = 0,
      numero_guia,
      observacoes
    } = req.body;

    // Validação básica
    if (!consulta_id || !plano_saude_id || !valor_consulta) {
      return res.status(400).json({
        success: false,
        error: 'Consulta ID, Plano de Saúde ID e Valor da consulta são obrigatórios',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (valor_consulta <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor da consulta deve ser maior que zero',
        code: 'INVALID_CONSULTATION_VALUE'
      });
    }

    // Verificar se já existe honorário para esta consulta
    const honorarioExistente = await prisma.honorarios.findFirst({
      where: { consulta_id: parseInt(consulta_id) }
    });

    if (honorarioExistente) {
      return res.status(409).json({
        success: false,
        error: 'Já existe honorário cadastrado para esta consulta',
        code: 'HONORARIO_ALREADY_EXISTS'
      });
    }

    // Verificar se a consulta existe
    const consulta = await prisma.consultas.findUnique({
      where: { id: parseInt(consulta_id) },
      include: { medico: { select: { percentual_repasse: true } } }
    });

    if (!consulta) {
      return res.status(404).json({
        success: false,
        error: 'Consulta não encontrada',
        code: 'CONSULTATION_NOT_FOUND'
      });
    }

    // Verificar se o plano de saúde existe
    const plano = await prisma.planos_saude.findUnique({
      where: { id: parseInt(plano_saude_id) }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        error: 'Plano de saúde não encontrado',
        code: 'PLAN_NOT_FOUND'
      });
    }

    // Calcular valor de repasse ao médico
    const valorLiquido = parseFloat(valor_consulta) - parseFloat(valor_glosa || 0);
    const percentualRepasse = consulta.medico.percentual_repasse || 70.00;
    const valorRepasseMedico = (valorLiquido * percentualRepasse) / 100;

    // Criar honorário
    const novoHonorario = await prisma.honorarios.create({
      data: {
        consulta_id: parseInt(consulta_id),
        plano_saude_id: parseInt(plano_saude_id),
        valor_consulta: parseFloat(valor_consulta),
        valor_glosa: parseFloat(valor_glosa || 0),
        valor_repasse_medico: Math.round(valorRepasseMedico * 100) / 100, // Arredondar para 2 casas decimais
        status_pagamento: valor_glosa > 0 ? 'GLOSADO' : 'PENDENTE',
        numero_guia: numero_guia?.trim(),
        observacoes: observacoes?.trim(),
        ...(valor_glosa > 0 && { data_glosa: new Date() })
      },
      include: {
        consulta: {
          include: {
            medico: { select: { nome_medico: true } },
            paciente: { select: { nome_paciente: true } }
          }
        },
        plano_saude: { select: { nome_plano: true } }
      }
    });

    // Atualizar flag tem_honorario na consulta
    await prisma.consultas.update({
      where: { id: parseInt(consulta_id) },
      data: { tem_honorario: true }
    });

    // Registrar criação no histórico
    await prisma.historico_honorarios.create({
      data: {
        honorario_id: novoHonorario.id,
        tipo_evento: 'CRIACAO',
        descricao: `Honorário criado no valor de R$ ${parseFloat(valor_consulta).toFixed(2)}`,
        dados_adicionais: {
          valor_consulta: parseFloat(valor_consulta),
          valor_glosa: parseFloat(valor_glosa || 0),
          status_inicial: novoHonorario.status_pagamento,
          numero_guia: numero_guia?.trim() || null,
          plano_saude_id: parseInt(plano_saude_id)
        },
        usuario_id: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Honorário criado com sucesso',
      data: { honorario: novoHonorario }
    });

  } catch (error) {
    console.error('Erro ao criar honorário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/honorarios/:id/status
 * DESCRIÇÃO: Atualizar status de pagamento do honorário
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.put('/:id/status', authenticateToken, requireAuth, validateHonorario.updateStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pagamento, data_pagamento, observacoes } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do honorário inválido',
        code: 'INVALID_ID'
      });
    }

    if (!status_pagamento) {
      return res.status(400).json({
        success: false,
        error: 'Status de pagamento é obrigatório',
        code: 'MISSING_STATUS'
      });
    }

    const statusValidos = ['PENDENTE', 'ENVIADO', 'PAGO', 'GLOSADO', 'CANCELADO'];
    if (!statusValidos.includes(status_pagamento)) {
      return res.status(400).json({
        success: false,
        error: 'Status de pagamento inválido',
        code: 'INVALID_STATUS',
        valid_statuses: statusValidos
      });
    }

    // Verificar se o honorário existe
    const honorario = await prisma.honorarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!honorario) {
      return res.status(404).json({
        success: false,
        error: 'Honorário não encontrado',
        code: 'HONORARIO_NOT_FOUND'
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      status_pagamento
    };

    if (status_pagamento === 'PAGO' && data_pagamento) {
      dadosAtualizacao.data_pagamento = new Date(data_pagamento);
    }

    if (observacoes !== undefined) {
      dadosAtualizacao.observacoes = observacoes?.trim();
    }

    // Atualizar honorário
    const honorarioAtualizado = await prisma.honorarios.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao,
      include: {
        consulta: {
          include: {
            medico: { select: { nome_medico: true } },
            paciente: { select: { nome_paciente: true } }
          }
        },
        plano_saude: { select: { nome_plano: true } }
      }
    });

    // Registrar mudança de status no histórico
    await prisma.historico_honorarios.create({
      data: {
        honorario_id: parseInt(id),
        tipo_evento: 'STATUS_ALTERADO',
        descricao: `Status alterado de ${honorario.status_pagamento} para ${status_pagamento}`,
        dados_adicionais: {
          status_anterior: honorario.status_pagamento,
          status_novo: status_pagamento,
          data_pagamento: data_pagamento || null,
          observacoes: observacoes?.trim() || null
        },
        usuario_id: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Status do honorário atualizado com sucesso',
      data: { honorario: honorarioAtualizado }
    });

  } catch (error) {
    console.error('Erro ao atualizar status do honorário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/honorarios/:id/glosa
 * DESCRIÇÃO: Registrar glosa no honorário
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.put('/:id/glosa', authenticateToken, requireAuth, validateHonorario.updateGlosa, async (req, res) => {
  try {
    const { id } = req.params;
    const { valor_glosa, motivo_glosa, data_glosa } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do honorário inválido',
        code: 'INVALID_ID'
      });
    }

    if (valor_glosa === undefined || valor_glosa < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor da glosa deve ser maior ou igual a zero',
        code: 'INVALID_GLOSA_VALUE'
      });
    }

    // Verificar se o honorário existe
    const honorario = await prisma.honorarios.findUnique({
      where: { id: parseInt(id) },
      include: {
        consulta: {
          include: { medico: { select: { percentual_repasse: true } } }
        }
      }
    });

    console.log('📊 REGISTRAR GLOSA - Honorário ANTES da atualização:', {
      id: honorario?.id,
      valor_consulta_atual: honorario?.valor_consulta,
      valor_glosa_atual: honorario?.valor_glosa,
      valor_glosa_nova: valor_glosa
    });

    if (!honorario) {
      return res.status(404).json({
        success: false,
        error: 'Honorário não encontrado',
        code: 'HONORARIO_NOT_FOUND'
      });
    }

    // Validar se valor da glosa não é maior que o valor da consulta
    if (parseFloat(valor_glosa) > parseFloat(honorario.valor_consulta)) {
      return res.status(400).json({
        success: false,
        error: 'Valor da glosa não pode ser maior que o valor da consulta',
        code: 'GLOSA_EXCEEDS_CONSULTATION_VALUE'
      });
    }

    // Recalcular valor de repasse
    const valorLiquido = parseFloat(honorario.valor_consulta) - parseFloat(valor_glosa);
    const percentualRepasse = honorario.consulta.medico.percentual_repasse || 70.00;
    const novoValorRepasse = (valorLiquido * percentualRepasse) / 100;

    // Determinar novo status
    let novoStatus = 'PENDENTE';
    if (parseFloat(valor_glosa) > 0) {
      if (parseFloat(valor_glosa) >= parseFloat(honorario.valor_consulta)) {
        novoStatus = 'GLOSADO';
      } else {
        novoStatus = 'GLOSADO';
      }
    }

    // Atualizar honorário (IMPORTANTE: valor_consulta NÃO é alterado!)
    const honorarioAtualizado = await prisma.honorarios.update({
      where: { id: parseInt(id) },
      data: {
        valor_glosa: parseFloat(valor_glosa),
        valor_repasse_medico: Math.round(novoValorRepasse * 100) / 100,
        motivo_glosa: motivo_glosa?.trim(),
        data_glosa: data_glosa ? new Date(data_glosa) : new Date(),
        status_pagamento: novoStatus
      },
      include: {
        consulta: {
          include: {
            medico: { select: { nome_medico: true } },
            paciente: { select: { nome_paciente: true } }
          }
        },
        plano_saude: { select: { nome_plano: true } }
      }
    });

    console.log('✅ REGISTRAR GLOSA - Honorário DEPOIS da atualização:', {
      id: honorarioAtualizado.id,
      valor_consulta: honorarioAtualizado.valor_consulta,
      valor_glosa: honorarioAtualizado.valor_glosa,
      valor_liquido: parseFloat(honorarioAtualizado.valor_consulta) - parseFloat(honorarioAtualizado.valor_glosa)
    });

    // Registrar no histórico
    await prisma.historico_honorarios.create({
      data: {
        honorario_id: parseInt(id),
        tipo_evento: 'GLOSA_REGISTRADA',
        descricao: parseFloat(valor_glosa) > 0 
          ? `Glosa de R$ ${parseFloat(valor_glosa).toFixed(2)} registrada`
          : 'Glosa removida (valor zerado)',
        dados_adicionais: {
          valor_glosa: parseFloat(valor_glosa),
          motivo: motivo_glosa?.trim() || null,
          valor_original: parseFloat(honorario.valor_consulta),
          valor_liquido: valorLiquido,
          status_anterior: honorario.status_pagamento,
          status_novo: novoStatus
        },
        usuario_id: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Glosa registrada com sucesso',
      data: { honorario: honorarioAtualizado }
    });

  } catch (error) {
    console.error('Erro ao registrar glosa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/honorarios/relatorio/medico/:medico_id
 * DESCRIÇÃO: Relatório de repasses por médico
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/relatorio/medico/:medico_id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { medico_id } = req.params;
    const { data_inicio, data_fim } = req.query;

    if (!medico_id || isNaN(parseInt(medico_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do médico inválido',
        code: 'INVALID_MEDICO_ID'
      });
    }

    // Construir filtro de período
    const where = {
      consulta: { medico_id: parseInt(medico_id) }
    };

    if (data_inicio || data_fim) {
      where.created_at = {};
      if (data_inicio) where.created_at.gte = new Date(data_inicio);
      if (data_fim) {
        const dataFim = new Date(data_fim);
        dataFim.setHours(23, 59, 59, 999);
        where.created_at.lte = dataFim;
      }
    }

    // Buscar dados do médico
    const medico = await prisma.medicos.findUnique({
      where: { id: parseInt(medico_id) },
      select: {
        id: true,
        nome_medico: true,
        especialidade: true,
        crm: true,
        percentual_repasse: true
      }
    });

    if (!medico) {
      return res.status(404).json({
        success: false,
        error: 'Médico não encontrado',
        code: 'MEDICO_NOT_FOUND'
      });
    }

    // Buscar honorários do médico
    const honorarios = await prisma.honorarios.findMany({
      where,
      include: {
        consulta: {
          select: {
            id: true,
            data_consulta: true,
            protocolo: true
          }
        },
        plano_saude: {
          select: {
            id: true,
            nome_plano: true,
            tipo_plano: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Calcular estatísticas
    const estatisticas = {
      total_consultas: honorarios.length,
      valor_total_bruto: honorarios.reduce((sum, h) => sum + parseFloat(h.valor_consulta), 0),
      valor_total_glosas: honorarios.reduce((sum, h) => sum + parseFloat(h.valor_glosa), 0),
      valor_total_liquido: honorarios.reduce((sum, h) => sum + parseFloat(h.valor_liquido), 0),
      valor_total_repasses: honorarios.reduce((sum, h) => sum + parseFloat(h.valor_repasse_medico || 0), 0),
      consultas_pagas: honorarios.filter(h => h.status_pagamento === 'PAGO').length,
      consultas_pendentes: honorarios.filter(h => h.status_pagamento === 'PENDENTE').length,
      consultas_glosadas: honorarios.filter(h => h.valor_glosa > 0).length,
      taxa_glosa: 0
    };

    if (estatisticas.valor_total_bruto > 0) {
      estatisticas.taxa_glosa = (estatisticas.valor_total_glosas / estatisticas.valor_total_bruto) * 100;
    }

    // Agrupamento por plano de saúde
    const agrupamentoPorPlano = {};
    honorarios.forEach(honorario => {
      const planoId = honorario.plano_saude.id;
      if (!agrupamentoPorPlano[planoId]) {
        agrupamentoPorPlano[planoId] = {
          plano: honorario.plano_saude,
          consultas: 0,
          valor_bruto: 0,
          valor_glosas: 0,
          valor_repasses: 0
        };
      }
      agrupamentoPorPlano[planoId].consultas++;
      agrupamentoPorPlano[planoId].valor_bruto += parseFloat(honorario.valor_consulta);
      agrupamentoPorPlano[planoId].valor_glosas += parseFloat(honorario.valor_glosa);
      agrupamentoPorPlano[planoId].valor_repasses += parseFloat(honorario.valor_repasse_medico || 0);
    });

    const resumoPorPlano = Object.values(agrupamentoPorPlano);

    res.status(200).json({
      success: true,
      message: 'Relatório de repasses gerado com sucesso',
      data: {
        medico,
        periodo: {
          data_inicio: data_inicio || 'Início dos registros',
          data_fim: data_fim || 'Hoje'
        },
        estatisticas,
        resumo_por_plano: resumoPorPlano,
        honorarios_detalhados: honorarios
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de repasses:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * NOVOS ENDPOINTS PARA RECURSOS DE GLOSA E HISTÓRICO
 * Adicionar ANTES de: module.exports = router;
 * ====================================================================
 */

/*
 * ====================================================================
 * ROTA: PUT /api/honorarios/:id/recurso
 * DESCRIÇÃO: Enviar recurso de glosa
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.put('/:id/recurso', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_recurso, data_recurso } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do honorário inválido',
        code: 'INVALID_ID'
      });
    }

    if (!motivo_recurso || !motivo_recurso.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Motivo do recurso é obrigatório',
        code: 'MISSING_MOTIVO_RECURSO'
      });
    }

    // Verificar se o honorário existe e está glosado
    const honorario = await prisma.honorarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!honorario) {
      return res.status(404).json({
        success: false,
        error: 'Honorário não encontrado',
        code: 'HONORARIO_NOT_FOUND'
      });
    }

    if (honorario.status_pagamento !== 'GLOSADO') {
      return res.status(400).json({
        success: false,
        error: 'Apenas honorários glosados podem ter recurso',
        code: 'HONORARIO_NAO_GLOSADO'
      });
    }



    // Atualizar honorário com dados do recurso
    const honorarioAtualizado = await prisma.honorarios.update({
      where: { id: parseInt(id) },
      data: {
        recurso_enviado: true,
        status_recurso: 'PENDENTE',
        data_recurso: data_recurso ? new Date(data_recurso) : new Date(),
        motivo_recurso: motivo_recurso.trim()
      },
      include: {
        consulta: {
          include: {
            medico: { select: { nome_medico: true } },
            paciente: { select: { nome_paciente: true } }
          }
        },
        plano_saude: { select: { nome_plano: true } }
      }
    });

    // Registrar no histórico
    await prisma.historico_honorarios.create({
      data: {
        honorario_id: parseInt(id),
        tipo_evento: 'RECURSO_ENVIADO',
        descricao: `Recurso enviado contra glosa de R$ ${parseFloat(honorario.valor_glosa).toFixed(2)}`,
        dados_adicionais: {
          motivo: motivo_recurso.trim(),
          valor_glosa: parseFloat(honorario.valor_glosa)
        },
        usuario_id: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Recurso enviado com sucesso',
      data: { honorario: honorarioAtualizado }
    });

  } catch (error) {
    console.error('Erro ao enviar recurso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});


/*
 * ====================================================================
 * ROTA: PUT /api/honorarios/:id/recurso/status
 * DESCRIÇÃO: Atualizar status do recurso de glosa
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.put('/:id/recurso/status', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_recurso, valor_recuperado } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do honorário inválido',
        code: 'INVALID_ID'
      });
    }

    if (!status_recurso) {
      return res.status(400).json({
        success: false,
        error: 'Status do recurso é obrigatório',
        code: 'MISSING_STATUS_RECURSO'
      });
    }

    const statusValidos = ['PENDENTE', 'ACEITO_TOTAL', 'ACEITO_PARCIAL', 'NEGADO'];
    if (!statusValidos.includes(status_recurso)) {
      return res.status(400).json({
        success: false,
        error: 'Status do recurso inválido',
        code: 'INVALID_STATUS_RECURSO',
        valid_statuses: statusValidos
      });
    }

    // Verificar se o honorário existe e tem recurso enviado
    const honorario = await prisma.honorarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!honorario) {
      return res.status(404).json({
        success: false,
        error: 'Honorário não encontrado',
        code: 'HONORARIO_NOT_FOUND'
      });
    }

    if (!honorario.recurso_enviado) {
      return res.status(400).json({
        success: false,
        error: 'Honorário não possui recurso enviado',
        code: 'SEM_RECURSO_ENVIADO'
      });
    }

    // Calcular valor recuperado baseado no status
    let valorRecuperadoFinal = 0;
    if (status_recurso === 'ACEITO_TOTAL') {
      valorRecuperadoFinal = parseFloat(honorario.valor_glosa);
    } else if (status_recurso === 'ACEITO_PARCIAL') {
      if (!valor_recuperado || valor_recuperado <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor recuperado é obrigatório para recurso parcialmente aceito',
          code: 'MISSING_VALOR_RECUPERADO'
        });
      }
      valorRecuperadoFinal = parseFloat(valor_recuperado);
    }

    // Recalcular valores após recurso (matemática financeira correta)
    // Exemplo: Consulta R$ 400, Glosa R$ 100 → Recebeu R$ 300
    //          Recurso aceito parcial R$ 50 → Nova glosa R$ 50
    //          Total final recebido: R$ 350 (300 inicial + 50 recuperado)
    
    const glosaOriginal = parseFloat(honorario.valor_glosa);
    const novaGlosa = glosaOriginal - valorRecuperadoFinal; // Glosa mantida após recurso
    const novoValorLiquido = parseFloat(honorario.valor_consulta) - novaGlosa; // Total que será recebido
    
    // Buscar percentual de repasse do médico
    const consultaComMedico = await prisma.consultas.findUnique({
      where: { id: honorario.consulta_id },
      include: { medico: { select: { percentual_repasse: true } } }
    });
    const percentualRepasse = consultaComMedico.medico.percentual_repasse || 70.00;
    const novoValorRepasse = (novoValorLiquido * percentualRepasse) / 100;

    // Determinar novo status baseado no resultado do recurso
    let novoStatus = honorario.status_pagamento;
    if (status_recurso === 'ACEITO_TOTAL' && novaGlosa === 0) {
      // Glosa totalmente revertida - valor integral será pago
      novoStatus = 'PAGO'; // Considera como pago pois não há mais desconto
    } else if (status_recurso === 'ACEITO_PARCIAL' && novaGlosa > 0) {
      // Ainda há glosa, mas menor que a original
      novoStatus = 'GLOSADO'; // Mantém como glosado com valor reduzido
    } else if (status_recurso === 'NEGADO') {
      // Glosa mantida integralmente
      novoStatus = 'GLOSADO';
    }

    // Atualizar honorário com valores recalculados
    const honorarioAtualizado = await prisma.honorarios.update({
      where: { id: parseInt(id) },
      data: {
        status_recurso,
        valor_recuperado: valorRecuperadoFinal,
        valor_glosa: novaGlosa,
        valor_liquido: novoValorLiquido,
        valor_repasse_medico: Math.round(novoValorRepasse * 100) / 100,
        status_pagamento: novoStatus
      },
      include: {
        consulta: {
          include: {
            medico: { select: { nome_medico: true } },
            paciente: { select: { nome_paciente: true } }
          }
        },
        plano_saude: { select: { nome_plano: true } }
      }
    });

    // Registrar no histórico
    let descricaoStatus = '';
    let detalhesStatus = {};

    if (status_recurso === 'ACEITO_TOTAL') {
      descricaoStatus = 'Recurso aceito integralmente';
      detalhesStatus = {
        status: status_recurso,
        valor_recuperado: valorRecuperadoFinal,
        valor_glosa_original: parseFloat(honorario.valor_glosa),
        nova_glosa: novaGlosa,
        valor_liquido_novo: novoValorLiquido,
        mensagem: `Valor integral de R$ ${valorRecuperadoFinal.toFixed(2)} recuperado. Glosa zerada.`
      };
    } else if (status_recurso === 'ACEITO_PARCIAL') {
      descricaoStatus = 'Recurso parcialmente aceito';
      detalhesStatus = {
        status: status_recurso,
        valor_recuperado: valorRecuperadoFinal,
        valor_glosa_original: parseFloat(honorario.valor_glosa),
        nova_glosa: novaGlosa,
        valor_liquido_novo: novoValorLiquido,
        mensagem: `Valor recuperado: R$ ${valorRecuperadoFinal.toFixed(2)} de R$ ${parseFloat(honorario.valor_glosa).toFixed(2)}. Nova glosa: R$ ${novaGlosa.toFixed(2)}`
      };
    } else {
      descricaoStatus = 'Recurso negado';
      detalhesStatus = {
        status: status_recurso,
        valor_glosa_original: parseFloat(honorario.valor_glosa),
        nova_glosa: novaGlosa,
        mensagem: `Glosa mantida. Perda de R$ ${parseFloat(honorario.valor_glosa).toFixed(2)}`
      };
    }


    await prisma.historico_honorarios.create({
      data: {
        honorario_id: parseInt(id),
        tipo_evento: 'RECURSO_RESPONDIDO',
        descricao: descricaoStatus,
        dados_adicionais: detalhesStatus,
        usuario_id: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Status do recurso atualizado com sucesso',
      data: { honorario: honorarioAtualizado }
    });

  } catch (error) {
    console.error('Erro ao atualizar status do recurso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});


/*
 * ====================================================================
 * ROTA: GET /api/honorarios/:id/historico
 * DESCRIÇÃO: Buscar histórico de alterações de um honorário
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/:id/historico', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID do honorário inválido',
        code: 'INVALID_ID'
      });
    }

    // Verificar se o honorário existe
    const honorario = await prisma.honorarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!honorario) {
      return res.status(404).json({
        success: false,
        error: 'Honorário não encontrado',
        code: 'HONORARIO_NOT_FOUND'
      });
    }

    // Buscar histórico
    const historico = await prisma.historico_honorarios.findMany({
      where: { honorario_id: parseInt(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome_completo: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Histórico recuperado com sucesso',
      data: {
        honorario_id: parseInt(id),
        total_eventos: historico.length,
        historico
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA ADMINISTRATIVA: POST /api/honorarios/corrigir-valores
 * DESCRIÇÃO: Corrige valor_consulta de honorários inconsistentes
 * ACESSO: Apenas ADMIN
 * IMPORTANTE: Executar apenas UMA VEZ para corrigir dados históricos
 * ====================================================================
 */
router.post('/corrigir-valores', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔧 INICIANDO CORREÇÃO DE VALORES DE HONORÁRIOS...');
    
    // Buscar todos os honorários com suas consultas
    const honorarios = await prisma.honorarios.findMany({
      include: {
        consulta: {
          select: {
            id: true,
            valor_bruto: true,
            data_consulta: true,
            medico: { select: { nome_medico: true } }
          }
        }
      }
    });

    const inconsistencias = [];
    const correcoes = [];

    // Identificar inconsistências
    for (const h of honorarios) {
      const valorConsultaAtual = parseFloat(h.valor_consulta);
      const valorBrutoConsulta = parseFloat(h.consulta.valor_bruto);
      
      if (valorConsultaAtual !== valorBrutoConsulta) {
        inconsistencias.push({
          honorario_id: h.id,
          consulta_id: h.consulta_id,
          medico: h.consulta.medico.nome_medico,
          data: h.consulta.data_consulta,
          valor_atual: valorConsultaAtual,
          valor_correto: valorBrutoConsulta,
          diferenca: valorBrutoConsulta - valorConsultaAtual
        });
      }
    }

    console.log(`📊 Encontradas ${inconsistencias.length} inconsistências`);

    // Corrigir cada honorário inconsistente
    for (const inc of inconsistencias) {
      await prisma.honorarios.update({
        where: { id: inc.honorario_id },
        data: {
          valor_consulta: inc.valor_correto
          // NÃO altera valor_glosa, valor_liquido ou valor_repasse_medico
          // Esses valores dependem da glosa e serão recalculados conforme necessário
        }
      });

      correcoes.push({
        honorario_id: inc.honorario_id,
        valor_antigo: inc.valor_atual,
        valor_novo: inc.valor_correto,
        corrigido: true
      });

      console.log(`✅ Honorário ${inc.honorario_id}: ${inc.valor_atual} → ${inc.valor_correto}`);
    }

    res.status(200).json({
      success: true,
      message: `Correção concluída: ${correcoes.length} honorários corrigidos`,
      data: {
        total_honorarios: honorarios.length,
        inconsistencias_encontradas: inconsistencias.length,
        corrigidos: correcoes.length,
        detalhes: inconsistencias,
        correcoes
      }
    });

  } catch (error) {
    console.error('❌ Erro ao corrigir valores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao corrigir valores',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
});

module.exports = router;