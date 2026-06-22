"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { turmasCoord } from "@/lib/mock-data/coordenacao";
import { relatorioAlunos } from "@/lib/mock-data/relatorios";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";

const POLOS  = ["Todos", ...new Set(turmasCoord.map((t) => t.polo))] as const;
const ANOS   = ["Todos", ...new Set(turmasCoord.map((t) => t.ano)).values()].sort() as string[];
const ETAPAS = ["Todas", "Fundamental II", "Ensino Médio"] as const;
const SITS   = ["APROVADO", "CURSANDO", "EM_PROCESSO", "RDS", "EVADIDO", "DESISTENTE"] as const;

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AcompanhamentoPage() {
  const [polo,  setPolo]  = useState("Todos");
  const [ano,   setAno]   = useState("Todos");
  const [etapa, setEtapa] = useState("Todas");

  const turmasFiltradas = useMemo(
    () =>
      turmasCoord.filter(
        (t) =>
          (polo  === "Todos" || t.polo  === polo)  &&
          (ano   === "Todos" || t.ano   === ano)   &&
          (etapa === "Todas" || t.etapa === etapa)
      ),
    [polo, ano, etapa]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/coordenacao"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline"
      >
        <ChevronLeft size={15} />
        Visão Geral
      </Link>

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Acompanhamento das Turmas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          {turmasFiltradas.length} turma
          {turmasFiltradas.length !== 1 ? "s" : ""} exibida
          {turmasFiltradas.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-3">
        <FilterSelect label="Polo"  value={polo}  onChange={setPolo}  options={POLOS}  />
        <FilterSelect label="Ano"   value={ano}   onChange={setAno}   options={ANOS}   />
        <FilterSelect label="Etapa" value={etapa} onChange={setEtapa} options={ETAPAS} />
      </div>

      {/* Cards de turma */}
      <div className="space-y-3">
        {turmasFiltradas.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#4B5563]">
              Nenhuma turma encontrada com esses filtros.
            </p>
          </div>
        )}

        {turmasFiltradas.map((turma) => {
          const alunos = relatorioAlunos.filter((a) => a.turmaNome === turma.nome);
          return (
            <div
              key={turma.id}
              className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              {/* Cabeçalho da turma */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#009640] px-5 py-3.5">
                <div>
                  <p className="font-semibold text-white">{turma.nome}</p>
                  <p className="text-xs text-white/70">
                    {turma.polo} · {turma.etapa} · {turma.ano}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {alunos.length} alunos
                  </span>
                  <span
                    className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                      turma.status === "ativa"
                        ? "bg-white/90 text-[#007A33]"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {turma.status === "ativa" ? "Ativa" : "Encerrada"}
                  </span>
                </div>
              </div>

              {/* Contadores por situação */}
              <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] sm:grid-cols-6">
                {SITS.map((s) => {
                  const count = alunos.filter((a) => a.situacao === s).length;
                  const cfg   = SITUACAO_CFG[s];
                  return (
                    <div key={s} className="p-3 text-center">
                      <p
                        className={`text-xl font-bold ${
                          count > 0 ? cfg.classes.split(" ")[1] : "text-gray-300"
                        }`}
                      >
                        {count}
                      </p>
                      <p className="mt-0.5 text-xs text-[#4B5563]">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Link para detalhe */}
              <div className="border-t border-[#E5E7EB] px-5 py-2.5">
                <Link
                  href={`/coordenacao/acompanhamento/${turma.id}`}
                  className="text-xs font-semibold text-[#009640] hover:underline"
                >
                  Ver detalhes desta turma →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
