import { prisma } from "@/lib/prisma";
import { calcularFrequenciaDeAlunos } from "@/lib/queries/frequencia";
import {
  CAMPOS_VAZIOS,
  mediaCompetencia,
  competenciaAprovada,
  situacaoArea,
  type CamposCompetencia,
} from "@/lib/regras-notas";
import {
  AREA_CONFIG_ORDER,
  AREA_SLUG_POR_CONFIG,
  AREA_CONFIG_POR_SLUG,
  type AreaConfigId,
} from "@/lib/competencias-config";
import type { SituacaoAluno } from "@prisma/client";

// ════════════════════════════════════════════════════════════════════════════
// AVALIAÇÃO ACADÊMICA DOS ALUNOS (base dos relatórios de Concluintes, Polo e Notas)
//
// CONCLUINTE = concluiu as 4 áreas. "Concluir uma área" = TODAS as competências
// aprovadas (nota ≥ 60 ou certificada) E frequência da área = 100% — exatamente
// o critério de `situacaoArea` (regras-notas.ts). Frequência é sempre CALCULADA
// (queries/frequencia.ts), nunca digitada.
// ════════════════════════════════════════════════════════════════════════════

const SEM_POLO = "—";
const SEM_TURMA = "—";

// Rótulo curto de cada área (igual ao que as telas já usam).
export const AREA_LABEL_CURTO: Record<AreaConfigId, string> = {
  matematica: "Matemática",
  linguagens: "Linguagens",
  cienciasNatureza: "C. Natureza",
  cienciasHumanas: "C. Humanas",
};

function toCampos(n: {
  certificacao: number | null;
  presenca: number | null;
  diagnostica: number | null;
  avaliativa: number | null;
  voceAutor: number | null;
}): CamposCompetencia {
  return {
    certificacao: n.certificacao,
    presenca: n.presenca,
    diagnostica: n.diagnostica,
    avaliativa: n.avaliativa,
    voceAutor: n.voceAutor,
  };
}

export type CompetenciaAvaliada = {
  codigo: string;
  mediaTexto: string; // "—" | "83" | "Cert 75%"
  aprovada: boolean; // nota + presença (regra única)
  temNota: boolean;
};

export type AreaAvaliada = {
  areaId: AreaConfigId;
  label: string;
  competencias: CompetenciaAvaliada[];
  aprovadaArea: boolean | null; // só notas: null se área sem nota; senão todas as com nota aprovadas
  concluida: boolean; // situacaoArea === "Aprovado" (notas + frequência 100%)
  freqPercentual: number;
};

export type AlunoAvaliado = {
  id: string;
  nome: string;
  turmaNome: string;
  poloNome: string;
  situacao: SituacaoAluno;
  certificadoEmitido: boolean;
  dataConclusao: Date | null;
  freqGeral: number;
  areas: AreaAvaliada[];
  concluinte: boolean; // as 4 áreas concluídas
};

function mediaTextoDe(campos: CamposCompetencia, total: number): string {
  const m = mediaCompetencia(campos, total);
  if (m.tipo === "certificado") return `Cert ${m.percentual}%`;
  if (m.tipo === "nota") return `${m.valor}`;
  return "—";
}

