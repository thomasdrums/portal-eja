import Link from "next/link";
import { professorTurmas, isAtivo, SITUACAO_CFG } from "@/lib/mock-data/professor";

export default function ProfessorRelatoriosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/professor"
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Painel
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0f2d52]">Relatórios</h1>
        <p className="text-sm text-gray-500">Selecione uma turma para ver o relatório detalhado</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {professorTurmas.map((turma) => {
          const total     = turma.alunos.length;
          const aprovados = turma.alunos.filter((a) => a.situacao === "APROVADO").length;
          const ativos    = turma.alunos.filter((a) => isAtivo(a.situacao)).length;

          return (
            <Link
              key={turma.id}
              href={`/professor/relatorios/${turma.id}`}
              className="group block rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 transition hover:shadow-lg active:scale-[0.98]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] shadow-sm">
                  <span className="text-lg text-white">📊</span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">{turma.nome}</p>
                  <p className="text-xs text-gray-500">{total} aluno{total !== 1 ? "s" : ""}</p>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  className="ml-auto h-5 w-5 shrink-0"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-gray-50 py-2">
                  <p className="text-xs text-gray-500">Ativos</p>
                  <p className="text-lg font-bold text-gray-700">{ativos}</p>
                </div>
                <div className="rounded-2xl bg-green-50 py-2">
                  <p className="text-xs text-green-600">{SITUACAO_CFG.APROVADO.label}</p>
                  <p className="text-lg font-bold text-green-700">{aprovados}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 py-2">
                  <p className="text-xs text-blue-600">Cursando</p>
                  <p className="text-lg font-bold text-blue-700">
                    {turma.alunos.filter((a) => a.situacao === "CURSANDO").length}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
