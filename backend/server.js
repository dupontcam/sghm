// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

console.log('[DEBUG] 1. Iniciando servidor...');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

console.log('[DEBUG] 2. Pacotes carregados');

// Inicializa o Prisma Client
const prisma = new PrismaClient();

console.log('[DEBUG] 3. Prisma Client inicializado');

// Inicializa o aplicativo Express
const app = express();
const PORT = process.env.PORT || 5000;

console.log('[DEBUG] 4. Express inicializado');
console.log(`[DEBUG] 4.1. PORT configurado para: ${PORT}`);

// --- Middlewares de Segurança ---

// Helmet: Protege headers HTTP
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para permitir recursos externos
  crossOriginEmbedderPolicy: false
}));

// CORS: Configuração restrita
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://sghm.vercel.app'])
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting Global: Proteção contra DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate Limiting para Autenticação: Proteção contra brute force
// Em desenvolvimento, tornamos mais permissivo para facilitar testes
const isDev = process.env.NODE_ENV !== 'production';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDev ? 100 : 5, // Em dev: 100 tentativas; em prod: 5
  message: {
    error: 'Muitas tentativas de login, tente novamente em 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware para parsing de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('[DEBUG] 5. Middlewares configurados');

// --- Rotas da API ---
// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'API do SGHM está funcionando!' });
});

console.log('[DEBUG] 6. Carregando rotas...');

// Importa e usa as rotas de Autenticação (SEM middleware de auth)
console.log('[DEBUG] 6.1. Carregando auth routes');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authLimiter, authRoutes); // Aplica rate limiting específico (dev-friendly em NODE_ENV!=production)

// Importa e usa as rotas de Médicos
console.log('[DEBUG] 6.2. Carregando medicos routes');
const medicosRoutes = require('./routes/medicos');
app.use('/api/medicos', medicosRoutes);

// Importa e usa as rotas de Pacientes
console.log('[DEBUG] 6.3. Carregando pacientes routes');
const pacientesRoutes = require('./routes/pacientes');
app.use('/api/pacientes', pacientesRoutes);

// Importa e usa as rotas de Consultas
console.log('[DEBUG] 6.4. Carregando consultas routes');
const consultasRoutes = require('./routes/consultas');
app.use('/api/consultas', consultasRoutes);

// Importa e usa as rotas de Relatórios
console.log('[DEBUG] 6.5. Carregando relatorios routes');
const relatoriosRoutes = require('./routes/relatorios');
app.use('/api/relatorios', relatoriosRoutes);

// Importa e usa as rotas de Estatísticas
console.log('[DEBUG] 6.6. Carregando estatisticas routes');
const estatisticasRoutes = require('./routes/estatisticas');
app.use('/api/estatisticas', estatisticasRoutes);

// Importa e usa as rotas de Planos de Saúde
console.log('[DEBUG] 6.7. Carregando planos routes');
const planosRoutes = require('./routes/planos');
app.use('/api/planos', planosRoutes);

// Importa e usa as rotas de Honorários
console.log('[DEBUG] 6.8. Carregando honorarios routes');
const honorariosRoutes = require('./routes/honorarios');
app.use('/api/honorarios', honorariosRoutes);

console.log('[DEBUG] 7. Todas as rotas carregadas');

// --- Inicialização do Servidor ---
console.log('[DEBUG] 8. Iniciando servidor HTTP...');
console.log(`[DEBUG] 8.1. Tentando bind na porta ${PORT}...`);

const server = app.listen(PORT, () => {
  const address = server.address();
  console.log(`[servidor] API rodando na porta ${PORT}`);
  console.log(`[DEBUG] 9.1. Address do servidor:`, address);
  console.log(
    `[servidor] Conectado ao banco de dados: ${process.env.DATABASE_URL.split('@')[1].split(':')[0]}`,
  );
  console.log('[DEBUG] 9. Servidor iniciado com sucesso!');
  console.log(`[INFO] Acesse: http://localhost:${PORT}/api`);
});

server.on('error', (error) => {
  console.error('[ERRO] Falha ao iniciar servidor:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`[ERRO] Porta ${PORT} já está em uso!`);
  }
  process.exit(1);
});