// Avalia TODOS os alunos não-arquivados: notas reais + frequência calculada,
// derivando a situação de cada área e se é concluinte. Base única dos 3 relatórios.
export async function avaliarTodosAlunos(): Promise<AlunoAvaliado[]> {
  const alunos = await prisma.aluno.findMany({
    where: { arquivado: false },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      situacao: true,
      dataConclusao: true,
      certificadoEmitido: true,
      turma: { select: { nome: true, polo: { select: { nome: true } } } },
    },
  });

  // Competências das 4 áreas de notas (código + total de habilidades do banco).
  const slugs = Object.values(AREA_SLUG_POR_CONFIG);
  const competencias = await prisma.competencia.findMany({
    where: { area: { slug: { in: slugs } } },
    orderBy: { ordem: "asc" },
    select: { id: true, codigo: true, habilidades: true, area: { select: { slug: true } } },
  });

  // Competências agrupadas por área (config), na ordem do banco.
  const compsPorArea: Record<AreaConfigId, { id: string; codigo: string; habilidades: number }[]> = {
    matematica: [],
    linguagens: [],
    cienciasNatureza: [],
    cienciasHumanas: [],
  };
  for (const c of competencias) {
    const areaId = AREA_CONFIG_POR_SLUG[c.area.slug];
    if (!areaId) continue; // ignora áreas fora das 4 de notas (ex.: interárea)
    compsPorArea[areaId].push({ id: c.id, codigo: c.codigo, habilidades: c.habilidades });
  }

  const ids = alunos.map((a) => a.id);
  const compIds = competencias.map((c) => c.id);

  // Notas de todos os alunos nessas competências + frequência calculada em lote.
  const [notas, freqMap] = await Promise.all([
    ids.length > 0 && compIds.length > 0
      ? prisma.nota.findMany({
          where: { alunoId: { in: ids }, competenciaId: { in: compIds } },
          select: {
            alunoId: true,
            competenciaId: true,
            certificacao: true,
            presenca: true,
            diagnostica: true,
            avaliativa: true,
            voceAutor: true,
          },
        })
      : Promise.resolve([]),
    calcularFrequenciaDeAlunos(ids),
  ]);

  // alunoId → competenciaId → campos
  const camposPorAluno = new Map<string, Map<string, CamposCompetencia>>();
  for (const n of notas) {
    let mapa = camposPorAluno.get(n.alunoId);
    if (!mapa) camposPorAluno.set(n.alunoId, (mapa = new Map()));
    mapa.set(n.competenciaId, toCampos(n));
  }

  return alunos.map((a) => {
    const camposAluno = camposPorAluno.get(a.id);
    const freq = freqMap.get(a.id);
    const freqPorSlug = new Map((freq?.areas ?? []).map((ar) => [ar.slug, ar.percentual]));

    const areas: AreaAvaliada[] = AREA_CONFIG_ORDER.map((areaId) => {
      const comps = compsPorArea[areaId];
      const slug = AREA_SLUG_POR_CONFIG[areaId];
      const freqPercentual = freqPorSlug.get(slug) ?? 0;

      const competenciasAval: CompetenciaAvaliada[] = comps.map((c) => {
        const campos = camposAluno?.get(c.id) ?? CAMPOS_VAZIOS;
        const media = mediaCompetencia(campos, c.habilidades);
        return {
          codigo: c.codigo,
          mediaTexto: mediaTextoDe(campos, c.habilidades),
          aprovada: competenciaAprovada(campos, c.habilidades),
          temNota: media.tipo !== "vazio",
        };
      });

      const comNota = competenciasAval.filter((c) => c.temNota);
      const aprovadaArea = comNota.length === 0 ? null : comNota.every((c) => c.aprovada);

      const situacao = situacaoArea(
        comps.map((c) => ({ campos: camposAluno?.get(c.id) ?? CAMPOS_VAZIOS, total: c.habilidades })),
        freqPercentual,
      );

      return {
        areaId,
        label: AREA_LABEL_CURTO[areaId],
        competencias: competenciasAval,
        aprovadaArea,
        concluida: situacao === "Aprovado",
        freqPercentual,
      };
    });

    return {
      id: a.id,
      nome: a.nome,
      turmaNome: a.turma?.nome ?? SEM_TURMA,
      poloNome: a.turma?.polo?.nome ?? SEM_POLO,
      situacao: a.situacao,
      certificadoEmitido: a.certificadoEmitido,
      dataConclusao: a.dataConclusao,
      freqGeral: freq?.geral.percentual ?? 0,
      areas,
      // Concluinte só se TODAS as 4 áreas foram concluídas.
      concluinte: areas.length === AREA_CONFIG_ORDER.length && areas.every((ar) => ar.concluida),
    };
  });
}

