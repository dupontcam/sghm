-- AlterTable
ALTER TABLE "consultas" ADD COLUMN     "tipo_local" VARCHAR(100);

-- AlterTable
ALTER TABLE "honorarios" ADD COLUMN     "data_recurso" DATE,
ADD COLUMN     "motivo_recurso" TEXT,
ADD COLUMN     "recurso_enviado" BOOLEAN DEFAULT false,
ADD COLUMN     "status_recurso" VARCHAR(20),
ADD COLUMN     "valor_recuperado" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "historico_honorarios" (
    "id" SERIAL NOT NULL,
    "honorario_id" INTEGER NOT NULL,
    "tipo_evento" VARCHAR(50) NOT NULL,
    "descricao" TEXT NOT NULL,
    "dados_adicionais" JSONB,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_honorarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historico_honorarios_honorario_id_idx" ON "historico_honorarios"("honorario_id");

-- CreateIndex
CREATE INDEX "historico_honorarios_created_at_idx" ON "historico_honorarios"("created_at");

-- CreateIndex
CREATE INDEX "historico_honorarios_tipo_evento_idx" ON "historico_honorarios"("tipo_evento");

-- CreateIndex
CREATE INDEX "honorarios_status_recurso_idx" ON "honorarios"("status_recurso");

-- AddForeignKey
ALTER TABLE "historico_honorarios" ADD CONSTRAINT "historico_honorarios_honorario_id_fkey" FOREIGN KEY ("honorario_id") REFERENCES "honorarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_honorarios" ADD CONSTRAINT "historico_honorarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
