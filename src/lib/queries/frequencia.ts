import { prisma } from "@/lib/prisma";
import {
  competenciaCertificada,
  FREQUENCIA_MINIMA_APROVACAO,
} from "@/lib/regras-notas";
import { AREA_CONFIG_POR_SLUG, type AreaConfigId } from "@/lib/competencias-config";

// ════════════════════════════════════════════════════════════════════════════
// FREQUÊNCIA CALCULADA (nunca gravada)
//
// Por ALUNO e por ÁREA:
//   TOTAL EXIGIDO = soma de Competencia.aulas das competências da área que o
//                   aluno NÃO certificou (certificar DISPENSA as aulas;
//                   aprovar por nota ≥ 60 NÃO dispensa).
//   PRESENÇAS     = respostas VALIDADAS em aulas AREA daquela área
//                 + respostas VALIDADAS em aulas INTERAREA (coringa: contam
//                   como presença nas 4 áreas).
//   PERCENTUAL    = presenças ÷ total exigido, limitado a 100%.
//   Aulas GERAL não entram em nada.
//
// A fonte da verdade é sempre: aulas + respostas validadas + certificações.
// A tabela Frequencia do banco NÃO é lida nem escrita aqui.
// ════════════════════════════════════════════════════════════════════════════

export type CompetenciaFrequencia = {
  codigo: string;
  aulas: number; // aulas previstas no currículo
  dispensada: boolean; // certificada → não entra no total exigido
};

export type AreaFrequencia = {
  slug: string;
  nome: string;
  totalExigido: number;
  presencas: number; // presenças contabilizadas (área + interárea)
  faltam: number; // quantas ainda faltam validar (nunca negativo)
  percentual: number; // 0–100, limitado
  semExigencia: boolean; // totalExigido = 0 (todas as competências certificadas)
  atingiuMinimo: boolean; // presenças cobrem o total exigido
  competencias: CompetenciaFrequencia[];
};

export type ResumoFrequencia = {
  totalExigido: number;
  presencas: number;
  percentual: number;
  semExigencia: boolean;
  atingiuMinimo: boolean;
};

export type FrequenciaAluno = {
  temTurma: boolean; // sem turma o aluno não recebe aulas → caso especial
  turmaNome: string | null;
  interareaValidadas: number; // nº de respostas interárea validadas (o coringa)
  areas: AreaFrequencia[];
  geral: ResumoFrequencia;
};

// Percentual limitado a 100 e arredondado PARA BAIXO: como o mínimo de aprovação
// é 100%, arredondar para cima poderia mostrar "100%" sem o aluno ter concluído.
function percentual(presencas: number, totalExigido: number): number {
  if (totalExigido <= 0) return 100; // nada exigido → nada em aberto
  return Math.min(100, Math.floor((presencas / totalExigido) * 100));
}

function montarResumo(presencas: number, totalExigido: number): ResumoFrequencia {
  return {
    totalExigido,
    presencas,
    percentual: percentual(presencas, totalExigido),
    semExigencia: totalExigido === 0,
    atingiuMinimo: presencas >= totalExigido,
  };
}

// Frequência de um aluno sem turma / sem dados — usada como fallback seguro.
function frequenciaVazia(temTurma: boolean): FrequenciaAluno {
  return {
    temTurma,
    turmaNome: null,
    interareaValidadas: 0,
    areas: [],
    geral: montarResumo(0, 0),
  };
}

