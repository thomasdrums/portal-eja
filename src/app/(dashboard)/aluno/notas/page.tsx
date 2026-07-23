import Link from "next/link";
import { ChevronLeft, CheckCircle2, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { carregarNotasDoAluno } from "@/lib/queries/notas";
import type { SituacaoCompetencia } from "@/lib/regras-notas";

// Sempre com dados atuais do banco (depende da sessão).
export const dynamic = "force-dynamic";

// Cor da célula de Média: verde quando a nota foi atingida (aprovado ou pendente de frequência),
// vermelha quando ainda não atingiu, cinza quando não há nota.
function corMedia(sit: SituacaoCompetencia): string {
  if (sit === "vazio") return "text-gray-400";
  if (sit === "cursando") return "text-red-500";
  return "text-[#009640]";
}

// Selo de Situação por competência (usa o campo presenca da própria nota).
function seloSituacao(sit: SituacaoCompetencia): { texto: string; classes: string } {
  switch (sit) {
    case "aprovado":
      return { texto: "Aprovado", classes: "bg-[#EAF6EE] text-[#007A33]" };
    case "pendente_frequencia":
      return { texto: "Pend. frequência", classes: "bg-amber-50 text-amber-700" };
    case "cursando":
      return { texto: "Em processo", classes: "bg-red-50 text-red-600" };
    default:
      return { texto: "—", classes: "bg-gray-50 text-gray-400" };
  }
}

export default async function NotasPage() {
  const session = await auth();
  const dados = await carregarNotasDoAluno(session?.user?.id);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/aluno"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Notas por Área</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Desempenho por competência em cada área do conhecimento</p>
      </div>

      {!dados.temAluno ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta ainda não está vinculada a um cadastro de aluno. Procure a coordenação.
        </div>
      ) : (
        <div className="space-y-4">
          {dados.areas.map((area) => {
            const badge =
              area.status === "aprovado"
                ? { texto: "APROVADO", Icon: CheckCircle2 }
                : area.status === "pendente_frequencia"
                  ? { texto: "PENDENTE DE FREQUÊNCIA", Icon: Clock }
                  : { texto: "EM ANDAMENTO", Icon: Clock };
            const BadgeIcon = badge.Icon;

            return (
              <div
                key={area.nome}
                className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center justify-between bg-[#009640] px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-white">{area.nome}</h2>
                  <span className="flex items-center gap-1.5 rounded bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    <BadgeIcon size={11} />
                    {badge.texto}
                  </span>
                </div>

                {!area.temNota ? (
                  <p className="px-5 py-6 text-center text-sm text-[#9CA3AF]">
                    Ainda sem notas lançadas nesta área.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Competência</th>
                        <th className="px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Média</th>
                        <th className="hidden px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563] sm:table-cell">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {area.competencias.map((c) => {
                        const selo = seloSituacao(c.situacao);
                        return (
                          <tr key={c.codigo} className="hover:bg-[#F8FAFC]">
                            <td className="px-5 py-3 font-medium text-gray-800">{c.codigo}</td>
                            <td className={`px-5 py-3 text-center font-bold ${corMedia(c.situacao)}`}>
                              {c.mediaTexto}
                            </td>
                            <td className="hidden px-5 py-3 text-center sm:table-cell">
                              <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${selo.classes}`}>
                                {selo.texto}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
                        <td className="px-5 py-2.5 text-xs text-[#4B5563]">Frequência por área</td>
                        <td colSpan={2} className="px-5 py-2.5 text-right">
                          {area.frequenciaSemExigencia ? (
                            <span className="rounded bg-[#EAF6EE] px-2.5 py-0.5 text-xs font-semibold text-[#007A33]">
                              Dispensado (competências certificadas)
                            </span>
                          ) : (
                            <span
                              className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                                area.frequenciaAtingida
                                  ? "bg-[#EAF6EE] text-[#007A33]"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {area.frequenciaPercentual}%
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
