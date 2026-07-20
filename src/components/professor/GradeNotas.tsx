"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Lock, Info, Save, Eye } from "lucide-react";
import {
  SITUACAO_CFG,
  notasEditaveis,
  type Turma,
  type Aluno,
  type NotasGrade,
  type SituacaoAluno,
} from "@/lib/mock-data/professor";
import {
  COMPETENCIAS_CONFIG,
  AREA_CONFIG_ORDER,
  competenciasDaArea,
  totalHabilidades,
  type AreaConfigId,
} from "@/lib/competencias-config";
import {
  mediaCompetencia,
  competenciaAprovada,
  situacaoArea,
  situacaoCompetencia,
  minParaCertificar,
  type CamposCompetencia,
  type SituacaoCompetencia,
} from "@/lib/regras-notas";

// ── Geometria das colunas congeladas (à esquerda) ────────────
const RA_W = 92;
const NOME_W = 150;
const STATUS_W = 120;
const NOME_LEFT = RA_W;
const STATUS_LEFT = RA_W + NOME_W;

// ── Campos editáveis por competência ─────────────────────────
const CAMPOS: { key: keyof CamposCompetencia; label: string }[] = [
  { key: "certificacao", label: "Cert." },
  { key: "presenca", label: "Pres." },
  { key: "diagnostica", label: "Diag." },
  { key: "avaliativa", label: "Aval." },
  { key: "voceAutor", label: "VA" },
];

// Opções do seletor de Status na grade (4 opções).
const STATUS_OPCOES: SituacaoAluno[] = [
  "CURSANDO",
  "APROVADO",
  "EVADIDO",
  "DESISTENTE",
];

// Painel "Visão Geral": rótulos das competências por área.
const VG_AREAS: { area: AreaConfigId; prefixo: string }[] = [
  { area: "matematica", prefixo: "MT" },
  { area: "linguagens", prefixo: "LCT" },
  { area: "cienciasNatureza", prefixo: "CNT" },
  { area: "cienciasHumanas", prefixo: "CHT" },
];

type AbaArea = AreaConfigId | "visaogeral";

function clampNum(val: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(val)));
}

function maxDoCampo(key: keyof CamposCompetencia, total: number): number {
  if (key === "certificacao") return total;
  if (key === "voceAutor") return 40;
  return 20;
}

// Texto + cor da célula de Média.
function mediaInfo(campos: CamposCompetencia, total: number) {
  const media = mediaCompetencia(campos, total);
  const aprovada = competenciaAprovada(campos, total);
  if (media.tipo === "vazio") {
    return { texto: "—", cls: "bg-gray-50 text-gray-400" };
  }
  const cls = aprovada
    ? "bg-[#EAF6EE] text-[#007A33]"
    : "bg-amber-50 text-amber-700";
  const texto =
    media.tipo === "certificado" ? `Cert ${media.percentual}%` : `${media.valor}`;
  return { texto, cls };
}

