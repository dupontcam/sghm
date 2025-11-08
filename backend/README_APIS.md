# 🔐 API Completa SGHM Backend - Sistema de Gestão de Honorários Médicos

Esta documentação descreve **todas as 37 APIs implementadas** incluindo autenticação JWT, gestão de planos de saúde, honorários médicos, dashboard financeiro, relatórios e estatísticas completas do sistema SGHM.

## 🆕 **Novidades da Versão 3.0**

✅ **Planos de Saúde:** 6 endpoints para CRUD completo de operadoras  
✅ **Honorários Médicos:** 9 endpoints para controle financeiro total  
✅ **Dashboard Avançado:** Estatísticas detalhadas dos últimos 30 dias  
✅ **Gestão de Glosas:** Controle completo de glosas e motivos  
✅ **37 Endpoints:** Sistema 100% funcional e testado

## 🚀 **Base URL**
```
http://localhost:3001/api
```

## 📊 **ESTATÍSTICAS DO SISTEMA**

O sistema possui atualmente:
- **37 endpoints funcionais** distribuídos em 8 módulos
- **6 planos de saúde** configurados (Unimed, Bradesco, Amil, SUS, SulAmérica, Particular)  
- **10 honorários de exemplo** com valor total de **R$ 1.275,00**
- **Taxa de glosa de 2,96%** e valor líquido de **R$ 1.237,20**
- **Sistema 100% testado** com Postman Collection v3.0

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

### **� Gestão de Usuários (Admin)**

#### **Criar Usuário (Admin Only)**
```http
POST /api/auth/create-user
Authorization: Bearer {admin_token}
```

**Body (JSON):**
```json
{
  "email": "operador@sghm.com",
  "senha": "senha123",
  "nome_completo": "José Silva Operador",
  "role": "OPERADOR"
}
```

#### **Listar Usuários (Admin Only)**
```http
GET /api/auth/users
Authorization: Bearer {admin_token}
```

#### **Atualizar Usuário (Admin Only)**
```http
PUT /api/auth/users/{id}
Authorization: Bearer {admin_token}
```

#### **Alterar Própria Senha (Todos)**
```http
PUT /api/auth/change-password
Authorization: Bearer {access_token}
```

**Body (JSON):**
```json
{
  "senha_atual": "senhaAtual123",
  "nova_senha": "novaSenha456"
}
```

---

## 🏥 **ENDPOINTS DE PLANOS DE SAÚDE**
> ⚠️ **Todas as rotas requerem autenticação JWT**

