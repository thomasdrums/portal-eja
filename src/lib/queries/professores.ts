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
  arquivadoEm: string | null; // data/hora de arquivamento (só nos arquivados)
  turmasVinculadas: string[];
};

// Formata data/hora para exibição (dd/mm/aaaa hh:mm); null quando não há data.
function fmtDataHora(d: Date | null): string | null {
  if (!d) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
}

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

// Busca professores filtrando por arquivado (false = listas normais; true = arquivados).
async function buscarProfessores(arquivado: boolean): Promise<ProfessorRow[]> {
  const professores = await prisma.professor.findMany({
    where: { arquivado },
    orderBy: arquivado ? { arquivadoEm: "desc" } : { nome: "asc" },
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
    arquivadoEm: fmtDataHora(p.arquivadoEm),
    turmasVinculadas: p.turmas.map((tp) => tp.turma.nome),
  }));
}

// Lista padrão: apenas os NÃO arquivados.
export async function listarProfessores(): Promise<ProfessorRow[]> {
  return buscarProfessores(false);
}

// Lista de arquivados (soft delete), com a data de arquivamento.
export async function listarProfessoresArquivados(): Promise<ProfessorRow[]> {
  return buscarProfessores(true);
}

// ── Opções para os seletores (áreas, polos, professores, turmas) ──
export async function listarAreas(): Promise<Opcao[]> {
  return prisma.area.findMany({ orderBy: { ordem: "asc" }, select: { id: true, nome: true } });
}

export async function listarPolos(): Promise<Opcao[]> {
  return prisma.polo.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}

export async function listarProfessoresOpcoes(): Promise<Opcao[]> {
  return prisma.professor.findMany({
    where: { arquivado: false },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
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

// Soft delete: arquiva o professor (sai das listas, permanece no banco). Não deleta nada.
export async function arquivarProfessor(id: string): Promise<ResultadoAcao> {
  await prisma.professor.update({
    where: { id },
    data: { arquivado: true, arquivadoEm: new Date() },
  });
  return { ok: true, message: "Professor arquivado" };
}

// Restaura um professor arquivado (volta às listas do dia a dia).
export async function desarquivarProfessor(id: string): Promise<ResultadoAcao> {
  await prisma.professor.update({
    where: { id },
    data: { arquivado: false, arquivadoEm: null },
  });
  return { ok: true, message: "Professor restaurado" };
}
