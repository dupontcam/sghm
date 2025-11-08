# 🏥 SGHM Backend - Sistema de Gestão de Honorários Médicos

Sistema completo de gestão de honorários médicos pós-consulta com API RESTful, autenticação JWT, dashboard financeiro e controle de glosas.

## 🆕 **Novidades da Versão 3.0**

✅ **Planos de Saúde:** CRUD completo para gestão de operadoras  
✅ **Honorários Médicos:** Sistema completo de controle financeiro  
✅ **Dashboard Avançado:** Estatísticas detalhadas dos últimos 30 dias  
✅ **Relatórios Médicos:** Relatórios individuais por médico e período  
✅ **Gestão de Glosas:** Controle completo de glosas e motivos  
✅ **37 Endpoints Funcionais:** Sistema 100% testado

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
- `POST /api/auth/create-user` - Criar usuário (Admin)
- `GET /api/auth/users` - Listar usuários (Admin)

#### **🏥 Planos de Saúde**
- `GET /api/planos` - Listar planos de saúde
- `POST /api/planos` - Criar plano (Admin)
- `GET /api/planos/:id` - Buscar plano por ID
- `PUT /api/planos/:id` - Atualizar plano (Admin)
- `DELETE /api/planos/:id` - Deletar plano (Admin)

#### **💰 Honorários Médicos**
- `GET /api/honorarios` - Listar honorários
- `POST /api/honorarios` - Criar honorário
- `GET /api/honorarios/dashboard` - Dashboard financeiro
- `PUT /api/honorarios/:id` - Atualizar status/glosa
- `GET /api/honorarios/relatorio-medico/:id` - Relatório médico

#### **👥 Gestão Básica**
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
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sghm.com","senha":"admin123"}'

# 2. Listar planos de saúde
curl -X GET http://localhost:3001/api/planos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Dashboard de honorários
curl -X GET http://localhost:3001/api/honorarios/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 4. Listar honorários
curl -X GET http://localhost:3001/api/honorarios \
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
│   ├── planos.js    # CRUD Planos de Saúde
│   ├── honorarios.js# CRUD Honorários + Dashboard
│   ├── consultas.js # CRUD Consultas
│   ├── medicos.js   # CRUD Médicos
│   ├── pacientes.js # CRUD Pacientes
│   ├── relatorios.js# Relatórios
│   └── estatisticas.js # Estatísticas
├── middleware/      # Middlewares
│   └── auth.js      # Autenticação JWT
├── migration_manual.sql    # Migração manual aplicada
├── dados_exemplo.sql       # Dados de exemplo
├── .env             # Variáveis de ambiente
├── server.js        # Servidor Express
├── README_APIS.md   # Documentação completa
└── POSTMAN_COLLECTION.md   # Collection v3.0
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
- **usuarios** - Sistema de autenticação e autorização
- **medicos** - Cadastro de médicos com especialidades
- **pacientes** - Cadastro de pacientes
- **consultas** - Registro de consultas realizadas
- **planos_saude** - Operadoras e planos de saúde
- **honorarios** - Controle financeiro pós-consulta

### **ENUMs:**
- `tipo_pagamento`: PARTICULAR, CONVENIO, SUS
- `status_pagamento`: PENDENTE, PAGO, GLOSA
- `status_honorario`: PENDENTE, ENVIADO, PAGO, GLOSADO, CANCELADO
- `tipo_plano`: CONVENIO, PARTICULAR, SUS
- `role_usuario`: ADMIN, OPERADOR

## ⚡ Performance

- Queries otimizadas com Prisma ORM
- Índices configurados nas tabelas principais
- Paginação implementada nos listagens
- Cache de tokens JWT
- Conexão otimizada com PostgreSQL

## 🧪 Testes

Sistema testado com:
- ✅ **37 Endpoints Funcionais:** Todas as APIs testadas
- ✅ **Postman Collection v3.0:** Collection completa atualizada  
- ✅ **Autenticação JWT:** Login, refresh e logout
- ✅ **CRUD Completo:** Planos, honorários, médicos, pacientes
- ✅ **Dashboard Financeiro:** Estatísticas dos últimos 30 dias
- ✅ **Gestão de Glosas:** Controle completo de glosas e motivos
- ✅ **Relatórios Médicos:** Relatórios individuais por período
- ✅ **Filtros e Paginação:** Todas as listagens com filtros

### **Dados de Demonstração:**
- 6 planos de saúde configurados (Unimed, Bradesco, Amil, SUS, SulAmérica, Particular)
- 10 honorários de exemplo com diferentes status
- Dashboard com valor total: R$ 1.275,00
- Taxa de glosa: 2,96%

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

**Status:** 🟢 **100% Funcional e Testado**  
**Versão:** 3.0  
**APIs Implementadas:** 37 endpoints  
**Última Atualização:** 08 de novembro de 2025

### 📊 **Estatísticas do Sistema:**
- **Planos de Saúde:** 6 operadoras configuradas
- **Honorários Processados:** R$ 1.275,00 (valor total)
- **Taxa de Glosa:** 2,96% 
- **Valor Líquido:** R$ 1.237,20
- **Sistema:** 100% testado e funcional