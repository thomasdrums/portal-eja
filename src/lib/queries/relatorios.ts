import { prisma } from "@/lib/prisma";
import { calcularFrequenciaDeAlunos } from "@/lib/queries/frequencia";
import type { SituacaoAluno, StatusTurma, EtapaAluno } from "@prisma/client";

// ════════════════════════════════════════════════════════════════════════════
// RELATÓRIOS DA COORDENAÇÃO (dados reais do banco)
//
// Lê sempre alunos/professores/turmas NÃO-ARQUIVADOS. As telas mantêm o mesmo
// visual — aqui só mudamos a fonte de dados (antes: mock em mock-data/relatorios).
// ════════════════════════════════════════════════════════════════════════════

const SEM_POLO = "—";
const SEM_TURMA = "—";

// Situações que aparecem nas telas de relatório (mesma lista de hoje).
export const SITUACOES_RELATORIO: SituacaoAluno[] = [
  "APROVADO",
  "CURSANDO",
  "EM_PROCESSO",
  "RDS",
  "EVADIDO",
  "DESISTENTE",
];

// Aluno "ativo" = não evadido, não desistente e não inativo.
function alunoAtivo(situacao: SituacaoAluno): boolean {
  return (
    situacao !== "EVADIDO" && situacao !== "DESISTENTE" && situacao !== "INATIVO"
  );
}

// ── 1. RELATÓRIO DE ALUNOS ──────────────────────────────────────────────────
export type RelatorioAlunoRow = {
  id: string;
  nome: string;
  poloNome: string; // derivado da turma
  turmaNome: string;
  cidade: string;
  situacao: SituacaoAluno;
};

export type RelatorioAlunosData = {
  linhas: RelatorioAlunoRow[];
  polos: string[];
  turmas: string[];
  cidades: string[];
};

export async function carregarRelatorioAlunos(): Promise<RelatorioAlunosData> {
  const alunos = await prisma.aluno.findMany({
    where: { arquivado: false },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      cidade: true,
      situacao: true,
      turma: { select: { nome: true, polo: { select: { nome: true } } } },
    },
  });

  const linhas: RelatorioAlunoRow[] = alunos.map((a) => ({
    id: a.id,
    nome: a.nome,
    poloNome: a.turma?.polo?.nome ?? SEM_POLO,
    turmaNome: a.turma?.nome ?? SEM_TURMA,
    cidade: a.cidade ?? "",
    situacao: a.situacao,
  }));

  // Opções de filtro derivadas dos dados reais (ignora vazios/sem vínculo).
  const polos = [...new Set(linhas.map((l) => l.poloNome))]
    .filter((p) => p !== SEM_POLO)
    .sort();
  const turmas = [...new Set(linhas.map((l) => l.turmaNome))]
    .filter((t) => t !== SEM_TURMA)
    .sort();
  const cidades = [...new Set(linhas.map((l) => l.cidade))]
    .filter((c) => c !== "")
    .sort();

  return { linhas, polos, turmas, cidades };
}

// ── 2. RELATÓRIO DE PROFESSORES ─────────────────────────────────────────────
export type RelatorioProfessorRow = {
  id: string;
  nome: string;
  areaNome: string; // disciplina (nome da Área)
  poloNome: string; // "" quando o professor não tem polo
  turmas: number; // turmas vinculadas (via TurmaProfessor)
  alunos: number; // alunos não-arquivados nessas turmas
  aulas: number; // aulas gravadas cadastradas pelo professor
};

export type RelatorioProfessoresData = {
  linhas: RelatorioProfessorRow[];
  polos: string[]; // polos reais, para agrupar (não inclui "sem polo")
  totalProfessores: number;
  totalTurmas: number;
  totalAulas: number;
};

export async function carregarRelatorioProfessores(): Promise<RelatorioProfessoresData> {
  const professores = await prisma.professor.findMany({
    where: { arquivado: false },
    orderBy: { nome: "asc" },
    include: {
      area: { select: { nome: true } },
      polo: { select: { nome: true } },
      turmas: { select: { turmaId: true } },
      _count: { select: { aulas: true } }, // aulas gravadas do professor
    },
  });

  // Conta alunos não-arquivados por turma, de uma vez, para todas as turmas
  // que têm professor vinculado.
  const turmaIds = [
    ...new Set(professores.flatMap((p) => p.turmas.map((t) => t.turmaId))),
  ];
  const contagens = turmaIds.length
    ? await prisma.aluno.groupBy({
        by: ["turmaId"],
        where: { arquivado: false, turmaId: { in: turmaIds } },
        _count: { _all: true },
      })
    : [];
  const alunosPorTurma = new Map(
    contagens.map((c) => [c.turmaId as string, c._count._all]),
  );

  const linhas: RelatorioProfessorRow[] = professores.map((p) => ({
    id: p.id,
    nome: p.nome,
    areaNome: p.area?.nome ?? "",
    poloNome: p.polo?.nome ?? "",
    turmas: p.turmas.length,
    alunos: p.turmas.reduce(
      (soma, t) => soma + (alunosPorTurma.get(t.turmaId) ?? 0),
      0,
    ),
    aulas: p._count.aulas,
  }));

  const polos = [...new Set(linhas.map((l) => l.poloNome))]
    .filter((p) => p !== "")
    .sort();

  return {
    linhas,
    polos,
    totalProfessores: linhas.length,
    totalTurmas: linhas.reduce((s, l) => s + l.turmas, 0),
    totalAulas: linhas.reduce((s, l) => s + l.aulas, 0),
  };
}

