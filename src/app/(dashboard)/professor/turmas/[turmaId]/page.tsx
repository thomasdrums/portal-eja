"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { professorTurmas, SITUACAO_CFG } from "@/lib/mock-data/professor";

export default function TurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = use(params);
  const [busca, setBusca] = useState("");

  const turma = professorTurmas.find((t) => t.id === turmaId);
  if (!turma) notFound();

  const termo = busca.trim().toLowerCase();
  const alunosFiltrados = turma.alunos.filter(
    (a) =>
      !termo ||
      a.nome.toLowerCase().includes(termo) ||
      a.ra.includes(termo),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/professor/turmas"
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Turmas
      </Link>

      <h1 className="mb-1 text-xl font-bold text-[#0f2d52]">{turma.nome}</h1>
      <p className="mb-5 text-sm text-gray-500">
        {turma.alunos.length} aluno{turma.alunos.length !== 1 ? "s" : ""}
      </p>

      {/* Campo de busca */}
      <div className="relative mb-4">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nome ou RA..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
        />
      </div>

      {alunosFiltrados.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-400">Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alunosFiltrados.map((aluno) => {
            const cfg = SITUACAO_CFG[aluno.situacao];
            return (
              <div
                key={aluno.id}
                className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-md ring-1 ring-gray-100"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f4fd] text-sm font-bold text-[#0f2d52]">
                  {aluno.nome.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{aluno.nome}</p>
                  <p className="text-xs text-gray-500">RA {aluno.ra} · {aluno.cidade}</p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}
                  title={cfg.descricao}
                >
                  {cfg.label}
                </span>

                <Link
                  href={`/professor/turmas/${turma.id}/${aluno.id}`}
                  className="shrink-0 rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
                >
                  Visualizar
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
