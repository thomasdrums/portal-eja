-- CreateEnum
CREATE TYPE "Segmento" AS ENUM ('FUNDAMENTAL_II', 'ENSINO_MEDIO');

-- CreateEnum
CREATE TYPE "Modalidade" AS ENUM ('NOVA_EJA', 'SEJAPRO');

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "entrada" TEXT,
ADD COLUMN     "modalidade" "Modalidade",
ADD COLUMN     "segmento" "Segmento";

-- CreateIndex
CREATE UNIQUE INDEX "Turma_codigo_key" ON "Turma"("codigo");
