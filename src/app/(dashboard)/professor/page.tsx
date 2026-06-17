import Link from "next/link";
import { auth } from "@/lib/auth";
import { CardStat } from "@/components/dashboard/CardStat";
import { professorTurmas, isAtivo } from "@/lib/mock-data/professor";

export default async function ProfessorDashboardPage() {
  const session = await auth();
  const nome = session?.user?.name ?? "Professor";

  const todosAlunos = professorTurmas.flatMap((t) => t.alunos);
  const total     = todosAlunos.length;
  const ativos    = todosAlunos.filter((a) => isAtivo(a.situacao)).length;
  const aprovados = todosAlunos.filter((a) => a.situacao === "APROVADO").length;

  const sections = [
    {
      href: "/professor/relatorios",
      label: "Relatórios",
      sub: "Resumos e fichas individuais por turma",
      icon: "📊",
    },
    {
      href: "/professor/turmas",
      label: "Turmas",
      sub: "Alunos, notas e frequência",
      icon: "👥",
    },
    {
      href: "/professor/aulas",
      label: "Aulas e Frequência",
      sub: "Cadastrar e gerenciar aulas gravadas",
      icon: "🎬",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Olá, {nome.split(" ")[0]}!</h1>
        <p className="text-sm text-gray-500">Painel do professor · Portal EJA</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardStat label="Turmas"        value={professorTurmas.length} />
        <CardStat label="Total de Alunos" value={total} />
        <CardStat label="Ativos"        value={ativos} />
        <CardStat label="Aprovados"     value={aprovados} />
      </div>

      <div className="space-y-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg transition hover:opacity-90"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
              {s.icon}
            </span>
            <div>
              <p className="font-bold text-lg">{s.label}</p>
              <p className="text-sm text-white/70">{s.sub}</p>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="ml-auto h-5 w-5 shrink-0 text-white/60"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
