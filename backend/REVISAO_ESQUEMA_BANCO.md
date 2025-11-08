# 📊 REVISÃO DO ESQUEMA DO BANCO DE DADOS - SGHM
## Foco: Gestão de Honorários Médicos Pós-Atendimento

**Data:** 08/11/2025  
**Objetivo:** Análise do esquema atual e propostas para gestão eficiente de honorários médicos  
**Escopo:** Sistema de controle financeiro de consultas realizadas

---

## 🔍 **ANÁLISE DO ESQUEMA ATUAL**

### ✅ **Pontos Positivos Identificados**
1. **Estrutura base sólida** - Tabelas essenciais já existem
2. **Relacionamentos bem definidos** - FKs e índices adequados
3. **Campos financeiros básicos** - valor_bruto, valor_glosa, valor_recebido
4. **Controle de auditoria** - created_at, updated_at, usuários de inclusão/alteração
5. **Status de pagamento** - PENDENTE, PAGO, GLOSA

### ❌ **Lacunas Críticas Identificadas**

#### 🏥 **1. Gestão de Planos de Saúde**
```sql
-- PROBLEMA: Plano de saúde como campo texto livre
plano_saude String? @db.VarChar(100)

-- SOLUÇÃO NECESSÁRIA: Tabela dedicada para operadoras
```

#### 💰 **2. Controle de Valores por Plano**
```sql
-- PROBLEMA: Valor único, sem diferenciação por plano
valor_bruto Decimal @db.Decimal(10, 2)

-- SOLUÇÃO NECESSÁRIA: Tabela de valores por operadora/procedimento
```

#### 📋 **3. Gestão de Procedimentos Médicos**
```sql
-- PROBLEMA: Descrição livre, sem padronização
descricao_procedimento String? @db.VarChar(255)

-- SOLUÇÃO NECESSÁRIA: Tabela de procedimentos padronizados (TUSS/CBHPM)
```

#### 📄 **4. Controle de Lotes de Faturamento**
```sql
-- PROBLEMA: Não existe controle de lotes para operadoras
-- SOLUÇÃO NECESSÁRIA: Tabela de lotes de envio para planos de saúde
```

#### 🔄 **5. Gestão Detalhada de Glosas**
```sql
-- PROBLEMA: Glosa apenas como valor, sem detalhamento
valor_glosa Decimal? @default(0.00) @db.Decimal(10, 2)

-- SOLUÇÃO NECESSÁRIA: Tabela de glosas com motivos e contestações
```

---

## 🏗️ **PROPOSTA DE NOVO ESQUEMA**

### 📋 **1. TABELA: operadoras_saude**
```sql
model operadoras_saude {
  id                    Int       @id @default(autoincrement())
  nome_operadora        String    @db.VarChar(100)
  codigo_ans            String?   @unique @db.VarChar(20)  -- Código ANS
  cnpj                  String?   @db.VarChar(18)
  tipo_operadora        tipo_operadora_enum
  prazo_pagamento_dias  Int       @default(30)
  email_faturamento     String?   @db.VarChar(100)
  telefone_faturamento  String?   @db.VarChar(20)
  endereco_faturamento  String?   @db.Text
  observacoes           String?   @db.Text
  ativo                 Boolean   @default(true)
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @updatedAt @db.Timestamptz(6)

  // Relacionamentos
  consultas             consultas[]
  valores_procedimentos valores_procedimentos[]
  lotes_faturamento     lotes_faturamento[]
  glosas                glosas[]
}

enum tipo_operadora_enum {
  PARTICULAR
  PLANO_SAUDE
  SUS
  COOPERATIVA
}
```

