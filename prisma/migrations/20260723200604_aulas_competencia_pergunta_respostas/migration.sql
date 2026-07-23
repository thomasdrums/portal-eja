/*
  Warnings:

  - You are about to drop the column `formularioUrl` on the `AulaGravada` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoAula" AS ENUM ('AREA', 'INTERAREA', 'GERAL');

-- CreateEnum
CREATE TYPE "StatusResposta" AS ENUM ('PENDENTE', 'VALIDADA', 'RECUSADA');

-- DropForeignKey
ALTER TABLE "AulaGravada" DROP CONSTRAINT "AulaGravada_areaId_fkey";

-- AlterTable
ALTER TABLE "AulaGravada" DROP COLUMN "formularioUrl",
ADD COLUMN     "competenciaId" TEXT,
ADD COLUMN     "pergunta" TEXT,
ADD COLUMN     "tipo" "TipoAula" NOT NULL DEFAULT 'AREA',
ALTER COLUMN "areaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Competencia" ADD COLUMN     "aulas" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RespostaAula" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "status" "StatusResposta" NOT NULL DEFAULT 'PENDENTE',
    "motivoRecusa" TEXT,
    "validadaEm" TIMESTAMP(3),
    "alunoId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "validadaPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RespostaAula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RespostaAula_alunoId_idx" ON "RespostaAula"("alunoId");

-- CreateIndex
CREATE INDEX "RespostaAula_aulaId_idx" ON "RespostaAula"("aulaId");

-- CreateIndex
CREATE UNIQUE INDEX "RespostaAula_alunoId_aulaId_key" ON "RespostaAula"("alunoId", "aulaId");

-- CreateIndex
CREATE INDEX "AulaGravada_competenciaId_idx" ON "AulaGravada"("competenciaId");

-- AddForeignKey
ALTER TABLE "AulaGravada" ADD CONSTRAINT "AulaGravada_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaGravada" ADD CONSTRAINT "AulaGravada_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaAula" ADD CONSTRAINT "RespostaAula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaAula" ADD CONSTRAINT "RespostaAula_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "AulaGravada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaAula" ADD CONSTRAINT "RespostaAula_validadaPorId_fkey" FOREIGN KEY ("validadaPorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
