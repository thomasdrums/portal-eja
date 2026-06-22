"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  relatorioAlunos,
  POLOS,
  SITUACAO_CFG,
  type SituacaoAluno,
} from "@/lib/mock-data/relatorios";

const SITUACOES: SituacaoAluno[] = [
  "APROVADO",
  "CURSANDO",
  "EM_PROCESSO",
  "RDS",
  "EVADIDO",
  "DESISTENTE",
];
const TURMAS  = [...new Set(relatorioAlunos.map((a) => a.turmaNome))].sort();
const CIDADES = [...new Set(relatorioAlunos.map((a) => a.cidade))].sort();

function Select({
  label, value, onChange, options, renderOption,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
  renderOption?: (v: string) => string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>{renderOption ? renderOption(o) : o}</option>
        ))}
      </select>
    </div>
  );
}

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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Relatório de Alunos</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            {filtered.length} aluno{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-4">
        <Select label="Polo"     value={polo}     onChange={setPolo}     options={[...POLOS]} />
        <Select label="Turma"    value={turma}    onChange={setTurma}    options={TURMAS}     />
        <Select label="Cidade"   value={cidade}   onChange={setCidade}   options={CIDADES}    />
        <Select
          label="Situação"
          value={situacao}
          onChange={setSituacao}
          options={SITUACOES}
          renderOption={(v) => SITUACAO_CFG[v as SituacaoAluno].label}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Nome</th>
              <th className="px-3 py-3">Polo</th>
              <th className="px-3 py-3">Turma</th>
              <th className="px-3 py-3">Cidade</th>
              <th className="px-3 py-3">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhum aluno encontrado com esses filtros.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const cfg = SITUACAO_CFG[a.situacao];
                return (
                  <tr key={a.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-semibold text-gray-800">{a.nome}</td>
                    <td className="px-3 py-3 text-[#4B5563]">{a.polo}</td>
                    <td className="px-3 py-3 text-[#4B5563]">{a.turmaNome}</td>
                    <td className="px-3 py-3 text-[#4B5563]">{a.cidade}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
                        {cfg.label}
                      </span>
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
