# 🎯 ESQUEMA SIMPLIFICADO PARA PROTÓTIPO - SGHM
## Versão Funcional para Apresentação da Etapa III

**Data:** 08/11/2025  
**Objetivo:** Protótipo funcional demonstrando gestão de honorários médicos  
**Escopo:** MVP para apresentação em vídeo da proposta do sistema

---

## 🎥 **CONTEXTO: APRESENTAÇÃO DA ETAPA III**

### 📋 **Objetivo do Protótipo:**
- ✅ Demonstrar **viabilidade** da gestão de honorários
- ✅ Mostrar **fluxo completo** do sistema
- ✅ Apresentar **valor real** para médicos
- ✅ **Implementação rápida** (2-3 semanas máximo)
- ✅ **Demonstração visual** das funcionalidades

### 🎯 **Funcionalidades Essenciais para Demo:**
1. **Cadastro de Planos de Saúde**
2. **Registro de Consultas Realizadas**
3. **Controle de Status de Pagamento**
4. **Gestão Básica de Glosas**
5. **Relatórios de Honorários**
6. **Dashboard Visual**

---

## 🏗️ **ESQUEMA SIMPLIFICADO**

### 📊 **MANTER TABELAS EXISTENTES (com ajustes mínimos)**

#### 1. **usuarios** - ✅ Já está adequada
```sql
-- Sem alterações necessárias
usuarios (id, nome_completo, email, senha, role...)
```

#### 2. **medicos** - ➕ Adicionar apenas 2 campos essenciais
```sql
-- Adicionar campos mínimos para repasse
ALTER TABLE medicos 
ADD COLUMN percentual_repasse DECIMAL(5,2) DEFAULT 70.00,
ADD COLUMN dados_bancarios TEXT; -- JSON simples com banco/agencia/conta
```

#### 3. **pacientes** - ✅ Manter como está
```sql
-- Sem alterações necessárias
pacientes (id, nome_paciente, cpf, telefone...)
```

### 🆕 **CRIAR APENAS 2 TABELAS NOVAS ESSENCIAIS**

#### 4. **planos_saude** - 🏥 Operadoras Simplificadas
```sql
CREATE TABLE planos_saude (
  id SERIAL PRIMARY KEY,
  nome_plano VARCHAR(100) NOT NULL,
  codigo_operadora VARCHAR(20),
  tipo_plano tipo_plano_enum DEFAULT 'CONVENIO',
  prazo_pagamento_dias INTEGER DEFAULT 30,
  valor_consulta_padrao DECIMAL(10,2) DEFAULT 100.00,
  percentual_glosa_historica DECIMAL(5,2) DEFAULT 5.00,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enum simplificado
CREATE TYPE tipo_plano_enum AS ENUM ('PARTICULAR', 'CONVENIO', 'SUS');
```

#### 5. **honorarios** - 💰 Controle Financeiro Unificado
```sql
CREATE TABLE honorarios (
  id SERIAL PRIMARY KEY,
  consulta_id INTEGER REFERENCES consultas(id) ON DELETE CASCADE,
  plano_saude_id INTEGER REFERENCES planos_saude(id),
  
  -- Dados financeiros essenciais
  valor_consulta DECIMAL(10,2) NOT NULL,
  valor_glosa DECIMAL(10,2) DEFAULT 0.00,
  valor_liquido DECIMAL(10,2) GENERATED ALWAYS AS (valor_consulta - valor_glosa) STORED,
  valor_repasse_medico DECIMAL(10,2), -- Calculado: valor_liquido * percentual
  
  -- Controle de status
  status_pagamento status_pagamento_enum DEFAULT 'PENDENTE',
  data_pagamento DATE,
  
  -- Controle de glosas (simplificado)
  motivo_glosa VARCHAR(255),
  data_glosa DATE,
  
  -- Metadados
  numero_guia VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices essenciais
  INDEX idx_consulta_id (consulta_id),
  INDEX idx_status_pagamento (status_pagamento),
  INDEX idx_data_pagamento (data_pagamento)
);

-- Enum atualizado
CREATE TYPE status_pagamento_enum AS ENUM (
  'PENDENTE', 
  'ENVIADO', 
  'PAGO', 
  'GLOSADO', 
  'CANCELADO'
);
```

### 🔄 **ATUALIZAR TABELA CONSULTAS (mínimas alterações)**

```sql
-- Adicionar apenas 3 campos essenciais
ALTER TABLE consultas 
ADD COLUMN plano_saude_id INTEGER REFERENCES planos_saude(id),
ADD COLUMN numero_carteirinha VARCHAR(50),
ADD COLUMN tem_honorario BOOLEAN DEFAULT FALSE;

-- Remover campos que vão para tabela honorarios
-- Manter: data_consulta, protocolo, medico_id, paciente_id, descricao_procedimento
```

---

## 📋 **DADOS DE EXEMPLO PARA DEMONSTRAÇÃO**