### 🏥 **2. TABELA: procedimentos_medicos**
```sql
model procedimentos_medicos {
  id                    Int       @id @default(autoincrement())
  codigo_tuss           String?   @unique @db.VarChar(20)   -- Código TUSS
  codigo_cbhpm          String?   @unique @db.VarChar(20)   -- Código CBHPM
  descricao             String    @db.VarChar(255)
  especialidade         String?   @db.VarChar(100)
  tipo_procedimento     tipo_procedimento_enum
  ativo                 Boolean   @default(true)
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @updatedAt @db.Timestamptz(6)

  // Relacionamentos
  consultas             consultas[]
  valores_procedimentos valores_procedimentos[]
}

enum tipo_procedimento_enum {
  CONSULTA
  EXAME
  CIRURGIA
  PROCEDIMENTO
  RETORNO
}
```

### 💰 **3. TABELA: valores_procedimentos**
```sql
model valores_procedimentos {
  id                    Int       @id @default(autoincrement())
  operadora_id          Int
  procedimento_id       Int
  medico_id             Int?      -- Valor específico para médico (opcional)
  valor_operadora       Decimal   @db.Decimal(10, 2)  -- Valor que a operadora paga
  valor_particular      Decimal?  @db.Decimal(10, 2)  -- Valor particular (se aplicável)
  percentual_medico     Decimal   @default(70.00) @db.Decimal(5, 2)  -- % para o médico
  vigencia_inicio       DateTime  @db.Date
  vigencia_fim          DateTime? @db.Date
  ativo                 Boolean   @default(true)
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @updatedAt @db.Timestamptz(6)

  // Relacionamentos
  operadora             operadoras_saude @relation(fields: [operadora_id], references: [id])
  procedimento          procedimentos_medicos @relation(fields: [procedimento_id], references: [id])
  medico                medicos? @relation(fields: [medico_id], references: [id])

  @@unique([operadora_id, procedimento_id, medico_id, vigencia_inicio])
}
```

### 📄 **4. TABELA: lotes_faturamento**
```sql
model lotes_faturamento {
  id                    Int       @id @default(autoincrement())
  operadora_id          Int
  numero_lote           String    @db.VarChar(50)
  data_envio            DateTime  @db.Date
  protocolo_envio       String?   @db.VarChar(100)
  quantidade_consultas  Int       @default(0)
  valor_total_lote      Decimal   @db.Decimal(12, 2)
  status_lote           status_lote_enum @default(ENVIADO)
  data_retorno          DateTime? @db.Date
  observacoes           String?   @db.Text
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @updatedAt @db.Timestamptz(6)

  // Relacionamentos
  operadora             operadoras_saude @relation(fields: [operadora_id], references: [id])
  consultas             consultas[]
  
  @@unique([operadora_id, numero_lote])
}

enum status_lote_enum {
  PREPARANDO
  ENVIADO
  PROCESSADO
  PAGO
  GLOSADO_PARCIAL
  GLOSADO_TOTAL
}
```

### 🚫 **5. TABELA: glosas**
```sql
model glosas {
  id                    Int       @id @default(autoincrement())
  consulta_id           Int
  operadora_id          Int
  lote_id               Int?
  valor_glosado         Decimal   @db.Decimal(10, 2)
  motivo_glosa          String    @db.VarChar(255)
  codigo_glosa          String?   @db.VarChar(20)
  data_glosa            DateTime  @db.Date
  status_contestacao    status_contestacao_enum @default(NAO_CONTESTADA)
  data_contestacao      DateTime? @db.Date
  valor_liberado_recurso Decimal? @db.Decimal(10, 2)
  observacoes_recurso   String?   @db.Text
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @updatedAt @db.Timestamptz(6)

  // Relacionamentos
  consulta              consultas @relation(fields: [consulta_id], references: [id])
  operadora             operadoras_saude @relation(fields: [operadora_id], references: [id])
  lote                  lotes_faturamento? @relation(fields: [lote_id], references: [id])
}

enum status_contestacao_enum {
  NAO_CONTESTADA
  CONTESTADA
  DEFERIDA
  INDEFERIDA
}
```

