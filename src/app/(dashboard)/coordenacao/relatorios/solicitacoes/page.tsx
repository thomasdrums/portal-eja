"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { relatorioSolicitacoes, POLOS, type StatusSolicitacao, type SolicitacaoRel } from "@/lib/mock-data/relatorios";

const STATUSES: StatusSolicitacao[] = ["Recebida","Em análise","Em processamento","Concluída"];
const TURMAS  = [...new Set(relatorioSolicitacoes.map((s) => s.turmaNome))].sort();
const TIPOS   = [...new Set(relatorioSolicitacoes.map((s) => s.tipoDocumento))].sort();

const statusColor: Record<StatusSolicitacao, string> = {
  "Recebida":         "bg-gray-100 text-gray-600",
  "Em análise":       "bg-[#EAF6EE] text-[#007A33]",
  "Em processamento": "bg-amber-50 text-amber-700",
  "Concluída":        "bg-green-100 text-green-700",
};

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

export default function RelatorioSolicitacoesPage() {
  const [lista, setLista] = useState<SolicitacaoRel[]>(relatorioSolicitacoes);
  const [polo,   setPolo]   = useState("");
  const [turma,  setTurma]  = useState("");
  const [status, setStatus] = useState("");
  const [tipo,   setTipo]   = useState("");

  const filtered = useMemo(() =>
    lista.filter((s) =>
      (!polo   || s.polo          === polo)   &&
      (!turma  || s.turmaNome     === turma)  &&
      (!status || s.status        === status) &&
      (!tipo   || s.tipoDocumento === tipo)
    ), [lista, polo, turma, status, tipo]);

  const contadores = STATUSES.map((st) => ({
    label: st,
    value: lista.filter((s) => s.status === st).length,
  }));

  function atualizarStatus(id: string, novoStatus: StatusSolicitacao) {
    setLista((l) => l.map((s) => s.id === id ? { ...s, status: novoStatus } : s));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Relatório de Solicitações</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            {filtered.length} solicitaç{filtered.length !== 1 ? "ões" : "ão"} encontrada{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {contadores.map((c) => (
          <div key={c.label} className={`rounded-lg p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${statusColor[c.label as StatusSolicitacao]}`}>
            <p className="text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs font-semibold">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-4">
        <Select label="Polo"   value={polo}   onChange={setPolo}   options={[...POLOS]} />
        <Select label="Turma"  value={turma}  onChange={setTurma}  options={TURMAS}     />
        <Select label="Status" value={status} onChange={setStatus} options={STATUSES}   />
        <Select label="Tipo"   value={tipo}   onChange={setTipo}   options={TIPOS}      />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Polo</th>
              <th className="px-3 py-3">Turma</th>
              <th className="px-3 py-3">Data</th>
              <th className="px-3 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhuma solicitação encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-semibold text-gray-800">{s.nomeAluno}</td>
                  <td className="px-3 py-3 text-xs text-[#4B5563]">{s.tipoDocumento}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{s.polo}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{s.turmaNome}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{s.dataSolicitacao}</td>
                  <td className="px-3 py-3 text-center">
                    <select
                      value={s.status}
                      onChange={(e) => atualizarStatus(s.id, e.target.value as StatusSolicitacao)}
                      className={`w-full cursor-pointer rounded border-0 px-2.5 py-1 text-xs font-semibold outline-none ${statusColor[s.status]}`}
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
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
