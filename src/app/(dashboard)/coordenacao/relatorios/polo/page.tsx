import Link from "next/link";
import { dadosPorPolo, relatorioAlunos, freqColor, freqTextColor, POLOS } from "@/lib/mock-data/relatorios";

export default function RelatorioPorPoloPage() {
  const polos = dadosPorPolo();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/coordenacao/relatorios" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Relatórios
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#0f2d52]">📍 Relatório por Polo</h1>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {polos.map((p) => {
          const alunosDoPolo = relatorioAlunos.filter((a) => a.polo === p.polo);
          const pctConclusao = p.alunos > 0 ? Math.round((p.concluintes / p.alunos) * 100) : 0;
          const pctCert      = p.alunos > 0 ? Math.round((p.certificados / p.alunos) * 100) : 0;

          const areaFreqs = ["matematica","linguagens","cienciasNatureza","cienciasHumanas","interarea"] as const;
          const areaLabels: Record<string, string> = {
            matematica: "Matemática", linguagens: "Linguagens",
            cienciasNatureza: "C. Natureza", cienciasHumanas: "C. Humanas", interarea: "Interárea",
          };
          const areaAvgs = areaFreqs.map((k) => {
            const vals = alunosDoPolo.map((a) => a.freq[k]);
            return { key: k, label: areaLabels[k], avg: vals.length > 0 ? Math.round(vals.reduce((s,v) => s+v,0)/vals.length) : 0 };
          });

          return (
            <div key={p.polo} className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-6 py-4">
                <h2 className="text-lg font-extrabold text-white">📍 Polo {p.polo}</h2>
              </div>

              {/* Métricas principais */}
              <div className="grid grid-cols-3 gap-px bg-gray-100">
                {[
                  { label: "Alunos",      value: p.alunos      },
                  { label: "Professores", value: p.professores  },
                  { label: "Turmas",      value: p.turmas       },
                ].map((m) => (
                  <div key={m.label} className="bg-white p-4 text-center">
                    <p className="text-2xl font-extrabold text-[#0f2d52]">{m.value}</p>
                    <p className="text-xs text-gray-500">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 space-y-5">
                {/* Frequência média geral */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Frequência Média Geral</span>
                    <span className={`font-extrabold text-sm ${freqTextColor(p.freqGeral)}`}>{p.freqGeral}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${freqColor(p.freqGeral)}`} style={{ width: `${p.freqGeral}%` }} />
                  </div>
                </div>

                {/* Frequência por área */}
                <div>
                  <p className="mb-2 text-xs font-bold text-gray-500">Frequência por Área</p>
                  <div className="space-y-2">
                    {areaAvgs.map((a) => (
                      <div key={a.key}>
                        <div className="mb-0.5 flex justify-between text-xs">
                          <span className="text-gray-600">{a.label}</span>
                          <span className={`font-bold ${freqTextColor(a.avg)}`}>{a.avg}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div className={`h-full rounded-full ${freqColor(a.avg)}`} style={{ width: `${a.avg}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concluintes e certificados */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-green-50 p-3 text-center">
                    <p className="text-xl font-extrabold text-green-700">{p.concluintes}</p>
                    <p className="text-xs text-green-600">Concluintes ({pctConclusao}%)</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3 text-center">
                    <p className="text-xl font-extrabold text-[#1565c0]">{p.certificados}</p>
                    <p className="text-xs text-blue-600">Certificados ({pctCert}%)</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
