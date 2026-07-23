import { prisma } from "@/lib/prisma";
import { Prisma, type TipoAula } from "@prisma/client";

export type ResultadoAcao = { ok: boolean; message: string };

// ── Tipos consumidos pelas telas ────────────────────────────────────────────

// Linha da lista de aulas do professor.
export type AulaRow = {
  id: string;
  tipo: TipoAula;
  titulo: string;
  dataInput: string; // "yyyy-mm-dd" (para preencher o input de edição)
  dataLabel: string; // "dd/mm/aaaa" (para exibir)
  youtubeUrl: string;
  pergunta: string | null;
  temPergunta: boolean;
  areaId: string | null;
  areaNome: string | null;
  competenciaId: string | null;
  competenciaCodigo: string | null;
  turmaId: string | null;
  turmaNome: string; // "Todas as turmas" quando turmaId = null
  qtdRespostas: number;
};

export type AreaOpcao = { id: string; slug: string; nome: string };
export type TurmaOpcao = { id: string; nome: string };
export type CompetenciaOpcao = {
  id: string;
  codigo: string;
  aulasPrevistas: number;
  aulasCadastradas: number;
};

// Opções para montar o formulário (áreas/turmas que o usuário pode usar + competências com contagem).
export type OpcoesAula = {
  podeCriar: boolean; // false quando o usuário não é professor nem coordenação
  areas: AreaOpcao[]; // áreas que o usuário pode escolher no tipo AREA
  turmas: TurmaOpcao[]; // turmas para "Publicar para" (além de "Todas")
  competenciasPorArea: Record<string, CompetenciaOpcao[]>; // areaId → competências
};

// Dados de entrada do formulário (o servidor NÃO confia no cliente e revalida tudo).
export type AulaInput = {
  tipo: TipoAula;
  titulo: string;
  data: string; // "yyyy-mm-dd" vindo do <input type="date">
  youtubeUrl: string;
  areaId: string | null;
  competenciaId: string | null;
  pergunta: string | null;
  turmaId: string | null; // null = todas as turmas
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtDataLabel(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

function fmtDataInput(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Converte "yyyy-mm-dd" em Date (meio-dia UTC, para não escorregar de dia por fuso).
function parseDataInput(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12, 0, 0));
  return isNaN(date.getTime()) ? null : date;
}

// Resolve o professor da sessão (id + área). Coordenação não tem perfil de professor.
async function resolverProfessor(userId: string) {
  return prisma.professor.findUnique({
    where: { userId },
    select: { id: true, areaId: true, area: { select: { slug: true, nome: true } } },
  });
}

// ── LISTA de aulas ──────────────────────────────────────────────────────────
// Professor vê as aulas que cadastrou; coordenação vê todas. Ordena por data (mais recente primeiro).
export async function listarAulasDoProfessor(
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<AulaRow[]> {
  if (!userId) return [];

  let where: Prisma.AulaGravadaWhereInput = {};
  if (!isCoordenacao) {
    const professor = await resolverProfessor(userId);
    if (!professor) return [];
    where = { professorId: professor.id };
  }

  const aulas = await prisma.aulaGravada.findMany({
    where,
    orderBy: [{ data: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      tipo: true,
      titulo: true,
      data: true,
      youtubeUrl: true,
      pergunta: true,
      areaId: true,
      area: { select: { nome: true } },
      competenciaId: true,
      competencia: { select: { codigo: true } },
      turmaId: true,
      turma: { select: { nome: true } },
      _count: { select: { respostas: true } },
    },
  });

  return aulas.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    titulo: a.titulo,
    dataInput: fmtDataInput(a.data),
    dataLabel: fmtDataLabel(a.data),
    youtubeUrl: a.youtubeUrl,
    pergunta: a.pergunta,
    temPergunta: !!a.pergunta,
    areaId: a.areaId,
    areaNome: a.area?.nome ?? null,
    competenciaId: a.competenciaId,
    competenciaCodigo: a.competencia?.codigo ?? null,
    turmaId: a.turmaId,
    turmaNome: a.turma?.nome ?? "Todas as turmas",
    qtdRespostas: a._count.respostas,
  }));
}

