// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Inicializa o Prisma Client
const prisma = new PrismaClient();

// Inicializa o aplicativo Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
// Habilita o CORS para permitir que o frontend React faça requisições
app.use(cors());
// Habilita o Express para entender JSON no corpo das requisições
app.use(express.json());

// --- Rotas da API ---
// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'API do SGHM está funcionando!' });
});

// Importa e usa as rotas de Médicos
const medicosRoutes = require('./routes/medicos');
app.use('/api/medicos', medicosRoutes);

// Importa e usa as rotas de Pacientes
const pacientesRoutes = require('./routes/pacientes');
app.use('/api/pacientes', pacientesRoutes);

// Importa e usa as rotas de Consultas
const consultasRoutes = require('./routes/consultas');
app.use('/api/consultas', consultasRoutes);

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`[servidor] API rodando na porta ${PORT}`);
  console.log(
    `[servidor] Conectado ao banco de dados: ${process.env.DATABASE_URL.split('@')[1].split(':')[0]}`,
  );
});