### 💸 **6. TABELA: repasses_medicos**
```sql
model repasses_medicos {
  id                    Int       @id @default(autoincrement())
  medico_id             Int
  periodo_inicio        DateTime  @db.Date
  periodo_fim           DateTime  @db.Date
  quantidade_consultas  Int       @default(0)
  valor_bruto_periodo   Decimal   @db.Decimal(12, 2)
  valor_glosas_periodo  Decimal   @default(0.00) @db.Decimal(12, 2)
  valor_liquido_periodo Decimal   @db.Decimal(12, 2)
  valor_repasse_medico  Decimal   @db.Decimal(12, 2)
  percentual_medio      Decimal   @db.Decimal(5, 2)
  status_repasse        status_repasse_enum @default(CALCULADO)
  data_pagamento        DateTime? @db.Date
  observacoes           String?   @db.Text
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @updatedAt @db.Timestamptz(6)

  // Relacionamentos
  medico                medicos @relation(fields: [medico_id], references: [id])
}

enum status_repasse_enum {
  CALCULADO
  APROVADO
  PAGO
  CANCELADO
}
```

---

## 🔄 **ATUALIZAÇÕES NECESSÁRIAS NAS TABELAS EXISTENTES**

### 👨‍⚕️ **1. TABELA medicos - Campos Adicionais**
```sql
-- Adicionar campos para dados bancários e percentuais
percentual_padrao     Decimal   @default(70.00) @db.Decimal(5, 2)
banco                 String?   @db.VarChar(100)
agencia               String?   @db.VarChar(20)
conta                 String?   @db.VarChar(20)
tipo_conta            String?   @db.VarChar(20)  -- Corrente/Poupança
pix                   String?   @db.VarChar(255)
observacoes_financeiras String? @db.Text

// Relacionamento com repasses
repasses              repasses_medicos[]
```

### 👥 **2. TABELA pacientes - Simplificação**
```sql
-- REMOVER campos desnecessários para honorários:
-- plano_saude (será referência à operadora na consulta)
-- numero_carteirinha (será campo da consulta)

-- MANTER apenas dados essenciais:
id, nome_paciente, data_nascimento, cpf, email, telefone
```

### 💰 **3. TABELA consultas - Reestruturação Completa**
```sql
model consultas {
  id                     Int                @id @default(autoincrement())
  
  -- Dados básicos da consulta
  data_consulta          DateTime           @db.Date
  protocolo              String             @unique @db.VarChar(50)
  numero_guia            String?            @db.VarChar(50)  -- Número da guia da operadora
  numero_carteirinha     String?            @db.VarChar(50)  -- Carteirinha do paciente
  
  -- Relacionamentos principais
  medico_id              Int
  paciente_id            Int
  operadora_id           Int                -- NOVO: Referência à operadora
  procedimento_id        Int                -- NOVO: Referência ao procedimento
  lote_id                Int?               -- NOVO: Lote de faturamento
  
  -- Dados financeiros
  tipo_atendimento       tipo_atendimento_enum
  valor_operadora        Decimal            @db.Decimal(10, 2)  -- Valor da operadora
  valor_particular       Decimal?           @db.Decimal(10, 2)  -- Se particular
  percentual_medico      Decimal            @db.Decimal(5, 2)   -- % específico desta consulta
  valor_repasse_medico   Decimal            @db.Decimal(10, 2)  -- Valor calculado para médico
  
  -- Controle de pagamento
  status_financeiro      status_financeiro_enum @default(PENDENTE)
  data_pagamento         DateTime?          @db.Date
  valor_pago             Decimal?           @db.Decimal(10, 2)
  forma_pagamento        String?            @db.VarChar(50)
  
  -- Controle de glosas
  tem_glosa              Boolean            @default(false)
  valor_total_glosas     Decimal            @default(0.00) @db.Decimal(10, 2)
  
  -- Auditoria
  usuario_inclusao_id    Int
  usuario_alteracao_id   Int
  created_at             DateTime           @default(now()) @db.Timestamptz(6)
  updated_at             DateTime           @updatedAt @db.Timestamptz(6)

  -- Relacionamentos
  medico                 medicos            @relation(fields: [medico_id], references: [id])
  paciente               pacientes          @relation(fields: [paciente_id], references: [id])
  operadora              operadoras_saude   @relation(fields: [operadora_id], references: [id])
  procedimento           procedimentos_medicos @relation(fields: [procedimento_id], references: [id])
  lote                   lotes_faturamento? @relation(fields: [lote_id], references: [id])
  usuario_inclusao       usuarios           @relation("consultas_incluidas", fields: [usuario_inclusao_id], references: [id])
  usuario_alteracao      usuarios           @relation("consultas_alteradas", fields: [usuario_alteracao_id], references: [id])
  
  -- Relacionamento com glosas
  glosas                 glosas[]

  -- Índices otimizados
  @@index([medico_id])
  @@index([operadora_id])
  @@index([data_consulta])
  @@index([status_financeiro])
  @@index([lote_id])
}

enum tipo_atendimento_enum {
  PARTICULAR
  PLANO_SAUDE
  SUS
}

enum status_financeiro_enum {
  PENDENTE
  ENVIADO
  PAGO
  GLOSADO_PARCIAL
  GLOSADO_TOTAL
  CANCELADO
}
```

