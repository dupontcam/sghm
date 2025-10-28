// backend/routes/consultas.js
const express = require('express');
const router = express.Router();

// TODO: Conectar ao banco de dados PostgreSQL aqui

// --- Rotas para Consultas ---

// GET /api/consultas - Listar todas as consultas
router.get('/', async (req, res) => {
  try {
    // TODO: Buscar consultas no banco de dados (talvez com JOINs para nomes?)
    console.log("Recebida requisição GET /api/consultas");
    const consultasMock = [ /* Seus dados mock se precisar testar */ ];
    res.json(consultasMock); // Enviar dados mock por enquanto
  } catch (err) {
    console.error("Erro ao buscar consultas:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// GET /api/consultas/:id - Obter uma consulta pelo ID
router.get('/:id', async (req, res) => {
  try {
    const consultaId = parseInt(req.params.id);
    // TODO: Buscar consulta com o ID específico no banco
    console.log(`Recebida requisição GET /api/consultas/${consultaId}`);
    res.json({ id: consultaId, message: "Consulta encontrada (placeholder)" }); // Placeholder
  } catch (err) {
    console.error("Erro ao buscar consulta por ID:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// POST /api/consultas - Criar um novo registro de consulta
router.post('/', async (req, res) => {
  try {
    const novaConsulta = req.body;
    // TODO: Inserir novaConsulta no banco de dados
    console.log("Recebida requisição POST /api/consultas com dados:", novaConsulta);
    // TODO: Retornar a consulta criada com o ID do banco
    res.status(201).json({ ...novaConsulta, id: Date.now(), message: "Consulta criada (placeholder)" }); // Placeholder com ID simulado
  } catch (err) {
    console.error("Erro ao criar consulta:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// PUT /api/consultas/:id - Atualizar um registro de consulta existente
router.put('/:id', async (req, res) => {
  try {
    const consultaId = parseInt(req.params.id);
    const consultaAtualizada = req.body;
    // TODO: Atualizar consulta com o ID específico no banco
    console.log(`Recebida requisição PUT /api/consultas/${consultaId} com dados:`, consultaAtualizada);
    res.json({ id: consultaId, ...consultaAtualizada, message: "Consulta atualizada (placeholder)" }); // Placeholder
  } catch (err) {
    console.error("Erro ao atualizar consulta:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// DELETE /api/consultas/:id - Excluir um registro de consulta
router.delete('/:id', async (req, res) => {
  try {
    const consultaId = parseInt(req.params.id);
    // TODO: Excluir consulta com o ID específico no banco
    console.log(`Recebida requisição DELETE /api/consultas/${consultaId}`);
    res.json({ message: `Consulta ${consultaId} excluída com sucesso (placeholder)` }); // Placeholder
  } catch (err) {
    console.error("Erro ao excluir consulta:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Exporta o router para ser usado no server.js
module.exports = router;
