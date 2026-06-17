import Link from "next/link";
import { notFound } from "next/navigation";
import { professorTurmas, type StatusAluno } from "@/lib/mock-data/professor";

const situacaoCfg: Record<StatusAluno, { label: string; classes: string }> = {
  "Em andamento": { label: "Em andamento", classes: "bg-yellow-50 text-yellow-700" },
  "Aprovado":     { label: "Aprovado",     classes: "bg-green-50 text-green-700"  },
  "Reprovado":    { label: "Reprovado",    classes: "bg-red-50 text-red-600"      },
};

export default async function TurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const turma = professorTurmas.find((t) => t.id === turmaId);
  if (!turma) notFound();

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
      <p className="mb-6 text-sm text-gray-500">
        {turma.alunos.length} aluno{turma.alunos.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {turma.alunos.map((aluno) => {
          const cfg = situacaoCfg[aluno.situacao];
          return (
            <div
              key={aluno.id}
              className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100"
            >
              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f4fd] text-sm font-bold text-[#0f2d52]">
                {aluno.nome.split(" ").slice(0, 2).map((n) => n[0]).join("")}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{aluno.nome}</p>
                <p className="text-sm text-gray-500">{aluno.cidade}</p>
              </div>

              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
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
    </div>
  );
}
