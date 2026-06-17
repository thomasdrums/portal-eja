"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { relatorioAlunos, POLOS } from "@/lib/mock-data/relatorios";

const TURMAS  = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();

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
        <h1 className="text-xl font-extrabold text-[#0f2d52]">📜 Relatório de Certificados</h1>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      {/* Indicadores */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#166534] to-[#16a34a] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Emitidos</p>
          <p className="text-3xl font-extrabold">{emitidos}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Entregues</p>
          <p className="text-3xl font-extrabold">{entregues}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#78350f] to-[#d97706] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Pendentes</p>
          <p className="text-3xl font-extrabold">{pendentes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100">
        <Select label="Polo"  value={polo}  onChange={setPolo}  options={[...POLOS]} />
        <Select label="Turma" value={turma} onChange={setTurma} options={TURMAS}     />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
        <div className="hidden grid-cols-5 gap-2 bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white sm:grid">
          <span>Nome</span><span>Polo</span><span>Turma</span><span className="text-center">Histórico</span>
          <span className="text-center">Certificado</span>
        </div>
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">Nenhum aluno encontrado.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((a) => (
              <li key={a.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm sm:grid-cols-5 sm:items-center sm:gap-2">
                <span className="font-semibold text-gray-800">{a.nome}</span>
                <span className="text-gray-600">{a.polo}</span>
                <span className="text-gray-600">{a.turmaNome}</span>
                <span className="text-center">
                  {a.documentacao.historicoEntregue
                    ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">✓ Entregue</span>
                    : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Pendente</span>}
                </span>
                <span className="text-center">
                  {a.documentacao.certificadoRecebido
                    ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">✓ Recebido</span>
                    : a.documentacao.certificadoEmitido
                    ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Emitido</span>
                    : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Pendente</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
