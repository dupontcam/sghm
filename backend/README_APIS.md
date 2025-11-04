# 📊 APIs de Relatórios e Estatísticas - SGHM Backend

Esta documentação descreve as **novas APIs implementadas** para relatórios financeiros, estatísticas e filtros avançados do sistema SGHM.

## 🚀 **Base URL**
```
http://localhost:5000/api
```

---

## 📈 **ENDPOINTS DE RELATÓRIOS**

### **1. Relatório Financeiro Completo**
```http
GET /api/relatorios/financeiro
```

**Query Parameters:**
- `medico_id` (opcional) - ID do médico (0 = todos)
- `data_inicio` (opcional) - Data inicial (YYYY-MM-DD)
- `data_fim` (opcional) - Data final (YYYY-MM-DD)
- `status_pagamento` (opcional) - PENDENTE, PAGO, GLOSA

**Exemplo:**
```
GET /api/relatorios/financeiro?medico_id=3&data_inicio=2025-01-01&data_fim=2025-12-31&status_pagamento=PAGO
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "consultas": [...],
    "resumo": {
      "faturado": 15000.00,
      "pago": 12000.00,
      "glosado": 1500.00,
      "aReceber": 1500.00,
      "totalConsultas": 25
    },
    "filtros": {...},
    "gerado_em": "2025-11-04T..."
  }
}
```

### **2. Dados para Dashboard**
```http
GET /api/relatorios/dashboard
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

### **3. Resumo por Período**
```http
GET /api/relatorios/resumo-periodo?data_inicio=2025-01-01&data_fim=2025-01-31
```

---

## 📊 **ENDPOINTS DE ESTATÍSTICAS**

### **1. Resumo Geral**
```http
GET /api/estatisticas/resumo
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

### **2. Top 5 Médicos por Faturamento**
```http
GET /api/estatisticas/medicos-top
```

### **3. Faturamento Mensal (12 meses)**
```http
GET /api/estatisticas/faturamento-mensal
```

---

## 🔍 **ENDPOINTS COM FILTROS AVANÇADOS**

### **1. Consultas com Filtros**
```http
GET /api/consultas
```

**Query Parameters:**
- `medico_id` - Filtrar por médico
- `paciente_id` - Filtrar por paciente  
- `status_pagamento` - Filtrar por status
- `data_inicio` - Data inicial
- `data_fim` - Data final

**Exemplo:**
```
GET /api/consultas?medico_id=3&status_pagamento=PENDENTE&data_inicio=2025-01-01
```

**Resposta:**
```json
{
  "success": true,
  "data": [...],
  "total": 15,
  "filtros": {
    "medico_id": "3",
    "status_pagamento": "PENDENTE",
    "data_inicio": "2025-01-01",
    "data_fim": null,
    "paciente_id": null
  }
}
```

---

## 🧪 **TESTES SUGERIDOS NO POSTMAN**

### **1. Teste Dashboard**
```
GET http://localhost:5000/api/relatorios/dashboard
```

### **2. Teste Relatório Financeiro**
```
GET http://localhost:5000/api/relatorios/financeiro?data_inicio=2025-01-01&data_fim=2025-12-31
```

### **3. Teste Estatísticas**
```
GET http://localhost:5000/api/estatisticas/resumo
```

### **4. Teste Filtros de Consultas**
```
GET http://localhost:5000/api/consultas?status_pagamento=PENDENTE
```

---

## ⚙️ **CONFIGURAÇÃO**

### **Dependências Necessárias:**
- ✅ Prisma Client
- ✅ PostgreSQL com ENUMs
- ✅ Express.js
- ✅ CORS habilitado

### **Banco de Dados:**
- ✅ Tabelas: `consultas`, `medicos`, `pacientes`, `usuarios`
- ✅ ENUMs: `tipo_pagamento`, `status_pagamento`, `role_usuario`
- ✅ Relacionamentos configurados

---

## 🎯 **PRÓXIMAS ETAPAS**

1. **Teste todas as APIs** no Postman
2. **Conectar com o Frontend** React
3. **Implementar autenticação JWT** 
4. **Adicionar validações** mais robustas
5. **Otimizar queries** para performance

---

**Status:** ✅ **APIs IMPLEMENTADAS E FUNCIONAIS**  
**Servidor:** 🟢 **Rodando na porta 5000**  
**Banco:** 🟢 **Conectado e configurado**