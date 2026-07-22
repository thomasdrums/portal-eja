import { prisma } from "@/lib/prisma";

export type ResultadoAcao = { ok: boolean; message: string };

export type Opcao = { id: string; nome: string };

// Formato consumido pela tela de Gestão de Professores.
// Obs.: o e-mail vive no User vinculado (exibido, não gravado aqui).
export type ProfessorRow = {
  id: string;
  nome: string;
  cpf: string; // persistido (coluna cpf)
  email: string; // vem do User vinculado (se houver)
  telefone: string; // persistido (coluna telefone)
  areaId: string | null;
  areaNome: string;
  poloId: string | null;
  poloNome: string;
  ativo: boolean; // persistido (coluna ativo)
  turmasVinculadas: string[];
};

export type NovoProfessorInput = {
  nome: string;
  areaId: string | null;
  poloId: string | null;
  cpf: string;
  email: string; // não gravado aqui (vive no User)
  telefone: string;
  ativo: boolean;
  turmaIds: string[];
};

export type EdicaoProfessorInput = NovoProfessorInput;

export async function listarProfessores(): Promise<ProfessorRow[]> {
  const professores = await prisma.professor.findMany({
    orderBy: { nome: "asc" },
    include: {
      user: { select: { email: true } },
      area: { select: { nome: true } },
      polo: { select: { nome: true } },
      turmas: { include: { turma: { select: { nome: true } } } },
    },
  });

  return professores.map((p) => ({
    id: p.id,
    nome: p.nome,
    cpf: p.cpf ?? "",
    email: p.user?.email ?? "",
    telefone: p.telefone ?? "",
    areaId: p.areaId,
    areaNome: p.area?.nome ?? "",
    poloId: p.poloId,
    poloNome: p.polo?.nome ?? "",
    ativo: p.ativo,
    turmasVinculadas: p.turmas.map((tp) => tp.turma.nome),
  }));
}

// ── Opções para os seletores (áreas, polos, professores, turmas) ──
export async function listarAreas(): Promise<Opcao[]> {
  return prisma.area.findMany({ orderBy: { ordem: "asc" }, select: { id: true, nome: true } });
}

export async function listarPolos(): Promise<Opcao[]> {
  return prisma.polo.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}

export async function listarProfessoresOpcoes(): Promise<Opcao[]> {
  return prisma.professor.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}

export async function listarTurmasOpcoes(): Promise<Opcao[]> {
  return prisma.turma.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}

export async function criarProfessor(dados: NovoProfessorInput): Promise<ResultadoAcao> {
  const nome = dados.nome.trim();
  if (!nome) return { ok: false, message: "Nome é obrigatório." };

  await prisma.professor.create({
    data: {
      nome,
      cpf: dados.cpf.trim() || null,
      telefone: dados.telefone.trim() || null,
      ativo: dados.ativo,
      areaId: dados.areaId || null,
      poloId: dados.poloId || null,
      turmas: dados.turmaIds.length
        ? { create: dados.turmaIds.map((turmaId) => ({ turmaId })) }
        : undefined,
    },
  });
  return { ok: true, message: "Professor cadastrado" };
}

export async function atualizarProfessor(
  id: string,
  dados: EdicaoProfessorInput,
): Promise<ResultadoAcao> {
  const nome = dados.nome.trim();
  if (!nome) return { ok: false, message: "Nome é obrigatório." };

  // Recria os vínculos de turma (deleteMany + create) para refletir a seleção atual.
  await prisma.professor.update({
    where: { id },
    data: {
      nome,
      cpf: dados.cpf.trim() || null,
      telefone: dados.telefone.trim() || null,
      ativo: dados.ativo,
      areaId: dados.areaId || null,
      poloId: dados.poloId || null,
      turmas: {
        deleteMany: {},
        create: dados.turmaIds.map((turmaId) => ({ turmaId })),
      },
    },
  });
  return { ok: true, message: "Dados atualizados" };
}

export async function definirAtivoProfessor(id: string, ativo: boolean): Promise<ResultadoAcao> {
  await prisma.professor.update({ where: { id }, data: { ativo } });
  return { ok: true, message: ativo ? "Professor reativado" : "Professor inativado" };
}