// ── OPÇÕES do formulário ─────────────────────────────────────────────────────
export async function carregarOpcoesAula(
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<OpcoesAula> {
  const vazio: OpcoesAula = { podeCriar: false, areas: [], turmas: [], competenciasPorArea: {} };
  if (!userId) return vazio;

  const professor = isCoordenacao ? null : await resolverProfessor(userId);
  if (!isCoordenacao && !professor) return vazio;

  // Áreas de conteúdo (as 4 com notas — Interárea NÃO entra no tipo AREA).
  // Professor: só a área dele. Coordenação: todas as 4.
  const areasDb = await prisma.area.findMany({
    where: {
      temNotas: true,
      ...(isCoordenacao ? {} : { id: professor!.areaId ?? "__nenhuma__" }),
    },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      slug: true,
      nome: true,
      competencias: {
        orderBy: { ordem: "asc" },
        select: { id: true, codigo: true, aulas: true, _count: { select: { aulasGravadas: true } } },
      },
    },
  });

  const areas: AreaOpcao[] = areasDb.map((a) => ({ id: a.id, slug: a.slug, nome: a.nome }));
  const competenciasPorArea: Record<string, CompetenciaOpcao[]> = {};
  for (const a of areasDb) {
    competenciasPorArea[a.id] = a.competencias.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      aulasPrevistas: c.aulas,
      aulasCadastradas: c._count.aulasGravadas,
    }));
  }

  // Turmas para "Publicar para". Professor: só as vinculadas; coordenação: todas.
  const turmasDb = await prisma.turma.findMany({
    where: isCoordenacao ? {} : { professores: { some: { professorId: professor!.id } } },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
  const turmas: TurmaOpcao[] = turmasDb.map((t) => ({ id: t.id, nome: t.nome }));

  return { podeCriar: true, areas, turmas, competenciasPorArea };
}

// ── Validação + normalização compartilhada por criar/atualizar ────────────────
type Normalizado = {
  tipo: TipoAula;
  titulo: string;
  data: Date;
  youtubeUrl: string;
  pergunta: string | null;
  areaId: string | null;
  competenciaId: string | null;
  turmaId: string | null;
  professorId: string | null;
};

async function validarEntrada(
  input: AulaInput,
  userId: string,
  isCoordenacao: boolean,
): Promise<{ ok: false; message: string } | { ok: true; data: Normalizado }> {
  const professor = isCoordenacao ? null : await resolverProfessor(userId);
  if (!isCoordenacao && !professor) {
    return { ok: false, message: "Sua conta não está vinculada a um cadastro de professor." };
  }

  const titulo = input.titulo.trim();
  const youtubeUrl = input.youtubeUrl.trim();
  const perguntaTrim = (input.pergunta ?? "").trim();
  if (!titulo) return { ok: false, message: "Informe o título da aula." };
  if (!youtubeUrl) return { ok: false, message: "Informe o link do YouTube." };

  const data = parseDataInput(input.data);
  if (!data) return { ok: false, message: "Informe uma data válida." };

  // Turma: null (todas) ou uma turma existente à qual o professor esteja vinculado.
  let turmaId: string | null = null;
  if (input.turmaId) {
    const turma = await prisma.turma.findUnique({
      where: { id: input.turmaId },
      select: { id: true, professores: { select: { professorId: true } } },
    });
    if (!turma) return { ok: false, message: "Turma selecionada não existe." };
    if (!isCoordenacao && !turma.professores.some((tp) => tp.professorId === professor!.id)) {
      return { ok: false, message: "Você só pode publicar para turmas às quais está vinculado." };
    }
    turmaId = turma.id;
  }

  const professorId = professor?.id ?? null;

  // Regras por tipo.
  if (input.tipo === "AREA") {
    if (!input.areaId) return { ok: false, message: "Selecione a área da aula." };
    if (!input.competenciaId) return { ok: false, message: "Selecione a competência da aula." };
    if (!perguntaTrim) return { ok: false, message: "Escreva a pergunta sobre o conteúdo." };

    const area = await prisma.area.findUnique({
      where: { id: input.areaId },
      select: { id: true, temNotas: true },
    });
    if (!area || !area.temNotas) {
      return { ok: false, message: "Área inválida para uma aula de área." };
    }
    // Professor só cadastra na própria área.
    if (!isCoordenacao && professor!.areaId !== area.id) {
      return { ok: false, message: "Você só pode cadastrar aulas da sua área." };
    }
    // A competência tem que pertencer à área escolhida.
    const comp = await prisma.competencia.findUnique({
      where: { id: input.competenciaId },
      select: { id: true, areaId: true },
    });
    if (!comp || comp.areaId !== area.id) {
      return { ok: false, message: "A competência não pertence à área escolhida." };
    }

    return {
      ok: true,
      data: {
        tipo: "AREA",
        titulo,
        data,
        youtubeUrl,
        pergunta: perguntaTrim,
        areaId: area.id,
        competenciaId: comp.id,
        turmaId,
        professorId,
      },
    };
  }

  if (input.tipo === "INTERAREA") {
    if (!perguntaTrim) return { ok: false, message: "Escreva a pergunta sobre o conteúdo." };
    return {
      ok: true,
      data: {
        tipo: "INTERAREA",
        titulo,
        data,
        youtubeUrl,
        pergunta: perguntaTrim,
        areaId: null,
        competenciaId: null,
        turmaId,
        professorId,
      },
    };
  }

  // GERAL: sem área, sem competência, sem pergunta.
  return {
    ok: true,
    data: {
      tipo: "GERAL",
      titulo,
      data,
      youtubeUrl,
      pergunta: null,
      areaId: null,
      competenciaId: null,
      turmaId,
      professorId,
    },
  };
}

// ── CRIAR ─────────────────────────────────────────────────────────────────────
export async function criarAula(
  input: AulaInput,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const v = await validarEntrada(input, userId, isCoordenacao);
  if (!v.ok) return v;

  await prisma.aulaGravada.create({
    data: {
      tipo: v.data.tipo,
      titulo: v.data.titulo,
      data: v.data.data,
      youtubeUrl: v.data.youtubeUrl,
      pergunta: v.data.pergunta,
      areaId: v.data.areaId,
      competenciaId: v.data.competenciaId,
      turmaId: v.data.turmaId,
      professorId: v.data.professorId,
    },
  });
  return { ok: true, message: "Aula cadastrada no banco." };
}

// ── ATUALIZAR ─────────────────────────────────────────────────────────────────
export async function atualizarAula(
  id: string,
  input: AulaInput,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  // Só o autor (professor) ou a coordenação podem editar.
  const dono = await garantirAcesso(id, userId, isCoordenacao);
  if (!dono.ok) return dono;

  const v = await validarEntrada(input, userId, isCoordenacao);
  if (!v.ok) return v;

  await prisma.aulaGravada.update({
    where: { id },
    data: {
      tipo: v.data.tipo,
      titulo: v.data.titulo,
      data: v.data.data,
      youtubeUrl: v.data.youtubeUrl,
      pergunta: v.data.pergunta,
      areaId: v.data.areaId,
      competenciaId: v.data.competenciaId,
      turmaId: v.data.turmaId,
    },
  });
  return { ok: true, message: "Aula atualizada." };
}

// ── EXCLUIR ───────────────────────────────────────────────────────────────────
// Apaga a aula (as respostas vinculadas caem em cascata pela FK). O aviso de
// "há respostas" é mostrado na confirmação da tela (qtdRespostas vem em AulaRow).
export async function excluirAula(
  id: string,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const dono = await garantirAcesso(id, userId, isCoordenacao);
  if (!dono.ok) return dono;

  await prisma.aulaGravada.delete({ where: { id } });
  return { ok: true, message: "Aula removida." };
}

// Garante que a aula existe e que o usuário pode gerenciá-la (autor ou coordenação).
async function garantirAcesso(
  id: string,
  userId: string,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  const aula = await prisma.aulaGravada.findUnique({
    where: { id },
    select: { id: true, professorId: true },
  });
  if (!aula) return { ok: false, message: "Aula não encontrada." };
  if (isCoordenacao) return { ok: true, message: "" };

  const professor = await resolverProfessor(userId);
  if (!professor || aula.professorId !== professor.id) {
    return { ok: false, message: "Você só pode alterar as aulas que cadastrou." };
  }
  return { ok: true, message: "" };
}
