import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  CAMPOS_VAZIOS,
  mediaCompetencia,
  situacaoCompetencia,
  type CamposCompetencia,
  type SituacaoCompetencia,
} from "@/lib/regras-notas";
import {
  AREA_CONFIG_ORDER,
  COMPETENCIAS_CONFIG,
  type AreaConfigId,
} from "@/lib/competencias-config";
import type { NotasGrade } from "@/lib/mock-data/professor";

export type ResultadoAcao = { ok: boolean; message: string };

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

// ── GRAVAÇÃO (Etapa C): salva as notas de UMA área da turma ─────────────────
// Recebe, por aluno, os 5 campos de cada competência da área. Faz upsert por
// (alunoId, competenciaId); competência totalmente vazia é REMOVIDA (não cria linha vazia).
// Segurança: professor precisa estar vinculado à turma e à própria área; coordenação libera.
export async function salvarNotasDaArea(
  turmaId: string,
  areaConfigId: AreaConfigId,
  notasPorAluno: Record<string, Record<string, CamposCompetencia>>,
  userId: string | undefined,
  isCoordenacao: boolean,
): Promise<ResultadoAcao> {
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const areaSlug = AREA_ID_TO_SLUG[areaConfigId];
  if (!areaSlug) return { ok: false, message: "Área inválida." };

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    select: { professores: { select: { professorId: true } } },
  });
  if (!turma) return { ok: false, message: "Turma não encontrada." };

  if (!isCoordenacao) {
    const professor = await prisma.professor.findUnique({
      where: { userId },
      select: { id: true, area: { select: { slug: true } } },
    });
    const vinculado = !!professor && turma.professores.some((tp) => tp.professorId === professor.id);
    if (!vinculado) return { ok: false, message: "Você não está vinculado a esta turma." };
    if (professor?.area?.slug !== areaSlug) {
      return { ok: false, message: "Você só pode lançar notas da sua área." };
    }
  }

  // Competências da área (codigo → id) e alunos válidos da turma (não arquivados).
  const [competencias, alunosTurma] = await Promise.all([
    prisma.competencia.findMany({ where: { area: { slug: areaSlug } }, select: { id: true, codigo: true } }),
    prisma.aluno.findMany({ where: { turmaId, arquivado: false }, select: { id: true } }),
  ]);
  const idPorCodigo = new Map(competencias.map((c) => [c.codigo, c.id]));
  const alunoIdsValidos = new Set(alunosTurma.map((a) => a.id));

  const ops: Prisma.PrismaPromise<unknown>[] = [];
  for (const [alunoId, porComp] of Object.entries(notasPorAluno)) {
    if (!alunoIdsValidos.has(alunoId)) continue; // ignora alunos fora da turma (segurança)
    for (const [codigo, campos] of Object.entries(porComp)) {
      const competenciaId = idPorCodigo.get(codigo);
      if (!competenciaId) continue;
      const vazio =
        campos.certificacao == null &&
        campos.presenca == null &&
        campos.diagnostica == null &&
        campos.avaliativa == null &&
        campos.voceAutor == null;
      if (vazio) {
        ops.push(prisma.nota.deleteMany({ where: { alunoId, competenciaId } }));
      } else {
        ops.push(
          prisma.nota.upsert({
            where: { alunoId_competenciaId: { alunoId, competenciaId } },
            update: { ...campos },
            create: { alunoId, competenciaId, ...campos },
          }),
        );
      }
    }
  }

  if (ops.length > 0) await prisma.$transaction(ops);
  return { ok: true, message: "Notas salvas no banco." };
}

// ── LEITURA das notas do ALUNO (tela "Notas por Área") ──────────────────────
// Slugs das 4 áreas de notas (interárea não tem notas).
const AREAS_NOTAS_SLUGS = Object.values(AREA_ID_TO_SLUG);

export type CompetenciaNotaAluno = {
  codigo: string;
  mediaTexto: string; // "—" | "83" | "Cert 75%"
  situacao: SituacaoCompetencia; // "aprovado" | "pendente_frequencia" | "cursando" | "vazio"
};

// Status exibido por área (badge), derivado das situações das competências:
//  - "aprovado": todas as competências aprovadas (nota + presença)
//  - "pendente_frequencia": todas atingiram a nota, mas alguma está com presença pendente
//  - "em_processo": ainda falta atingir a nota em alguma competência
export type StatusAreaAluno = "aprovado" | "pendente_frequencia" | "em_processo";

export type AreaNotaAluno = {
  nome: string;
  competencias: CompetenciaNotaAluno[];
  status: StatusAreaAluno;
  temNota: boolean; // há alguma nota (de competência) lançada na área?
};

export type NotasAlunoResult =
  | { temAluno: false }
  | { temAluno: true; areas: AreaNotaAluno[] };

// Texto da média a partir do resultado das regras (certificado / nota / vazio).
function fmtMediaTexto(campos: CamposCompetencia, total: number): string {
  const m = mediaCompetencia(campos, total);
  if (m.tipo === "certificado") return `Cert ${m.percentual}%`;
  if (m.tipo === "nota") return `${m.valor}`;
  return "—";
}

// Carrega as notas do aluno vinculado à sessão. O aluno é derivado do userId no servidor.
export async function carregarNotasDoAluno(
  userId: string | undefined,
): Promise<NotasAlunoResult> {
  if (!userId) return { temAluno: false };

  const aluno = await prisma.aluno.findUnique({ where: { userId }, select: { id: true } });
  if (!aluno) return { temAluno: false };

  // Áreas (ordem do banco) com suas competências (código/ordem/habilidades do banco).
  const areas = await prisma.area.findMany({
    where: { slug: { in: AREAS_NOTAS_SLUGS } },
    orderBy: { ordem: "asc" },
    select: {
      nome: true,
      competencias: {
        orderBy: { ordem: "asc" },
        select: { id: true, codigo: true, habilidades: true },
      },
    },
  });

  // Notas do aluno nessas competências.
  const compIds = areas.flatMap((a) => a.competencias.map((c) => c.id));
  const notas =
    compIds.length > 0
      ? await prisma.nota.findMany({
          where: { alunoId: aluno.id, competenciaId: { in: compIds } },
          select: {
            competenciaId: true,
            certificacao: true,
            presenca: true,
            diagnostica: true,
            avaliativa: true,
            voceAutor: true,
          },
        })
      : [];
  const camposPorComp = new Map(notas.map((n) => [n.competenciaId, toCampos(n)]));

  const resultado: AreaNotaAluno[] = areas.map((area) => {
    const competencias: CompetenciaNotaAluno[] = area.competencias.map((c) => {
      const campos = camposPorComp.get(c.id) ?? CAMPOS_VAZIOS;
      return {
        codigo: c.codigo,
        mediaTexto: fmtMediaTexto(campos, c.habilidades),
        situacao: situacaoCompetencia(campos, c.habilidades),
      };
    });

    // Status da área derivado das situações das competências (mesma regra da presença).
    const todasAprovadas = competencias.every((c) => c.situacao === "aprovado");
    const todasAtingiram = competencias.every(
      (c) => c.situacao === "aprovado" || c.situacao === "pendente_frequencia",
    );
    const temPendFrequencia = competencias.some((c) => c.situacao === "pendente_frequencia");

    let status: StatusAreaAluno;
    if (todasAprovadas) status = "aprovado";
    else if (todasAtingiram && temPendFrequencia) status = "pendente_frequencia";
    else status = "em_processo";

    return {
      nome: area.nome,
      competencias,
      status,
      temNota: competencias.some((c) => c.situacao !== "vazio"),
    };
  });

  return { temAluno: true, areas: resultado };
}