// ── CÁLCULO EM LOTE (base de tudo) ──────────────────────────────────────────
// Uma consulta por assunto (áreas, notas, respostas, alunos) e o cruzamento em
// memória — assim a tela da turma não dispara N consultas por aluno.
export async function calcularFrequenciaDeAlunos(
  alunoIds: string[],
): Promise<Map<string, FrequenciaAluno>> {
  const resultado = new Map<string, FrequenciaAluno>();
  const ids = [...new Set(alunoIds)].filter(Boolean);
  if (ids.length === 0) return resultado;

  // Áreas com notas (as 4). Interárea não é área de frequência própria: é coringa.
  const areas = await prisma.area.findMany({
    where: { temNotas: true },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      slug: true,
      nome: true,
      competencias: {
        orderBy: { ordem: "asc" },
        select: { id: true, codigo: true, aulas: true, habilidades: true },
      },
    },
  });

  const competenciaIds = areas.flatMap((a) => a.competencias.map((c) => c.id));

  const [alunos, notas, respostas] = await Promise.all([
    prisma.aluno.findMany({
      where: { id: { in: ids } },
      select: { id: true, turmaId: true, turma: { select: { nome: true } } },
    }),
    competenciaIds.length > 0
      ? prisma.nota.findMany({
          where: { alunoId: { in: ids }, competenciaId: { in: competenciaIds } },
          select: { alunoId: true, competenciaId: true, certificacao: true },
        })
      : Promise.resolve([]),
    // Só respostas VALIDADAS contam presença. GERAL fica de fora.
    prisma.respostaAula.findMany({
      where: {
        alunoId: { in: ids },
        status: "VALIDADA",
        aula: { tipo: { in: ["AREA", "INTERAREA"] } },
      },
      select: { alunoId: true, aula: { select: { tipo: true, areaId: true } } },
    }),
  ]);

  // alunoId → competenciaId → certificacao
  const certPorAluno = new Map<string, Map<string, number | null>>();
  for (const n of notas) {
    let mapa = certPorAluno.get(n.alunoId);
    if (!mapa) certPorAluno.set(n.alunoId, (mapa = new Map()));
    mapa.set(n.competenciaId, n.certificacao);
  }

  // alunoId → { porArea: areaId → nº de validadas, interarea: nº de validadas }
  const presencasPorAluno = new Map<string, { porArea: Map<string, number>; interarea: number }>();
  for (const r of respostas) {
    let p = presencasPorAluno.get(r.alunoId);
    if (!p) presencasPorAluno.set(r.alunoId, (p = { porArea: new Map(), interarea: 0 }));
    if (r.aula.tipo === "INTERAREA") {
      p.interarea += 1;
    } else if (r.aula.areaId) {
      p.porArea.set(r.aula.areaId, (p.porArea.get(r.aula.areaId) ?? 0) + 1);
    }
  }

  const turmaPorAluno = new Map(
    alunos.map((a) => [a.id, { id: a.turmaId, nome: a.turma?.nome ?? null }]),
  );

  for (const alunoId of ids) {
    const turma = turmaPorAluno.get(alunoId);
    const temTurma = !!turma?.id;
    const cert = certPorAluno.get(alunoId);
    const presencas = presencasPorAluno.get(alunoId);
    const interareaValidadas = presencas?.interarea ?? 0;

    const areasResultado: AreaFrequencia[] = areas.map((area) => {
      const competencias: CompetenciaFrequencia[] = area.competencias.map((c) => ({
        codigo: c.codigo,
        aulas: c.aulas,
        dispensada: competenciaCertificada(cert?.get(c.id) ?? null, c.habilidades),
      }));

      // Só as competências NÃO certificadas somam aulas exigidas.
      const totalExigido = competencias
        .filter((c) => !c.dispensada)
        .reduce((s, c) => s + c.aulas, 0);

      // Presenças da área + o coringa da interárea.
      const presencasArea = (presencas?.porArea.get(area.id) ?? 0) + interareaValidadas;
      const resumo = montarResumo(presencasArea, totalExigido);

      return {
        slug: area.slug,
        nome: area.nome,
        totalExigido,
        presencas: presencasArea,
        faltam: Math.max(0, totalExigido - presencasArea),
        percentual: resumo.percentual,
        semExigencia: resumo.semExigencia,
        atingiuMinimo: resumo.atingiuMinimo,
        competencias,
      };
    });

    // Geral: soma dos totais exigidos e das presenças LIMITADAS ao exigido de cada
    // área (sem o limite, o coringa da interárea inflaria o número).
    const totalGeral = areasResultado.reduce((s, a) => s + a.totalExigido, 0);
    const presencasGeral = areasResultado.reduce(
      (s, a) => s + Math.min(a.presencas, a.totalExigido),
      0,
    );

    resultado.set(alunoId, {
      temTurma,
      turmaNome: turma?.nome ?? null,
      interareaValidadas,
      areas: areasResultado,
      geral: montarResumo(presencasGeral, totalGeral),
    });
  }

  return resultado;
}

// ── UM aluno ────────────────────────────────────────────────────────────────
export async function calcularFrequenciaDoAluno(alunoId: string): Promise<FrequenciaAluno> {
  const mapa = await calcularFrequenciaDeAlunos([alunoId]);
  return mapa.get(alunoId) ?? frequenciaVazia(false);
}

// ── Aluno da SESSÃO (telas do aluno) ────────────────────────────────────────
export type FrequenciaAlunoResult =
  | { temAluno: false }
  | { temAluno: true; frequencia: FrequenciaAluno };

