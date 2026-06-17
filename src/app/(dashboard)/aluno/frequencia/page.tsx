import Link from "next/link";
import { alunoFrequencia } from "@/lib/mock-data/aluno";

const areaColors: Record<string, { bar: string; badge: string }> = {
  "Matemática":            { bar: "bg-[#1565c0]", badge: "bg-blue-50 text-blue-700" },
  "Linguagens":            { bar: "bg-[#0288d1]", badge: "bg-cyan-50 text-cyan-700" },
  "Ciências da Natureza":  { bar: "bg-[#00897b]", badge: "bg-teal-50 text-teal-700" },
  "Ciências Humanas":      { bar: "bg-[#6a1b9a]", badge: "bg-purple-50 text-purple-700" },
};

export default function FrequenciaPage() {
  const totalPresencas = alunoFrequencia.reduce((s, a) => s + a.presencas, 0);
  const totalAulas = alunoFrequencia.reduce((s, a) => s + a.totalAulas, 0);
  const totalFaltas = totalAulas - totalPresencas;
  const pctGeral = Math.round((totalPresencas / totalAulas) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back */}
      <Link
        href="/aluno"
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-bold text-[#0f2d52]">Frequência</h1>

      {/* Resumo geral */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] p-6 text-white shadow-lg">
        <p className="text-sm text-white/70">Frequência Geral</p>
        <p className="mt-1 text-5xl font-bold">{pctGeral}%</p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${pctGeral}%` }} />
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <p className="text-white/60">Presenças</p>
            <p className="text-lg font-bold">{totalPresencas}</p>
          </div>
          <div>
            <p className="text-white/60">Faltas</p>
            <p className="text-lg font-bold">{totalFaltas}</p>
          </div>
          <div>
            <p className="text-white/60">Total de aulas</p>
            <p className="text-lg font-bold">{totalAulas}</p>
          </div>
        </div>
      </div>

      {/* Por área */}
      <div className="space-y-4">
        {alunoFrequencia.map((item) => {
          const faltas = item.totalAulas - item.presencas;
          const pct = Math.round((item.presencas / item.totalAulas) * 100);
          const ok = pct === 100;
          const colors = areaColors[item.area] ?? { bar: "bg-[#1565c0]", badge: "bg-blue-50 text-blue-700" };

          return (
            <div key={item.area} className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">{item.area}</h2>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${colors.badge}`}>
                  {pct}%
                </span>
              </div>

              {/* Bar */}
              <div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-green-50 py-2">
                  <p className="text-xs text-gray-500">Presenças</p>
                  <p className="text-lg font-bold text-green-600">{item.presencas}</p>
                </div>
                <div className="rounded-2xl bg-red-50 py-2">
                  <p className="text-xs text-gray-500">Faltas</p>
                  <p className="text-lg font-bold text-red-500">{faltas}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 py-2">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-700">{item.totalAulas}</p>
                </div>
              </div>

              {ok && (
                <p className="mt-3 text-center text-xs font-semibold text-green-600">
                  ✓ Frequência completa nesta área
                </p>
              )}
              {!ok && (
                <p className="mt-3 text-center text-xs text-gray-400">
                  Necessário 100% para aprovação nesta área
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
