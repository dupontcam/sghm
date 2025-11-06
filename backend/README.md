# 🏥 SGHM Backend - Sistema de Gestão Hospitalar

Sistema completo de gestão hospitalar com API RESTful, autenticação JWT e relatórios financeiros.

## 🚀 Início Rápido

### **Pré-requisitos**
- Node.js 18+
- PostgreSQL 16
- Docker (opcional)

### **Instalação**
```bash
# Clone o repositório
git clone https://github.com/dupontcam/sghm.git
cd sghm/backend

# Instalar dependências
npm install

# Configurar banco de dados
docker-compose up -d

# Executar migrações
npx prisma migrate dev

# Iniciar servidor
npm start
```

### **Configuração**
Crie um arquivo `.env`:
```env
DATABASE_URL="postgresql://sghm:sghm123@localhost:5432/sghm_db"
JWT_SECRET=seu_jwt_secret_super_secreto_aqui
JWT_EXPIRES_IN=24h
REFRESH_JWT_SECRET=seu_refresh_secret_super_secreto_aqui  
REFRESH_JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

## 📚 Documentação da API

Para documentação completa dos endpoints, consulte: [README_APIS.md](./README_APIS.md)

### **Endpoints Principais**

#### **🔐 Autenticação**
- `POST /api/auth/login` - Login com email/senha
- `GET /api/auth/me` - Perfil do usuário
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

#### **👥 Gestão**
- `GET/POST/PUT/DELETE /api/medicos` - CRUD Médicos
- `GET/POST/PUT/DELETE /api/pacientes` - CRUD Pacientes  
- `GET/POST/PUT/DELETE /api/consultas` - CRUD Consultas

#### **📊 Relatórios e Estatísticas**
- `GET /api/relatorios/dashboard` - Dashboard principal
- `GET /api/relatorios/financeiro` - Relatório financeiro
- `GET /api/estatisticas/resumo` - Estatísticas gerais
- `GET /api/estatisticas/medicos-top` - Ranking médicos

### **Teste Rápido**
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sghm.com","password":"admin123"}'

# Usar token retornado
curl -X GET http://localhost:3001/api/consultas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔧 Scripts Disponíveis

```bash
npm start          # Iniciar servidor de produção
npm run dev        # Iniciar em modo desenvolvimento
npm run db:migrate # Executar migrações do banco
npm run db:reset   # Resetar banco de dados
npm run db:seed    # Popular com dados de teste
```

## 🏗️ Arquitetura

```
backend/
├── prisma/          # Schema e migrações do banco
├── routes/          # Endpoints da API
│   ├── auth.js      # Autenticação JWT
│   ├── consultas.js # CRUD Consultas
│   ├── medicos.js   # CRUD Médicos
│   ├── pacientes.js # CRUD Pacientes
│   ├── relatorios.js# Relatórios
│   └── estatisticas.js # Estatísticas
├── middleware/      # Middlewares
│   └── auth.js      # Autenticação JWT
├── .env             # Variáveis de ambiente
├── server.js        # Servidor Express
└── README_APIS.md   # Documentação completa
```

## 🛠️ Tecnologias

- **Backend:** Node.js + Express.js
- **Banco:** PostgreSQL + Prisma ORM
- **Auth:** JWT (JSON Web Tokens)
- **Validação:** Express + middlewares personalizados
- **CORS:** Habilitado para frontend

## 🔒 Segurança

- ✅ Autenticação JWT com refresh tokens
- ✅ Senhas criptografadas com bcryptjs
- ✅ Middleware de proteção em todas as rotas
- ✅ Validação de entrada em todos endpoints
- ✅ CORS configurado adequadamente

## 📊 Banco de Dados

### **Entidades Principais:**
- **usuarios** - Sistema de autenticação
- **medicos** - Cadastro de médicos
- **pacientes** - Cadastro de pacientes
- **consultas** - Registro de consultas e faturamento

### **ENUMs:**
- `tipo_pagamento`: PARTICULAR, CONVENIO, SUS
- `status_pagamento`: PENDENTE, PAGO, GLOSA
- `role_usuario`: admin, user

## ⚡ Performance

- Queries otimizadas com Prisma ORM
- Índices configurados nas tabelas principais
- Paginação implementada nos listagens
- Cache de tokens JWT
- Conexão otimizada com PostgreSQL

## 🧪 Testes

Sistema testado com:
- ✅ Postman Collection completa
- ✅ Todos fluxos de autenticação
- ✅ CRUD completo de todas entidades
- ✅ Relatórios e estatísticas
- ✅ Filtros e paginação

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

**Desenvolvedor:** dupontcam  
**Repositório:** [github.com/dupontcam/sghm](https://github.com/dupontcam/sghm)

---

**Status:** 🟢 **Em Produção**  
**Versão:** 2.0  
**Última Atualização:** 06 de novembro de 2025