"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { relatorioSolicitacoes, POLOS, type StatusSolicitacao } from "@/lib/mock-data/relatorios";

const STATUSES: StatusSolicitacao[] = ["Recebida","Em análise","Em processamento","Concluída"];
const TURMAS  = [...new Set(relatorioSolicitacoes.map((s) => s.turmaNome))].sort();
const TIPOS   = [...new Set(relatorioSolicitacoes.map((s) => s.tipoDocumento))].sort();

const statusColor: Record<StatusSolicitacao, string> = {
  "Recebida":         "bg-gray-100 text-gray-600",
  "Em análise":       "bg-blue-100 text-blue-700",
  "Em processamento": "bg-amber-100 text-amber-700",
  "Concluída":        "bg-green-100 text-green-700",
};

export default function RelatorioSolicitacoesPage() {
  const [polo,   setPolo]   = useState("");
  const [turma,  setTurma]  = useState("");
  const [status, setStatus] = useState("");
  const [tipo,   setTipo]   = useState("");

  const filtered = useMemo(() =>
    relatorioSolicitacoes.filter((s) =>
      (!polo   || s.polo          === polo)   &&
      (!turma  || s.turmaNome     === turma)  &&
      (!status || s.status        === status) &&
      (!tipo   || s.tipoDocumento === tipo)
    ), [polo, turma, status, tipo]);

  const contadores = STATUSES.map((st) => ({
    label: st,
    value: relatorioSolicitacoes.filter((s) => s.status === st).length,
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
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/coordenacao/relatorios" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Relatórios
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f2d52]">📨 Relatório de Solicitações</h1>
          <p className="text-sm text-gray-500">{filtered.length} solicitaç{filtered.length !== 1 ? "ões" : "ão"} encontrada{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      {/* Contadores por status */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {contadores.map((c) => (
          <div key={c.label} className={`rounded-3xl p-4 text-center ${statusColor[c.label as StatusSolicitacao]}`}>
            <p className="text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs font-semibold">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:grid-cols-4">
        <Select label="Polo"   value={polo}   onChange={setPolo}   options={[...POLOS]} />
        <Select label="Turma"  value={turma}  onChange={setTurma}  options={TURMAS}     />
        <Select label="Status" value={status} onChange={setStatus} options={STATUSES}   />
        <Select label="Tipo"   value={tipo}   onChange={setTipo}   options={TIPOS}      />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
        <div className="hidden grid-cols-6 gap-2 bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white sm:grid">
          <span>Aluno</span><span>Tipo</span><span>Polo</span><span>Turma</span><span>Data</span><span className="text-center">Status</span>
        </div>
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((s) => (
              <li key={s.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm sm:grid-cols-6 sm:items-center sm:gap-2">
                <span className="font-semibold text-gray-800">{s.nomeAluno}</span>
                <span className="text-gray-600">{s.tipoDocumento}</span>
                <span className="text-gray-600">{s.polo}</span>
                <span className="text-gray-600">{s.turmaNome}</span>
                <span className="text-gray-500">{s.dataSolicitacao}</span>
                <span className="sm:text-center">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[s.status]}`}>
                    {s.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
