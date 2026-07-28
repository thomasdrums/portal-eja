import { prisma } from "@/lib/prisma";
import type { Modalidade } from "@prisma/client";
import type { ResultadoAcao } from "@/lib/queries/professores";
import { modalidadeLabel } from "@/lib/turma-labels";

export type { ResultadoAcao };

// "ativa"/"encerrada" na UI ↔ EM_ANDAMENTO/ENCERRADA no banco.
export type StatusUI = "ativa" | "encerrada";

export type TurmaRow = {
  id: string;
  nome: string;
  poloId: string;
  poloNome: string;
  codigo: string; // "" se vazio
  modalidade: "" | Modalidade;
  modalidadeLabel: string;
  entrada: string; // ex.: "2026.2" ("" se vazio)
  ano: string; // Int? no banco → string na UI ("" se vazio)
  etapa: string; // etapaEnsino ("" se vazio)
  status: StatusUI;
  professores: string[]; // nomes
  qtdAlunos: number;
};

export type NovaTurmaInput = {
  nome: string;
  poloId: string;
  codigo: string;
  modalidade: "" | Modalidade;
  entrada: string;
  ano: string;
  etapaEnsino: string;
  status: StatusUI;
  professorIds: string[];
};

export type EdicaoTurmaInput = NovaTurmaInput;

export async function listarTurmas(): Promise<TurmaRow[]> {
  const turmas = await prisma.turma.findMany({
    orderBy: { nome: "asc" },
    include: {
      polo: { select: { nome: true } },
      // Só professores não-arquivados aparecem vinculados à turma.
      professores: {
        where: { professor: { arquivado: false } },
        include: { professor: { select: { nome: true } } },
      },
      // Contagem de alunos considera apenas os não-arquivados.
      _count: { select: { alunos: { where: { arquivado: false } } } },
    },
  });

  return turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    poloId: t.poloId,
    poloNome: t.polo?.nome ?? "",
    codigo: t.codigo ?? "",
    modalidade: t.modalidade ?? "",
    modalidadeLabel: modalidadeLabel(t.modalidade),
    entrada: t.entrada ?? "",
    ano: t.ano != null ? String(t.ano) : "",
    etapa: t.etapaEnsino ?? "",
    status: t.status === "ENCERRADA" ? "encerrada" : "ativa",
    professores: t.professores.map((tp) => tp.professor.nome),
    qtdAlunos: t._count.alunos,
  }));
}

// Erro do Prisma para código já usado por outra turma (unique @unique).
function isCodigoDuplicado(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}

export async function criarTurma(dados: NovaTurmaInput): Promise<ResultadoAcao> {
  const nome = dados.nome.trim();
  if (!nome) return { ok: false, message: "Nome da turma é obrigatório." };
  if (!dados.poloId) return { ok: false, message: "Selecione um polo." };

  const codigo = dados.codigo.trim();
  try {
    await prisma.turma.create({
      data: {
        nome,
        poloId: dados.poloId,
        codigo: codigo || null,
        modalidade: dados.modalidade || null,
        entrada: dados.entrada.trim() || null,
        ano: dados.ano ? parseInt(dados.ano, 10) : null,
        etapaEnsino: dados.etapaEnsino || null,
        status: dados.status === "encerrada" ? "ENCERRADA" : "EM_ANDAMENTO",
        professores: dados.professorIds.length
          ? { create: dados.professorIds.map((professorId) => ({ professorId })) }
          : undefined,
      },
    });
  } catch (e) {
    if (isCodigoDuplicado(e))
      return { ok: false, message: `O código "${codigo}" já está em uso por outra turma.` };
    throw e;
  }
  return { ok: true, message: "Turma criada" };
}

export async function atualizarTurma(
  id: string,
  dados: EdicaoTurmaInput,
): Promise<ResultadoAcao> {
  const nome = dados.nome.trim();
  if (!nome) return { ok: false, message: "Nome da turma é obrigatório." };
  if (!dados.poloId) return { ok: false, message: "Selecione um polo." };

  const codigo = dados.codigo.trim();
  try {
    await prisma.turma.update({
      where: { id },
      data: {
        nome,
        poloId: dados.poloId,
        codigo: codigo || null,
        modalidade: dados.modalidade || null,
        entrada: dados.entrada.trim() || null,
        ano: dados.ano ? parseInt(dados.ano, 10) : null,
        etapaEnsino: dados.etapaEnsino || null,
        professores: {
          deleteMany: {},
          create: dados.professorIds.map((professorId) => ({ professorId })),
        },
      },
    });
  } catch (e) {
    if (isCodigoDuplicado(e))
      return { ok: false, message: `O código "${codigo}" já está em uso por outra turma.` };
    throw e;
  }
  return { ok: true, message: "Dados atualizados" };
}

export async function encerrarTurma(id: string): Promise<ResultadoAcao> {
  await prisma.turma.update({ where: { id }, data: { status: "ENCERRADA" } });
  return { ok: true, message: "Turma encerrada" };
}

export async function reabrirTurma(id: string): Promise<ResultadoAcao> {
  await prisma.turma.update({ where: { id }, data: { status: "EM_ANDAMENTO" } });
  return { ok: true, message: "Turma reaberta" };
}
