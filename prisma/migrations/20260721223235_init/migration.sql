-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ALUNO', 'PROFESSOR', 'COORDENACAO');

-- CreateEnum
CREATE TYPE "SituacaoAluno" AS ENUM ('EM_PROCESSO', 'CURSANDO', 'APROVADO', 'RDS', 'EVADIDO', 'DESISTENTE', 'INATIVO');

-- CreateEnum
CREATE TYPE "EtapaAluno" AS ENUM ('AVA', 'RDS');

-- CreateEnum
CREATE TYPE "StatusTurma" AS ENUM ('EM_ANDAMENTO', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('RECEBIDA', 'EM_ANALISE', 'EM_PROCESSAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DECLARACAO_MATRICULA', 'DECLARACAO_FREQUENCIA', 'HISTORICO_ESCOLAR', 'CERTIFICADO', 'OUTROS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Polo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Polo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ano" INTEGER,
    "etapaEnsino" TEXT,
    "status" "StatusTurma" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "poloId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "temNotas" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competencia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "habilidades" INTEGER NOT NULL DEFAULT 0,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "Competencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ra" TEXT,
    "cidade" TEXT,
    "telefone" TEXT,
    "cep" TEXT,
    "nomePai" TEXT,
    "nomeMae" TEXT,
    "escolaridade" TEXT,
    "situacao" "SituacaoAluno" NOT NULL DEFAULT 'CURSANDO',
    "etapa" "EtapaAluno" NOT NULL DEFAULT 'AVA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataMatricula" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "historicoEntregue" BOOLEAN NOT NULL DEFAULT false,
    "certificadoEmitido" BOOLEAN NOT NULL DEFAULT false,
    "certificadoRecebido" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "turmaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "areaId" TEXT,
    "poloId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaProfessor" (
    "turmaId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,

    CONSTRAINT "TurmaProfessor_pkey" PRIMARY KEY ("turmaId","professorId")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "certificacao" INTEGER,
    "presenca" INTEGER,
    "diagnostica" INTEGER,
    "avaliativa" INTEGER,
    "voceAutor" INTEGER,
    "alunoId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frequencia" (
    "id" TEXT NOT NULL,
    "totalAulas" INTEGER NOT NULL DEFAULT 0,
    "presencas" INTEGER NOT NULL DEFAULT 0,
    "alunoId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Frequencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AulaGravada" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "formularioUrl" TEXT,
    "areaId" TEXT NOT NULL,
    "professorId" TEXT,
    "turmaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AulaGravada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observacao" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Observacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "tipoOutros" TEXT,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'RECEBIDA',
    "alunoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Polo_nome_key" ON "Polo"("nome");

-- CreateIndex
CREATE INDEX "Turma_poloId_idx" ON "Turma"("poloId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_slug_key" ON "Area"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Competencia_areaId_codigo_key" ON "Competencia"("areaId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_ra_key" ON "Aluno"("ra");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_userId_key" ON "Aluno"("userId");

-- CreateIndex
CREATE INDEX "Aluno_turmaId_idx" ON "Aluno"("turmaId");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");

-- CreateIndex
CREATE INDEX "TurmaProfessor_professorId_idx" ON "TurmaProfessor"("professorId");

-- CreateIndex
CREATE INDEX "Nota_alunoId_idx" ON "Nota"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_alunoId_competenciaId_key" ON "Nota"("alunoId", "competenciaId");

-- CreateIndex
CREATE INDEX "Frequencia_alunoId_idx" ON "Frequencia"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "Frequencia_alunoId_areaId_key" ON "Frequencia"("alunoId", "areaId");

-- CreateIndex
CREATE INDEX "AulaGravada_areaId_idx" ON "AulaGravada"("areaId");

-- CreateIndex
CREATE INDEX "AulaGravada_turmaId_idx" ON "AulaGravada"("turmaId");

-- CreateIndex
CREATE INDEX "Observacao_alunoId_idx" ON "Observacao"("alunoId");

-- CreateIndex
CREATE INDEX "Solicitacao_alunoId_idx" ON "Solicitacao"("alunoId");

-- CreateIndex
CREATE INDEX "Solicitacao_status_idx" ON "Solicitacao"("status");

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_poloId_fkey" FOREIGN KEY ("poloId") REFERENCES "Polo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competencia" ADD CONSTRAINT "Competencia_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_poloId_fkey" FOREIGN KEY ("poloId") REFERENCES "Polo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaProfessor" ADD CONSTRAINT "TurmaProfessor_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaProfessor" ADD CONSTRAINT "TurmaProfessor_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaGravada" ADD CONSTRAINT "AulaGravada_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaGravada" ADD CONSTRAINT "AulaGravada_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaGravada" ADD CONSTRAINT "AulaGravada_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observacao" ADD CONSTRAINT "Observacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observacao" ADD CONSTRAINT "Observacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;
