import { prisma } from "@/lib/prisma";
import { Prisma, type TipoAula, type StatusResposta } from "@prisma/client";
import { competenciaCertificada } from "@/lib/regras-notas";

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

// Data + hora local, para carimbar envio/validação nas respostas.
function fmtDataHoraLabel(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} às ${hh}:${mi}`;
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

// ════════════════════════════════════════════════════════════════════════════
// TELA DO ALUNO (lista única + responder pergunta)
// ════════════════════════════════════════════════════════════════════════════

export type RespostaAlunoView = {
  status: StatusResposta;
  texto: string;
  motivoRecusa: string | null;
};

export type AulaAlunoRow = {
  id: string;
  tipo: TipoAula;
  titulo: string;
  dataLabel: string;
  youtubeUrl: string;
  areaNome: string | null;
  competenciaCodigo: string | null;
  pergunta: string | null;
  dispensada: boolean; // AREA cuja competência o aluno já certificou
  resposta: RespostaAlunoView | null;
};

export type AulasAlunoResult = {
  temAluno: boolean; // conta vinculada a um cadastro de aluno
  temTurma: boolean; // aluno tem turma (necessário para ver aulas)
  aulas: AulaAlunoRow[];
};

// A competência CERTIFICADA dispensa as aulas — regra única em regras-notas.ts
// (a mesma usada pelo cálculo de frequência).
const estaCertificada = competenciaCertificada;

// Lista as aulas visíveis para o aluno da sessão, em ordem cronológica (mais recente primeiro).
// Traz a resposta do próprio aluno (se houver) e marca dispensa por certificação.
export async function listarAulasDoAluno(
  userId: string | undefined,
): Promise<AulasAlunoResult> {
  if (!userId) return { temAluno: false, temTurma: false, aulas: [] };

  const aluno = await prisma.aluno.findUnique({
    where: { userId },
    select: { id: true, turmaId: true },
  });
  if (!aluno) return { temAluno: false, temTurma: false, aulas: [] };
  if (!aluno.turmaId) return { temAluno: true, temTurma: false, aulas: [] };

  // Aulas da turma do aluno OU publicadas para todas (turmaId null).
  const aulas = await prisma.aulaGravada.findMany({
    where: { OR: [{ turmaId: aluno.turmaId }, { turmaId: null }] },
    orderBy: [{ data: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      tipo: true,
      titulo: true,
      data: true,
      youtubeUrl: true,
      pergunta: true,
      area: { select: { nome: true } },
      competenciaId: true,
      competencia: { select: { codigo: true, habilidades: true } },
      respostas: {
        where: { alunoId: aluno.id },
        select: { status: true, texto: true, motivoRecusa: true },
      },
    },
  });

  // Notas (certificação) das competências das aulas de área — para calcular a dispensa.
  const compIds = aulas
    .filter((a) => a.tipo === "AREA" && a.competenciaId)
    .map((a) => a.competenciaId as string);
  const notas = compIds.length
    ? await prisma.nota.findMany({
        where: { alunoId: aluno.id, competenciaId: { in: compIds } },
        select: { competenciaId: true, certificacao: true },
      })
    : [];
  const certPorComp = new Map(notas.map((n) => [n.competenciaId, n.certificacao]));

  const rows: AulaAlunoRow[] = aulas.map((a) => {
    let dispensada = false;
    if (a.tipo === "AREA" && a.competenciaId && a.competencia) {
      const cert = certPorComp.get(a.competenciaId) ?? null;
      dispensada = estaCertificada(cert, a.competencia.habilidades);
    }
    const r = a.respostas[0];
    return {
      id: a.id,
      tipo: a.tipo,
      titulo: a.titulo,
      dataLabel: fmtDataLabel(a.data),
      youtubeUrl: a.youtubeUrl,
      areaNome: a.area?.nome ?? null,
      competenciaCodigo: a.competencia?.codigo ?? null,
      pergunta: a.pergunta,
      dispensada,
      resposta: r ? { status: r.status, texto: r.texto, motivoRecusa: r.motivoRecusa } : null,
    };
  });

  return { temAluno: true, temTurma: true, aulas: rows };
}

// Envia (ou reenvia) a resposta do aluno da sessão a uma aula. Upsert por (alunoId, aulaId).
// Segurança: o aluno vem SEMPRE da sessão; nunca de um id do cliente.
export async function responderAula(
  aulaId: string,
  texto: string,
  userId: string | undefined,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const aluno = await prisma.aluno.findUnique({
    where: { userId },
    select: { id: true, turmaId: true },
  });
  if (!aluno) return { ok: false, message: "Sua conta não está vinculada a um cadastro de aluno." };

  const txt = texto.trim();
  if (!txt) return { ok: false, message: "Escreva sua resposta antes de enviar." };

  const aula = await prisma.aulaGravada.findUnique({
    where: { id: aulaId },
    select: {
      id: true,
      tipo: true,
      turmaId: true,
      competenciaId: true,
      competencia: { select: { habilidades: true } },
    },
  });
  if (!aula) return { ok: false, message: "Aula não encontrada." };

  // A aula precisa estar publicada para a turma do aluno (dele ou "todas").
  if (aula.turmaId !== null && aula.turmaId !== aluno.turmaId) {
    return { ok: false, message: "Esta aula não está disponível para a sua turma." };
  }

  // Aula geral não tem pergunta.
  if (aula.tipo === "GERAL") {
    return { ok: false, message: "Esta aula é informativa e não tem pergunta." };
  }

  // Dispensa por certificação (só AREA).
  if (aula.tipo === "AREA" && aula.competenciaId && aula.competencia) {
    const nota = await prisma.nota.findUnique({
      where: { alunoId_competenciaId: { alunoId: aluno.id, competenciaId: aula.competenciaId } },
      select: { certificacao: true },
    });
    if (estaCertificada(nota?.certificacao ?? null, aula.competencia.habilidades)) {
      return { ok: false, message: "Você está dispensado desta aula (competência certificada)." };
    }
  }

  // Resposta já validada trava a edição.
  const existente = await prisma.respostaAula.findUnique({
    where: { alunoId_aulaId: { alunoId: aluno.id, aulaId: aula.id } },
    select: { status: true },
  });
  if (existente?.status === "VALIDADA") {
    return { ok: false, message: "Sua resposta já foi validada e não pode mais ser alterada." };
  }

  // Cria ou reenvia: sempre volta para PENDENTE e limpa dados de validação/recusa.
  await prisma.respostaAula.upsert({
    where: { alunoId_aulaId: { alunoId: aluno.id, aulaId: aula.id } },
    update: {
      texto: txt,
      status: "PENDENTE",
      motivoRecusa: null,
      validadaEm: null,
      validadaPorId: null,
    },
    create: { texto: txt, status: "PENDENTE", alunoId: aluno.id, aulaId: aula.id },
  });

  return { ok: true, message: "Resposta enviada. Aguarde a validação do professor." };
}

// ════════════════════════════════════════════════════════════════════════════
// TELA DO PROFESSOR (validar / recusar as respostas dos alunos)
// ════════════════════════════════════════════════════════════════════════════

export type RespostaValidacaoRow = {
  id: string;
  status: StatusResposta;
  texto: string;
  motivoRecusa: string | null;
  enviadaEmLabel: string; // 1º envio
  reenviadaEmLabel: string | null; // preenchido quando o aluno respondeu de novo
  validadaEmLabel: string | null; // data da validação/recusa
  validadaPorNome: string | null;
  alunoNome: string;
  alunoRa: string;
  turmaId: string | null;
  turmaNome: string;
  aulaId: string;
  aulaTitulo: string;
  aulaTipo: TipoAula;
  aulaDataLabel: string;
  areaNome: string | null;
  competenciaCodigo: string | null;
  pergunta: string | null;
};

export type RespostasValidacaoResult = {
  podeValidar: boolean; // false quando a conta não é professor nem coordenação
  respostas: RespostaValidacaoRow[];
  aulas: { id: string; titulo: string }[]; // opções do filtro por aula
  turmas: { id: string; nome: string }[]; // opções do filtro por turma
};

// Respostas visíveis para quem está logado: o professor vê as das SUAS aulas;
// a coordenação vê todas. Ordena por envio mais recente primeiro.
function whereRespostasVisiveis(
  professorId: string | null,
  isCoordenacao: boolean,
): Prisma.RespostaAulaWhereInput {
  return isCoordenacao ? {} : { aula: { professorId } };
}

export async function listarRespostasParaValidacao(
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<RespostasValidacaoResult> {
  const vazio: RespostasValidacaoResult = {
    podeValidar: false,
    respostas: [],
    aulas: [],
    turmas: [],
  };
  if (!userId) return vazio;

  const professor = isCoordenacao ? null : await resolverProfessor(userId);
  if (!isCoordenacao && !professor) return vazio;

  const respostas = await prisma.respostaAula.findMany({
    where: whereRespostasVisiveis(professor?.id ?? null, isCoordenacao),
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      texto: true,
      motivoRecusa: true,
      createdAt: true,
      updatedAt: true,
      validadaEm: true,
      validadaPor: { select: { nome: true } },
      aluno: {
        select: {
          nome: true,
          ra: true,
          turmaId: true,
          turma: { select: { nome: true } },
        },
      },
      aula: {
        select: {
          id: true,
          titulo: true,
          tipo: true,
          data: true,
          pergunta: true,
          area: { select: { nome: true } },
          competencia: { select: { codigo: true } },
        },
      },
    },
  });

  const rows: RespostaValidacaoRow[] = respostas.map((r) => {
    // O reenvio (Etapa 3) altera o texto sem mexer no createdAt: só marcamos
    // "reenviada" enquanto está PENDENTE, para o professor saber que é texto novo.
    const houveEdicao = r.updatedAt.getTime() - r.createdAt.getTime() > 1000;
    return {
      id: r.id,
      status: r.status,
      texto: r.texto,
      motivoRecusa: r.motivoRecusa,
      enviadaEmLabel: fmtDataHoraLabel(r.createdAt),
      reenviadaEmLabel:
        r.status === "PENDENTE" && houveEdicao ? fmtDataHoraLabel(r.updatedAt) : null,
      validadaEmLabel: r.validadaEm ? fmtDataHoraLabel(r.validadaEm) : null,
      validadaPorNome: r.validadaPor?.nome ?? null,
      alunoNome: r.aluno.nome,
      alunoRa: r.aluno.ra ?? "—",
      turmaId: r.aluno.turmaId,
      turmaNome: r.aluno.turma?.nome ?? "Sem turma",
      aulaId: r.aula.id,
      aulaTitulo: r.aula.titulo,
      aulaTipo: r.aula.tipo,
      aulaDataLabel: fmtDataLabel(r.aula.data),
      areaNome: r.aula.area?.nome ?? null,
      competenciaCodigo: r.aula.competencia?.codigo ?? null,
      pergunta: r.aula.pergunta,
    };
  });

  // Opções dos filtros: só o que aparece na lista (evita filtro que não acha nada).
  const aulasMap = new Map<string, string>();
  const turmasMap = new Map<string, string>();
  for (const r of rows) {
    aulasMap.set(r.aulaId, r.aulaTitulo);
    if (r.turmaId) turmasMap.set(r.turmaId, r.turmaNome);
  }

  return {
    podeValidar: true,
    respostas: rows,
    aulas: [...aulasMap].map(([id, titulo]) => ({ id, titulo })),
    turmas: [...turmasMap]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
  };
}

// Contador de pendentes (badge da navegação e do painel do professor).
export async function contarRespostasPendentes(
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<number> {
  if (!userId) return 0;

  const professor = isCoordenacao ? null : await resolverProfessor(userId);
  if (!isCoordenacao && !professor) return 0;

  return prisma.respostaAula.count({
    where: {
      status: "PENDENTE",
      ...whereRespostasVisiveis(professor?.id ?? null, isCoordenacao),
    },
  });
}

// Confere se o usuário pode mexer NESTA resposta (dono da aula ou coordenação).
// O id do validador vem sempre da sessão — nunca do cliente.
type AcessoResposta =
  | { ok: false; message: string }
  | { ok: true; validadaPorId: string | null; status: StatusResposta };

async function garantirAcessoResposta(
  respostaId: string,
  userId: string,
  isCoordenacao: boolean,
): Promise<AcessoResposta> {
  const resposta = await prisma.respostaAula.findUnique({
    where: { id: respostaId },
    select: { id: true, status: true, aula: { select: { professorId: true } } },
  });
  if (!resposta) return { ok: false, message: "Resposta não encontrada." };

  if (isCoordenacao) {
    // Coordenação não tem cadastro de professor: validadaPorId fica nulo.
    return { ok: true, validadaPorId: null, status: resposta.status };
  }

  const professor = await resolverProfessor(userId);
  if (!professor) {
    return { ok: false, message: "Sua conta não está vinculada a um cadastro de professor." };
  }
  if (resposta.aula.professorId !== professor.id) {
    return { ok: false, message: "Você só pode validar respostas das aulas que cadastrou." };
  }
  return { ok: true, validadaPorId: professor.id, status: resposta.status };
}

// ── VALIDAR ───────────────────────────────────────────────────────────────────
// Marca a resposta como VALIDADA. É isso que passará a contar presença (Etapa 5).
export async function validarResposta(
  respostaId: string,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const acesso = await garantirAcessoResposta(respostaId, userId, isCoordenacao);
  if (!acesso.ok) return acesso;
  if (acesso.status === "VALIDADA") return { ok: true, message: "Esta resposta já estava validada." };

  await prisma.respostaAula.update({
    where: { id: respostaId },
    data: {
      status: "VALIDADA",
      validadaEm: new Date(),
      validadaPorId: acesso.validadaPorId,
      motivoRecusa: null,
    },
  });
  return { ok: true, message: "Resposta validada." };
}

// ── VALIDAR EM LOTE ───────────────────────────────────────────────────────────
// A permissão vai dentro do WHERE: ids de outro professor simplesmente não são
// atualizados, mesmo que cheguem forjados do cliente.
export async function validarRespostasEmLote(
  respostaIds: string[],
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const ids = [...new Set(respostaIds)].filter(Boolean);
  if (ids.length === 0) return { ok: false, message: "Selecione ao menos uma resposta." };

  const professor = isCoordenacao ? null : await resolverProfessor(userId);
  if (!isCoordenacao && !professor) {
    return { ok: false, message: "Sua conta não está vinculada a um cadastro de professor." };
  }

  const res = await prisma.respostaAula.updateMany({
    where: {
      id: { in: ids },
      status: "PENDENTE",
      ...whereRespostasVisiveis(professor?.id ?? null, isCoordenacao),
    },
    data: {
      status: "VALIDADA",
      validadaEm: new Date(),
      validadaPorId: professor?.id ?? null,
      motivoRecusa: null,
    },
  });

  if (res.count === 0) {
    return { ok: false, message: "Nenhuma das respostas selecionadas pôde ser validada." };
  }
  const ignoradas = ids.length - res.count;
  return {
    ok: true,
    message:
      res.count === 1
        ? "1 resposta validada."
        : `${res.count} respostas validadas.` +
          (ignoradas > 0 ? ` (${ignoradas} ignorada${ignoradas > 1 ? "s" : ""}.)` : ""),
  };
}

// ── RECUSAR ───────────────────────────────────────────────────────────────────
// Exige motivo. O aluno vê o motivo e pode responder de novo (volta para PENDENTE).
export async function recusarResposta(
  respostaId: string,
  motivo: string,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const motivoTrim = motivo.trim();
  if (!motivoTrim) return { ok: false, message: "Escreva o motivo da recusa para o aluno." };

  const acesso = await garantirAcessoResposta(respostaId, userId, isCoordenacao);
  if (!acesso.ok) return acesso;

  await prisma.respostaAula.update({
    where: { id: respostaId },
    data: {
      status: "RECUSADA",
      motivoRecusa: motivoTrim,
      validadaEm: new Date(),
      validadaPorId: acesso.validadaPorId,
    },
  });
  return { ok: true, message: "Resposta recusada. O aluno poderá responder de novo." };
}

// ── DESFAZER VALIDAÇÃO ────────────────────────────────────────────────────────
// Volta para PENDENTE (validou por engano). Só faz sentido a partir de VALIDADA.
export async function desfazerValidacao(
  respostaId: string,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const acesso = await garantirAcessoResposta(respostaId, userId, isCoordenacao);
  if (!acesso.ok) return acesso;
  if (acesso.status !== "VALIDADA") {
    return { ok: false, message: "Só é possível desfazer uma resposta que está validada." };
  }

  await prisma.respostaAula.update({
    where: { id: respostaId },
    data: { status: "PENDENTE", validadaEm: null, validadaPorId: null, motivoRecusa: null },
  });
  return { ok: true, message: "Validação desfeita. A resposta voltou para pendente." };
}
