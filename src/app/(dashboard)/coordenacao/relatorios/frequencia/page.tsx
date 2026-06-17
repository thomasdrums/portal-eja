"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { relatorioAlunos, POLOS, freqMedia, freqColor, freqTextColor, freqEmoji } from "@/lib/mock-data/relatorios";

const TURMAS = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();
const AREAS  = [
  { key: "matematica"      as const, label: "Matemática"          },
  { key: "linguagens"      as const, label: "Linguagens"          },
  { key: "cienciasNatureza"as const, label: "C. Natureza"         },
  { key: "cienciasHumanas" as const, label: "C. Humanas"          },
  { key: "interarea"       as const, label: "Interárea"           },
];

export default function RelatorioFrequenciaPage() {
  const [polo,  setPolo]  = useState("");
  const [turma, setTurma] = useState("");
  const [area,  setArea]  = useState("");

  const filtered = useMemo(() =>
    relatorioAlunos.filter((a) =>
      (!polo  || a.polo      === polo)  &&
      (!turma || a.turmaNome === turma)
    ), [polo, turma]);

  const areaLabels: Record<string, string> = Object.fromEntries(AREAS.map((a) => [a.key, a.label]));

  function freqVal(a: typeof relatorioAlunos[0], k: string) {
    return a.freq[k as keyof typeof a.freq];
  }

  const visibleAreas = area ? AREAS.filter((a) => a.key === area) : AREAS;

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
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/coordenacao/relatorios" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Relatórios
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f2d52]">📅 Relatório de Frequência</h1>
          <p className="text-sm text-gray-500">{filtered.length} aluno{filtered.length !== 1 ? "s" : ""} · 🟢 ≥ 75% · 🟡 50–74% · 🔴 &lt; 50%</p>
        </div>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:grid-cols-3">
        <Select label="Polo"  value={polo}  onChange={setPolo}  options={[...POLOS]}  />
        <Select label="Turma" value={turma} onChange={setTurma} options={TURMAS}      />
        <Select label="Área"  value={area}  onChange={setArea}  options={AREAS.map((a) => a.key)} />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#0f2d52] to-[#1565c0] text-left text-xs font-bold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-3 py-3">Polo</th>
              <th className="px-3 py-3">Turma</th>
              {visibleAreas.map((a) => (
                <th key={a.key} className="px-3 py-3 text-center">{areaLabels[a.key]}</th>
              ))}
              <th className="px-3 py-3 text-center">Geral</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={99} className="py-10 text-center text-sm text-gray-400">Nenhum aluno encontrado.</td></tr>
            ) : filtered.map((a) => {
              const geral = freqMedia(a);
              return (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-semibold text-gray-800">{a.nome}</td>
                  <td className="px-3 py-3 text-gray-500">{a.polo}</td>
                  <td className="px-3 py-3 text-gray-500">{a.turmaNome}</td>
                  {visibleAreas.map((ar) => {
                    const v = freqVal(a, ar.key);
                    return (
                      <td key={ar.key} className="px-3 py-3 text-center">
                        <span className={`font-bold ${freqTextColor(v)}`}>{freqEmoji(v)} {v}%</span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <span className={`font-extrabold ${freqTextColor(geral)}`}>{geral}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
