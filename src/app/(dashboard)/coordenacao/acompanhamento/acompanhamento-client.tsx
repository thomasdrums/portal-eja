"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";
import type { RelatorioTurmaRow } from "@/lib/queries/relatorios";

const SITS = ["APROVADO", "CURSANDO", "EM_PROCESSO", "RDS", "EVADIDO", "DESISTENTE"] as const;

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

export default function AcompanhamentoClient({
  turmas,
  polos,
}: {
  turmas: RelatorioTurmaRow[];
  polos: string[];
}) {
  const [polo, setPolo] = useState("Todos");
  const opcoesPolo = ["Todos", ...polos];

  const turmasFiltradas = useMemo(
    () => turmas.filter((t) => polo === "Todos" || t.poloNome === polo),
    [turmas, polo],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/coordenacao"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline"
      >
        <ChevronLeft size={15} />
        Visão Geral
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Acompanhamento das Turmas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          {turmasFiltradas.length} turma{turmasFiltradas.length !== 1 ? "s" : ""} exibida
          {turmasFiltradas.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:max-w-xs">
        <FilterSelect label="Polo" value={polo} onChange={setPolo} options={opcoesPolo} />
      </div>

      <div className="space-y-3">
        {turmasFiltradas.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#4B5563]">Nenhuma turma encontrada com esses filtros.</p>
          </div>
        )}

        {turmasFiltradas.map((turma) => {
          const subtitulo = [
            turma.poloNome,
            turma.modalidadeLabel,
            turma.professores.join(", "),
            turma.entrada || (turma.ano ? String(turma.ano) : ""),
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <div
              key={turma.id}
              className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#009640] px-5 py-3.5">
                <div>
                  <p className="font-semibold text-white">
                    {turma.nome}
                    {turma.codigo && <span className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold">{turma.codigo}</span>}
                  </p>
                  <p className="text-xs text-white/70">{subtitulo}</p>
                </div>
                <span className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {turma.total} alunos
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] sm:grid-cols-6">
                {SITS.map((s) => {
                  const count = turma.counts[s] ?? 0;
                  const cfg = SITUACAO_CFG[s];
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
