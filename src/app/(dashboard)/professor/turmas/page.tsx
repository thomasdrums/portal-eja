import Link from "next/link";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { listarTurmasDoProfessor } from "@/lib/queries/professor-turmas";

// Sempre com dados atuais do banco (depende da sessão).
export const dynamic = "force-dynamic";

export default async function TurmasPage() {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const turmas = await listarTurmasDoProfessor(session?.user?.id, isCoordenacao);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Turmas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Lista de turmas sob sua responsabilidade</p>
      </div>

      {turmas.length === 0 ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Users size={22} className="mx-auto mb-2 text-[#9CA3AF]" />
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
                <th className="hidden px-5 py-3.5 text-center text-xs font-semibold text-white sm:table-cell">Etapa</th>
                <th className="hidden px-5 py-3.5 text-center text-xs font-semibold text-white md:table-cell">Polo</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Total de Alunos</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {turmas.map((turma) => (
                <tr key={turma.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Users size={15} className="shrink-0 text-[#009640]" />
                      <div>
                        <p className="font-medium text-gray-800">{turma.nome}</p>
                        <p className="text-[11px] text-[#4B5563]">
                          {turma.aprovados} aprovados · {turma.cursando} cursando
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-center text-[#4B5563] sm:table-cell">{turma.etapaEnsino}</td>
                  <td className="hidden px-5 py-3.5 text-center text-[#4B5563] md:table-cell">{turma.poloNome}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-gray-800">
                    {turma.qtdAlunos}
                  </td>
                  <td className="px-5 py-3.5 text-center">
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
      )}
    </div>
  );
}
