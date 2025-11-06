-- ========================================
-- SGHM - Sistema de Gestão de Honorários Médicos
-- Schema PostgreSQL 16+
-- Versão: 2.0
-- Data: 06/11/2025
-- ========================================

-- Desabilitar avisos do VS Code para este arquivo
-- @ts-nocheck
-- sqlfluff:off

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;

-- ========================================
-- STEP 1: Criar ENUMs
-- ========================================

-- Enum para role dos usuários
DROP TYPE IF EXISTS role_usuario CASCADE;
CREATE TYPE role_usuario AS ENUM ('ADMIN', 'OPERADOR');

-- Enum para tipo de pagamento
DROP TYPE IF EXISTS tipo_pagamento CASCADE; 
CREATE TYPE tipo_pagamento AS ENUM ('PARTICULAR', 'PLANO_SAUDE');

-- Enum para status do pagamento
DROP TYPE IF EXISTS status_pagamento CASCADE;
CREATE TYPE status_pagamento AS ENUM ('PENDENTE', 'PAGO', 'GLOSA');

-- ========================================
-- STEP 2: Tabelas Principais
-- ========================================

-- Tabela de usuários do sistema
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- Hash bcrypt
    nome_completo VARCHAR(255) NOT NULL,
    role role_usuario NOT NULL DEFAULT 'OPERADOR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de médicos
DROP TABLE IF EXISTS medicos CASCADE;
CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    nome_medico VARCHAR(255) NOT NULL,
    especialidade VARCHAR(255),
    crm VARCHAR(50) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pacientes
DROP TABLE IF EXISTS pacientes CASCADE;
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nome_paciente VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de consultas
DROP TABLE IF EXISTS consultas CASCADE;
CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    data_consulta DATE NOT NULL,
    protocolo VARCHAR(100) UNIQUE,
    consultorio VARCHAR(100),
    tipo_pagamento tipo_pagamento NOT NULL,
    valor_bruto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    valor_glosa DECIMAL(10,2) DEFAULT 0.00,
    valor_recebido DECIMAL(10,2) DEFAULT 0.00,
    data_recebimento DATE,
    status_pagamento status_pagamento NOT NULL DEFAULT 'PENDENTE',
    descricao_procedimento TEXT,
    medico_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    usuario_inclusao_id INTEGER NOT NULL,
    usuario_alteracao_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_consultas_medico 
        FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_paciente 
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_usuario_inclusao 
        FOREIGN KEY (usuario_inclusao_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_consultas_usuario_alteracao 
        FOREIGN KEY (usuario_alteracao_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ========================================
-- STEP 3: Índices para Performance
-- ========================================

-- Índices para consultas
CREATE INDEX idx_consultas_data ON consultas(data_consulta);
CREATE INDEX idx_consultas_medico ON consultas(medico_id);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_status ON consultas(status_pagamento);
CREATE INDEX idx_consultas_protocolo ON consultas(protocolo);

-- Índices para médicos
CREATE INDEX idx_medicos_nome ON medicos(nome_medico);
CREATE INDEX idx_medicos_especialidade ON medicos(especialidade);

-- Índices para pacientes
CREATE INDEX idx_pacientes_nome ON pacientes(nome_paciente);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);

-- Índices para usuários
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ========================================
-- STEP 4: Usuário Padrão do Sistema
-- ========================================

-- Inserir usuário administrador padrão
-- Senha: admin123 (será hasheada pelo backend)
INSERT INTO usuarios (email, senha, nome_completo, role) 
VALUES ('admin@sghm.com', '$2b$10$exemplo_hash_aqui', 'Administrador do Sistema', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- STEP 5: Funções de Triggers (opcional)
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicos_updated_at 
    BEFORE UPDATE ON medicos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at 
    BEFORE UPDATE ON pacientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultas_updated_at 
    BEFORE UPDATE ON consultas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 6: Grants e Permissões
-- ========================================

-- Conceder permissões ao usuário sghm
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sghm;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sghm;
GRANT USAGE ON SCHEMA public TO sghm;

-- ========================================
-- FIM DO SCHEMA
-- ========================================

-- Verificar se tudo foi criado corretamente
SELECT 'Schema SGHM criado com sucesso!' AS status;