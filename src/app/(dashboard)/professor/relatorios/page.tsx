import Link from "next/link";
import { professorTurmas, isAtivo, SITUACAO_CFG } from "@/lib/mock-data/professor";
import { BarChart2 } from "lucide-react";

export default function ProfessorRelatoriosPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          Selecione uma turma para visualizar o relatório detalhado
        </p>
      </div>

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
            {professorTurmas.map((turma) => {
              const total     = turma.alunos.length;
              const aprovados = turma.alunos.filter((a) => a.situacao === "APROVADO").length;
              const ativos    = turma.alunos.filter((a) => isAtivo(a.situacao)).length;
              const cursando  = turma.alunos.filter((a) => a.situacao === "CURSANDO").length;

              return (
                <tr key={turma.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={15} className="shrink-0 text-[#009640]" />
                      <span className="font-medium text-gray-800">{turma.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-gray-800">{total}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-gray-700">{ativos}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-[#009640]">{aprovados}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-[#4B5563]">{cursando}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Link
                      href={`/professor/relatorios/${turma.id}`}
                      className="inline-flex items-center gap-1 rounded border border-[#009640] px-3 py-1.5 text-xs font-semibold text-[#009640] transition hover:bg-[#EAF6EE]"
                    >
                      Ver relatório
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