// ── 3. RELATÓRIO DE TURMAS ──────────────────────────────────────────────────
export type RelatorioTurmaRow = {
  id: string;
  nome: string;
  poloNome: string;
  ano: number | null;
  etapaEnsino: string | null;
  status: StatusTurma; // EM_ANDAMENTO | ENCERRADA
  total: number; // alunos não-arquivados
  ativos: number; // alunos ativos
  freqMed: number; // frequência média (cálculo real), 0–100
  counts: Record<SituacaoAluno, number>;
  professores: string[];
};

export type RelatorioTurmasData = {
  linhas: RelatorioTurmaRow[];
  polos: string[];
  turmasAtivas: number;
  totalAlunos: number;
  totalAtivos: number;
  freqGeral: number;
};

function zerarContagens(): Record<SituacaoAluno, number> {
  return {
    EM_PROCESSO: 0,
    CURSANDO: 0,
    APROVADO: 0,
    RDS: 0,
    EVADIDO: 0,
    DESISTENTE: 0,
    INATIVO: 0,
  };
}

export async function carregarRelatorioTurmas(): Promise<RelatorioTurmasData> {
  const turmas = await prisma.turma.findMany({
    orderBy: { nome: "asc" },
    include: {
      polo: { select: { nome: true } },
      professores: { include: { professor: { select: { nome: true } } } },
      alunos: {
        where: { arquivado: false },
        select: { id: true, situacao: true },
      },
    },
  });

  // Frequência calculada de todos os alunos de uma vez (fonte real).
  const todosAlunoIds = turmas.flatMap((t) => t.alunos.map((a) => a.id));
  const freqMap = await calcularFrequenciaDeAlunos(todosAlunoIds);

  const linhas: RelatorioTurmaRow[] = turmas.map((t) => {
    const total = t.alunos.length;
    const ativos = t.alunos.filter((a) => alunoAtivo(a.situacao)).length;

    const counts = zerarContagens();
    for (const a of t.alunos) counts[a.situacao] += 1;

    const freqMed =
      total > 0
        ? Math.round(
            t.alunos.reduce(
              (s, a) => s + (freqMap.get(a.id)?.geral.percentual ?? 0),
              0,
            ) / total,
          )
        : 0;

    return {
      id: t.id,
      nome: t.nome,
      poloNome: t.polo?.nome ?? SEM_POLO,
      ano: t.ano,
      etapaEnsino: t.etapaEnsino,
      status: t.status,
      total,
      ativos,
      freqMed,
      counts,
      professores: t.professores.map((tp) => tp.professor.nome),
    };
  });

  const comAlunos = linhas.filter((l) => l.total > 0);
  const polos = [...new Set(linhas.map((l) => l.poloNome))]
    .filter((p) => p !== SEM_POLO)
    .sort();

  return {
    linhas,
    polos,
    turmasAtivas: linhas.filter((l) => l.status === "EM_ANDAMENTO").length,
    totalAlunos: linhas.reduce((s, l) => s + l.total, 0),
    totalAtivos: linhas.reduce((s, l) => s + l.ativos, 0),
    freqGeral:
      comAlunos.length > 0
        ? Math.round(
            comAlunos.reduce((s, l) => s + l.freqMed, 0) / comAlunos.length,
          )
        : 0,
  };
}

// ── 4. RESUMO POR TURMA (hub "Relatório por Turma" e Acompanhamento) ─────────
// Traz cada turma com os alunos (só situação + etapa), para os cruzamentos
// situação × etapa feitos na tela. Filtros de polo/professor são montados na UI.
export type TurmaResumoRow = {
  id: string;
  nome: string;
  poloNome: string;
  professores: string[];
  periodoLetivo: string; // ano da turma (string vazia quando não informado)
  alunos: { situacao: SituacaoAluno; etapa: EtapaAluno }[];
};

export type TurmasResumoData = {
  turmas: TurmaResumoRow[];
  polos: string[];
};

export async function carregarTurmasResumo(): Promise<TurmasResumoData> {
  const turmas = await prisma.turma.findMany({
    orderBy: { nome: "asc" },
    include: {
      polo: { select: { nome: true } },
      professores: { include: { professor: { select: { nome: true } } } },
      alunos: {
        where: { arquivado: false },
        select: { situacao: true, etapa: true },
      },
    },
  });

  const linhas: TurmaResumoRow[] = turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    poloNome: t.polo?.nome ?? SEM_POLO,
    professores: t.professores.map((tp) => tp.professor.nome),
    periodoLetivo: t.ano != null ? String(t.ano) : "",
    alunos: t.alunos.map((a) => ({ situacao: a.situacao, etapa: a.etapa })),
  }));

  const polos = [...new Set(linhas.map((l) => l.poloNome))]
    .filter((p) => p !== SEM_POLO)
    .sort();

  return { turmas: linhas, polos };
}
