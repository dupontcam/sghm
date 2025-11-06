# 🔐 API Completa SGHM Backend - Sistema de Gestão de Honorários Médicos

Esta documentação descreve **todas as APIs implementadas** incluindo autenticação JWT, relatórios financeiros, estatísticas e CRUD completo do sistema SGHM.

## 🚀 **Base URL**
```
http://localhost:3001/api
```

## � **SISTEMA DE AUTENTICAÇÃO JWT**

### **🔐 Login**
```http
POST /api/auth/login
```

**Body (JSON):**
```json
{
  "email": "admin@sghm.com",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@sghm.com",
    "nome": "Administrador",
    "role": "admin"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "24h"
  }
}
```

### **👤 Perfil do Usuário**
```http
GET /api/auth/me
Authorization: Bearer {access_token}
```

### **🔄 Renovar Token**
```http
POST /api/auth/refresh
```

**Body (JSON):**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **🚪 Logout**
```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

### **👥 Registro de Usuário**
```http
POST /api/auth/register
```

**Body (JSON):**
```json
{
  "email": "novo@sghm.com",
  "password": "senha123",
  "nome": "Novo Usuário",
  "role": "user"
}
```

---

## 🩺 **ENDPOINTS DE MÉDICOS**
> ⚠️ **Todas as rotas requerem autenticação JWT**

### **📋 Listar Médicos**
```http
GET /api/medicos
Authorization: Bearer {access_token}
```

### **👨‍⚕️ Buscar Médico por ID**
```http
GET /api/medicos/{id}
Authorization: Bearer {access_token}
```

### **➕ Criar Médico**
```http
POST /api/medicos
Authorization: Bearer {access_token}
```

**Body (JSON):**
```json
{
  "nome_medico": "Dr. João Silva",
  "especialidade": "Cardiologia",
  "crm": "12345",
  "telefone": "(11) 99999-9999",
  "email": "joao@clinica.com"
}
```

### **✏️ Atualizar Médico**
```http
PUT /api/medicos/{id}
Authorization: Bearer {access_token}
```

### **🗑️ Deletar Médico**
```http
DELETE /api/medicos/{id}
Authorization: Bearer {access_token}
```

---

## 👥 **ENDPOINTS DE PACIENTES**
> ⚠️ **Todas as rotas requerem autenticação JWT**

### **📋 Listar Pacientes**
```http
GET /api/pacientes
Authorization: Bearer {access_token}
```

### **👤 Buscar Paciente por ID**
```http
GET /api/pacientes/{id}
Authorization: Bearer {access_token}
```

### **➕ Criar Paciente**
```http
POST /api/pacientes
Authorization: Bearer {access_token}
```

**Body (JSON):**
```json
{
  "nome_paciente": "Maria Santos",
  "cpf": "123.456.789-00",
  "data_nascimento": "1985-05-15",
  "telefone": "(11) 88888-8888",
  "endereco": "Rua das Flores, 123"
}
```

### **✏️ Atualizar Paciente**
```http
PUT /api/pacientes/{id}
Authorization: Bearer {access_token}
```

### **🗑️ Deletar Paciente**
```http
DELETE /api/pacientes/{id}
Authorization: Bearer {access_token}
```

---

## 📅 **ENDPOINTS DE CONSULTAS**
> ⚠️ **Todas as rotas requerem autenticação JWT**

### **📋 Listar Consultas com Filtros**
```http
GET /api/consultas
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `medico_id` (opcional) - ID do médico
- `paciente_id` (opcional) - ID do paciente  
- `status_pagamento` (opcional) - PENDENTE, PAGO, GLOSA
- `data_inicio` (opcional) - Data inicial (YYYY-MM-DD)
- `data_fim` (opcional) - Data final (YYYY-MM-DD)

**Exemplo:**
```
GET /api/consultas?medico_id=3&status_pagamento=PENDENTE&data_inicio=2025-01-01
Authorization: Bearer {access_token}
```

