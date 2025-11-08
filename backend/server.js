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

// Importa e usa as rotas de Autenticação (SEM middleware de auth)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Importa e usa as rotas de Médicos
const medicosRoutes = require('./routes/medicos');
app.use('/api/medicos', medicosRoutes);

// Importa e usa as rotas de Pacientes
const pacientesRoutes = require('./routes/pacientes');
app.use('/api/pacientes', pacientesRoutes);

// Importa e usa as rotas de Consultas
const consultasRoutes = require('./routes/consultas');
app.use('/api/consultas', consultasRoutes);

// Importa e usa as rotas de Relatórios
const relatoriosRoutes = require('./routes/relatorios');
app.use('/api/relatorios', relatoriosRoutes);

// Importa e usa as rotas de Estatísticas
const estatisticasRoutes = require('./routes/estatisticas');
app.use('/api/estatisticas', estatisticasRoutes);

// Importa e usa as rotas de Planos de Saúde
const planosRoutes = require('./routes/planos');
app.use('/api/planos', planosRoutes);

// Importa e usa as rotas de Honorários
const honorariosRoutes = require('./routes/honorarios');
app.use('/api/honorarios', honorariosRoutes);

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`[servidor] API rodando na porta ${PORT}`);
  console.log(
    `[servidor] Conectado ao banco de dados: ${process.env.DATABASE_URL.split('@')[1].split(':')[0]}`,
  );
});