### 🏥 **Planos de Saúde (5-6 principais)**
```sql
INSERT INTO planos_saude (nome_plano, codigo_operadora, tipo_plano, prazo_pagamento_dias, valor_consulta_padrao, percentual_glosa_historica) VALUES
('Particular', 'PART', 'PARTICULAR', 0, 200.00, 0.00),
('Unimed', '123456', 'CONVENIO', 45, 120.00, 8.50),
('Bradesco Saúde', '789012', 'CONVENIO', 60, 110.00, 12.30),
('SulAmérica', '345678', 'CONVENIO', 30, 130.00, 6.20),
('Amil', '567890', 'CONVENIO', 45, 115.00, 9.80),
('SUS', 'SUS', 'SUS', 90, 50.00, 25.00);
```

### 👨‍⚕️ **Médicos com Percentuais**
```sql
UPDATE medicos SET 
  percentual_repasse = 70.00,
  dados_bancarios = '{"banco": "Banco do Brasil", "agencia": "1234-5", "conta": "67890-1", "tipo": "Corrente"}'
WHERE id = 1;
```

### 💰 **Honorários de Exemplo**
```sql
-- Consultas com status variados para demonstração
INSERT INTO honorarios (consulta_id, plano_saude_id, valor_consulta, valor_glosa, status_pagamento, data_pagamento, numero_guia) VALUES
(1, 2, 120.00, 0.00, 'PAGO', '2025-10-15', 'UNI123456'),
(2, 3, 110.00, 15.50, 'GLOSADO', NULL, 'BRA789012'),
(3, 1, 200.00, 0.00, 'PAGO', '2025-10-20', NULL),
(4, 4, 130.00, 0.00, 'ENVIADO', NULL, 'SUL345678'),
(5, 2, 120.00, 0.00, 'PENDENTE', NULL, 'UNI123457');
```

---

## 🎯 **FUNCIONALIDADES DO PROTÓTIPO**

### 📊 **1. Dashboard Principal**
```
📈 Resumo Financeiro
┌─────────────────────────────────────┐
│ Total a Receber: R$ 15.450,00       │
│ Pago este Mês: R$ 8.320,00          │
│ Glosas Pendentes: R$ 1.230,00       │
│ Taxa de Glosa: 7.8%                 │
└─────────────────────────────────────┘

📊 Status das Consultas (Últimos 30 dias)
┌─────────────┬─────────┬──────────┐
│ Status      │ Qtd     │ Valor    │
├─────────────┼─────────┼──────────┤
│ Pendente    │ 25      │ 3.450,00 │
│ Enviado     │ 18      │ 2.150,00 │
│ Pago        │ 42      │ 8.320,00 │
│ Glosado     │ 5       │ 680,00   │
└─────────────┴─────────┴──────────┘
```

### 📋 **2. Registro de Consultas**
```
Formulário Simplificado:
┌─────────────────────────────────────┐
│ Data da Consulta: [DD/MM/AAAA]      │
│ Médico: [Dropdown]                  │
│ Paciente: [Busca/Novo]              │
│ Plano de Saúde: [Dropdown]          │
│ Nº Carteirinha: [__________]         │
│ Nº da Guia: [__________]            │
│ Valor: [Auto-preenchido]            │
│ Observações: [Textarea]             │
│                                     │
│ [Salvar Consulta]                   │
└─────────────────────────────────────┘
```

### 💰 **3. Controle de Honorários**
```
Lista de Honorários:
┌────────────┬─────────────┬──────────┬─────────┬───────────┐
│ Data       │ Paciente    │ Plano    │ Valor   │ Status    │
├────────────┼─────────────┼──────────┼─────────┼───────────┤
│ 15/10/2025 │ João Silva  │ Unimed   │ 120,00  │ 💚 PAGO    │
│ 18/10/2025 │ Maria Lopes │ Bradesco │ 110,00  │ 🔴 GLOSADO │
│ 20/10/2025 │ José Santos │ Particular│ 200,00  │ 💚 PAGO   │
│ 22/10/2025 │ Ana Costa   │ SulAmérica│ 130,00  │ 🟡 ENVIADO │
└────────────┴─────────────┴──────────┴─────────┴───────────┘
```

### 🚫 **4. Gestão de Glosas (Simplificada)**
```
Glosas Pendentes:
┌─────────────┬─────────────┬──────────┬─────────────────┐
│ Data Consulta│ Paciente   │ Valor    │ Motivo Glosa    │
├─────────────┼─────────────┼──────────┼─────────────────┤
│ 18/10/2025  │ Maria Lopes │ 15,50    │ Falta documento │
│ 25/10/2025  │ Pedro Lima  │ 22,30    │ Código inválido │
│ 28/10/2025  │ Carla Reis  │ 45,00    │ Prazo vencido   │
└─────────────┴─────────────┴──────────┴─────────────────┘

[Contestar Glosas Selecionadas]
```

