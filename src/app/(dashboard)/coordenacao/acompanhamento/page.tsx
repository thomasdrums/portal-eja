"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { turmasCoord } from "@/lib/mock-data/coordenacao";
import { relatorioAlunos } from "@/lib/mock-data/relatorios";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";

const POLOS  = ["Todos", ...new Set(turmasCoord.map((t) => t.polo))] as const;
const ANOS   = ["Todos", ...new Set(turmasCoord.map((t) => t.ano)).values()].sort() as string[];
const ETAPAS = ["Todas", "Fundamental II", "Ensino Médio"] as const;

const SITS = ["APROVADO","CURSANDO","EM_PROCESSO","RDS","EVADIDO","DESISTENTE"] as const;

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function AcompanhamentoPage() {
  const [polo,  setPolo]  = useState("Todos");
  const [ano,   setAno]   = useState("Todos");
  const [etapa, setEtapa] = useState("Todas");

  const turmasFiltradas = useMemo(() =>
    turmasCoord.filter((t) =>
      (polo  === "Todos"  || t.polo  === polo)  &&
      (ano   === "Todos"  || t.ano   === ano)   &&
      (etapa === "Todas"  || t.etapa === etapa)
    ), [polo, ano, etapa]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/coordenacao" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Visão Geral
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#0f2d52]">📋 Acompanhamento das Turmas</h1>
        <p className="text-sm text-gray-500">{turmasFiltradas.length} turma{turmasFiltradas.length !== 1 ? "s" : ""} exibida{turmasFiltradas.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-3 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100">
        <Sel label="Polo"  value={polo}  onChange={setPolo}  options={POLOS}  />
        <Sel label="Ano"   value={ano}   onChange={setAno}   options={ANOS}   />
        <Sel label="Etapa" value={etapa} onChange={setEtapa} options={ETAPAS} />
      </div>

      {/* Cards de turma */}
      <div className="space-y-4">
        {turmasFiltradas.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-400">Nenhuma turma encontrada com esses filtros.</p>
          </div>
        )}
        {turmasFiltradas.map((turma) => {
          const alunos = relatorioAlunos.filter((a) => a.turmaNome === turma.nome);
          return (
            <div key={turma.id} className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
              {/* Cabeçalho */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-4">
                <div>
                  <p className="font-bold text-white">{turma.nome}</p>
                  <p className="text-xs text-white/60">{turma.polo} · {turma.etapa} · {turma.ano}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">{alunos.length} alunos</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${turma.status === "ativa" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {turma.status === "ativa" ? "Ativa" : "Encerrada"}
                  </span>
                </div>
              </div>

              {/* Indicadores por situação */}
              <div className="grid grid-cols-3 divide-x divide-gray-50 sm:grid-cols-6">
                {SITS.map((s) => {
                  const count = alunos.filter((a) => a.situacao === s).length;
                  const cfg   = SITUACAO_CFG[s];
                  return (
                    <div key={s} className="p-3 text-center">
                      <p className={`text-xl font-extrabold ${count > 0 ? cfg.classes.split(" ")[1] : "text-gray-300"}`}>{count}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Link detalhe */}
              <div className="border-t border-gray-50 px-5 py-2.5">
                <Link href={`/coordenacao/acompanhamento/${turma.id}`} className="text-xs font-semibold text-[#1565c0] hover:underline">
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
