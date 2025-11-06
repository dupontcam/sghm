-- Script de criação das tabelas para o projeto SGHM
-- Compatível com PostgreSQL
-- language: postgresql

-- Criar ENUMs primeiro
CREATE TYPE role_usuario AS ENUM ('ADMIN', 'OPERADOR');
CREATE TYPE tipo_pagamento AS ENUM ('PARTICULAR', 'PLANO_SAUDE');
CREATE TYPE status_pagamento AS ENUM ('PENDENTE', 'PAGO', 'GLOSA');

-- Tabela 1: Usuários do Sistema (Admin, Operador)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- A senha NUNCA deve ser salva em texto puro.
    -- O backend (Node.js) fará o hash (ex: bcrypt) antes de salvar.
    senha VARCHAR(255) NOT NULL,
    
    nome_completo VARCHAR(255) NOT NULL,
    
    -- CHECK constraint garante que o 'role' só pode ser um desses dois valores
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'OPERADOR')),
    
    cpf VARCHAR(14) UNIQUE, -- CPF/CNPJ da empresa/usuário
    telefone VARCHAR(20),
    
    ativo BOOLEAN DEFAULT true,
    
    -- Timestamps para auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 2: Médicos
CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    nome_medico VARCHAR(255) NOT NULL,
    especialidade VARCHAR(255),
    crm VARCHAR(50) UNIQUE NOT NULL,
    
    -- Pode conter CPF ou CNPJ
    cnpj_cpf VARCHAR(18) UNIQUE, 
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 3: Pacientes
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nome_paciente VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    
    -- Dados do plano de saúde
    plano_saude VARCHAR(255),
    numero_carteirinha VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 4: Consultas (Tabela Central)
CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    
    -- Chaves Estrangeiras (Relações)
    -- ON DELETE RESTRICT: impede que um médico ou paciente seja deletado
    -- se ele estiver associado a uma consulta.
    medico_id INTEGER NOT NULL REFERENCES medicos(id) ON DELETE RESTRICT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    
    data_consulta DATE NOT NULL,
    protocolo VARCHAR(100) UNIQUE, -- Protocolo da operadora
    consultorio VARCHAR(255),
    tipo_pagamento VARCHAR(100), -- Ex: 'Plano de Saúde', 'Particular'
    especialidade_consulta VARCHAR(255),
    
    -- Campos Financeiros
    -- Usamos DECIMAL(10, 2) para valores monetários (10 dígitos no total, 2 após a vírgula)
    -- NUNCA use FLOAT para dinheiro.
    valor_bruto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Status do pagamento (PENDENTE, PAGO, GLOSA)
    status_pagamento VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' 
        CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'GLOSA')),
        
    valor_glosa DECIMAL(10, 2) DEFAULT 0.00,
    valor_recebido DECIMAL(10, 2) DEFAULT 0.00,
    data_recebimento DATE,
    
    descricao_procedimento TEXT,
    
    -- Campos de Auditoria (Quem fez o quê)
    -- Também protegidos por RESTRICT
    usuario_inclusao_id INTEGER REFERENCES usuarios(id) ON DELETE RESTRICT,
    usuario_alteracao_id INTEGER REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices: Melhoram a performance de buscas futuras (SELECTs)
CREATE INDEX idx_consultas_medico_id ON consultas(medico_id);
CREATE INDEX idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX idx_consultas_data_consulta ON consultas(data_consulta);
CREATE INDEX idx_consultas_status_pagamento ON consultas(status_pagamento);
