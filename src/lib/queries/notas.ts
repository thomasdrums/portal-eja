import { prisma } from "@/lib/prisma";
import { CAMPOS_VAZIOS, type CamposCompetencia } from "@/lib/regras-notas";
import {
  AREA_CONFIG_ORDER,
  COMPETENCIAS_CONFIG,
  type AreaConfigId,
} from "@/lib/competencias-config";
import type { NotasGrade } from "@/lib/mock-data/professor";

// Mapa: id de área da grade (config) ↔ slug da Area no banco.
const AREA_ID_TO_SLUG: Record<AreaConfigId, string> = {
  matematica: "matematica",
  linguagens: "linguagens",
  cienciasNatureza: "ciencias-natureza",
  cienciasHumanas: "ciencias-humanas",
};
const SLUG_TO_AREA_ID: Record<string, AreaConfigId> = Object.fromEntries(
  Object.entries(AREA_ID_TO_SLUG).map(([id, slug]) => [slug, id as AreaConfigId]),
) as Record<string, AreaConfigId>;

// Totais de habilidades por competência, vindos do BANCO: area(config id) → codigo → habilidades.
export type TotaisMap = Record<string, Record<string, number>>;

// Converte uma linha Nota (campos Int?) para o formato de 5 campos da grade.
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

// Grade vazia (4 áreas de notas) com as competências do config — garante que a GradeNotas
// sempre encontre todas as células que renderiza (as notas do banco preenchem por cima).
function gradeVaziaConfig(): NotasGrade {
  const grade = {} as NotasGrade;
  for (const area of AREA_CONFIG_ORDER) {
    const obj: Record<string, CamposCompetencia> = {};
    for (const comp of Object.keys(COMPETENCIAS_CONFIG[area].competencias)) {
      obj[comp] = { ...CAMPOS_VAZIOS };
    }
    grade[area] = obj;
  }
  return grade;
}

// ── LEITURA por ÁREA (uma área, via slug) ──────────────────────────────────
// Retorna as competências da área (codigo/ordem/habilidades do banco) e, por aluno da turma
// (arquivado=false), os 5 campos por competência — célula VAZIA quando não houver Nota.
export async function carregarNotasDaArea(
  turmaId: string,
  areaSlug: string,
): Promise<{
  competencias: { codigo: string; ordem: number; habilidades: number }[];
  notasPorAluno: Record<string, Record<string, CamposCompetencia>>;
}> {
  const [alunos, competencias] = await Promise.all([
    prisma.aluno.findMany({ where: { turmaId, arquivado: false }, select: { id: true } }),
    prisma.competencia.findMany({
      where: { area: { slug: areaSlug } },
      orderBy: { ordem: "asc" },
      select: { id: true, codigo: true, ordem: true, habilidades: true },
    }),
  ]);

  const codigoPorCompId = new Map(competencias.map((c) => [c.id, c.codigo]));

  // Esqueleto vazio: cada aluno → cada competência da área.
  const notasPorAluno: Record<string, Record<string, CamposCompetencia>> = {};
  for (const a of alunos) {
    const obj: Record<string, CamposCompetencia> = {};
    for (const c of competencias) obj[c.codigo] = { ...CAMPOS_VAZIOS };
    notasPorAluno[a.id] = obj;
  }

  if (alunos.length > 0 && competencias.length > 0) {
    const notas = await prisma.nota.findMany({
      where: {
        alunoId: { in: alunos.map((a) => a.id) },
        competenciaId: { in: competencias.map((c) => c.id) },
      },
      select: {
        alunoId: true,
        competenciaId: true,
        certificacao: true,
        presenca: true,
        diagnostica: true,
        avaliativa: true,
        voceAutor: true,
      },
    });
    for (const n of notas) {
      const codigo = codigoPorCompId.get(n.competenciaId);
      if (codigo && notasPorAluno[n.alunoId]) notasPorAluno[n.alunoId][codigo] = toCampos(n);
    }
  }

  return {
    competencias: competencias.map((c) => ({
      codigo: c.codigo,
      ordem: c.ordem,
      habilidades: c.habilidades,
    })),
    notasPorAluno,
  };
}

// ── LEITURA das 4 ÁREAS de uma vez (para a grade + a "Visão Geral") ─────────
// Retorna, por aluno da turma, o NotasGrade completo (4 áreas) preenchido com as notas reais,
// e o mapa de totais de habilidades por competência vindo do banco.
export async function carregarNotasGradeTurma(turmaId: string): Promise<{
  notasPorAluno: Record<string, NotasGrade>;
  totais: TotaisMap;
}> {
  const alunos = await prisma.aluno.findMany({
    where: { turmaId, arquivado: false },
    select: { id: true },
  });

  const slugs = Object.values(AREA_ID_TO_SLUG);
  const competencias = await prisma.competencia.findMany({
    where: { area: { slug: { in: slugs } } },
    select: { id: true, codigo: true, habilidades: true, area: { select: { slug: true } } },
  });

  // competenciaId → { areaId(config), codigo } e totais do banco.
  const compInfo = new Map<string, { areaId: AreaConfigId; codigo: string }>();
  const totais: TotaisMap = {};
  for (const c of competencias) {
    const areaId = SLUG_TO_AREA_ID[c.area.slug];
    if (!areaId) continue; // ignora áreas fora das 4 de notas (ex.: interárea)
    compInfo.set(c.id, { areaId, codigo: c.codigo });
    (totais[areaId] ??= {})[c.codigo] = c.habilidades;
  }

  // Grade vazia para todos os alunos (garante entrada mesmo sem nenhuma nota).
  const notasPorAluno: Record<string, NotasGrade> = {};
  for (const a of alunos) notasPorAluno[a.id] = gradeVaziaConfig();

  if (alunos.length > 0 && compInfo.size > 0) {
    const notas = await prisma.nota.findMany({
      where: {
        alunoId: { in: alunos.map((a) => a.id) },
        competenciaId: { in: [...compInfo.keys()] },
      },
      select: {
        alunoId: true,
        competenciaId: true,
        certificacao: true,
        presenca: true,
        diagnostica: true,
        avaliativa: true,
        voceAutor: true,
      },
    });
    for (const n of notas) {
      const info = compInfo.get(n.competenciaId);
      const grade = notasPorAluno[n.alunoId];
      if (!info || !grade) continue;
      const areaObj = grade[info.areaId];
      if (areaObj && info.codigo in areaObj) {
        areaObj[info.codigo] = toCampos(n);
      }
    }
  }

  return { notasPorAluno, totais };
}