### **📋 Listar Planos de Saúde**
```http
GET /api/planos
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `ativo` (boolean): Filtrar por status ativo
- `tipo_plano` (enum): CONVENIO, PARTICULAR, SUS
- `search` (string): Buscar por nome ou código

**Resposta:**
```json
{
  "success": true,
  "data": {
    "planos": [
      {
        "id": 1,
        "nome_plano": "Unimed",
        "codigo_operadora": "UN001",
        "tipo_plano": "CONVENIO",
        "valor_consulta_padrao": 120.00,
        "percentual_glosa_historica": 3.50,
        "prazo_pagamento_dias": 30,
        "ativo": true
      }
    ],
    "total": 6,
    "stats": {
      "total_planos": 6,
      "valor_medio_consulta": 127.50,
      "glosa_media": 4.20,
      "prazo_medio_pagamento": 35
    }
  }
}
```

### **🔍 Buscar Plano por ID**
```http
GET /api/planos/{id}
Authorization: Bearer {access_token}
```

### **➕ Criar Plano de Saúde (Admin Only)**
```http
POST /api/planos
Authorization: Bearer {admin_token}
```

**Body (JSON):**
```json
{
  "nome_plano": "Novo Convênio XYZ",
  "codigo_operadora": "XYZ001",
  "tipo_plano": "CONVENIO",
  "valor_consulta_padrao": 125.00,
  "percentual_glosa_historica": 5.5,
  "prazo_pagamento_dias": 45,
  "observacoes": "Plano empresarial",
  "ativo": true
}
```

### **✏️ Atualizar Plano (Admin Only)**
```http
PUT /api/planos/{id}
Authorization: Bearer {admin_token}
```

### **🗑️ Deletar Plano (Admin Only)**
```http
DELETE /api/planos/{id}
Authorization: Bearer {admin_token}
```

---

## 💰 **ENDPOINTS DE HONORÁRIOS MÉDICOS**
> ⚠️ **Todas as rotas requerem autenticação JWT**

### **📋 Listar Honorários**
```http
GET /api/honorarios
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status_pagamento` (enum): PENDENTE, ENVIADO, PAGO, GLOSADO, CANCELADO
- `plano_saude_id` (number): ID do plano de saúde
- `medico_id` (number): ID do médico
- `data_inicio` (date): Data inicial (YYYY-MM-DD)
- `data_fim` (date): Data final (YYYY-MM-DD)
- `page` (number): Página (padrão: 1)
- `limit` (number): Limite por página (padrão: 20)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "honorarios": [
      {
        "id": 1,
        "consulta_id": 54,
        "valor_consulta": 120.00,
        "valor_glosa": 0.00,
        "valor_liquido": 120.00,
        "valor_repasse_medico": 84.00,
        "status_pagamento": "PENDENTE",
        "data_pagamento": null,
        "consulta": {
          "data_consulta": "2025-11-08",
          "medico": { "nome": "Dr. João Silva" },
          "paciente": { "nome": "Maria Santos" }
        },
        "plano_saude": { "nome_plano": "Unimed" }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 10,
      "items_per_page": 20
    }
  }
}
```

### **📊 Dashboard de Honorários**
```http
GET /api/honorarios/dashboard
Authorization: Bearer {access_token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "periodo": "30 dias",
    "estatisticas_gerais": {
      "total_consultas": 10,
      "valor_total": 1275.00,
      "valor_glosas": 37.80,
      "valor_liquido": 1237.20,
      "valor_repasses": 865.04,
      "taxa_glosa": 2.96
    },
    "consultas_por_status": [
      { "status_pagamento": "PENDENTE", "_count": { "id": 3 }, "_sum": { "valor_consulta": 370.00 } },
      { "status_pagamento": "PAGO", "_count": { "id": 3 }, "_sum": { "valor_consulta": 450.00 } }
    ],
    "top_planos": [
      { "plano_nome": "Unimed", "_count": { "id": 3 }, "_sum": { "valor_consulta": 360.00 } }
    ],
    "evolucao_diaria": [
      { "data": "2025-11-01", "consultas": 2, "valor": 240.00 }
    ]
  }
}
```

### **🔍 Buscar Honorário por ID**
```http
GET /api/honorarios/{id}
Authorization: Bearer {access_token}
```

### **➕ Criar Honorário**
```http
POST /api/honorarios
Authorization: Bearer {access_token}
```

**Body (JSON):**
```json
{
  "consulta_id": 5,
  "plano_saude_id": 2,
  "valor_consulta": 120.00,
  "valor_glosa": 0.00,
  "status_pagamento": "PENDENTE",
  "numero_guia": "GUIA-2025-001",
  "observacoes": "Consulta cardiológica de rotina"
}
```

### **✏️ Atualizar Status de Pagamento**
```http
PUT /api/honorarios/{id}
Authorization: Bearer {access_token}
```

**Body (JSON) - Processar Pagamento:**
```json
{
  "status_pagamento": "PAGO",
  "data_pagamento": "2025-11-08",
  "observacoes": "Pagamento processado com sucesso"
}
```

**Body (JSON) - Registrar Glosa:**
```json
{
  "status_pagamento": "GLOSADO",
  "valor_glosa": 25.50,
  "motivo_glosa": "Documentação incompleta - falta relatório médico",
  "data_glosa": "2025-11-08",
  "observacoes": "Reenviar com documentação completa"
}
```

