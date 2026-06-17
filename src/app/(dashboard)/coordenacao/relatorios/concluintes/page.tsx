"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { relatorioAlunos, POLOS } from "@/lib/mock-data/relatorios";

const concluintes = relatorioAlunos.filter((a) => a.situacao === "Aprovado" && a.dataConclusao);
const MESES  = [...new Set(concluintes.map((a) => a.dataConclusao!))].sort();
const TURMAS = [...new Set(concluintes.map((a) => a.turmaNome))].sort();

export default function RelatorioConcluentesPage() {
  const [polo,  setPolo]  = useState("");
  const [mes,   setMes]   = useState("");

  const filtered = useMemo(() =>
    concluintes.filter((a) =>
      (!polo || a.polo === polo) &&
      (!mes  || a.dataConclusao === mes)
    ), [polo, mes]);

  const totalConcluintes = concluintes.length;
  const totalAlunos      = relatorioAlunos.length;
  const pctConclusao     = Math.round((totalConcluintes / totalAlunos) * 100);

  const porTurma = TURMAS.map((t) => ({
    turma: t,
    total: relatorioAlunos.filter((a) => a.turmaNome === t).length,
    concluintes: concluintes.filter((a) => a.turmaNome === t).length,
  }));

  function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20">
          <option value="">Todos</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/coordenacao/relatorios" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Relatórios
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#0f2d52]">🎓 Relatório de Concluintes</h1>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      {/* Indicadores */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-[#166534] to-[#16a34a] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Total de Concluintes</p>
          <p className="text-3xl font-extrabold">{totalConcluintes}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">% de Conclusão Geral</p>
          <p className="text-3xl font-extrabold">{pctConclusao}%</p>
        </div>
        <div className="col-span-2 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:col-span-1">
          <p className="mb-2 text-xs font-bold text-gray-500">% por Turma</p>
          <div className="space-y-2">
            {porTurma.filter((t) => t.concluintes > 0).map((t) => {
              const pct = Math.round((t.concluintes / t.total) * 100);
              return (
                <div key={t.turma}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="text-gray-600">{t.turma}</span>
                    <span className="font-bold text-gray-700">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100">
        <Select label="Polo" value={polo} onChange={setPolo} options={[...POLOS]} />
        <Select label="Mês"  value={mes}  onChange={setMes}  options={MESES}      />
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
        <div className="hidden grid-cols-4 gap-4 bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white sm:grid">
          <span>Nome</span><span>Polo</span><span>Turma</span><span>Conclusão</span>
        </div>
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">Nenhum concluinte com esses filtros.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((a) => (
              <li key={a.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm sm:grid-cols-4 sm:items-center sm:gap-4">
                <span className="font-semibold text-gray-800">{a.nome}</span>
                <span className="text-gray-600">{a.polo}</span>
                <span className="text-gray-600">{a.turmaNome}</span>
                <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  🎓 {a.dataConclusao}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