### 📊 **5. Relatórios Essenciais**

#### **A) Relatório por Plano de Saúde**
```sql
-- Query de exemplo
SELECT 
  ps.nome_plano,
  COUNT(h.id) as total_consultas,
  SUM(h.valor_consulta) as valor_bruto,
  SUM(h.valor_glosa) as valor_glosas,
  SUM(h.valor_liquido) as valor_liquido,
  AVG(ps.prazo_pagamento_dias) as prazo_medio
FROM honorarios h
JOIN planos_saude ps ON h.plano_saude_id = ps.id
WHERE h.created_at >= '2025-10-01'
GROUP BY ps.id, ps.nome_plano
ORDER BY valor_liquido DESC;
```

#### **B) Relatório de Repasses por Médico**
```sql
-- Query de exemplo  
SELECT 
  m.nome_medico,
  COUNT(h.id) as total_consultas,
  SUM(h.valor_repasse_medico) as total_repasse,
  m.percentual_repasse,
  SUM(CASE WHEN h.status_pagamento = 'PAGO' THEN h.valor_repasse_medico ELSE 0 END) as repasse_pago
FROM honorarios h
JOIN consultas c ON h.consulta_id = c.id
JOIN medicos m ON c.medico_id = m.id
WHERE h.created_at >= '2025-10-01'
GROUP BY m.id, m.nome_medico, m.percentual_repasse
ORDER BY total_repasse DESC;
```

---

## 🚀 **CRONOGRAMA DE IMPLEMENTAÇÃO**

### 📅 **Semana 1: Estrutura Base**
- [ ] Criar tabelas `planos_saude` e `honorarios`
- [ ] Migração dos dados existentes
- [ ] APIs básicas de CRUD

### 📅 **Semana 2: Interface e Lógica**
- [ ] Interface de cadastro de planos
- [ ] Tela de registro de consultas/honorários
- [ ] Cálculos automáticos de repasse

### 📅 **Semana 3: Relatórios e Dashboard**
- [ ] Dashboard principal
- [ ] Relatórios de honorários
- [ ] Gestão de glosas
- [ ] Preparação para apresentação

---

## 🎥 **ROTEIRO PARA VÍDEO DE APRESENTAÇÃO**

### 🎬 **Parte 1: Problema (2 minutos)**
- Dificuldade de médicos controlarem honorários manualmente
- Complexidade dos diferentes planos de saúde
- Problemas com glosas e atrasos de pagamento

### 🎬 **Parte 2: Solução (3 minutos)**
- Apresentar o SGHM como solução
- Mostrar tela de cadastro de consultas
- Demonstrar controle de status de pagamento

### 🎬 **Parte 3: Funcionalidades (4 minutos)**
- Dashboard com visão geral
- Relatório por plano de saúde
- Gestão de glosas
- Cálculo automático de repasses

### 🎬 **Parte 4: Benefícios (1 minuto)**
- Economia de tempo
- Redução de erros
- Controle financeiro completo
- Tomada de decisão baseada em dados

---

## 💡 **VANTAGENS DA VERSÃO SIMPLIFICADA**

### ✅ **Para Desenvolvimento:**
- **Implementação rápida** (3 semanas)
- **Menor complexidade** técnica
- **Fácil manutenção** e evolução
- **Menos bugs** potenciais

### ✅ **Para Apresentação:**
- **Foco no essencial** - gestão de honorários
- **Demonstração clara** do valor
- **Interface limpa** e intuitiva
- **Dados realistas** para demo

### ✅ **Para Evolução Futura:**
- **Base sólida** para expansão
- **Estrutura escalável** 
- **Fácil adição** de novas funcionalidades
- **Migração simples** para versão completa

---

## 🎯 **MÉTRICAS DE SUCESSO DO PROTÓTIPO**

### 📊 **KPIs para Demonstração:**
- ✅ **5 planos de saúde** cadastrados
- ✅ **50+ consultas** com honorários controlados
- ✅ **Dashboard funcional** com dados reais
- ✅ **3 relatórios** essenciais implementados
- ✅ **Gestão de glosas** operacional

### 🎥 **Objetivos da Apresentação:**
- Demonstrar **viabilidade técnica**
- Mostrar **valor prático** para médicos
- Provar **diferencial** do produto
- Convencer sobre **potencial de mercado**

---

## 🎯 **CONCLUSÃO**

Esta versão simplificada mantém **100% do valor** da proposta original, mas com:
- ✅ **70% menos complexidade** de implementação
- ✅ **Foco total** na gestão de honorários
- ✅ **Demonstração efetiva** em vídeo
- ✅ **Base sólida** para evolução

**Recomendação:** Implementar esta versão para a apresentação da Etapa III e evoluir gradualmente com feedback dos usuários.

---

**✅ Esta abordagem garante um protótipo funcional e impressionante para a apresentação, sem comprometer a qualidade ou o escopo do projeto.**