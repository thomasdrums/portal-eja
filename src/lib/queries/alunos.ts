import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, type EtapaAluno, type SituacaoAluno } from "@prisma/client";

// Formato consumido pela tela de Gestão de Alunos (mesma forma do mock anterior).
export type AlunoRow = {
  id: string;
  ra: string;
  nome: string;
  email: string;
  cidade: string;
  telefone: string;
  etapa: EtapaAluno;
  situacao: SituacaoAluno;
  ativo: boolean;
  turmaId: string | null;
  turmaNome: string;
  poloNome: string | null;
};

export type TurmaOption = { id: string; nome: string };

export type NovoAlunoInput = {
  nome: string;
  ra: string;
  cidade: string;
  telefone: string;
  email: string;
  turmaId: string | null;
  etapa: EtapaAluno;
  situacao: SituacaoAluno;
};

export type EdicaoAlunoInput = {
  nome: string;
  ra: string;
  cidade: string;
  telefone: string;
  email: string;
  etapa: EtapaAluno;
};

export type ResultadoAluno = { ok: boolean; message: string };

// Senha temporária padrão ao redefinir o acesso do aluno.
const SENHA_PADRAO = "eja123";

// Alunos evadidos/desistentes/inativos entram como sem acesso ativo.
function derivarAtivo(situacao: SituacaoAluno): boolean {
  return situacao !== "EVADIDO" && situacao !== "DESISTENTE" && situacao !== "INATIVO";
}

// Detecta violação de unicidade (RA duplicado) do Prisma (P2002).
function isRaDuplicado(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return false;
  const target = e.meta?.target;
  const alvo = Array.isArray(target) ? target.join(",") : String(target ?? "");
  return alvo.includes("ra");
}

export async function listarAlunos(): Promise<AlunoRow[]> {
  const alunos = await prisma.aluno.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      turma: { include: { polo: { select: { nome: true } } } },
    },
  });

  return alunos.map((a) => ({
    id: a.id,
    ra: a.ra ?? "",
    nome: a.nome,
    email: a.user?.email ?? "", // e-mail vem da conta de acesso vinculada, se houver
    cidade: a.cidade ?? "",
    telefone: a.telefone ?? "",
    etapa: a.etapa,
    situacao: a.situacao,
    ativo: a.ativo,
    turmaId: a.turmaId,
    turmaNome: a.turma?.nome ?? "—",
    poloNome: a.turma?.polo?.nome ?? null,
  }));
}

export async function listarTurmas(): Promise<TurmaOption[]> {
  return prisma.turma.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}

export async function criarAluno(dados: NovoAlunoInput): Promise<ResultadoAluno> {
  const nome = dados.nome.trim();
  const ra = dados.ra.trim();
  if (!nome || !ra) return { ok: false, message: "Nome e RA são obrigatórios." };

  try {
    await prisma.aluno.create({
      data: {
        nome,
        ra,
        cidade: dados.cidade.trim() || null,
        telefone: dados.telefone.trim() || null,
        etapa: dados.etapa,
        situacao: dados.situacao,
        ativo: derivarAtivo(dados.situacao),
        turmaId: dados.turmaId || null,
      },
    });
    return { ok: true, message: "Aluno cadastrado" };
  } catch (e) {
    if (isRaDuplicado(e)) return { ok: false, message: `Já existe um aluno com o RA ${ra}.` };
    throw e;
  }
}

export async function atualizarAluno(id: string, dados: EdicaoAlunoInput): Promise<ResultadoAluno> {
  const nome = dados.nome.trim();
  const ra = dados.ra.trim();
  if (!nome || !ra) return { ok: false, message: "Nome e RA são obrigatórios." };

  try {
    await prisma.aluno.update({
      where: { id },
      data: {
        nome,
        ra,
        cidade: dados.cidade.trim() || null,
        telefone: dados.telefone.trim() || null,
        etapa: dados.etapa,
      },
    });
    return { ok: true, message: "Dados atualizados" };
  } catch (e) {
    if (isRaDuplicado(e)) return { ok: false, message: `Já existe um aluno com o RA ${ra}.` };
    throw e;
  }
}

export async function definirAtivo(id: string, ativo: boolean): Promise<ResultadoAluno> {
  await prisma.aluno.update({ where: { id }, data: { ativo } });
  return { ok: true, message: ativo ? "Aluno ativado" : "Aluno inativado" };
}

export async function resetarSenhaAluno(id: string): Promise<ResultadoAluno> {
  const aluno = await prisma.aluno.findUnique({ where: { id }, select: { userId: true } });
  if (!aluno?.userId) {
    return { ok: false, message: "Este aluno não possui acesso (sem conta de login)." };
  }
  const passwordHash = bcrypt.hashSync(SENHA_PADRAO, 10);
  await prisma.user.update({ where: { id: aluno.userId }, data: { passwordHash } });
  return { ok: true, message: `Senha redefinida para "${SENHA_PADRAO}"` };
}
