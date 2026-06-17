import Link from "next/link";
import { professorTurmas } from "@/lib/mock-data/professor";

export default function TurmasPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/professor" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-bold text-[#0f2d52]">Turmas</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {professorTurmas.map((turma) => (
          <Link key={turma.id} href={`/professor/turmas/${turma.id}`} className="group">
            <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 transition-all hover:shadow-lg active:scale-[0.98]">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{turma.nome}</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {turma.alunos.length} aluno{turma.alunos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} className="h-5 w-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
