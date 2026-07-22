-- AlterEnum
ALTER TYPE "StatusSolicitacao" ADD VALUE 'CANCELADA';

-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "protocolo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Solicitacao_protocolo_key" ON "Solicitacao"("protocolo");
