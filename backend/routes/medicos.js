// sghm/backend/routes/medicos.js
const express = require('express');
const router = express.Router();

// --- Rotas CRUD para /api/medicos ---
// Note que não precisamos mais importar 'prisma' aqui,
// pois ele está vindo via `req.prisma` (injetado no server.js)

// GET /api/medicos (Listar todos os médicos)
router.get('/', async (req, res) => {
  const prisma = req.prisma;
  
  try {
    const medicos = await prisma.medicos.findMany({
         orderBy: {
           nome_medico: 'asc'
         }
    });
    res.json(medicos);
  } catch (error) {
    console.error("Erro ao buscar médicos:", error);
    res.status(500).json({ error: 'Erro ao buscar médicos' });
  }
});

// GET /api/medicos/:id (Buscar um médico por ID)
router.get('/:id', async (req, res) => {
  const prisma = req.prisma;
  const { id } = req.params;

  try {
    const medico = await prisma.medicos.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!medico) {
      return res.status(44).json({ error: 'Médico não encontrado' });
    }
    
    res.json(medico);
  } catch (error) {
    console.error("Erro ao buscar médico:", error);
    res.status(500).json({ error: 'Erro ao buscar médico' });
  }
});

// POST /api/medicos (Criar um novo médico)
router.post('/', async (req, res) => {
  const prisma = req.prisma;
  const { nome_medico, especialidade, crm, cnpj_cpf, email, telefone } = req.body;

  // Validação simples (em um projeto real, usar Zod ou Joi)
  if (!nome_medico || !crm) {
    return res.status(400).json({ error: 'Nome do médico e CRM são obrigatórios' });
  }

  try {
    const novoMedico = await prisma.medicos.create({
      data: {
        nome_medico,
        especialidade,
        crm,
        cnpj_cpf,
        email,
        telefone,
      },
    });
    // Retorna 201 (Created) e o objeto criado
    res.status(201).json(novoMedico);
  } catch (error) {
    console.error("Erro ao criar médico:", error);
    // Código 'P2002' é o erro de violação de constraint única (ex: CRM ou email duplicado)
    if (error.code === 'P2002') {
        const field = error.meta.target.join(', ');
        return res.status(409).json({ error: `Já existe um médico com este ${field}.` });
    }
    res.status(500).json({ error: 'Erro ao criar médico' });
  }
});

// PUT /api/medicos/:id (Atualizar um médico existente)
router.put('/:id', async (req, res) => {
  const prisma = req.prisma;
  const { id } = req.params;
  const { nome_medico, especialidade, crm, cnpj_cpf, email, telefone } = req.body;

  try {
    const medicoAtualizado = await prisma.medicos.update({
      where: { id: parseInt(id) },
      data: {
        nome_medico,
        especialidade,
        crm,
        cnpj_cpf,
        email,
        telefone,
        // O Prisma só atualiza campos que não são 'undefined'
      },
    });
    res.json(medicoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar médico:", error);
     // Código 'P2025' é erro de "não encontrado" para atualização
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Médico não encontrado para atualização' });
    }
    if (error.code === 'P2002') {
        const field = error.meta.target.join(', ');
        return res.status(409).json({ error: `Já existe um médico com este ${field}.` });
    }
    res.status(500).json({ error: 'Erro ao atualizar médico' });
  }
});

// DELETE /api/medicos/:id (Deletar um médico)
router.delete('/:id', async (req, res) => {
  const prisma = req.prisma;
  const { id } = req.params;

  try {
    await prisma.medicos.delete({
      where: { id: parseInt(id) },
    });
    // Retorna 204 (No Content)
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar médico:", error);
    
    // Código 'P2025' é erro de "não encontrado" para deleção
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Médico não encontrado para deleção' });
    }
    // Código 'P2003' é erro de violação de chave estrangeira (ex: médico com consultas)
    if (error.code === 'P2003') {
        return res.status(409).json({ error: 'Não é possível deletar este médico pois ele está associado a consultas.' });
    }
    res.status(500).json({ error: 'Erro ao deletar médico' });
  }
});


module.exports = router;


// Exporta o router para ser usado no server.js
module.exports = router;