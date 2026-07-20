"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { professorTurmas, SITUACAO_CFG, ETAPA_CFG } from "@/lib/mock-data/professor";
import { GradeNotas } from "@/components/professor/GradeNotas";

export default function AcompanhamentoTurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = use(params);
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"alunos" | "notas">("alunos");

  const turma = professorTurmas.find((t) => t.id === turmaId);
  if (!turma) notFound();

  const termo = busca.trim().toLowerCase();
  const alunosFiltrados = turma.alunos.filter(
    (a) => !termo || a.nome.toLowerCase().includes(termo) || a.ra.includes(termo),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/coordenacao/acompanhamento"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Acompanhamento
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {turma.nome} — {turma.alunos.length} aluno
          {turma.alunos.length !== 1 ? "s" : ""} matriculado
          {turma.alunos.length !== 1 ? "s" : ""}
        </h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          {turma.polo} · {turma.professorResponsavel} · {turma.periodoLetivo}
        </p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setAba("alunos")}
          className={`flex-1 rounded py-2.5 text-xs font-semibold transition sm:text-sm ${
            aba === "alunos" ? "bg-[#009640] text-white shadow-sm" : "text-[#4B5563] hover:text-[#009640]"
          }`}
        >
          Lista de Alunos
        </button>
        <button
          onClick={() => setAba("notas")}
          className={`flex-1 rounded py-2.5 text-xs font-semibold transition sm:text-sm ${
            aba === "notas" ? "bg-[#009640] text-white shadow-sm" : "text-[#4B5563] hover:text-[#009640]"
          }`}
        >
          Lançar Notas
        </button>
      </div>

      {/* Coordenação visualiza as notas em modo somente leitura */}
      {aba === "notas" && <GradeNotas turma={turma} readOnly />}

      {aba === "alunos" && (
        <>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Buscar por nome ou RA..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded border border-[#D9D9D9] bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20 sm:max-w-xs"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {alunosFiltrados.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#4B5563]">Nenhum aluno encontrado.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#009640]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-white">Nome</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold text-white sm:table-cell">RA</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold text-white md:table-cell">Cidade</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Etapa</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {alunosFiltrados.map((aluno) => {
                    const cfg = SITUACAO_CFG[aluno.situacao];
                    return (
                      <tr key={aluno.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3 font-medium text-gray-800">
                          {aluno.nome}
                          <p className="text-[11px] text-[#4B5563] sm:hidden">RA {aluno.ra}</p>
                        </td>
                        <td className="hidden px-5 py-3 text-[#4B5563] sm:table-cell">{aluno.ra}</td>
                        <td className="hidden px-5 py-3 text-[#4B5563] md:table-cell">{aluno.cidade}</td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className="rounded bg-[#EAF6EE] px-2 py-0.5 text-[11px] font-semibold text-[#007A33]"
                            title={ETAPA_CFG[aluno.etapa].descricao}
                          >
                            {ETAPA_CFG[aluno.etapa].label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
