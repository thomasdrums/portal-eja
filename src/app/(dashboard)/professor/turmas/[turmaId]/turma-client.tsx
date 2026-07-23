"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { SITUACAO_CFG, type Turma } from "@/lib/mock-data/professor";
import type { TotaisMap } from "@/lib/queries/notas";
import { GradeNotas, type FrequenciasGrade } from "@/components/professor/GradeNotas";

// UI da página da turma (abas/busca/tabela + grade). A turma vem REAL do banco (via props);
// as notas são lidas do banco (Etapa B) e usadas como estado inicial da grade. O salvar de
// verdade ainda não foi ligado (Etapa C) — a GradeNotas segue editando em estado local.
export default function TurmaClient({
  turma,
  totais,
  frequencias,
}: {
  turma: Turma;
  totais?: TotaisMap;
  // Frequência calculada (respostas validadas) por aluno/área — somente leitura.
  frequencias?: FrequenciasGrade;
}) {
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"alunos" | "notas">("alunos");

  const termo = busca.trim().toLowerCase();
  const alunosFiltrados = turma.alunos.filter(
    (a) => !termo || a.nome.toLowerCase().includes(termo) || a.ra.includes(termo),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/professor/turmas"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Turmas
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">{turma.nome}</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          {turma.alunos.length} aluno{turma.alunos.length !== 1 ? "s" : ""} matriculados
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

      {aba === "notas" && (
        <GradeNotas turma={turma} totais={totais} frequencias={frequencias} />
      )}

      {aba === "alunos" && (
        <>
          {/* Busca */}
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

          {/* Tabela */}
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
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Situação</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Ação</th>
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
                          <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Link
                            href={`/professor/turmas/${turma.id}/${aluno.id}`}
                            className="inline-flex items-center gap-1 rounded border border-[#009640] px-3 py-1.5 text-xs font-semibold text-[#009640] transition hover:bg-[#EAF6EE]"
                          >
                            Visualizar
                          </Link>
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
