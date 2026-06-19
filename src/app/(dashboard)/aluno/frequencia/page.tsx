import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { alunoFrequencia } from "@/lib/mock-data/aluno";

export default function FrequenciaPage() {
  const totalPresencas = alunoFrequencia.reduce((s, a) => s + a.presencas, 0);
  const totalAulas = alunoFrequencia.reduce((s, a) => s + a.totalAulas, 0);
  const totalFaltas = totalAulas - totalPresencas;
  const pctGeral = Math.round((totalPresencas / totalAulas) * 100);

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
        <h1 className="text-xl font-semibold text-gray-900">Frequência</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Registro de presenças e faltas por área do conhecimento</p>
      </div>

      {/* Resumo geral */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">Frequência Geral</p>
        <div className="mb-3 flex items-end gap-3">
          <span className="text-4xl font-bold text-gray-900">{pctGeral}%</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#009640] transition-all"
            style={{ width: `${pctGeral}%` }}
          />
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] text-center">
          <div className="px-4">
            <p className="text-xs text-[#4B5563]">Presenças</p>
            <p className="text-2xl font-bold text-[#009640]">{totalPresencas}</p>
          </div>
          <div className="px-4">
            <p className="text-xs text-[#4B5563]">Faltas</p>
            <p className="text-2xl font-bold text-red-500">{totalFaltas}</p>
          </div>
          <div className="px-4">
            <p className="text-xs text-[#4B5563]">Total</p>
            <p className="text-2xl font-bold text-gray-700">{totalAulas}</p>
          </div>
        </div>
      </div>

      {/* Tabela por área */}
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640]">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-white">Área</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Presenças</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Faltas</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Total</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Frequência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {alunoFrequencia.map((item) => {
              const faltas = item.totalAulas - item.presencas;
              const pct = Math.round((item.presencas / item.totalAulas) * 100);
              const ok = pct === 100;

              return (
                <tr key={item.area} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{item.area}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-[#009640]">{item.presencas}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-red-500">{faltas}</td>
                  <td className="px-5 py-3.5 text-center text-[#4B5563]">{item.totalAulas}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`rounded px-2.5 py-0.5 text-[11px] font-bold ${
                        ok ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-2.5">
          <p className="text-xs text-[#4B5563]">
            Frequência mínima exigida para aprovação: 100%
          </p>
        </div>
      </div>
    </div>
  );
}
