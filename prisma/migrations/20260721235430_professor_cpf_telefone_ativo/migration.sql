-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "telefone" TEXT;
