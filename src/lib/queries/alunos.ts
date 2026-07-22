import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, Role, type EtapaAluno, type SituacaoAluno } from "@prisma/client";

// Formato consumido pela tela de Gestão de Alunos (mesma forma do mock anterior).
export type AlunoRow = {
  id: string;
  ra: string;
  nome: string;
  cpf: string;
  email: string;
  cidade: string;
  telefone: string;
  etapa: EtapaAluno;
  situacao: SituacaoAluno;
  ativo: boolean;
  temAcesso: boolean; // true se há conta de login (User) vinculada
  arquivadoEm: string | null; // data/hora de arquivamento (só nos arquivados)
  turmaId: string | null;
  turmaNome: string;
  poloNome: string | null;
};

// Turma para os seletores: inclui poloId para filtrar a lista de turmas pelo polo escolhido.
export type TurmaOption = { id: string; nome: string; poloId: string };

export type NovoAlunoInput = {
  nome: string;
  ra: string;
  cpf: string;
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
  cpf: string;
  cidade: string;
  telefone: string;
  email: string;
  etapa: EtapaAluno;
  turmaId: string | null;
  situacao: SituacaoAluno;
};

export type ResultadoAluno = { ok: boolean; message: string };

// Senha padrão de acesso do aluno (usada na criação da conta e na redefinição).
const SENHA_PADRAO = "Aluno@sesi";

// Gera o hash bcrypt da senha (mesmo método/força usados no login em auth.ts).
function hashSenha(senha: string): string {
  return bcrypt.hashSync(senha, 10);
}

// Alunos evadidos/desistentes/inativos entram como sem acesso ativo.
function derivarAtivo(situacao: SituacaoAluno): boolean {
  return situacao !== "EVADIDO" && situacao !== "DESISTENTE" && situacao !== "INATIVO";
}

// Detecta violação de unicidade (P2002) do Prisma para um campo específico.
function isUniqueViolation(e: unknown, campo: string): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return false;
  const target = e.meta?.target;
  const alvo = Array.isArray(target) ? target.join(",") : String(target ?? "");
  return alvo.includes(campo);
}

// Formata data/hora para exibição (dd/mm/aaaa hh:mm); null quando não há data.
function fmtDataHora(d: Date | null): string | null {
  if (!d) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
}

// Busca alunos filtrando por arquivado (false = listas do dia a dia; true = arquivados).
async function buscarAlunos(arquivado: boolean): Promise<AlunoRow[]> {
  const alunos = await prisma.aluno.findMany({
    where: { arquivado },
    orderBy: arquivado ? { arquivadoEm: "desc" } : { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      turma: { include: { polo: { select: { nome: true } } } },
    },
  });

  return alunos.map((a) => ({
    id: a.id,
    ra: a.ra ?? "",
    nome: a.nome,
    cpf: a.cpf ?? "",
    // Prioriza o e-mail do próprio Aluno; se vazio, cai no da conta de acesso vinculada.
    email: a.email ?? a.user?.email ?? "",
    cidade: a.cidade ?? "",
    telefone: a.telefone ?? "",
    etapa: a.etapa,
    situacao: a.situacao,
    ativo: a.ativo,
    temAcesso: a.userId != null, // tem conta de login vinculada?
    arquivadoEm: fmtDataHora(a.arquivadoEm),
    turmaId: a.turmaId,
    turmaNome: a.turma?.nome ?? "—",
    poloNome: a.turma?.polo?.nome ?? null,
  }));
}

// Lista padrão: apenas os NÃO arquivados.
export async function listarAlunos(): Promise<AlunoRow[]> {
  return buscarAlunos(false);
}

// Lista de arquivados (soft delete), com a data de arquivamento.
export async function listarAlunosArquivados(): Promise<AlunoRow[]> {
  return buscarAlunos(true);
}

export async function listarTurmas(): Promise<TurmaOption[]> {
  return prisma.turma.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, poloId: true },
  });
}

export async function criarAluno(dados: NovoAlunoInput): Promise<ResultadoAluno> {
  const nome = dados.nome.trim();
  const ra = dados.ra.trim();
  if (!nome || !ra) return { ok: false, message: "Nome e RA são obrigatórios." };

  const email = dados.email.trim();

  // Com e-mail, cria também a conta de login (User). E-mail já usado não é duplicado.
  if (email) {
    const jaExiste = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (jaExiste) return { ok: false, message: "Já existe uma conta com este e-mail." };
  }

  // Forma "checked" do Prisma: turma/user via relação (permite criar o User aninhado).
  const data: Prisma.AlunoCreateInput = {
    nome,
    ra,
    cpf: dados.cpf.trim() || null,
    email: email || null,
    cidade: dados.cidade.trim() || null,
    telefone: dados.telefone.trim() || null,
    etapa: dados.etapa,
    situacao: dados.situacao,
    ativo: derivarAtivo(dados.situacao),
    ...(dados.turmaId ? { turma: { connect: { id: dados.turmaId } } } : {}),
    ...(email
      ? {
          user: {
            create: {
              name: nome,
              email,
              role: Role.ALUNO,
              passwordHash: hashSenha(SENHA_PADRAO),
            },
          },
        }
      : {}),
  };

  try {
    await prisma.aluno.create({ data });
    return { ok: true, message: email ? "Aluno cadastrado e acesso criado" : "Aluno cadastrado" };
  } catch (e) {
    if (isUniqueViolation(e, "ra")) return { ok: false, message: `Já existe um aluno com o RA ${ra}.` };
    if (isUniqueViolation(e, "email")) return { ok: false, message: "Já existe uma conta com este e-mail." };
    throw e;
  }
}

