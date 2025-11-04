const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

// Inicializa o Prisma Client
// (Assumindo que está no mesmo nível do server.js que inicializa o prisma)
const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: POST /api/medicos
 * DESCRIÇÃO: Cria um novo médico
 * ====================================================================
 */
router.post('/', authenticateToken, async (req, res) => {
  // Pega os dados do corpo da requisição (JSON)
  const { nome_medico, especialidade, crm, cnpj_cpf, email, telefone } = req.body;

  // Validação básica (Exemplo: CRM é obrigatório)
  if (!nome_medico || !crm) {
    return res.status(400).json({
      error: 'Campos obrigatórios (nome_medico, crm) não foram preenchidos.',
    });
  }

  try {
    // Tenta criar o novo médico no banco de dados
    const novoMedico = await prisma.medicos.create({
      data: {
        nome_medico,
        especialidade,
        crm,
        cnpj_cpf,
        email,
        telefone,
        // As colunas 'criado_em' e 'atualizado_em' serão preenchidas
        // automaticamente pelo banco de dados (DEFAULT NOW())
      },
    });

    // Retorna o médico recém-criado com status 201 (Created)
    res.status(201).json(novoMedico);
  } catch (error) {
    console.error('Erro ao criar médico:', error);
    // Tratamento de erro (ex: CRM duplicado)
    if (error.code === 'P2002' && error.meta?.target?.includes('crm')) {
      return res.status(409).json({ error: 'CRM já cadastrado.' });
    }
    // Erro genérico
    res.status(500).json({ error: 'Erro interno ao criar médico.' });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/medicos
 * DESCRIÇÃO: Lista todos os médicos
 * ====================================================================
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const medicos = await prisma.medicos.findMany({
      // Opcional: ordenar por nome
      orderBy: {
        nome_medico: 'asc',
      },
    });
    res.status(200).json(medicos);
  } catch (error) {
    console.error('Erro ao listar médicos:', error);
    res.status(500).json({ error: 'Erro interno ao listar médicos.' });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/medicos/:id
 * DESCRIÇÃO: Busca um médico específico pelo ID
 * ====================================================================
 */
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const medico = await prisma.medicos.findUnique({
      where: {
        id: parseInt(id), // Converte o ID da URL para número
      },
    });

    // Se o médico não for encontrado, retorna 404
    if (!medico) {
      return res.status(404).json({ error: 'Médico não encontrado.' });
    }

    res.status(200).json(medico);
  } catch (error) {
    console.error('Erro ao buscar médico:', error);
    res.status(500).json({ error: 'Erro interno ao buscar médico.' });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/medicos/:id
 * DESCRIÇÃO: Atualiza um médico existente
 * ====================================================================
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nome_medico, especialidade, crm, cnpj_cpf, email, telefone } = req.body;

  try {
    const medicoAtualizado = await prisma.medicos.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nome_medico,
        especialidade,
        crm,
        cnpj_cpf,
        email,
        telefone,
        atualizado_em: new Date(), // Atualiza o timestamp
      },
    });

    res.status(200).json(medicoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar médico:', error);
    // Erro P2025: O registro que você tentou atualizar não existe
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Médico não encontrado.' });
    }
    // Erro P2002: CRM duplicado ao tentar atualizar
    if (error.code === 'P2002' && error.meta?.target?.includes('crm')) {
      return res.status(409).json({ error: 'CRM já cadastrado em outro registro.' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar médico.' });
  }
});

/*
 * ====================================================================
 * ROTA: DELETE /api/medicos/:id
 * DESCRIÇÃO: Deleta um médico
 * ====================================================================
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.medicos.delete({
      where: {
        id: parseInt(id),
      },
    });

    // Retorna 204 No Content (Sucesso, sem corpo de resposta)
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar médico:', error);

    // Erro P2025: O registro que você tentou deletar não existe
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Médico não encontrado.' });
    }

    // Erro P2003: Restrição de chave estrangeira (Integridade Referencial)
    // Isso acontece se o médico estiver vinculado a uma consulta
    if (error.code === 'P2003') {
      return res.status(400).json({
        error:
          'Não é possível excluir este médico, pois ele está associado a uma ou mais consultas.',
      });
    }

    res.status(500).json({ error: 'Erro interno ao deletar médico.' });
  }
});

// Exporta o router para ser usado no server.js
module.exports = router;