---

## 📊 **IMPACTO DAS MUDANÇAS**

### ✅ **Benefícios da Nova Estrutura**

#### 🎯 **1. Gestão Completa de Honorários**
- Controle detalhado por operadora
- Valores específicos por procedimento
- Cálculo automático de repasses

#### 📋 **2. Controle de Lotes de Faturamento**
- Organização por lotes para operadoras
- Rastreamento de protocolos
- Status detalhado de processamento

#### 🚫 **3. Gestão Avançada de Glosas**
- Motivos detalhados de glosa
- Processo de contestação
- Histórico completo de recursos

#### 💰 **4. Relatórios Financeiros Precisos**
- Contas a receber por operadora
- Repasses calculados automaticamente
- Análise de performance por plano

#### 📈 **5. Indicadores Gerenciais**
- Taxa de glosas por operadora
- Tempo médio de pagamento
- Produtividade médica
- Rentabilidade por plano

### 🔧 **Complexidade de Migração**

#### 🟡 **Média Complexidade:**
- Migração de dados existentes
- Atualização das APIs
- Ajustes no frontend
- Testes de integridade

#### ⏱️ **Estimativa de Tempo:**
- **Preparação:** 1 semana
- **Implementação:** 2-3 semanas
- **Testes:** 1 semana
- **Total:** 4-5 semanas

---

## 🎯 **ESTRATÉGIA DE IMPLEMENTAÇÃO**

### 📅 **FASE 1: Fundação (Semana 1-2)**
1. ✅ Criar tabelas: operadoras_saude, procedimentos_medicos
2. ✅ Implementar APIs básicas de cadastro
3. ✅ Migrar dados existentes

### 📅 **FASE 2: Core Business (Semana 3-4)**
1. ✅ Implementar tabela valores_procedimentos
2. ✅ Atualizar tabela consultas
3. ✅ Criar sistema de lotes_faturamento

### 📅 **FASE 3: Gestão Avançada (Semana 5)**
1. ✅ Implementar sistema de glosas
2. ✅ Criar tabela repasses_medicos
3. ✅ Atualizar todas as APIs

### 📅 **FASE 4: Testes e Validação (Semana 6)**
1. ✅ Testes de integridade
2. ✅ Validação dos cálculos
3. ✅ Testes de performance

---

## 🎯 **CONCLUSÃO**

Esta nova estrutura de banco de dados transforma o SGHM em um **sistema profissional de gestão de honorários médicos**, capaz de:

- ✅ **Controlar completamente** o ciclo financeiro das consultas
- ✅ **Automatizar cálculos** de valores e repasses
- ✅ **Gerenciar glosas** de forma profissional
- ✅ **Gerar relatórios** precisos para tomada de decisão
- ✅ **Escalar** para múltiplos médicos e operadoras

**Recomendação:** Implementar esta estrutura em fases, mantendo compatibilidade com os dados existentes durante a transição.

---

**✅ Esta revisão fornece a base sólida para um sistema de gestão de honorários médicos verdadeiramente profissional e eficiente.**