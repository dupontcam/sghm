const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

// Inicializa o Prisma Client
const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: POST /api/consultas
 * DESCRIÇÃO: Registra uma nova consulta
 * ====================================================================
 */
router.post('/', authenticateToken, async (req, res) => {
  const {
    medico_id,
    paciente_id,
    data_consulta,
    tipo_pagamento,
    status_pagamento,
    valor_bruto,
    valor_recebido,
    valor_glosa,
    data_recebimento,
    consultorio,
    protocolo,
    descricao_procedimento,
    plano_saude_id,
    numero_carteirinha,
  } = req.body;

  // Pega o ID do usuário logado do token JWT
  const usuario_id = req.user.id;

  console.log('POST /consultas - Body:', JSON.stringify(req.body, null, 2));
  console.log('Usuário logado (do token):', usuario_id);

  // Validação básica (Campos obrigatórios)
  if (!medico_id || !paciente_id || !data_consulta || !valor_bruto || !protocolo) {
    return res.status(400).json({
      error:
        'Campos obrigatórios (medico_id, paciente_id, data_consulta, valor_bruto, protocolo) não foram preenchidos.',
    });
  }

  try {
    const dataConsulta = {
      // Conecta as relações de Médico e Paciente
      medico: { connect: { id: parseInt(medico_id) } },
      paciente: { connect: { id: parseInt(paciente_id) } },

      // Usa o usuário logado para inclusão e alteração
      usuario_inclusao: { connect: { id: usuario_id } },
      usuario_alteracao: { connect: { id: usuario_id } },

      // Outros campos da consulta
      data_consulta: new Date(data_consulta),
      tipo_pagamento: tipo_pagamento || 'PARTICULAR',
      status_pagamento: status_pagamento || 'PENDENTE',
      valor_bruto: parseFloat(valor_bruto),

      // Campos opcionais de pagamento
      valor_recebido: valor_recebido ? parseFloat(valor_recebido) : null,
      valor_glosa: valor_glosa ? parseFloat(valor_glosa) : null,
      data_recebimento: data_recebimento ? new Date(data_recebimento) : null,

      // Campos diretos
      numero_carteirinha: numero_carteirinha || null,
      consultorio,
      protocolo,
      descricao_procedimento,
    };

    // Adiciona plano_saude se fornecido (relação)
    if (plano_saude_id) {
      dataConsulta.plano_saude = { connect: { id: parseInt(plano_saude_id) } };
    }

    const novaConsulta = await prisma.consultas.create({
      data: dataConsulta,
    });

    res.status(201).json(novaConsulta);
  } catch (error) {
    console.error('Erro ao registrar consulta:', error);
    if (error.code === 'P2003') {
      return res
        .status(400)
        .json({ error: 'Médico ou Paciente não encontrado (ID inválido).' });
    }
    if (error.code === 'P2002') {
      return res
        .status(409)
        .json({ error: `Conflito: O campo ${error.meta.target} já existe.` });
    }
    res.status(500).json({
      error: 'Erro interno ao registrar consulta.',
      details: error.message,
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/consultas
 * DESCRIÇÃO: Lista todas as consultas com dados do médico e paciente
 * QUERY PARAMS: medico_id, paciente_id, status_pagamento, data_inicio, data_fim
 * ====================================================================
 */
router.get('/', authenticateToken, async (req, res) => {
  const { medico_id, paciente_id, status_pagamento, data_inicio, data_fim } = req.query;

  try {
    // Construir filtros dinâmicos
    const where = {};

    if (medico_id && medico_id !== '0') {
      where.medico_id = parseInt(medico_id);
    }

    if (paciente_id && paciente_id !== '0') {
      where.paciente_id = parseInt(paciente_id);
    }

    if (status_pagamento && status_pagamento !== '') {
      where.status_pagamento = status_pagamento;
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

    const consultas = await prisma.consultas.findMany({
      where,
      orderBy: {
        data_consulta: 'desc', // Mais recentes primeiro
      },
      include: {
        medico: true,
        paciente: true,
        usuario_inclusao: true,
        usuario_alteracao: true,
      },
    });
    
    res.status(200).json({
      success: true,
      data: consultas,
      total: consultas.length,
      filtros: {
        medico_id: medico_id || null,
        paciente_id: paciente_id || null,
        status_pagamento: status_pagamento || null,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null
      }
    });
  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno ao listar consultas.',
      details: error.message 
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/consultas/:id
 * DESCRIÇÃO: Busca uma consulta específica (com médico e paciente)
 * ====================================================================
 */
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const consulta = await prisma.consultas.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        medico: true,
        paciente: true,
        usuario_inclusao: true,
        usuario_alteracao: true,
      },
    });

    if (!consulta) {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }

    res.status(200).json(consulta);
  } catch (error) {
    console.error('Erro ao buscar consulta:', error);
    res.status(500).json({ error: 'Erro interno ao buscar consulta.' });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/consultas/:id
 * DESCRIÇÃO: Atualiza uma consulta (ex: Controle Financeiro)
 * ====================================================================
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  console.log(`PUT /consultas/${id} - Body:`, JSON.stringify(req.body, null, 2));
  console.log('Usuário logado (do token):', req.user?.id);
  
  const {
    medico_id,
    paciente_id,
    data_consulta,
    tipo_pagamento,
    status_pagamento,
    valor_bruto,
    valor_recebido,
    data_recebimento,
    valor_pago, // Nome antigo (vem do body)
    data_pagamento, // Nome antigo (vem do body)
    glosa_valor, // Nome antigo (vem do body)
    consultorio,
    protocolo,
    descricao_procedimento,
  } = req.body;

  // Obter o ID do usuário autenticado
  const usuario_id = req.user.id;

  const dataToUpdate = {
    medico: medico_id ? { connect: { id: parseInt(medico_id) } } : undefined,
    paciente: paciente_id
      ? { connect: { id: parseInt(paciente_id) } }
      : undefined,
    usuario_alteracao: { connect: { id: usuario_id } },

    // Campos normais
    data_consulta: data_consulta ? new Date(data_consulta) : undefined,
    tipo_pagamento,
    status_pagamento,
    valor_bruto: valor_bruto ? parseFloat(valor_bruto) : undefined,

    // Campos de pagamento (prioriza novos nomes, fallback para antigos)
    valor_recebido: valor_recebido ? parseFloat(valor_recebido) : (valor_pago ? parseFloat(valor_pago) : undefined),
    data_recebimento: data_recebimento ? new Date(data_recebimento) : (data_pagamento ? new Date(data_pagamento) : undefined),
    valor_glosa: glosa_valor ? parseFloat(glosa_valor) : undefined,

    consultorio,
    protocolo,
    descricao_procedimento,
    updated_at: new Date(),
  };

  try {
    const consultaAtualizada = await prisma.consultas.update({
      where: {
        id: parseInt(id),
      },
      data: dataToUpdate,
    });

    res.status(200).json(consultaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }
    if (error.code === 'P2003') {
      return res
        .status(400)
        .json({ error: 'Médico ou Paciente não encontrado (ID inválido).' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar consulta.' });
  }
});

/*
 * ====================================================================
 * ROTA: DELETE /api/consultas/:id
 * DESCRIÇÃO: Deleta uma consulta
 * ====================================================================
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.consultas.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }
    res.status(500).json({ error: 'Erro interno ao deletar consulta.' });
  }
});

// Exporta o router para ser usado no server.js
module.exports = router;

