import Link from "next/link";
import { auth } from "@/lib/auth";
import { CardStat } from "@/components/dashboard/CardStat";
import { professorTurmas, isAtivo } from "@/lib/mock-data/professor";
import { Users, ExternalLink } from "lucide-react";

export default async function ProfessorDashboardPage() {
  const session = await auth();
  const nome = session?.user?.name ?? "Professor";

  const todosAlunos = professorTurmas.flatMap((t) => t.alunos);
  const totalAlunos = todosAlunos.length;
  const ativos      = todosAlunos.filter((a) => isAtivo(a.situacao)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Bem-vindo, {nome.split(" ")[0]}
        </h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Painel do professor — Portal EJA SESI</p>
      </div>

      {/* Indicadores */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#4B5563]">
          Visão Geral
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <CardStat label="Total de Turmas"  value={professorTurmas.length} />
          <CardStat label="Total de Alunos"  value={totalAlunos} />
          <CardStat label="Alunos Ativos"    value={ativos} />
        </div>
      </section>

      {/* Turmas */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#4B5563]">Turmas</h2>
          <Link
            href="/professor/turmas"
            className="flex items-center gap-1 text-xs font-medium text-[#009640] hover:underline"
          >
            Ver todas
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#009640]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-white">Turma</th>
                <th className="hidden px-5 py-3 text-center text-xs font-semibold text-white sm:table-cell">Etapa</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-white">Total de Alunos</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-white">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {professorTurmas.map((turma) => (
                <tr key={turma.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Users size={15} className="shrink-0 text-[#009640]" />
                      <span className="font-medium text-gray-800">{turma.nome}</span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-center text-[#4B5563] sm:table-cell">—</td>
                  <td className="px-5 py-3 text-center font-semibold text-gray-800">
                    {turma.alunos.length}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      href={`/professor/turmas/${turma.id}`}
                      className="inline-flex items-center gap-1 rounded border border-[#009640] px-3 py-1.5 text-xs font-semibold text-[#009640] transition hover:bg-[#EAF6EE]"
                    >
                      Acessar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
