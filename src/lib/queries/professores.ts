import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";

export type ResultadoAcao = { ok: boolean; message: string };

export type Opcao = { id: string; nome: string };

// Formato consumido pela tela de Gestão de Professores.
export type ProfessorRow = {
  id: string;
  nome: string;
  cpf: string; // persistido (coluna cpf)
  email: string; // persistido (coluna email); cai no User vinculado se vazio
  telefone: string; // persistido (coluna telefone)
  areaId: string | null;
  areaNome: string;
  poloId: string | null;
  poloNome: string;
  ativo: boolean; // persistido (coluna ativo)
  temAcesso: boolean; // true se há conta de login (User) vinculada
  arquivadoEm: string | null; // data/hora de arquivamento (só nos arquivados)
  turmasVinculadas: string[];
};

// Senha padrão de acesso do professor (usada na criação da conta e na redefinição).
const SENHA_PADRAO = "Prof@sesi";

// Gera o hash bcrypt da senha (mesmo método/força usados no login em auth.ts).
function hashSenha(senha: string): string {
  return bcrypt.hashSync(senha, 10);
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

export type NovoProfessorInput = {
  nome: string;
  areaId: string | null;
  poloId: string | null;
  cpf: string;
  email: string; // gravado no Professor e usado para criar a conta de login
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
    // Prioriza o e-mail do próprio Professor; se vazio, cai no da conta de acesso vinculada.
    email: p.email ?? p.user?.email ?? "",
    telefone: p.telefone ?? "",
    areaId: p.areaId,
    areaNome: p.area?.nome ?? "",
    poloId: p.poloId,
    poloNome: p.polo?.nome ?? "",
    ativo: p.ativo,
    temAcesso: p.userId != null, // tem conta de login vinculada?
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

  const email = dados.email.trim();

  // Com e-mail, cria também a conta de login (User). E-mail já usado não é duplicado.
  if (email) {
    const jaExiste = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (jaExiste) return { ok: false, message: "Já existe uma conta com este e-mail." };
  }

  try {
    // Conta e ficha nascem juntas: se uma falhar, nenhuma é gravada.
    await prisma.$transaction(async (tx) => {
      const user = email
        ? await tx.user.create({
            data: {
              name: nome,
              email,
              role: Role.PROFESSOR,
              passwordHash: hashSenha(SENHA_PADRAO),
            },
          })
        : null;

      await tx.professor.create({
        data: {
          nome,
          cpf: dados.cpf.trim() || null,
          email: email || null,
          telefone: dados.telefone.trim() || null,
          ativo: dados.ativo,
          areaId: dados.areaId || null,
          poloId: dados.poloId || null,
          userId: user?.id ?? null,
          turmas: dados.turmaIds.length
            ? { create: dados.turmaIds.map((turmaId) => ({ turmaId })) }
            : undefined,
        },
      });
    });
  } catch (e) {
    if (isUniqueViolation(e, "email")) {
      return { ok: false, message: "Já existe uma conta com este e-mail." };
    }
    throw e;
  }

  return {
    ok: true,
    message: email ? "Professor cadastrado e acesso criado" : "Professor cadastrado",
  };
}

export async function atualizarProfessor(
  id: string,
  dados: EdicaoProfessorInput,
): Promise<ResultadoAcao> {
  const nome = dados.nome.trim();
  if (!nome) return { ok: false, message: "Nome é obrigatório." };

  const email = dados.email.trim();

  const atual = await prisma.professor.findUnique({ where: { id }, select: { userId: true } });
  if (!atual) return { ok: false, message: "Professor não encontrado." };

  // E-mail não pode colidir com outra conta (ignora o próprio User, se houver).
  if (email) {
    const conflito = await prisma.user.findFirst({
      where: { email, ...(atual.userId ? { NOT: { id: atual.userId } } : {}) },
      select: { id: true },
    });
    if (conflito) return { ok: false, message: "Já existe uma conta com este e-mail." };
  }

  // Recria os vínculos de turma (deleteMany + create) para refletir a seleção atual.
  await prisma.professor.update({
    where: { id },
    data: {
      nome,
      cpf: dados.cpf.trim() || null,
      email: email || null,
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

  // Sincroniza a conta de login conforme o e-mail informado.
  let msg = "Dados atualizados";
  if (email) {
    try {
      if (atual.userId) {
        // Já tem conta: atualiza nome e e-mail do User (mantém a senha).
        await prisma.user.update({ where: { id: atual.userId }, data: { name: nome, email } });
      } else {
        // Não tinha conta e agora há e-mail: cria o acesso e vincula ao professor.
        const novoUser = await prisma.user.create({
          data: { name: nome, email, role: Role.PROFESSOR, passwordHash: hashSenha(SENHA_PADRAO) },
        });
        await prisma.professor.update({ where: { id }, data: { userId: novoUser.id } });
        msg = "Dados atualizados e acesso criado";
      }
    } catch (e) {
      if (isUniqueViolation(e, "email")) {
        return { ok: false, message: "Já existe uma conta com este e-mail." };
      }
      throw e;
    }
  }
  return { ok: true, message: msg };
}

export async function resetarSenhaProfessor(id: string): Promise<ResultadoAcao> {
  const professor = await prisma.professor.findUnique({ where: { id }, select: { userId: true } });
  if (!professor?.userId) {
    return { ok: false, message: "Cadastre um e-mail para gerar o acesso." };
  }
  await prisma.user.update({
    where: { id: professor.userId },
    data: { passwordHash: hashSenha(SENHA_PADRAO) },
  });
  return { ok: true, message: `Senha redefinida para ${SENHA_PADRAO}` };
}

// Define uma senha específica (mínimo 6 caracteres) para o acesso do professor.
export async function definirSenhaProfessor(id: string, senha: string): Promise<ResultadoAcao> {
  const professor = await prisma.professor.findUnique({ where: { id }, select: { userId: true } });
  if (!professor?.userId) {
    return { ok: false, message: "Cadastre um e-mail para gerar o acesso." };
  }
  if (senha.length < 6) {
    return { ok: false, message: "A senha deve ter ao menos 6 caracteres." };
  }
  await prisma.user.update({
    where: { id: professor.userId },
    data: { passwordHash: hashSenha(senha) },
  });
  return { ok: true, message: "Senha definida com sucesso." };
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
