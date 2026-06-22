import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { dadosPorPolo, relatorioAlunos, freqColor, freqTextColor } from "@/lib/mock-data/relatorios";

export default function RelatorioPorPoloPage() {
  const polos = dadosPorPolo();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Relatório por Polo</h1>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            <div key={p.polo} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="bg-[#009640] px-6 py-4">
                <h2 className="text-base font-bold text-white">Polo {p.polo}</h2>
              </div>

              <div className="grid grid-cols-3 gap-px bg-[#E5E7EB]">
                {[
                  { label: "Alunos",      value: p.alunos      },
                  { label: "Professores", value: p.professores  },
                  { label: "Turmas",      value: p.turmas       },
                ].map((m) => (
                  <div key={m.label} className="bg-white p-4 text-center">
                    <p className="text-2xl font-extrabold text-gray-900">{m.value}</p>
                    <p className="text-xs text-[#4B5563]">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Frequência Média Geral</span>
                    <span className={`text-sm font-extrabold ${freqTextColor(p.freqGeral)}`}>{p.freqGeral}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${freqColor(p.freqGeral)}`} style={{ width: `${p.freqGeral}%` }} />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-[#4B5563]">Frequência por Área</p>
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded bg-[#EAF6EE] p-3 text-center">
                    <p className="text-xl font-extrabold text-[#007A33]">{p.concluintes}</p>
                    <p className="text-xs text-[#007A33]">Concluintes ({pctConclusao}%)</p>
                  </div>
                  <div className="rounded border border-[#E5E7EB] bg-white p-3 text-center">
                    <p className="text-xl font-extrabold text-gray-900">{p.certificados}</p>
                    <p className="text-xs text-[#4B5563]">Certificados ({pctCert}%)</p>
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
