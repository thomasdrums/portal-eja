"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { relatorioAlunos, POLOS, freqMedia } from "@/lib/mock-data/relatorios";

const TURMAS = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();
const AREAS  = [
  { key: "matematica"       as const, label: "Matemática"  },
  { key: "linguagens"       as const, label: "Linguagens"  },
  { key: "cienciasNatureza" as const, label: "C. Natureza" },
  { key: "cienciasHumanas"  as const, label: "C. Humanas"  },
  { key: "interarea"        as const, label: "Interárea"   },
];

function FilterSelect({
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
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
        {label}
      </label>
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

function FreqBadge({ value }: { value: number }) {
  const cls =
    value >= 75
      ? "bg-[#EAF6EE] text-[#007A33]"
      : value >= 50
      ? "bg-yellow-50 text-yellow-700"
      : "bg-red-50 text-red-600";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${cls}`}>
      {value}%
    </span>
  );
}

export default function RelatorioFrequenciaPage() {
  const [polo,  setPolo]  = useState("");
  const [turma, setTurma] = useState("");
  const [area,  setArea]  = useState("");

  const filtered = useMemo(
    () =>
      relatorioAlunos.filter(
        (a) =>
          (!polo  || a.polo      === polo)  &&
          (!turma || a.turmaNome === turma)
      ),
    [polo, turma]
  );

  const areaLabels: Record<string, string> = Object.fromEntries(
    AREAS.map((a) => [a.key, a.label])
  );

  function freqVal(a: (typeof relatorioAlunos)[0], k: string) {
    return a.freq[k as keyof typeof a.freq];
  }

  const visibleAreas = area ? AREAS.filter((a) => a.key === area) : AREAS;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/coordenacao/relatorios"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline"
      >
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Relatório de Frequência</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          {filtered.length} aluno{filtered.length !== 1 ? "s" : ""} ·{" "}
          <span className="text-[#007A33]">Verde</span> ≥ 75% ·{" "}
          <span className="text-yellow-700">Amarelo</span> 50–74% ·{" "}
          <span className="text-red-600">Vermelho</span> &lt; 50%
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-3">
        <FilterSelect
          label="Polo"
          value={polo}
          onChange={setPolo}
          options={[...POLOS]}
        />
        <FilterSelect
          label="Turma"
          value={turma}
          onChange={setTurma}
          options={TURMAS}
        />
        <FilterSelect
          label="Área"
          value={area}
          onChange={setArea}
          options={AREAS.map((a) => a.key)}
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-3 py-3">Polo</th>
              <th className="px-3 py-3">Turma</th>
              {visibleAreas.map((a) => (
                <th key={a.key} className="px-3 py-3 text-center">
                  {areaLabels[a.key]}
                </th>
              ))}
              <th className="px-3 py-3 text-center">Geral</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={99} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const geral = freqMedia(a);
                return (
                  <tr key={a.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-semibold text-gray-800">{a.nome}</td>
                    <td className="px-3 py-3 text-[#4B5563]">{a.polo}</td>
                    <td className="px-3 py-3 text-[#4B5563]">{a.turmaNome}</td>
                    {visibleAreas.map((ar) => {
                      const v = freqVal(a, ar.key);
                      return (
                        <td key={ar.key} className="px-3 py-3 text-center">
                          <FreqBadge value={v} />
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      <FreqBadge value={geral} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
