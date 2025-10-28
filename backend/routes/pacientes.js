// backend/routes/pacientes.js
const express = require('express');
const router = express.Router();

// TODO: Conectar ao banco de dados PostgreSQL aqui

// --- Rotas para Pacientes ---

// GET /api/pacientes - Listar todos os pacientes
router.get('/', async (req, res) => {
  try {
    // TODO: Buscar pacientes no banco de dados
    console.log("Recebida requisição GET /api/pacientes");
    const pacientesMock = [ /* Seus dados mock se precisar testar */ ];
    res.json(pacientesMock); // Enviar dados mock por enquanto
  } catch (err) {
    console.error("Erro ao buscar pacientes:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// GET /api/pacientes/:id - Obter um paciente pelo ID
router.get('/:id', async (req, res) => {
  try {
    const pacienteId = parseInt(req.params.id);
    // TODO: Buscar paciente com o ID específico no banco
    console.log(`Recebida requisição GET /api/pacientes/${pacienteId}`);
    res.json({ id: pacienteId, message: "Paciente encontrado (placeholder)" }); // Placeholder
  } catch (err) {
    console.error("Erro ao buscar paciente por ID:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// POST /api/pacientes - Criar um novo paciente
router.post('/', async (req, res) => {
  try {
    const novoPaciente = req.body;
    // TODO: Inserir novoPaciente no banco de dados
    console.log("Recebida requisição POST /api/pacientes com dados:", novoPaciente);
    // TODO: Retornar o paciente criado com o ID do banco
    res.status(201).json({ ...novoPaciente, id: Date.now(), message: "Paciente criado (placeholder)" }); // Placeholder com ID simulado
  } catch (err) {
    console.error("Erro ao criar paciente:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// PUT /api/pacientes/:id - Atualizar um paciente existente
router.put('/:id', async (req, res) => {
  try {
    const pacienteId = parseInt(req.params.id);
    const pacienteAtualizado = req.body;
    // TODO: Atualizar paciente com o ID específico no banco
    console.log(`Recebida requisição PUT /api/pacientes/${pacienteId} com dados:`, pacienteAtualizado);
    res.json({ id: pacienteId, ...pacienteAtualizado, message: "Paciente atualizado (placeholder)" }); // Placeholder
  } catch (err) {
    console.error("Erro ao atualizar paciente:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// DELETE /api/pacientes/:id - Excluir um paciente
router.delete('/:id', async (req, res) => {
  try {
    const pacienteId = parseInt(req.params.id);
    // TODO: Excluir paciente com o ID específico no banco
    // TODO: Adicionar verificação de integridade referencial aqui também!
    console.log(`Recebida requisição DELETE /api/pacientes/${pacienteId}`);
    res.json({ message: `Paciente ${pacienteId} excluído com sucesso (placeholder)` }); // Placeholder
  } catch (err) {
    console.error("Erro ao excluir paciente:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Exporta o router para ser usado no server.js
module.exports = router;