-- CreateEnum
CREATE TYPE "role_usuario" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "tipo_pagamento" AS ENUM ('PARTICULAR', 'PLANO_SAUDE');

-- CreateEnum
CREATE TYPE "tipo_plano" AS ENUM ('PARTICULAR', 'CONVENIO', 'SUS');

-- CreateEnum
CREATE TYPE "status_pagamento" AS ENUM ('PENDENTE', 'PAGO', 'GLOSA');

-- CreateEnum
CREATE TYPE "status_honorario" AS ENUM ('PENDENTE', 'ENVIADO', 'PAGO', 'GLOSADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome_completo" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(14),
    "telefone" VARCHAR(20),
    "role" "role_usuario" NOT NULL DEFAULT 'OPERADOR',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" SERIAL NOT NULL,
    "nome_medico" VARCHAR(100) NOT NULL,
    "especialidade" VARCHAR(100),
    "crm" VARCHAR(20) NOT NULL,
    "cnpj_cpf" VARCHAR(18),
    "email" VARCHAR(100),
    "telefone" VARCHAR(20),
    "percentual_repasse" DECIMAL(5,2) DEFAULT 70.00,
    "dados_bancarios" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" SERIAL NOT NULL,
    "nome_paciente" VARCHAR(100) NOT NULL,
    "data_nascimento" DATE,
    "cpf" VARCHAR(14),
    "email" VARCHAR(100),
    "telefone" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_saude" (
    "id" SERIAL NOT NULL,
    "nome_plano" VARCHAR(100) NOT NULL,
    "codigo_operadora" VARCHAR(20),
    "tipo_plano" "tipo_plano" NOT NULL DEFAULT 'CONVENIO',
    "prazo_pagamento_dias" INTEGER NOT NULL DEFAULT 30,
    "valor_consulta_padrao" DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    "percentual_glosa_historica" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planos_saude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" SERIAL NOT NULL,
    "data_consulta" DATE NOT NULL,
    "protocolo" VARCHAR(50) NOT NULL,
    "consultorio" VARCHAR(100),
    "tipo_pagamento" "tipo_pagamento",
    "valor_bruto" DECIMAL(10,2) NOT NULL,
    "valor_glosa" DECIMAL(10,2) DEFAULT 0.00,
    "valor_recebido" DECIMAL(10,2) DEFAULT 0.00,
    "data_recebimento" DATE,
    "status_pagamento" "status_pagamento" NOT NULL DEFAULT 'PENDENTE',
    "descricao_procedimento" VARCHAR(255),
    "plano_saude_id" INTEGER,
    "numero_carteirinha" VARCHAR(50),
    "tem_honorario" BOOLEAN NOT NULL DEFAULT false,
    "medico_id" INTEGER NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "usuario_inclusao_id" INTEGER NOT NULL,
    "usuario_alteracao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "honorarios" (
    "id" SERIAL NOT NULL,
    "consulta_id" INTEGER NOT NULL,
    "plano_saude_id" INTEGER NOT NULL,
    "valor_consulta" DECIMAL(10,2) NOT NULL,
    "valor_glosa" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "valor_liquido" DECIMAL(10,2) NOT NULL,
    "valor_repasse_medico" DECIMAL(10,2) NOT NULL,
    "status_pagamento" "status_honorario" NOT NULL DEFAULT 'PENDENTE',
    "data_pagamento" DATE,
    "motivo_glosa" VARCHAR(255),
    "data_glosa" DATE,
    "numero_guia" VARCHAR(50),
    "observacoes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honorarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_crm_key" ON "medicos"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- CreateIndex
CREATE INDEX "planos_saude_tipo_plano_idx" ON "planos_saude"("tipo_plano");

-- CreateIndex
CREATE INDEX "planos_saude_ativo_idx" ON "planos_saude"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "consultas_protocolo_key" ON "consultas"("protocolo");

-- CreateIndex
CREATE INDEX "consultas_medico_id_idx" ON "consultas"("medico_id");

-- CreateIndex
CREATE INDEX "consultas_paciente_id_idx" ON "consultas"("paciente_id");

-- CreateIndex
CREATE INDEX "consultas_plano_saude_id_idx" ON "consultas"("plano_saude_id");

-- CreateIndex
CREATE INDEX "consultas_usuario_inclusao_id_idx" ON "consultas"("usuario_inclusao_id");

-- CreateIndex
CREATE INDEX "consultas_usuario_alteracao_id_idx" ON "consultas"("usuario_alteracao_id");

-- CreateIndex
CREATE INDEX "consultas_data_consulta_idx" ON "consultas"("data_consulta");

-- CreateIndex
CREATE INDEX "consultas_status_pagamento_idx" ON "consultas"("status_pagamento");

-- CreateIndex
CREATE UNIQUE INDEX "honorarios_consulta_id_key" ON "honorarios"("consulta_id");

-- CreateIndex
CREATE INDEX "honorarios_consulta_id_idx" ON "honorarios"("consulta_id");

-- CreateIndex
CREATE INDEX "honorarios_plano_saude_id_idx" ON "honorarios"("plano_saude_id");

-- CreateIndex
CREATE INDEX "honorarios_status_pagamento_idx" ON "honorarios"("status_pagamento");

-- CreateIndex
CREATE INDEX "honorarios_data_pagamento_idx" ON "honorarios"("data_pagamento");

-- CreateIndex
CREATE INDEX "honorarios_created_at_idx" ON "honorarios"("created_at");

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_plano_saude_id_fkey" FOREIGN KEY ("plano_saude_id") REFERENCES "planos_saude"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_usuario_alteracao_id_fkey" FOREIGN KEY ("usuario_alteracao_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_usuario_inclusao_id_fkey" FOREIGN KEY ("usuario_inclusao_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honorarios" ADD CONSTRAINT "honorarios_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "consultas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honorarios" ADD CONSTRAINT "honorarios_plano_saude_id_fkey" FOREIGN KEY ("plano_saude_id") REFERENCES "planos_saude"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