### **🔍 Buscar Consulta por ID**
```http
GET /api/consultas/{id}
Authorization: Bearer {access_token}
```

### **➕ Criar Consulta**
```http
POST /api/consultas
Authorization: Bearer {access_token}
```

**Body (JSON):**
```json
{
  "data_consulta": "2025-11-10",
  "protocolo": "PROT-2025-001",
  "consultorio": "Sala 1",
  "tipo_pagamento": "CONVENIO",
  "valor_bruto": 250.00,
  "valor_glosa": 0.00,
  "valor_recebido": 250.00,
  "data_recebimento": "2025-11-10",
  "status_pagamento": "PAGO",
  "descricao_procedimento": "Consulta cardiológica",
  "medico_id": 2,
  "paciente_id": 5
}
```

### **✏️ Atualizar Consulta**
```http
PUT /api/consultas/{id}
Authorization: Bearer {access_token}
```

### **🗑️ Deletar Consulta**
```http
DELETE /api/consultas/{id}
Authorization: Bearer {access_token}
```

---

## 📈 **ENDPOINTS DE RELATÓRIOS**
> ⚠️ **Todas as rotas requerem autenticação JWT**

### **💰 Relatório Financeiro Completo**
```http
GET /api/relatorios/financeiro
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `medico_id` (opcional) - ID do médico (0 = todos)
- `data_inicio` (opcional) - Data inicial (YYYY-MM-DD)
- `data_fim` (opcional) - Data final (YYYY-MM-DD)
- `status_pagamento` (opcional) - PENDENTE, PAGO, GLOSA

**Exemplo:**
```
GET /api/relatorios/financeiro?medico_id=3&data_inicio=2025-01-01&data_fim=2025-12-31&status_pagamento=PAGO
Authorization: Bearer {access_token}
```

### **📊 Dashboard Principal**
```http
GET /api/relatorios/dashboard
Authorization: Bearer {access_token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "estatisticas": {
      "totalConsultas": 150,
      "totalFaturado": 45000.00,
      "totalPago": 38000.00,
      "totalGlosado": 3000.00,
      "totalPendente": 4000.00,
      "taxaGlosa": 6.7
    },
    "pieData": [
      {"name": "Pendente", "value": 20, "color": "#ffc107"},
      {"name": "Pago", "value": 120, "color": "#28a745"},
      {"name": "Glosado", "value": 10, "color": "#dc3545"}
    ],
    "faturamentoPorMes": [...]
  }
}
```

### **📅 Resumo por Período**
```http
GET /api/relatorios/resumo-periodo?data_inicio=2025-01-01&data_fim=2025-01-31
Authorization: Bearer {access_token}
```

---

## 📊 **ENDPOINTS DE ESTATÍSTICAS**
> ⚠️ **Todas as rotas requerem autenticação JWT**

### **📈 Resumo Geral**
```http
GET /api/estatisticas/resumo
Authorization: Bearer {access_token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "contadores": {
      "totalConsultas": 150,
      "totalMedicos": 12,
      "totalPacientes": 85,
      "consultasPendentes": 20,
      "consultasPagas": 120,
      "consultasGlosadas": 10
    },
    "financeiro": {
      "valorTotal": 45000.00,
      "valorPago": 38000.00,
      "valorGlosado": 3000.00,
      "valorPendente": 4000.00,
      "taxaGlosa": 6.7
    }
  }
}
```

### **🏆 Top Médicos por Número de Consultas**
```http
GET /api/estatisticas/medicos-top?limit=5
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit` (opcional, padrão: 5) - Número de médicos no ranking

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "medico_id": 5,
      "nome": "Dr. João Silva",
      "especialidade": "Cardiologia",
      "total_consultas": 15,
      "valor_faturado": 3500.00,
      "valor_recebido": 3200.00,
      "posicao": 1
    }
  ],
  "total_retornados": 5,
  "limite_solicitado": 5
}
```

