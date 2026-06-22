"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { relatorioAlunos, POLOS } from "@/lib/mock-data/relatorios";

const TURMAS = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();

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

export default function RelatorioCertificadosPage() {
  const [polo,  setPolo]  = useState("");
  const [turma, setTurma] = useState("");

  const filtered = useMemo(() =>
    relatorioAlunos.filter((a) =>
      (!polo  || a.polo      === polo)  &&
      (!turma || a.turmaNome === turma)
    ), [polo, turma]);

  const emitidos  = filtered.filter((a) => a.documentacao.certificadoEmitido).length;
  const entregues = filtered.filter((a) => a.documentacao.certificadoRecebido).length;
  const pendentes = filtered.length - emitidos;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Relatório de Certificados</h1>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Emitidos",  value: emitidos,  extra: "bg-[#EAF6EE]",                          text: "text-[#007A33]" },
          { label: "Entregues", value: entregues, extra: "border border-[#E5E7EB] bg-white",       text: "text-gray-900"  },
          { label: "Pendentes", value: pendentes, extra: "border border-amber-100 bg-amber-50",    text: "text-amber-700" },
        ].map((c) => (
          <div key={c.label} className={`rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${c.extra}`}>
            <p className="text-xs font-semibold text-[#4B5563]">{c.label}</p>
            <p className={`mt-1 text-3xl font-extrabold ${c.text}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Select label="Polo"  value={polo}  onChange={setPolo}  options={[...POLOS]} />
        <Select label="Turma" value={turma} onChange={setTurma} options={TURMAS}     />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Nome</th>
              <th className="px-3 py-3">Turma</th>
              <th className="px-3 py-3 text-center">Histórico</th>
              <th className="px-3 py-3 text-center">Certificado</th>
              <th className="px-3 py-3">Emissão</th>
              <th className="px-3 py-3">Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-semibold text-gray-800">
                    {a.nome}
                    <span className="ml-2 text-xs font-normal text-[#4B5563]">{a.polo}</span>
                  </td>
                  <td className="px-3 py-3 text-[#4B5563]">{a.turmaNome}</td>
                  <td className="px-3 py-3 text-center">
                    {a.documentacao.historicoEntregue
                      ? <span className="rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-bold text-[#007A33]">Sim</span>
                      : <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {a.documentacao.certificadoRecebido
                      ? <span className="rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-bold text-[#007A33]">Recebido</span>
                      : a.documentacao.certificadoEmitido
                      ? <span className="rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-bold text-[#007A33]">Emitido</span>
                      : <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">Pendente</span>}
                  </td>
                  <td className="px-3 py-3 text-xs text-[#4B5563]">{a.certificadoDataEmissao ?? "—"}</td>
                  <td className="px-3 py-3 text-xs text-[#4B5563]">{a.certificadoDataEntrega ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
