"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { relatorioAlunos, POLOS } from "@/lib/mock-data/relatorios";

const concluintes = relatorioAlunos.filter((a) => a.situacao === "APROVADO" && a.dataConclusao);
const MESES  = [...new Set(concluintes.map((a) => a.dataConclusao!))].sort();
const ANOS   = [...new Set(MESES.map((m) => m.split("/")[1]))].sort();
const TURMAS = [...new Set(concluintes.map((a) => a.turmaNome))].sort();

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

export default function RelatorioConcluentesPage() {
  const [polo, setPolo] = useState("");
  const [mes,  setMes]  = useState("");
  const [ano,  setAno]  = useState("");

  const filtered = useMemo(() =>
    concluintes.filter((a) =>
      (!polo || a.polo === polo) &&
      (!mes  || a.dataConclusao === mes) &&
      (!ano  || a.dataConclusao?.endsWith(ano))
    ), [polo, mes, ano]);

  const totalConcluintes = concluintes.length;
  const totalAlunos      = relatorioAlunos.length;
  const pctConclusao     = Math.round((totalConcluintes / totalAlunos) * 100);

  const porPolo = [...POLOS].map((p) => ({
    polo: p,
    total:       relatorioAlunos.filter((a) => a.polo === p).length,
    concluintes: concluintes.filter((a) => a.polo === p).length,
  }));

  const porTurma = TURMAS.map((t) => ({
    turma: t,
    total:       relatorioAlunos.filter((a) => a.turmaNome === t).length,
    concluintes: concluintes.filter((a) => a.turmaNome === t).length,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Relatório de Concluintes</h1>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-semibold text-[#4B5563]">Total de Concluintes</p>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">{totalConcluintes}</p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-semibold text-[#4B5563]">Taxa de Conclusão</p>
          <p className="mt-1 text-3xl font-extrabold text-[#009640]">{pctConclusao}%</p>
        </div>
        <div className="col-span-2 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:col-span-1">
          <p className="mb-2 text-xs font-bold text-[#4B5563]">% por Turma</p>
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
                    <div className="h-full rounded-full bg-[#009640]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {porPolo.map((p) => (
          <div key={p.polo} className="rounded-lg border border-[#E5E7EB] bg-white p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-semibold text-[#4B5563]">{p.polo}</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">{p.concluintes}</p>
            <p className="text-xs text-gray-400">de {p.total}</p>
            <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#009640]" style={{ width: `${p.total > 0 ? Math.round((p.concluintes / p.total) * 100) : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Select label="Polo" value={polo} onChange={setPolo} options={[...POLOS]} />
        <Select label="Mês"  value={mes}  onChange={setMes}  options={MESES}      />
        <Select label="Ano"  value={ano}  onChange={setAno}  options={ANOS}       />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Nome</th>
              <th className="px-3 py-3">Polo</th>
              <th className="px-3 py-3">Turma</th>
              <th className="px-3 py-3">Conclusão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhum concluinte com esses filtros.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-semibold text-gray-800">{a.nome}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{a.polo}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{a.turmaNome}</td>
                  <td className="px-3 py-3">
                    <span className="inline-block rounded bg-[#EAF6EE] px-2.5 py-0.5 text-xs font-semibold text-[#007A33]">
                      {a.dataConclusao}
                    </span>
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
