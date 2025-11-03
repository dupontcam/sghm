const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

// Inicializa o Prisma Client
const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: POST /api/pacientes
 * DESCRIÇÃO: Cria um novo paciente
 * ====================================================================
 */
router.post('/', async (req, res) => {
  const {
    nome_paciente,
    cpf,
    data_nascimento,
    email,
    telefone,
    numero_carteirinha,
    plano_saude,
  } = req.body;

  // Validação básica (Exemplo: nome e cpf são obrigatórios)
  if (!nome_paciente || !cpf) {
    return res.status(400).json({
      error: 'Campos obrigatórios (nome_paciente, cpf) não foram preenchidos.',
    });
  }

  try {
    const novoPaciente = await prisma.pacientes.create({
      data: {
        nome_paciente,
        cpf,
        // Converte a data de string (ex: "AAAA-MM-DD") para um objeto Date
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        email,
        telefone,
        numero_carteirinha,
        plano_saude,
        // 'criado_em' e 'atualizado_em' são preenchidos pelo DB (DEFAULT NOW())
      },
    });

    res.status(201).json(novoPaciente);
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    // Erro (P2002): Violação de restrição única (ex: CPF duplicado)
    if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
      return res.status(409).json({ error: 'CPF já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro interno ao criar paciente.' });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/pacientes
 * DESCRIÇÃO: Lista todos os pacientes
 * ====================================================================
 */
router.get('/', async (req, res) => {
  try {
    const pacientes = await prisma.pacientes.findMany({
      orderBy: {
        nome_paciente: 'asc',
      },
    });
    res.status(200).json(pacientes);
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    res.status(500).json({ error: 'Erro interno ao listar pacientes.' });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/pacientes/:id
 * DESCRIÇÃO: Busca um paciente específico pelo ID
 * ====================================================================
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const paciente = await prisma.pacientes.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    res.status(200).json(paciente);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ error: 'Erro interno ao buscar paciente.' });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/pacientes/:id
 * DESCRIÇÃO: Atualiza um paciente existente
 * ====================================================================
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nome_paciente,
    cpf,
    data_nascimento,
    email,
    telefone,
    numero_carteirinha,
    plano_saude,
  } = req.body;

  try {
    const pacienteAtualizado = await prisma.pacientes.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nome_paciente,
        cpf,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
        email,
        telefone,
        numero_carteirinha,
        plano_saude,
        atualizado_em: new Date(), // Atualiza o timestamp
      },
    });

    res.status(200).json(pacienteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    // Erro P2025: Registro não encontrado para atualizar
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }
    // Erro (P2002): CPF duplicado ao tentar atualizar
    if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
      return res.status(409).json({ error: 'CPF já cadastrado em outro registro.' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar paciente.' });
  }
});

/*
 * ====================================================================
 * ROTA: DELETE /api/pacientes/:id
 * DESCRIÇÃO: Deleta um paciente
 * ====================================================================
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.pacientes.delete({
      where: {
        id: parseInt(id),
      },
    });

    // Sucesso, sem corpo de resposta
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar paciente:', error);

    // Erro P2025: Registro não encontrado para deletar
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    // Erro P2003: Restrição de chave estrangeira (Paciente vinculado a uma consulta)
    if (error.code === 'P2003') {
      return res.status(400).json({
        error:
          'Não é possível excluir este paciente, pois ele está associado a uma ou mais consultas.',
      });
    }

    res.status(500).json({ error: 'Erro interno ao deletar paciente.' });
  }
});

// Exporta o router para ser usado no server.js
module.exports = router;