export async function carregarFrequenciaDoAlunoLogado(
  userId: string | undefined,
): Promise<FrequenciaAlunoResult> {
  if (!userId) return { temAluno: false };

  const aluno = await prisma.aluno.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!aluno) return { temAluno: false };

  return { temAluno: true, frequencia: await calcularFrequenciaDoAluno(aluno.id) };
}

// ── TURMA inteira (telas do professor e da coordenação) ─────────────────────
export async function calcularFrequenciaDaTurma(
  turmaId: string,
): Promise<Map<string, FrequenciaAluno>> {
  const alunos = await prisma.aluno.findMany({
    where: { turmaId, arquivado: false },
    select: { id: true },
  });
  return calcularFrequenciaDeAlunos(alunos.map((a) => a.id));
}

// ── RELATÓRIO da coordenação (todos os alunos, com filtros na tela) ─────────
export type LinhaFrequenciaRelatorio = {
  alunoId: string;
  nome: string;
  ra: string;
  poloNome: string;
  turmaNome: string;
  temTurma: boolean;
  interareaValidadas: number;
  areas: Record<string, { percentual: number; semExigencia: boolean }>; // slug → resumo
  geral: { percentual: number; semExigencia: boolean };
};

export type RelatorioFrequencia = {
  linhas: LinhaFrequenciaRelatorio[];
  polos: string[];
  turmas: string[];
  areas: { slug: string; nome: string }[];
};

export async function carregarRelatorioFrequencia(): Promise<RelatorioFrequencia> {
  const alunos = await prisma.aluno.findMany({
    where: { arquivado: false },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      ra: true,
      turmaId: true,
      turma: { select: { nome: true, polo: { select: { nome: true } } } },
    },
  });

  const frequencias = await calcularFrequenciaDeAlunos(alunos.map((a) => a.id));

  const linhas: LinhaFrequenciaRelatorio[] = alunos.map((a) => {
    const freq = frequencias.get(a.id) ?? frequenciaVazia(!!a.turmaId);
    const areas: LinhaFrequenciaRelatorio["areas"] = {};
    for (const area of freq.areas) {
      areas[area.slug] = { percentual: area.percentual, semExigencia: area.semExigencia };
    }
    return {
      alunoId: a.id,
      nome: a.nome,
      ra: a.ra ?? "—",
      poloNome: a.turma?.polo?.nome ?? "—",
      turmaNome: a.turma?.nome ?? "Sem turma",
      temTurma: !!a.turmaId,
      interareaValidadas: freq.interareaValidadas,
      areas,
      geral: { percentual: freq.geral.percentual, semExigencia: freq.geral.semExigencia },
    };
  });

  // Colunas de área na ordem do banco (as 4 com notas).
  const areasDb = await prisma.area.findMany({
    where: { temNotas: true },
    orderBy: { ordem: "asc" },
    select: { slug: true, nome: true },
  });

  return {
    linhas,
    polos: [...new Set(linhas.map((l) => l.poloNome))].filter((p) => p !== "—").sort(),
    turmas: [...new Set(linhas.map((l) => l.turmaNome))].sort(),
    areas: areasDb,
  };
}

// ── Formato consumido pelas telas que usam o id de área do config ───────────
// (grade de notas do professor, relatórios). Chave = AreaConfigId.
export type FrequenciaPorAreaConfig = Partial<Record<AreaConfigId, AreaFrequencia>>;

export function frequenciaPorAreaConfig(freq: FrequenciaAluno): FrequenciaPorAreaConfig {
  const mapa: FrequenciaPorAreaConfig = {};
  for (const area of freq.areas) {
    const configId = AREA_CONFIG_POR_SLUG[area.slug];
    if (configId) mapa[configId] = area;
  }
  return mapa;
}

// Frequência da turma inteira já no formato da grade: alunoId → área(config) → resumo.
export async function carregarFrequenciaGradeTurma(
  turmaId: string,
): Promise<Record<string, FrequenciaPorAreaConfig>> {
  const mapa = await calcularFrequenciaDaTurma(turmaId);
  const resultado: Record<string, FrequenciaPorAreaConfig> = {};
  for (const [alunoId, freq] of mapa) resultado[alunoId] = frequenciaPorAreaConfig(freq);
  return resultado;
}

export { FREQUENCIA_MINIMA_APROVACAO };