### **💰 Top Médicos por Faturamento**
```http
GET /api/estatisticas/medicos-faturamento?limit=3
Authorization: Bearer {access_token}
```

### **📊 Faturamento Mensal (12 meses)**
```http
GET /api/estatisticas/faturamento-mensal
Authorization: Bearer {access_token}
```

---

## 🧪 **EXEMPLOS DE TESTE NO POSTMAN**

### **1. Fluxo Completo de Autenticação**

#### **Passo 1: Login**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@sghm.com",
  "password": "admin123"
}
```

#### **Passo 2: Usar Token nas Requisições**
```http
GET http://localhost:3001/api/consultas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Passo 3: Renovar Token**
```http
POST http://localhost:3001/api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **Passo 4: Logout**
```http
POST http://localhost:3001/api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Testes de Endpoints**

#### **Dashboard:**
```http
GET http://localhost:3001/api/relatorios/dashboard
Authorization: Bearer {seu_token}
```

#### **Consultas com Filtros:**
```http
GET http://localhost:3001/api/consultas?status_pagamento=PENDENTE&limit=10
Authorization: Bearer {seu_token}
```

#### **Top Médicos:**
```http
GET http://localhost:3001/api/estatisticas/medicos-top?limit=3
Authorization: Bearer {seu_token}
```

#### **Criar Consulta:**
```http
POST http://localhost:3001/api/consultas
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "data_consulta": "2025-11-10",
  "protocolo": "PROT-2025-100",
  "consultorio": "Sala 2",
  "tipo_pagamento": "PARTICULAR",
  "valor_bruto": 300.00,
  "valor_recebido": 300.00,
  "status_pagamento": "PAGO",
  "descricao_procedimento": "Consulta de rotina",
  "medico_id": 2,
  "paciente_id": 3
}
```

---

## ⚙️ **CONFIGURAÇÃO DO AMBIENTE**

### **Dependências:**
```json
{
  "express": "^4.18.2",
  "prisma": "^6.18.0",
  "@prisma/client": "^6.18.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3"
}
```

### **Variáveis de Ambiente (.env):**
```env
# Banco de dados
DATABASE_URL="postgresql://sghm:sghm123@localhost:5432/sghm_db"

# JWT
JWT_SECRET=seu_jwt_secret_super_secreto_aqui
JWT_EXPIRES_IN=24h
REFRESH_JWT_SECRET=seu_refresh_secret_super_secreto_aqui  
REFRESH_JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development
```

### **Banco de Dados:**
- ✅ PostgreSQL 16 com Docker
- ✅ Prisma ORM configurado
- ✅ ENUMs: `tipo_pagamento`, `status_pagamento`, `role_usuario`
- ✅ Tabelas: `usuarios`, `medicos`, `pacientes`, `consultas`
- ✅ Relacionamentos e índices configurados

---

## 🔒 **SEGURANÇA E AUTENTICAÇÃO**

### **Headers Obrigatórios:**
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### **Códigos de Status:**
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Token inválido/expirado
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

### **Estrutura de Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": "Detalhes técnicos do erro",
  "code": "ERROR_CODE"
}
```

---

## 🎯 **STATUS DO PROJETO**

### **✅ Implementado:**
- 🔐 Sistema completo de autenticação JWT
- 👥 CRUD completo de usuários, médicos, pacientes
- 📅 CRUD completo de consultas com filtros
- 📊 Relatórios financeiros e estatísticas  
- 🛡️ Middleware de autenticação em todas as rotas
- 📝 Validação de dados e tratamento de erros
- 🧪 Testes validados no Postman

### **🏁 Pronto para:**
- 🚀 Integração com Frontend React
- 🌐 Deploy em produção
- 📱 Desenvolvimento de aplicativo móvel
- 📊 Relatórios avançados e dashboards

---

**Versão:** 2.0  
**Última atualização:** 06 de novembro de 2025  
**Servidor:** 🟢 Rodando na porta 3001  
**Status:** ✅ **SISTEMA COMPLETO E FUNCIONAL**