// dd/mm/aaaa → aqui só MM/AAAA (mês/ano da conclusão, para o filtro da tela).
function fmtMesAno(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${mm}/${d.getFullYear()}`;
}

// ── 1. CONCLUINTES ──────────────────────────────────────────────────────────
export type ConcluinteRow = {
  id: string;
  nome: string;
  turmaNome: string;
  poloNome: string;
  dataConclusao: string | null; // MM/AAAA quando o campo dataConclusao existir
};

export type RelatorioConcluintesData = {
  linhas: ConcluinteRow[];
  totalConcluintes: number;
  totalAlunos: number;
  pctConclusao: number;
  porPolo: { polo: string; total: number; concluintes: number }[];
  porTurma: { turma: string; total: number; concluintes: number }[];
  polos: string[];
  meses: string[];
  anos: string[];
};

export async function carregarRelatorioConcluintes(): Promise<RelatorioConcluintesData> {
  const todos = await avaliarTodosAlunos();
  const concluintes = todos.filter((a) => a.concluinte);

  const linhas: ConcluinteRow[] = concluintes.map((a) => ({
    id: a.id,
    nome: a.nome,
    turmaNome: a.turmaNome,
    poloNome: a.poloNome,
    dataConclusao: a.dataConclusao ? fmtMesAno(a.dataConclusao) : null,
  }));

  const polos = [...new Set(todos.map((a) => a.poloNome))].filter((p) => p !== SEM_POLO).sort();

  const porPolo = polos.map((polo) => ({
    polo,
    total: todos.filter((a) => a.poloNome === polo).length,
    concluintes: concluintes.filter((a) => a.poloNome === polo).length,
  }));

  const turmasConcl = [...new Set(concluintes.map((a) => a.turmaNome))]
    .filter((t) => t !== SEM_TURMA)
    .sort();
  const porTurma = turmasConcl.map((turma) => ({
    turma,
    total: todos.filter((a) => a.turmaNome === turma).length,
    concluintes: concluintes.filter((a) => a.turmaNome === turma).length,
  }));

  const meses = [...new Set(linhas.map((l) => l.dataConclusao).filter((m): m is string => !!m))].sort();
  const anos = [...new Set(meses.map((m) => m.split("/")[1]))].sort();

  return {
    linhas,
    totalConcluintes: concluintes.length,
    totalAlunos: todos.length,
    pctConclusao: todos.length > 0 ? Math.round((concluintes.length / todos.length) * 100) : 0,
    porPolo,
    porTurma,
    polos,
    meses,
    anos,
  };
}

// ── 2. POR POLO ─────────────────────────────────────────────────────────────
export type PoloFreqArea = { areaId: AreaConfigId; label: string; avg: number };
export type PoloRow = {
  polo: string;
  alunos: number;
  professores: number;
  turmas: number;
  freqGeral: number;
  freqPorArea: PoloFreqArea[];
  concluintes: number;
  certificados: number;
};

export type RelatorioPorPoloData = { polos: PoloRow[] };

export async function carregarRelatorioPorPolo(): Promise<RelatorioPorPoloData> {
  const [todos, professores, turmas] = await Promise.all([
    avaliarTodosAlunos(),
    prisma.professor.findMany({
      where: { arquivado: false },
      select: { polo: { select: { nome: true } } },
    }),
    prisma.turma.findMany({ select: { polo: { select: { nome: true } } } }),
  ]);

  const nomesPolos = [...new Set(todos.map((a) => a.poloNome))].filter((p) => p !== SEM_POLO).sort();

  const polos: PoloRow[] = nomesPolos.map((polo) => {
    const doPolo = todos.filter((a) => a.poloNome === polo);
    const n = doPolo.length;

    const freqPorArea: PoloFreqArea[] = AREA_CONFIG_ORDER.map((areaId) => {
      const vals = doPolo.map(
        (a) => a.areas.find((ar) => ar.areaId === areaId)?.freqPercentual ?? 0,
      );
      return {
        areaId,
        label: AREA_LABEL_CURTO[areaId],
        avg: n > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / n) : 0,
      };
    });

    return {
      polo,
      alunos: n,
      professores: professores.filter((p) => p.polo?.nome === polo).length,
      turmas: turmas.filter((t) => t.polo?.nome === polo).length,
      freqGeral: n > 0 ? Math.round(doPolo.reduce((s, a) => s + a.freqGeral, 0) / n) : 0,
      freqPorArea,
      concluintes: doPolo.filter((a) => a.concluinte).length,
      certificados: doPolo.filter((a) => a.certificadoEmitido).length,
    };
  });

  return { polos };
}

// ── 3. NOTAS ────────────────────────────────────────────────────────────────
export type NotasAreaCard = {
  areaId: AreaConfigId;
  label: string;
  competencias: CompetenciaAvaliada[];
  aprovadaArea: boolean | null;
};
export type NotasAlunoCard = {
  id: string;
  nome: string;
  turmaNome: string;
  poloNome: string;
  situacao: SituacaoAluno;
  areas: NotasAreaCard[];
};
export type RelatorioNotasData = {
  alunos: NotasAlunoCard[];
  polos: string[];
  turmas: string[];
};

export async function carregarRelatorioNotas(): Promise<RelatorioNotasData> {
  const todos = await avaliarTodosAlunos();

  const alunos: NotasAlunoCard[] = todos.map((a) => ({
    id: a.id,
    nome: a.nome,
    turmaNome: a.turmaNome,
    poloNome: a.poloNome,
    situacao: a.situacao,
    areas: a.areas.map((ar) => ({
      areaId: ar.areaId,
      label: ar.label,
      competencias: ar.competencias,
      aprovadaArea: ar.aprovadaArea,
    })),
  }));

  const polos = [...new Set(todos.map((a) => a.poloNome))].filter((p) => p !== SEM_POLO).sort();
  const turmas = [...new Set(todos.map((a) => a.turmaNome))].filter((t) => t !== SEM_TURMA).sort();

  return { alunos, polos, turmas };
}
