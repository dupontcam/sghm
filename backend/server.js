// 1. Importar as dependências
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// 2. Criar a aplicação Express
const app = express();

// 3. Configurar Middlewares
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json()); // Habilita o servidor a entender JSON no corpo das requisições

// 4. Definir a Porta
// Usará a porta definida no .env ou 5000 como padrão
const PORT = process.env.PORT || 5000; 

// 5. Rota de Teste (Exemplo)
// Quando alguém acessar a raiz "/", envia uma mensagem
app.get('/', (req, res) => {
  res.send('API do SGHM está rodando!');
});

// --- Futuras Configurações ---
// TODO: Configurar a conexão com o banco de dados PostgreSQL (usando 'pg')
// TODO: Importar e usar os arquivos de rotas (ex: app.use('/api/medicos', medicoRoutes);)
// --- Fim das Futuras Configurações ---

// 6. Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});