### **📈 Relatório Médico Individual**
```http
GET /api/honorarios/relatorio-medico/{medico_id}
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `data_inicio` (date): Data inicial (YYYY-MM-DD)
- `data_fim` (date): Data final (YYYY-MM-DD)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "medico": {
      "nome": "Dr. João Silva",
      "especialidade": "Cardiologia",
      "percentual_repasse": 70.00
    },
    "periodo": { "inicio": "2025-10-01", "fim": "2025-11-30" },
    "resumo": {
      "total_consultas": 5,
      "valor_bruto": 590.00,
      "valor_glosas": 15.50,
      "valor_liquido": 574.50,
      "valor_repasse": 402.15,
      "taxa_glosa": 2.63
    },
    "por_plano": [
      {
        "plano_nome": "Unimed",
        "consultas": 3,
        "valor_bruto": 360.00,
        "valor_repasse": 252.00
      }
    ]
  }
}
```

### **🗑️ Deletar Honorário (Admin Only)**
```http
DELETE /api/honorarios/{id}
Authorization: Bearer {admin_token}
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
- ✅ ENUMs: `tipo_pagamento`, `status_pagamento`, `status_honorario`, `tipo_plano`, `role_usuario`
- ✅ Tabelas: `usuarios`, `medicos`, `pacientes`, `consultas`, `planos_saude`, `honorarios`
- ✅ Relacionamentos e índices configurados
- ✅ 6 planos de saúde configurados
- ✅ 10 honorários de exemplo

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
- `403` - Acesso negado (Admin only)
- `404` - Recurso não encontrado
- `409` - Conflito (registro já existe)
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

### **✅ Implementado (37 Endpoints):**
- 🔐 **8 APIs de Autenticação:** Login, perfil, refresh, logout, CRUD usuários
- 🏥 **6 APIs de Planos de Saúde:** CRUD completo com filtros e estatísticas
- 💰 **9 APIs de Honorários:** Dashboard, CRUD, relatórios médicos, controle de glosas
- 👥 **2 APIs de Pacientes:** CRUD básico com validações
- 🩺 **2 APIs de Médicos:** CRUD básico com especialidades
- 📅 **3 APIs de Consultas:** CRUD com relacionamentos e filtros
- 📊 **4 APIs de Estatísticas:** Resumos, rankings, faturamento
- 📈 **3 APIs de Relatórios:** Dashboard, financeiro, personalizado

### **💡 Funcionalidades Avançadas:**
- ✅ **Dashboard Financeiro:** Estatísticas dos últimos 30 dias
- ✅ **Gestão de Glosas:** Controle completo de motivos e valores
- ✅ **Relatórios Médicos:** Individuais por período e plano
- ✅ **Controle de Status:** PENDENTE → ENVIADO → PAGO/GLOSADO
- ✅ **6 Planos Configurados:** Unimed, Bradesco, Amil, SUS, SulAmérica, Particular
- ✅ **Taxa de Glosa:** Cálculo automático (2,96% atual)

### **🧪 Testes Completos:**
- ✅ **Postman Collection v3.0:** 37 endpoints testados
- ✅ **Autenticação JWT:** Login, refresh, logout funcionais
- ✅ **CRUD Completo:** Todas entidades testadas
- ✅ **Dashboard:** Estatísticas financeiras funcionando
- ✅ **Filtros e Paginação:** Todas as listagens validadas
- ✅ **Dados de Exemplo:** R$ 1.275,00 processados

### **🏁 Pronto para:**
- 🚀 **Integração Frontend:** APIs documentadas e funcionais
- 🌐 **Deploy Produção:** Sistema 100% testado
- 📱 **Expansões:** Base sólida para novas funcionalidades
- 📱 Desenvolvimento de aplicativo móvel
- 📊 Relatórios avançados e dashboards

---

**Versão:** 2.0  
**Última atualização:** 06 de novembro de 2025  
**Servidor:** 🟢 Rodando na porta 3001  
**Status:** ✅ **SISTEMA COMPLETO E FUNCIONAL**