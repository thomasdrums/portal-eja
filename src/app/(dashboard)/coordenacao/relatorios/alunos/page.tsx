"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { relatorioAlunos, POLOS, type SituacaoAluno } from "@/lib/mock-data/relatorios";

const SITUACOES: SituacaoAluno[] = ["Em andamento", "Aprovado", "Reprovado"];
const TURMAS   = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();
const CIDADES  = [...new Set(relatorioAlunos.map((a) => a.cidade))].sort();

const situacaoBadge: Record<SituacaoAluno, string> = {
  "Aprovado":     "bg-green-100 text-green-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Reprovado":    "bg-red-100 text-red-600",
};

export default function RelatorioAlunosPage() {
  const [polo,     setPolo]     = useState("");
  const [turma,    setTurma]    = useState("");
  const [cidade,   setCidade]   = useState("");
  const [situacao, setSituacao] = useState("");

  const filtered = useMemo(() =>
    relatorioAlunos.filter((a) =>
      (!polo     || a.polo      === polo)     &&
      (!turma    || a.turmaNome === turma)    &&
      (!cidade   || a.cidade    === cidade)   &&
      (!situacao || a.situacao  === situacao)
    ), [polo, turma, cidade, situacao]);

  function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
        >
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
          <h1 className="text-xl font-extrabold text-[#0f2d52]">👥 Relatório de Alunos</h1>
          <p className="text-sm text-gray-500">{filtered.length} aluno{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">
          ⬇ Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:grid-cols-4">
        <Select label="Polo"     value={polo}     onChange={setPolo}     options={[...POLOS]}    />
        <Select label="Turma"    value={turma}    onChange={setTurma}    options={TURMAS}        />
        <Select label="Cidade"   value={cidade}   onChange={setCidade}   options={CIDADES}       />
        <Select label="Situação" value={situacao} onChange={setSituacao} options={SITUACOES}     />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
        {/* Header */}
        <div className="hidden grid-cols-5 gap-4 bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white sm:grid">
          <span>Nome</span><span>Polo</span><span>Turma</span><span>Cidade</span><span>Situação</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">Nenhum aluno encontrado com esses filtros.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((a) => (
              <li key={a.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm sm:grid-cols-5 sm:items-center sm:gap-4">
                <span className="font-semibold text-gray-800">{a.nome}</span>
                <span className="text-gray-600">{a.polo}</span>
                <span className="text-gray-600">{a.turmaNome}</span>
                <span className="text-gray-600">{a.cidade}</span>
                <span>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${situacaoBadge[a.situacao]}`}>
                    {a.situacao}
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
