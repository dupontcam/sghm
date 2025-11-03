// sghm/backend/server.js

// Importações principais
const express = require('express');
const cors = require('cors');
// IMPORTANTE: Carrega as variáveis do arquivo .env para 'process.env'
require('dotenv').config(); 

// Importa o cliente Prisma
const { PrismaClient } = require('@prisma/client');
// Cria uma instância ÚNICA do Prisma (Singleton).
// Isso é uma boa prática para evitar múltiplas conexões
const prisma = new PrismaClient();

// Importação das rotas
// Nossos arquivos de rotas vão esperar receber o 'prisma'
const medicosRoutes = require('./routes/medicos');
const pacientesRoutes = require('./routes/pacientes'); // Seu placeholder
const consultasRoutes = require('./routes/consultas'); // Seu placeholder

// Inicialização do App Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---

// 1. CORS: Permite que o seu frontend React (ex: localhost:3000)
// se comunique com este backend (localhost:5000)
app.use(cors());

// 2. JSON Parser: Permite que o Express entenda requisições com corpo (body) em JSON
app.use(express.json());

// 3. Middleware para injetar o Prisma no 'req'
// Isso evita ter que importar o prisma em todos os arquivos de rota
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// --- Rotas da API ---

// Rota de "saúde" básica para verificar se o servidor está online
app.get('/api/health', (req, res) => {
  res.json({ status: 'API está online e conectada!' });
});

// Rotas principais da aplicação
// Todo request para /api/medicos será gerenciado por 'medicosRoutes'
app.use('/api/medicos', medicosRoutes);

// Suas rotas placeholder (elas vão falhar se você não injetar o prisma nelas)
// Recomendo comentar as duas linhas abaixo até você atualizar
// 'pacientes.js' e 'consultas.js' com a lógica do Prisma.
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/consultas', consultasRoutes);

// --- Inicialização do Servidor ---

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}`);
});

// --- Gerenciamento de Desligamento (Boa Prática) ---
// Garante que o Prisma feche a conexão com o banco ao desligar o app
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

