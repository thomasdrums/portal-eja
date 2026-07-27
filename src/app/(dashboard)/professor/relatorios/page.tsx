import Link from "next/link";
import { auth } from "@/lib/auth";
import { listarTurmasDoProfessor } from "@/lib/queries/professor-turmas";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";
import { BarChart2 } from "lucide-react";

// Turmas REAIS do professor logado (coordenação enxerga todas). Depende da sessão.
export const dynamic = "force-dynamic";

export default async function ProfessorRelatoriosPage() {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const turmas = await listarTurmasDoProfessor(session?.user?.id, isCoordenacao);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          Selecione uma turma para visualizar o relatório detalhado
        </p>
      </div>

      {turmas.length === 0 ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <BarChart2 size={22} className="mx-auto mb-2 text-[#9CA3AF]" />
          <p className="text-sm text-[#4B5563]">
            Você ainda não tem turmas vinculadas. Fale com a coordenação.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#009640]">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white">Turma</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Total</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Ativos</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">
                  {SITUACAO_CFG.APROVADO.label}
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Cursando</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {turmas.map((turma) => (
                <tr key={turma.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={15} className="shrink-0 text-[#009640]" />
                      <span className="font-medium text-gray-800">{turma.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-gray-800">{turma.qtdAlunos}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-gray-700">{turma.ativos}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-[#009640]">{turma.aprovados}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-[#4B5563]">{turma.cursando}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Link
                      href={`/professor/relatorios/${turma.id}`}
                      className="inline-flex items-center gap-1 rounded border border-[#009640] px-3 py-1.5 text-xs font-semibold text-[#009640] transition hover:bg-[#EAF6EE]"
                    >
                      Ver relatório
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
