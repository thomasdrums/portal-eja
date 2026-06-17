"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { relatorioAlunos, POLOS, type SituacaoAluno } from "@/lib/mock-data/relatorios";

const TURMAS = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();
const AREAS_CONFIG = [
  { key: "matematica"       as const, label: "Matemática",          comps: ["C1","C2","C3","C4","C5"] },
  { key: "linguagens"       as const, label: "Linguagens",          comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasNatureza" as const, label: "C. Natureza",         comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasHumanas"  as const, label: "C. Humanas",          comps: ["C1","C2","C3","C4"]      },
];

function notaColor(n: number | null) {
  if (n === null) return "text-gray-300";
  return n >= 60 ? "text-green-600 font-bold" : "text-red-500 font-bold";
}

function areaAprovada(notas: Record<string, number | null>) {
  const vals = Object.values(notas).filter((v): v is number => v !== null);
  if (vals.length === 0) return null;
  return vals.every((v) => v >= 60);
}

export default function RelatorioNotasPage() {
  const [polo,  setPolo]  = useState("");
  const [turma, setTurma] = useState("");
  const [area,  setArea]  = useState("");

  const filtered = useMemo(() =>
    relatorioAlunos.filter((a) =>
      (!polo  || a.polo      === polo)  &&
      (!turma || a.turmaNome === turma)
    ), [polo, turma]);

  const visibleAreas = area
    ? AREAS_CONFIG.filter((a) => a.key === area)
    : AREAS_CONFIG;

  const aprovados   = filtered.filter((a) => a.situacao === "Aprovado").length;
  const emAndamento = filtered.filter((a) => a.situacao === "Em andamento").length;
  const reprovados  = filtered.filter((a) => a.situacao === "Reprovado").length;

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

      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#0f2d52]">📝 Relatório de Notas</h1>
        <p className="text-sm text-gray-500">{filtered.length} aluno{filtered.length !== 1 ? "s" : ""} · Verde ≥ 60 · Vermelho &lt; 60</p>
      </div>

      {/* Contadores */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Aprovados",    value: aprovados,   color: "bg-green-50 text-green-700"  },
          { label: "Em andamento", value: emAndamento, color: "bg-blue-50 text-blue-700"    },
          { label: "Reprovados",   value: reprovados,  color: "bg-red-50 text-red-600"      },
        ].map((c) => (
          <div key={c.label} className={`rounded-3xl ${c.color} p-4 text-center`}>
            <p className="text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs font-semibold">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:grid-cols-3">
        <Select label="Polo"  value={polo}  onChange={setPolo}  options={[...POLOS]}                         />
        <Select label="Turma" value={turma} onChange={setTurma} options={TURMAS}                             />
        <Select label="Área"  value={area}  onChange={setArea}  options={AREAS_CONFIG.map((a) => a.key)}     />
      </div>

      {/* Botão exportar */}
      <div className="mb-4 flex justify-end">
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      {/* Cards por aluno */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-400">Nenhum aluno encontrado.</p>
          </div>
        ) : filtered.map((a) => (
          <div key={a.id} className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3">
              <div>
                <span className="font-bold text-white">{a.nome}</span>
                <span className="ml-3 text-xs text-white/60">{a.polo} · {a.turmaNome}</span>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                a.situacao === "Aprovado" ? "bg-green-400/30 text-green-100" :
                a.situacao === "Reprovado" ? "bg-red-400/30 text-red-100" :
                "bg-white/20 text-white/80"
              }`}>{a.situacao}</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
              {visibleAreas.map((ar) => {
                const aprovada = areaAprovada(a.notas[ar.key]);
                return (
                  <div key={ar.key} className="bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-600">{ar.label}</p>
                      {aprovada !== null && (
                        <span className={`text-xs font-bold ${aprovada ? "text-green-600" : "text-red-500"}`}>
                          {aprovada ? "✓ OK" : "✗"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {ar.comps.map((c) => {
                        const nota = a.notas[ar.key][c];
                        return (
                          <div key={c} className="flex justify-between text-xs">
                            <span className="text-gray-400">{c}</span>
                            <span className={notaColor(nota)}>{nota ?? "—"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
