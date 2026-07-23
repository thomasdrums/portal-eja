"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { RelatorioFrequencia } from "@/lib/queries/frequencia";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { valor: string; texto: string }[];
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
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </div>
  );
}

// Faixas de cor mantidas como estavam (Verde ≥75% · Amarelo 50–74% · Vermelho <50%).
function FreqBadge({
  valor,
  semExigencia,
}: {
  valor: number | null;
  semExigencia?: boolean;
}) {
  if (valor === null) {
    return (
      <span className="inline-block rounded bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-400">
        —
      </span>
    );
  }
  if (semExigencia) {
    return (
      <span
        className="inline-block rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-bold text-[#007A33]"
        title="Todas as competências certificadas — sem aulas exigidas"
      >
        Disp.
      </span>
    );
  }
  const cls =
    valor >= 75
      ? "bg-[#EAF6EE] text-[#007A33]"
      : valor >= 50
        ? "bg-yellow-50 text-yellow-700"
        : "bg-red-50 text-red-600";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${cls}`}>{valor}%</span>
  );
}

export default function RelatorioFrequenciaClient({
  dados,
}: {
  dados: RelatorioFrequencia;
}) {
  const [polo, setPolo] = useState("");
  const [turma, setTurma] = useState("");
  const [area, setArea] = useState("");

  const filtrados = useMemo(
    () =>
      dados.linhas.filter(
        (l) => (!polo || l.poloNome === polo) && (!turma || l.turmaNome === turma),
      ),
    [dados.linhas, polo, turma],
  );

  const areasVisiveis = area ? dados.areas.filter((a) => a.slug === area) : dados.areas;

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
          {filtrados.length} aluno{filtrados.length !== 1 ? "s" : ""} ·{" "}
          <span className="text-[#007A33]">Verde</span> ≥ 75% ·{" "}
          <span className="text-yellow-700">Amarelo</span> 50–74% ·{" "}
          <span className="text-red-600">Vermelho</span> &lt; 50%
        </p>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Calculado a partir das respostas validadas pelos professores (aulas da área + interárea)
          ÷ aulas exigidas. Competências certificadas dispensam suas aulas — “Disp.” significa que
          não há mais aulas exigidas na área. Mínimo para aprovação: 100%.
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-3">
        <FilterSelect
          label="Polo"
          value={polo}
          onChange={setPolo}
          options={dados.polos.map((p) => ({ valor: p, texto: p }))}
        />
        <FilterSelect
          label="Turma"
          value={turma}
          onChange={setTurma}
          options={dados.turmas.map((t) => ({ valor: t, texto: t }))}
        />
        <FilterSelect
          label="Área"
          value={area}
          onChange={setArea}
          options={dados.areas.map((a) => ({ valor: a.slug, texto: a.nome }))}
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
              {areasVisiveis.map((a) => (
                <th key={a.slug} className="px-3 py-3 text-center">
                  {a.nome}
                </th>
              ))}
              <th className="px-3 py-3 text-center" title="Respostas interárea validadas">
                Interárea
              </th>
              <th className="px-3 py-3 text-center">Geral</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={99} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              filtrados.map((l) => (
                <tr key={l.alunoId} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-800">{l.nome}</span>
                    <span className="block text-xs text-[#9CA3AF]">RA {l.ra}</span>
                  </td>
                  <td className="px-3 py-3 text-[#4B5563]">{l.poloNome}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{l.turmaNome}</td>
                  {areasVisiveis.map((a) => {
                    const resumo = l.areas[a.slug];
                    return (
                      <td key={a.slug} className="px-3 py-3 text-center">
                        <FreqBadge
                          valor={l.temTurma && resumo ? resumo.percentual : null}
                          semExigencia={resumo?.semExigencia}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center text-[#4B5563]">{l.interareaValidadas}</td>
                  <td className="px-3 py-3 text-center">
                    <FreqBadge
                      valor={l.temTurma ? l.geral.percentual : null}
                      semExigencia={l.geral.semExigencia}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
