-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "arquivado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "arquivadoEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "arquivado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "arquivadoEm" TIMESTAMP(3);
