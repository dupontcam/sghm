// backend/routes/medicos.js
const express = require('express');
const router = express.Router();

// TODO: Conectar ao banco de dados PostgreSQL aqui

// --- Rotas para Médicos ---

// GET /api/medicos - Listar todos os médicos
router.get('/', async (req, res) => {
  try {
    // TODO: Buscar médicos no banco de dados
    console.log("Recebida requisição GET /api/medicos");
    const medicosMock = [ /* Seus dados mock se precisar testar */ ];
    res.json(medicosMock); // Enviar dados mock por enquanto
  } catch (err) {
    console.error("Erro ao buscar médicos:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// GET /api/medicos/:id - Obter um médico pelo ID
router.get('/:id', async (req, res) => {
  try {
    const medicoId = parseInt(req.params.id);
    // TODO: Buscar médico com o ID específico no banco
    console.log(`Recebida requisição GET /api/medicos/${medicoId}`);
    res.json({ id: medicoId, message: "Médico encontrado (placeholder)" }); // Placeholder
  } catch (err) {
    console.error("Erro ao buscar médico por ID:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// POST /api/medicos - Criar um novo médico
router.post('/', async (req, res) => {
  try {
    const novoMedico = req.body; // Dados vêm do corpo da requisição
    // TODO: Inserir novoMedico no banco de dados
    console.log("Recebida requisição POST /api/medicos com dados:", novoMedico);
    // TODO: Retornar o médico criado com o ID do banco
    res.status(201).json({ ...novoMedico, id: Date.now(), message: "Médico criado (placeholder)" }); // Placeholder com ID simulado
  } catch (err) {
    console.error("Erro ao criar médico:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// PUT /api/medicos/:id - Atualizar um médico existente
router.put('/:id', async (req, res) => {
  try {
    const medicoId = parseInt(req.params.id);
    const medicoAtualizado = req.body;
    // TODO: Atualizar médico com o ID específico no banco
    console.log(`Recebida requisição PUT /api/medicos/${medicoId} com dados:`, medicoAtualizado);
    res.json({ id: medicoId, ...medicoAtualizado, message: "Médico atualizado (placeholder)" }); // Placeholder
  } catch (err) {
    console.error("Erro ao atualizar médico:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// DELETE /api/medicos/:id - Excluir um médico
router.delete('/:id', async (req, res) => {
  try {
    const medicoId = parseInt(req.params.id);
    // TODO: Excluir médico com o ID específico no banco
    // TODO: Adicionar verificação de integridade referencial aqui também!
    console.log(`Recebida requisição DELETE /api/medicos/${medicoId}`);
    res.json({ message: `Médico ${medicoId} excluído com sucesso (placeholder)` }); // Placeholder
  } catch (err) {
    console.error("Erro ao excluir médico:", err.message);
    res.status(500).send('Erro no servidor');
  }
});


// Exporta o router para ser usado no server.js
module.exports = router;