export function GradeNotas({
  turma,
  readOnly = false,
}: {
  turma: Turma;
  // Modo somente leitura (Coordenação): vê todas as áreas, sem editar.
  readOnly?: boolean;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "PROFESSOR";
  const disciplina = session?.user?.disciplina ?? null;

  // Em modo somente leitura nenhuma área é editável.
  const editableIds = readOnly ? [] : notasEditaveis(disciplina, role);

  // Área selecionada — null segue a 1ª área editável do professor.
  const [areaPick, setAreaPick] = useState<AbaArea | null>(null);
  const effectiveArea: AbaArea =
    areaPick ?? (editableIds[0] as AreaConfigId | undefined) ?? "matematica";
  const isVisaoGeral = effectiveArea === "visaogeral";
  const notaArea: AreaConfigId = isVisaoGeral ? "matematica" : effectiveArea;
  const areaEditavel = !isVisaoGeral && editableIds.includes(notaArea);

  const comps = competenciasDaArea(notaArea);

  // Cópia local editável das notas de todos os alunos da turma.
  const [grade, setGrade] = useState<Record<string, NotasGrade>>(() =>
    Object.fromEntries(turma.alunos.map((a) => [a.id, a.notasGrade])),
  );
  // Status editável (local) — TODO: persistir no banco (Fase 2)
  const [statusMap, setStatusMap] = useState<Record<string, SituacaoAluno>>(() =>
    Object.fromEntries(turma.alunos.map((a) => [a.id, a.situacao])),
  );

  const [busca, setBusca] = useState("");
  const [salvoMsg, setSalvoMsg] = useState("");

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return turma.alunos;
    return turma.alunos.filter(
      (a) => a.nome.toLowerCase().includes(termo) || a.ra.includes(termo),
    );
  }, [busca, turma.alunos]);

  function setCampo(
    alunoId: string,
    comp: string,
    key: keyof CamposCompetencia,
    raw: string,
    max: number,
  ) {
    setGrade((prev) => {
      const atual = prev[alunoId][notaArea][comp];
      let valor: number | null = null;
      if (raw !== "") {
        const n = Number(raw);
        valor = Number.isNaN(n) ? null : clampNum(n, max);
      }
      return {
        ...prev,
        [alunoId]: {
          ...prev[alunoId],
          [notaArea]: {
            ...prev[alunoId][notaArea],
            [comp]: { ...atual, [key]: valor },
          },
        },
      };
    });
  }

  function handleSalvar() {
    // TODO: persistir no banco (Fase 2)
    setSalvoMsg(
      "Notas salvas localmente — ainda não persistem após recarregar (em breve, com o banco de dados).",
    );
    setTimeout(() => setSalvoMsg(""), 4000);
  }

  return (
    <div className="space-y-4">
      {/* Seletor de área + Visão Geral */}
      <div className="flex flex-wrap gap-2">
        {AREA_CONFIG_ORDER.map((a) => {
          const ativo = a === effectiveArea;
          const editavel = editableIds.includes(a);
          return (
            <button
              key={a}
              onClick={() => setAreaPick(a)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                ativo
                  ? "border-[#009640] bg-[#009640] text-white"
                  : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#009640] hover:text-[#009640]"
              }`}
            >
              {COMPETENCIAS_CONFIG[a].nome}
              {!editavel && !readOnly && (
                <Lock size={11} className={ativo ? "text-white/80" : "text-gray-400"} />
              )}
            </button>
          );
        })}
        <button
          onClick={() => setAreaPick("visaogeral")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            isVisaoGeral
              ? "border-[#009640] bg-[#009640] text-white"
              : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#009640] hover:text-[#009640]"
          }`}
        >
          <Eye size={13} />
          Visão Geral
        </button>
      </div>

      {/* Aviso de somente leitura — Coordenação (todas as áreas) */}
      {readOnly && (
        <div className="flex items-center gap-2 rounded-lg border border-[#CDEBD7] bg-[#EAF6EE] px-4 py-2.5 text-xs font-medium text-[#007A33]">
          <Eye size={14} className="shrink-0" />
          Visualização da Coordenação — todas as áreas em <strong>somente leitura</strong>.
        </div>
      )}

      {/* Aviso de somente leitura para área que o professor não leciona */}
      {!readOnly && !isVisaoGeral && !areaEditavel && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
          <Lock size={14} className="shrink-0" />
          Você está visualizando <strong>{COMPETENCIAS_CONFIG[notaArea].nome}</strong>, uma área que
          não leciona — os campos estão em somente leitura.
        </div>
      )}

      {/* Busca + dica de uso */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            placeholder="Buscar por RA ou nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded border border-[#D9D9D9] bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
          />
        </div>
        <p className="hidden items-center gap-1.5 text-xs text-[#9CA3AF] sm:flex">
          <Info size={13} />
          Ideal em computador/notebook · no celular, role a grade na horizontal
        </p>
      </div>

      {isVisaoGeral ? (
        <VisaoGeral alunos={alunosFiltrados} grade={grade} />
      ) : (
        <>
          {/* Aviso de não-persistência */}
          {!readOnly && (
            <div className="flex items-start gap-2 rounded-lg border border-[#D9D9D9] bg-[#F9FAFB] px-4 py-2.5 text-xs text-[#4B5563]">
              <Info size={14} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
              As notas ainda não são salvas permanentemente (em breve, com o banco de dados).
            </div>
          )}

          {/* Grade de notas */}
          <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <table className="border-separate border-spacing-0 text-xs">
              <thead>
                {/* Linha 1: colunas congeladas (rowSpan 2) + grupos de competência */}
                <tr>
                  <th
                    className="sticky z-20 border-b border-r border-[#007A33] bg-[#009640] px-2 py-2 text-left text-[11px] font-semibold text-white"
                    style={{ left: 0, width: RA_W, minWidth: RA_W }}
                    rowSpan={2}
                  >
                    RA
                  </th>
                  <th
                    className="sticky z-20 border-b border-r border-[#007A33] bg-[#009640] px-2 py-2 text-left text-[11px] font-semibold text-white"
                    style={{ left: NOME_LEFT, width: NOME_W, minWidth: NOME_W }}
                    rowSpan={2}
                  >
                    Nome
                  </th>
                  <th
                    className="sticky z-20 border-b border-r-2 border-r-[#E5E7EB] border-b-[#007A33] bg-[#009640] px-2 py-2 text-center text-[11px] font-semibold text-white shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
                    style={{ left: STATUS_LEFT, width: STATUS_W, minWidth: STATUS_W }}
                    rowSpan={2}
                  >
                    Status
                  </th>

                  {comps.map((comp) => (
                    <th
                      key={comp}
                      className="border-b border-l-2 border-l-[#007A33] border-b-[#007A33] bg-[#009640] px-2 py-1.5 text-center text-[11px] font-semibold text-white"
                      colSpan={CAMPOS.length + 1}
                    >
                      {comp} · {totalHabilidades(notaArea, comp)} hab · cert ≥{" "}
                      {minParaCertificar(totalHabilidades(notaArea, comp))}
                    </th>
                  ))}

                  <th
                    className="border-b border-l-2 border-l-[#007A33] border-b-[#007A33] bg-[#009640] px-2 py-2 text-center text-[11px] font-semibold text-white"
                    rowSpan={2}
                  >
                    Situação
                  </th>
                </tr>
                {/* Linha 2: rótulos dos campos */}
                <tr>
                  {comps.map((comp) =>
                    [...CAMPOS, { key: "media" as const, label: "Média" }].map((c, i) => (
                      <th
                        key={`${comp}-${c.label}`}
                        className={`border-b border-[#E5E7EB] bg-[#007A33] px-1.5 py-1.5 text-center text-[10px] font-semibold text-white ${
                          i === 0 ? "border-l-2 border-l-[#E5E7EB]" : ""
                        }`}
                      >
                        {c.label}
                      </th>
                    )),
                  )}
                </tr>
              </thead>

              <tbody>
                {alunosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + comps.length * (CAMPOS.length + 1) + 1}
                      className="px-5 py-8 text-center text-sm text-[#4B5563]"
                    >
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                ) : (
                  alunosFiltrados.map((aluno) => {
                    const notasAluno = grade[aluno.id][notaArea];
                    const sit = situacaoArea(
                      comps.map((comp) => ({
                        campos: notasAluno[comp],
                        total: totalHabilidades(notaArea, comp),
                      })),
                    );
                    const status = statusMap[aluno.id];

                    return (
                      <tr key={aluno.id}>
                        {/* Congeladas */}
                        <td
                          className="sticky z-10 border-b border-r border-[#E5E7EB] bg-white px-2 py-1.5 font-mono text-[11px] text-[#4B5563]"
                          style={{ left: 0, width: RA_W, minWidth: RA_W }}
                        >
                          {aluno.ra}
                        </td>
                        <td
                          className="sticky z-10 border-b border-r border-[#E5E7EB] bg-white px-2 py-1.5 font-medium text-gray-800"
                          style={{ left: NOME_LEFT, width: NOME_W, minWidth: NOME_W }}
                        >
                          {aluno.nome}
                        </td>
                        <td
                          className="sticky z-10 border-b border-r-2 border-r-[#E5E7EB] border-b-[#E5E7EB] bg-white px-1.5 py-1.5 text-center shadow-[2px_0_4px_rgba(0,0,0,0.04)]"
                          style={{ left: STATUS_LEFT, width: STATUS_W, minWidth: STATUS_W }}
                        >
                          <select
                            value={status}
                            disabled={!areaEditavel}
                            onChange={(e) =>
                              setStatusMap((m) => ({
                                ...m,
                                [aluno.id]: e.target.value as SituacaoAluno,
                              }))
                            }
                            className={`w-full rounded border-0 px-1.5 py-1 text-[10px] font-semibold outline-none ${
                              areaEditavel ? "cursor-pointer" : "cursor-not-allowed"
                            } ${SITUACAO_CFG[status].classes}`}
                          >
                            {STATUS_OPCOES.map((s) => (
                              <option key={s} value={s} className="bg-white text-gray-800">
                                {SITUACAO_CFG[s].label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Campos por competência */}
                        {comps.map((comp) => {
                          const campos = notasAluno[comp];
                          const total = totalHabilidades(notaArea, comp);
                          const certificado =
                            campos.certificacao !== null && campos.certificacao > 0;
                          const media = mediaInfo(campos, total);

                          return (
                            <CompCells
                              key={`${aluno.id}-${comp}`}
                              campos={campos}
                              total={total}
                              certificado={certificado}
                              areaEditavel={areaEditavel}
                              media={media}
                              onChange={(key, raw, max) =>
                                setCampo(aluno.id, comp, key, raw, max)
                              }
                            />
                          );
                        })}

                        {/* Situação da área */}
                        <td className="border-b border-l-2 border-l-[#E5E7EB] border-b-[#E5E7EB] px-2 py-1.5 text-center">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              sit === "Aprovado"
                                ? "bg-[#EAF6EE] text-[#007A33]"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {sit}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé: salvar — oculto em modo somente leitura */}
          {!readOnly && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {salvoMsg ? (
                <p className="text-xs font-medium text-[#007A33]">✓ {salvoMsg}</p>
              ) : (
                <span />
              )}
              <button
                onClick={handleSalvar}
                disabled={!areaEditavel}
                className="flex items-center gap-2 rounded bg-[#009640] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={15} />
                Salvar notas
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Células de uma competência (5 inputs + média) ────────────
function CompCells({
  campos,
  total,
  certificado,
  areaEditavel,
  media,
  onChange,
}: {
  campos: CamposCompetencia;
  total: number;
  certificado: boolean;
  areaEditavel: boolean;
  media: { texto: string; cls: string };
  onChange: (key: keyof CamposCompetencia, raw: string, max: number) => void;
}) {
  return (
    <>
      {CAMPOS.map((c, i) => {
        // Se a certificação está preenchida, os 4 campos de nota travam.
        const travadoPorCert = certificado && c.key !== "certificacao";
        const disabled = !areaEditavel || travadoPorCert;
        const max = maxDoCampo(c.key, total);
        return (
          <td
            key={c.key}
            className={`border-b border-[#E5E7EB] px-1 py-1 text-center ${
              i === 0 ? "border-l-2 border-l-[#E5E7EB]" : ""
            }`}
          >
            <input
              type="number"
              min={0}
              max={max}
              value={campos[c.key] ?? ""}
              disabled={disabled}
              onChange={(e) => onChange(c.key, e.target.value, max)}
              className={`w-11 rounded border px-1 py-1 text-center text-xs outline-none ${
                disabled
                  ? "border-gray-200 bg-gray-100 text-gray-400"
                  : "border-[#D9D9D9] text-gray-800 focus:border-[#009640] focus:ring-1 focus:ring-[#009640]/30"
              }`}
            />
          </td>
        );
      })}
      <td className="border-b border-[#E5E7EB] px-1.5 py-1 text-center">
        <span className={`inline-block min-w-[52px] rounded px-1.5 py-1 text-[11px] font-bold ${media.cls}`}>
          {media.texto}
        </span>
      </td>
    </>
  );
}

// ── Painel "Visão Geral": situação por competência (somente leitura) ──────────
function VisaoGeral({
  alunos,
  grade,
}: {
  alunos: Aluno[];
  grade: Record<string, NotasGrade>;
}) {
  const totalComps = VG_AREAS.reduce(
    (s, g) => s + competenciasDaArea(g.area).length,
    0,
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="border-separate border-spacing-0 text-xs">
          <thead>
            {/* Linha 1: congeladas + cabeçalho por área */}
            <tr>
              <th
                className="sticky z-20 border-b border-r border-[#007A33] bg-[#009640] px-2 py-2 text-left text-[11px] font-semibold text-white"
                style={{ left: 0, width: RA_W, minWidth: RA_W }}
                rowSpan={2}
              >
                RA
              </th>
              <th
                className="sticky z-20 border-b border-r-2 border-r-[#E5E7EB] border-b-[#007A33] bg-[#009640] px-2 py-2 text-left text-[11px] font-semibold text-white shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
                style={{ left: NOME_LEFT, width: NOME_W, minWidth: NOME_W }}
                rowSpan={2}
              >
                Nome
              </th>
              {VG_AREAS.map((g) => (
                <th
                  key={g.area}
                  className="border-b border-l-2 border-l-[#007A33] border-b-[#007A33] bg-[#009640] px-2 py-1.5 text-center text-[11px] font-semibold text-white"
                  colSpan={competenciasDaArea(g.area).length}
                >
                  {COMPETENCIAS_CONFIG[g.area].nome}
                </th>
              ))}
            </tr>
            {/* Linha 2: rótulos das competências (MT1, LCT1, …) */}
            <tr>
              {VG_AREAS.map((g) =>
                competenciasDaArea(g.area).map((comp, i) => (
                  <th
                    key={`${g.area}-${comp}`}
                    className={`border-b border-[#E5E7EB] bg-[#007A33] px-2 py-1.5 text-center text-[10px] font-semibold text-white ${
                      i === 0 ? "border-l-2 border-l-[#E5E7EB]" : ""
                    }`}
                  >
                    {g.prefixo}
                    {i + 1}
                  </th>
                )),
              )}
            </tr>
          </thead>

          <tbody>
            {alunos.length === 0 ? (
              <tr>
                <td
                  colSpan={2 + totalComps}
                  className="px-5 py-8 text-center text-sm text-[#4B5563]"
                >
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td
                    className="sticky z-10 border-b border-r border-[#E5E7EB] bg-white px-2 py-1.5 font-mono text-[11px] text-[#4B5563]"
                    style={{ left: 0, width: RA_W, minWidth: RA_W }}
                  >
                    {aluno.ra}
                  </td>
                  <td
                    className="sticky z-10 border-b border-r-2 border-r-[#E5E7EB] border-b-[#E5E7EB] bg-white px-2 py-1.5 font-medium text-gray-800 shadow-[2px_0_4px_rgba(0,0,0,0.04)]"
                    style={{ left: NOME_LEFT, width: NOME_W, minWidth: NOME_W }}
                  >
                    {aluno.nome}
                  </td>
                  {VG_AREAS.map((g) => {
                    const compsArea = competenciasDaArea(g.area);
                    return compsArea.map((comp, i) => {
                      const sit = situacaoCompetencia(
                        grade[aluno.id][g.area][comp],
                        totalHabilidades(g.area, comp),
                      );
                      return (
                        <SituacaoCell
                          key={`${aluno.id}-${g.area}-${comp}`}
                          sit={sit}
                          primeiro={i === 0}
                        />
                      );
                    });
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-xs text-[#4B5563]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#EAF6EE] ring-1 ring-[#007A33]/30" />
          <strong className="text-[#007A33]">Aprovado</strong> — certificado ou média ≥ 60
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-100 ring-1 ring-amber-300" />
          <strong className="text-amber-700">Cursando</strong> — nota lançada, ainda não atingiu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-gray-100 ring-1 ring-gray-300" />
          <strong className="text-gray-500">—</strong> sem nota lançada
        </span>
      </div>
    </div>
  );
}

function SituacaoCell({
  sit,
  primeiro,
}: {
  sit: SituacaoCompetencia;
  primeiro: boolean;
}) {
  const cfg =
    sit === "aprovado"
      ? { txt: "Aprovado", cls: "bg-[#EAF6EE] text-[#007A33]" }
      : sit === "cursando"
        ? { txt: "Cursando", cls: "bg-amber-50 text-amber-700" }
        : { txt: "—", cls: "bg-gray-50 text-gray-400" };
  return (
    <td
      className={`border-b border-[#E5E7EB] px-1.5 py-1.5 text-center ${
        primeiro ? "border-l-2 border-l-[#E5E7EB]" : ""
      }`}
    >
      <span
        className={`inline-block min-w-[64px] rounded px-1.5 py-0.5 text-[10px] font-semibold ${cfg.cls}`}
      >
        {cfg.txt}
      </span>
    </td>
  );
}
