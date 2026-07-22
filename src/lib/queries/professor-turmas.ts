import { prisma } from "@/lib/prisma";
import { Prisma, type SituacaoAluno as SituacaoDB, type EtapaAluno as EtapaDB } from "@prisma/client";
import { CAMPOS_VAZIOS, type CamposCompetencia } from "@/lib/regras-notas";
import { COMPETENCIAS_CONFIG, AREA_CONFIG_ORDER } from "@/lib/competencias-config";
import type {
  Turma as TurmaGrade,
  Aluno as AlunoGrade,
  SituacaoAluno as SituacaoGrade,
} from "@/lib/mock-data/professor";

// Linha da LISTA de turmas do professor.
export type TurmaProfessorRow = {
  id: string;
  nome: string;
  poloNome: string;
  etapaEnsino: string;
  qtdAlunos: number;
  aprovados: number;
  cursando: number;
  ativos: number;
};

// Aluno "ativo" = não evadido, não desistente e não inativo.
function ativoNaSituacao(s: SituacaoDB): boolean {
  return s !== "EVADIDO" && s !== "DESISTENTE" && s !== "INATIVO";
}

// Resultado do carregamento da PÁGINA de uma turma (com validação de acesso).
export type AcessoTurma = "ok" | "negado" | "inexistente";
export type CarregarTurmaResult = { acesso: AcessoTurma; turma: TurmaGrade | null };

// ── Helpers do adaptador DB → formato que a GradeNotas espera hoje ──

// A grade (mock) não tem "INATIVO"; mapeia para EM_PROCESSO só para exibição nesta etapa.
function mapSituacao(s: SituacaoDB): SituacaoGrade {
  return s === "INATIVO" ? "EM_PROCESSO" : s;
}

function fmtData(d: Date | null): string {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// Grade de notas VAZIA (células em branco) — a leitura real das notas vem na próxima etapa.
function gradeVazia(): AlunoGrade["notasGrade"] {
  const grade = {} as AlunoGrade["notasGrade"];
  for (const area of AREA_CONFIG_ORDER) {
    const obj: Record<string, CamposCompetencia> = {};
    for (const comp of Object.keys(COMPETENCIAS_CONFIG[area].competencias)) {
      obj[comp] = { ...CAMPOS_VAZIOS };
    }
    grade[area] = obj;
  }
  return grade;
}

function notasVazias(): AlunoGrade["notas"] {
  return { matematica: {}, linguagens: {}, cienciasNatureza: {}, cienciasHumanas: {} };
}

function freqVazia(): AlunoGrade["frequencia"] {
  const z = () => ({ totalAulas: 0, presencas: 0 });
  return {
    matematica: z(),
    linguagens: z(),
    cienciasNatureza: z(),
    cienciasHumanas: z(),
    interarea: z(),
  };
}

// Campos do Aluno (banco) que o adaptador consome.
type AlunoDB = {
  id: string;
  ra: string | null;
  nome: string;
  email: string | null;
  cidade: string | null;
  telefone: string | null;
  escolaridade: string | null;
  dataMatricula: Date | null;
  situacao: SituacaoDB;
  etapa: EtapaDB;
  ativo: boolean;
  historicoEntregue: boolean;
  certificadoEmitido: boolean;
  certificadoRecebido: boolean;
  user: { email: string | null } | null;
};

// Converte um Aluno do banco para o formato (mock) consumido pelas telas do professor.
// Dados pessoais/documentação/situação são REAIS; notas/frequência iniciam VAZIAS
// (a leitura real dessas partes vem nas próximas etapas).
function adaptarAluno(a: AlunoDB): AlunoGrade {
  return {
    id: a.id,
    ra: a.ra ?? "",
    nome: a.nome,
    email: a.email ?? a.user?.email ?? "",
    cidade: a.cidade ?? "",
    telefone: a.telefone ?? "",
    escolaridade: a.escolaridade ?? "",
    dataMatricula: fmtData(a.dataMatricula),
    situacao: mapSituacao(a.situacao),
    etapa: a.etapa,
    ativo: a.ativo,
    documentacao: {
      historicoEntregue: a.historicoEntregue,
      certificadoEmitido: a.certificadoEmitido,
      certificadoRecebido: a.certificadoRecebido,
    },
    notas: notasVazias(),
    notasGrade: gradeVazia(),
    frequencia: freqVazia(),
  };
}

// ── LISTA de turmas do professor logado (ou todas, se coordenação) ──
export async function listarTurmasDoProfessor(
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<TurmaProfessorRow[]> {
  if (!userId) return [];

  let where: Prisma.TurmaWhereInput = {};
  if (!isCoordenacao) {
    const professor = await prisma.professor.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!professor) return [];
    where = { professores: { some: { professorId: professor.id } } };
  }

  const turmas = await prisma.turma.findMany({
    where,
    orderBy: { nome: "asc" },
    include: {
      polo: { select: { nome: true } },
      // Só alunos não-arquivados contam.
      alunos: { where: { arquivado: false }, select: { situacao: true } },
    },
  });

  return turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    poloNome: t.polo?.nome ?? "—",
    etapaEnsino: t.etapaEnsino ?? "—",
    qtdAlunos: t.alunos.length,
    aprovados: t.alunos.filter((a) => a.situacao === "APROVADO").length,
    cursando: t.alunos.filter((a) => a.situacao === "CURSANDO").length,
    ativos: t.alunos.filter((a) => ativoNaSituacao(a.situacao)).length,
  }));
}

