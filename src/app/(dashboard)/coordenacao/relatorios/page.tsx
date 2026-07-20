"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  professorTurmas,
  SITUACAO_CFG,
  type SituacaoAluno,
} from "@/lib/mock-data/professor";

const SITS: SituacaoAluno[] = ["APROVADO", "CURSANDO", "EM_PROCESSO", "RDS", "EVADIDO", "DESISTENTE"];

// Cores semânticas suaves por situação (SESI, sem azul — Cursando em teal).
const SIT_SELO: Record<SituacaoAluno, string> = {
  APROVADO:    "bg-green-50 text-green-700",
  CURSANDO:    "bg-teal-50 text-teal-700",
  EM_PROCESSO: "bg-amber-50 text-amber-700",
  RDS:         "bg-purple-50 text-purple-700",
  EVADIDO:     "bg-orange-50 text-orange-700",
  DESISTENTE:  "bg-red-50 text-red-600",
};

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// Cartão branco institucional de indicador.
function IndicadorCard({
  label,
  value,
  sub,
  destaque = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${destaque ? "text-[#009640]" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-[#4B5563]">{sub}</p>}
    </div>
  );
}

export default function RelatoriosPage() {
  const [polo, setPolo] = useState("");
  const [prof, setProf] = useState("");
  const [turmaNome, setTurmaNome] = useState("");

  const polos = useMemo(() => [...new Set(professorTurmas.map((t) => t.polo))], []);

  const professores = useMemo(
    () => [
      ...new Set(
        professorTurmas
          .filter((t) => !polo || t.polo === polo)
          .map((t) => t.professorResponsavel),
      ),
    ],
    [polo],
  );

  const turmas = useMemo(
    () =>
      professorTurmas
        .filter((t) => (!polo || t.polo === polo) && (!prof || t.professorResponsavel === prof))
        .map((t) => t.nome),
    [polo, prof],
  );

  const turma = professorTurmas.find((t) => t.nome === turmaNome);

  // ── Resumo analítico (cruzamento situação × etapa) ───────
  const resumo = useMemo(() => {
    if (!turma) return null;
    const alunos = turma.alunos;
    const total = alunos.length;
    const por = (s: SituacaoAluno) => alunos.filter((a) => a.situacao === s);
    const aprovados = por("APROVADO").length;
    const evadidos = por("EVADIDO");
    const desistentes = por("DESISTENTE");
    return {
      total,
      counts: Object.fromEntries(SITS.map((s) => [s, por(s).length])) as Record<SituacaoAluno, number>,
      aprovados,
      conclusaoPct: total > 0 ? Math.round((aprovados / total) * 100) : 0,
      evadidosAVA: evadidos.filter((a) => a.etapa === "AVA").length,
      evadidosRDS: evadidos.filter((a) => a.etapa === "RDS").length,
      desistentesAVA: desistentes.filter((a) => a.etapa === "AVA").length,
      desistentesRDS: desistentes.filter((a) => a.etapa === "RDS").length,
      emProcesso: por("EM_PROCESSO").length,
    };
  }, [turma]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/coordenacao"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline"
      >
        <ChevronLeft size={15} />
        Visão Geral
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Relatório por Turma</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">Selecione polo, professor e turma para gerar o relatório</p>
        </div>
        <button
          disabled
          title="Disponível em breve"
          className="cursor-not-allowed rounded border border-[#D9D9D9] bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-400"
        >
          Exportar relatório
        </button>
      </div>

      {/* Filtros combinados */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-3">
        <Select
          label="Polo"
          value={polo}
          onChange={(v) => { setPolo(v); setProf(""); setTurmaNome(""); }}
          options={polos}
        />
        <Select
          label="Professor"
          value={prof}
          onChange={(v) => { setProf(v); setTurmaNome(""); }}
          options={professores}
        />
        <Select label="Turma" value={turmaNome} onChange={setTurmaNome} options={turmas} />
      </div>

      {!turma ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
          <p className="text-sm text-[#4B5563]">Selecione uma turma para visualizar o relatório.</p>
        </div>
      ) : (
        resumo && (
          <div className="space-y-6">
            {/* Cabeçalho da turma */}
            <div className="rounded-lg bg-[#009640] p-6 text-white">
              <h2 className="text-lg font-extrabold">{turma.nome}</h2>
              <p className="text-sm text-white/80">
                {turma.polo} · {turma.professorResponsavel} · {turma.periodoLetivo}
              </p>
            </div>

            {/* Selos de contagem por situação */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4B5563]">
                Distribuição por situação
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {SITS.map((s) => (
                  <div
                    key={s}
                    className={`rounded-lg p-3 text-center ring-1 ring-black/5 ${SIT_SELO[s]}`}
                  >
                    <p className="text-2xl font-extrabold">{resumo.counts[s]}</p>
                    <p className="mt-0.5 text-[11px] font-semibold leading-tight">
                      {SITUACAO_CFG[s].label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo analítico */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4B5563]">
                Resumo analítico da turma
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <IndicadorCard label="Total de alunos" value={resumo.total} />
                <IndicadorCard
                  label="Concluintes (Aprovados)"
                  value={resumo.aprovados}
                  sub={`${resumo.conclusaoPct}% do total da turma`}
                  destaque
                />
                <IndicadorCard label="Em Processo" value={resumo.emProcesso} />
                <IndicadorCard
                  label="Evadidos"
                  value={resumo.evadidosAVA + resumo.evadidosRDS}
                  sub={`AVA: ${resumo.evadidosAVA} · RDS: ${resumo.evadidosRDS}`}
                />
                <IndicadorCard
                  label="Desistentes"
                  value={resumo.desistentesAVA + resumo.desistentesRDS}
                  sub={`AVA: ${resumo.desistentesAVA} · RDS: ${resumo.desistentesRDS}`}
                />
              </div>
            </div>

            {/* Detalhe Evadidos/Desistentes por etapa em cartões dedicados */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <IndicadorCard label="Evadidos no AVA" value={resumo.evadidosAVA} />
              <IndicadorCard label="Evadidos no RDS" value={resumo.evadidosRDS} />
              <IndicadorCard label="Desistentes no AVA" value={resumo.desistentesAVA} />
              <IndicadorCard label="Desistentes no RDS" value={resumo.desistentesRDS} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
