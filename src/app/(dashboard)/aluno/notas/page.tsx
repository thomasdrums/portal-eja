import Link from "next/link";
import { ChevronLeft, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { alunoAreas } from "@/lib/mock-data/aluno";

function isAprovada(area: (typeof alunoAreas)[number]) {
  return area.frequencia === 100 && area.competencias.every((c) => c.nota >= 60);
}

export default function NotasPage() {
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

      <div className="space-y-4">
        {alunoAreas.map((area) => {
          const aprovada = isAprovada(area);
          const freqOk = area.frequencia === 100;

          return (
            <div
              key={area.id}
              className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between bg-[#009640] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">{area.nome}</h2>
                <span className="flex items-center gap-1.5 rounded bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {aprovada ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  {aprovada ? "APROVADO" : "EM ANDAMENTO"}
                </span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Competência</th>
                    <th className="px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Nota</th>
                    <th className="hidden px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563] sm:table-cell">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {area.competencias.map((c) => {
                    const ok = c.nota >= 60;
                    return (
                      <tr key={c.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3 font-medium text-gray-800">{c.id}</td>
                        <td className={`px-5 py-3 text-center font-bold ${ok ? "text-[#009640]" : "text-red-500"}`}>
                          {c.nota}
                        </td>
                        <td className="hidden px-5 py-3 text-center sm:table-cell">
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                              ok ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-600"
                            }`}
                          >
                            {ok ? "Aprovado" : "Pendente"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
                    <td className="px-5 py-2.5 text-xs text-[#4B5563]">Frequência</td>
                    <td colSpan={2} className="px-5 py-2.5 text-right">
                      <span
                        className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                          freqOk ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {area.frequencia}%{freqOk ? " — Completa" : ""}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>

              {aprovada && (
                <div className="border-t border-[#E5E7EB] bg-[#EAF6EE] px-5 py-3">
                  <a
                    href={area.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#007A33] hover:underline"
                  >
                    <ExternalLink size={14} />
                    Entrar no grupo da próxima etapa
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
