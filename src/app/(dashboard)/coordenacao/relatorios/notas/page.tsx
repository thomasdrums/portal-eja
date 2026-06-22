"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { relatorioAlunos, POLOS, SITUACAO_CFG } from "@/lib/mock-data/relatorios";

const TURMAS = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();
const AREAS_CONFIG = [
  { key: "matematica"       as const, label: "Matemática",  comps: ["C1","C2","C3","C4","C5"] },
  { key: "linguagens"       as const, label: "Linguagens",  comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasNatureza" as const, label: "C. Natureza", comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasHumanas"  as const, label: "C. Humanas",  comps: ["C1","C2","C3","C4"]      },
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

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20">
        <option value="">Todos</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
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

  const aprovados   = filtered.filter((a) => a.situacao === "APROVADO").length;
  const emAndamento = filtered.filter((a) => a.situacao === "CURSANDO" || a.situacao === "EM_PROCESSO").length;
  const reprovados  = filtered.filter((a) => a.situacao === "EVADIDO" || a.situacao === "DESISTENTE").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Relatório de Notas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">{filtered.length} aluno{filtered.length !== 1 ? "s" : ""} · Verde ≥ 60 · Vermelho &lt; 60</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aprovados",     value: aprovados,   extra: "bg-[#EAF6EE]",                          text: "text-[#007A33]" },
          { label: "Em Processo",   value: emAndamento, extra: "border border-[#E5E7EB] bg-white",       text: "text-gray-900"  },
          { label: "Evad./Desist.", value: reprovados,  extra: "border border-red-100 bg-red-50",        text: "text-red-600"   },
        ].map((c) => (
          <div key={c.label} className={`rounded-lg p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${c.extra}`}>
            <p className={`text-2xl font-extrabold ${c.text}`}>{c.value}</p>
            <p className="text-xs font-semibold text-[#4B5563]">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-3">
        <Select label="Polo"  value={polo}  onChange={setPolo}  options={[...POLOS]}                         />
        <Select label="Turma" value={turma} onChange={setTurma} options={TURMAS}                             />
        <Select label="Área"  value={area}  onChange={setArea}  options={AREAS_CONFIG.map((a) => a.key)}     />
      </div>

      <div className="flex justify-end">
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#4B5563]">Nenhum aluno encontrado.</p>
          </div>
        ) : filtered.map((a) => (
          <div key={a.id} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between bg-[#009640] px-5 py-3">
              <div>
                <span className="font-bold text-white">{a.nome}</span>
                <span className="ml-3 text-xs text-white/70">{a.polo} · {a.turmaNome}</span>
              </div>
              <span className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                {SITUACAO_CFG[a.situacao].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#E5E7EB] sm:grid-cols-4">
              {visibleAreas.map((ar) => {
                const aprovada = areaAprovada(a.notas[ar.key]);
                return (
                  <div key={ar.key} className="bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-600">{ar.label}</p>
                      {aprovada !== null && (
                        <span className={`text-xs font-bold ${aprovada ? "text-green-600" : "text-red-500"}`}>
                          {aprovada ? "OK" : "—"}
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