// ── PÁGINA da turma: carrega turma + alunos reais e valida o vínculo do professor ──
export async function carregarTurmaDoProfessor(
  turmaId: string,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<CarregarTurmaResult> {
  if (!userId) return { acesso: "negado", turma: null };

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: {
      polo: { select: { nome: true } },
      professores: { select: { professorId: true } },
      alunos: {
        where: { arquivado: false },
        orderBy: { nome: "asc" },
        include: { user: { select: { email: true } } },
      },
    },
  });

  if (!turma) return { acesso: "inexistente", turma: null };

  // Coordenação enxerga todas; professor só as turmas às quais está vinculado.
  if (!isCoordenacao) {
    const professor = await prisma.professor.findUnique({
      where: { userId },
      select: { id: true },
    });
    const vinculado = !!professor && turma.professores.some((tp) => tp.professorId === professor.id);
    if (!vinculado) return { acesso: "negado", turma: null };
  }

  // Adapta para o formato (mock) que a GradeNotas consome — notas iniciam VAZIAS.
  const turmaGrade: TurmaGrade = {
    id: turma.id,
    nome: turma.nome,
    polo: turma.polo?.nome ?? "",
    etapaEnsino: turma.etapaEnsino ?? "",
    periodoLetivo: turma.ano != null ? String(turma.ano) : "",
    professorResponsavel: "",
    alunos: turma.alunos.map(adaptarAluno),
  };

  return { acesso: "ok", turma: turmaGrade };
}

// ── DETALHE de um aluno: valida vínculo do professor e carrega o aluno real da turma ──
export type CarregarAlunoResult = { acesso: AcessoTurma; aluno: AlunoGrade | null };

export async function carregarAlunoDoProfessor(
  turmaId: string,
  alunoId: string,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<CarregarAlunoResult> {
  if (!userId) return { acesso: "negado", aluno: null };

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    select: { id: true, professores: { select: { professorId: true } } },
  });
  if (!turma) return { acesso: "inexistente", aluno: null };

  // Coordenação vê tudo; professor só se estiver vinculado à turma.
  if (!isCoordenacao) {
    const professor = await prisma.professor.findUnique({
      where: { userId },
      select: { id: true },
    });
    const vinculado = !!professor && turma.professores.some((tp) => tp.professorId === professor.id);
    if (!vinculado) return { acesso: "negado", aluno: null };
  }

  // O aluno precisa pertencer a essa turma (e não estar arquivado).
  const aluno = await prisma.aluno.findFirst({
    where: { id: alunoId, turmaId, arquivado: false },
    include: { user: { select: { email: true } } },
  });
  if (!aluno) return { acesso: "inexistente", aluno: null };

  return { acesso: "ok", aluno: adaptarAluno(aluno) };
}
