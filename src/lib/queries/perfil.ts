import { prisma } from "@/lib/prisma";
import { Prisma, type SituacaoAluno, type EtapaAluno } from "@prisma/client";

// ════════════════════════════════════════════════════════════════════════════
// PERFIL (dados da própria pessoa logada — sempre derivada da SESSÃO no servidor)
// ════════════════════════════════════════════════════════════════════════════

export type ResultadoPerfil = { ok: boolean; message: string };

// ── ALUNO (somente leitura) ─────────────────────────────────────────────────
export type PerfilAluno = {
  nome: string;
  ra: string | null;
  email: string | null;
  cidade: string | null;
  telefone: string | null;
  cep: string | null;
  nomePai: string | null;
  nomeMae: string | null;
  turmaNome: string | null;
  poloNome: string | null;
  etapa: EtapaAluno;
  situacao: SituacaoAluno;
};

// Carrega o perfil do ALUNO logado (sessão → User → Aluno). null se não houver aluno vinculado.
export async function carregarPerfilAluno(
  userId: string | undefined,
): Promise<PerfilAluno | null> {
  if (!userId) return null;

  const aluno = await prisma.aluno.findUnique({
    where: { userId },
    include: {
      user: { select: { email: true } },
      turma: { include: { polo: { select: { nome: true } } } },
    },
  });
  if (!aluno) return null;

  return {
    nome: aluno.nome,
    ra: aluno.ra,
    // Prioriza o e-mail do próprio Aluno; se vazio, cai no da conta de acesso.
    email: aluno.email ?? aluno.user?.email ?? null,
    cidade: aluno.cidade,
    telefone: aluno.telefone,
    cep: aluno.cep,
    nomePai: aluno.nomePai,
    nomeMae: aluno.nomeMae,
    turmaNome: aluno.turma?.nome ?? null,
    poloNome: aluno.turma?.polo?.nome ?? null,
    etapa: aluno.etapa,
    situacao: aluno.situacao,
  };
}

// ── PROFESSOR / COORDENAÇÃO (ver e editar) ──────────────────────────────────
export type PerfilConta = {
  role: string;
  nome: string;
  email: string;
  // Só o professor tem telefone/área/polo no banco. Coordenação: null.
  telefone: string | null;
  areaNome: string | null;
  poloNome: string | null;
  temProfessor: boolean;
};

export type EdicaoPerfilInput = {
  nome: string;
  email: string;
  telefone: string; // ignorado para quem não tem perfil Professor
};

// Detecta violação de unicidade (P2002) do Prisma no campo e-mail.
function isEmailDuplicado(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return false;
  const target = e.meta?.target;
  const alvo = Array.isArray(target) ? target.join(",") : String(target ?? "");
  return alvo.includes("email");
}

// Carrega o perfil da conta logada (User + Professor quando houver).
export async function carregarPerfilConta(
  userId: string | undefined,
): Promise<PerfilConta | null> {
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      professor: {
        include: {
          area: { select: { nome: true } },
          polo: { select: { nome: true } },
        },
      },
    },
  });
  if (!user) return null;

  return {
    role: user.role,
    nome: user.name,
    email: user.email,
    telefone: user.professor?.telefone ?? null,
    areaNome: user.professor?.area?.nome ?? null,
    poloNome: user.professor?.polo?.nome ?? null,
    temProfessor: user.professor != null,
  };
}

// Salva o perfil da própria conta. userId vem SEMPRE da sessão (nunca do cliente).
// Atualiza User (nome/e-mail) e, quando houver, o perfil Professor (nome/e-mail/telefone).
export async function salvarPerfilConta(
  userId: string,
  dados: EdicaoPerfilInput,
): Promise<ResultadoPerfil> {
  const nome = dados.nome.trim();
  const email = dados.email.trim();
  if (!nome) return { ok: false, message: "O nome é obrigatório." };
  if (!email) return { ok: false, message: "O e-mail é obrigatório." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, professor: { select: { id: true } } },
  });
  if (!user) return { ok: false, message: "Conta não encontrada." };

  // E-mail não pode colidir com outra conta (ignora a própria).
  const conflito = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (conflito) return { ok: false, message: "Já existe uma conta com este e-mail." };

  try {
    await prisma.user.update({ where: { id: userId }, data: { name: nome, email } });

    // Professor: espelha nome/e-mail e persiste o telefone (Coordenação não tem esses campos).
    if (user.professor) {
      await prisma.professor.update({
        where: { id: user.professor.id },
        data: { nome, email, telefone: dados.telefone.trim() || null },
      });
    }
  } catch (e) {
    if (isEmailDuplicado(e)) return { ok: false, message: "Já existe uma conta com este e-mail." };
    throw e;
  }

  return { ok: true, message: "Dados salvos" };
}