export async function atualizarAluno(id: string, dados: EdicaoAlunoInput): Promise<ResultadoAluno> {
  const nome = dados.nome.trim();
  const ra = dados.ra.trim();
  if (!nome || !ra) return { ok: false, message: "Nome e RA são obrigatórios." };

  const email = dados.email.trim();

  const atual = await prisma.aluno.findUnique({ where: { id }, select: { userId: true } });
  if (!atual) return { ok: false, message: "Aluno não encontrado." };

  // E-mail não pode colidir com outra conta (ignora o próprio User, se houver).
  if (email) {
    const conflito = await prisma.user.findFirst({
      where: { email, ...(atual.userId ? { NOT: { id: atual.userId } } : {}) },
      select: { id: true },
    });
    if (conflito) return { ok: false, message: "Já existe uma conta com este e-mail." };
  }

  try {
    await prisma.aluno.update({
      where: { id },
      data: {
        nome,
        ra,
        cpf: dados.cpf.trim() || null,
        email: email || null,
        cidade: dados.cidade.trim() || null,
        telefone: dados.telefone.trim() || null,
        etapa: dados.etapa,
        situacao: dados.situacao,
        turmaId: dados.turmaId || null,
      },
    });
  } catch (e) {
    if (isUniqueViolation(e, "ra")) return { ok: false, message: `Já existe um aluno com o RA ${ra}.` };
    throw e;
  }

  // Sincroniza a conta de login conforme o e-mail informado.
  let msg = "Dados atualizados";
  if (email) {
    try {
      if (atual.userId) {
        // Já tem conta: atualiza nome e e-mail do User (mantém a senha).
        await prisma.user.update({ where: { id: atual.userId }, data: { name: nome, email } });
      } else {
        // Não tinha conta e agora há e-mail: cria o acesso e vincula ao aluno.
        const novoUser = await prisma.user.create({
          data: { name: nome, email, role: Role.ALUNO, passwordHash: hashSenha(SENHA_PADRAO) },
        });
        await prisma.aluno.update({ where: { id }, data: { userId: novoUser.id } });
        msg = "Dados atualizados e acesso criado";
      }
    } catch (e) {
      if (isUniqueViolation(e, "email")) return { ok: false, message: "Já existe uma conta com este e-mail." };
      throw e;
    }
  }
  return { ok: true, message: msg };
}

export async function definirAtivo(id: string, ativo: boolean): Promise<ResultadoAluno> {
  await prisma.aluno.update({ where: { id }, data: { ativo } });
  return { ok: true, message: ativo ? "Aluno ativado" : "Aluno inativado" };
}

// Soft delete: arquiva o aluno (sai das listas, permanece no banco). Não deleta nada.
export async function arquivarAluno(id: string): Promise<ResultadoAluno> {
  await prisma.aluno.update({
    where: { id },
    data: { arquivado: true, arquivadoEm: new Date() },
  });
  return { ok: true, message: "Aluno arquivado" };
}

// Restaura um aluno arquivado (volta às listas do dia a dia).
export async function desarquivarAluno(id: string): Promise<ResultadoAluno> {
  await prisma.aluno.update({
    where: { id },
    data: { arquivado: false, arquivadoEm: null },
  });
  return { ok: true, message: "Aluno restaurado" };
}

export async function resetarSenhaAluno(id: string): Promise<ResultadoAluno> {
  const aluno = await prisma.aluno.findUnique({ where: { id }, select: { userId: true } });
  if (!aluno?.userId) {
    return { ok: false, message: "Cadastre um e-mail para gerar o acesso." };
  }
  await prisma.user.update({
    where: { id: aluno.userId },
    data: { passwordHash: hashSenha(SENHA_PADRAO) },
  });
  return { ok: true, message: `Senha redefinida para ${SENHA_PADRAO}` };
}

// Define uma senha específica (mínimo 6 caracteres) para o acesso do aluno.
export async function definirSenhaAluno(id: string, senha: string): Promise<ResultadoAluno> {
  const aluno = await prisma.aluno.findUnique({ where: { id }, select: { userId: true } });
  if (!aluno?.userId) {
    return { ok: false, message: "Cadastre um e-mail para gerar o acesso." };
  }
  if (senha.length < 6) {
    return { ok: false, message: "A senha deve ter ao menos 6 caracteres." };
  }
  await prisma.user.update({ where: { id: aluno.userId }, data: { passwordHash: hashSenha(senha) } });
  return { ok: true, message: "Senha definida com sucesso." };
}
