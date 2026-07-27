import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";
import { carregarRelatorioTurmas } from "@/lib/queries/relatorios";

// Lê as turmas reais do banco a cada carga.
export const dynamic = "force-dynamic";

// Situações exibidas nos indicadores da turma (mesma lista de hoje).
const SITUACOES: (keyof typeof SITUACAO_CFG)[] = [
  "APROVADO",
  "CURSANDO",
  "EM_PROCESSO",
  "RDS",
  "EVADIDO",
  "DESISTENTE",
];

export default async function RelatorioTurmasPage() {
  const { linhas, polos, turmasAtivas, totalAlunos, totalAtivos, freqGeral } =
    await carregarRelatorioTurmas();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Relatório de Turmas</h1>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Turmas Ativas",     value: turmasAtivas },
          { label: "Total de Alunos",   value: totalAlunos  },
          { label: "Alunos Ativos",     value: totalAtivos  },
          { label: "Freq. Média Geral", value: `${freqGeral}%` },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-semibold text-[#4B5563]">{c.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {polos.map((polo) => {
        const turmasPolo = linhas.filter((d) => d.poloNome === polo);
        if (turmasPolo.length === 0) return null;
        return (
          <section key={polo}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#4B5563]">{polo}</h2>
            <div className="space-y-3">
              {turmasPolo.map((turma) => {
                const { total, ativos, freqMed, counts } = turma;
                const ativa = turma.status === "EM_ANDAMENTO";
                return (
                  <div key={turma.id} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between bg-[#009640] px-5 py-3">
                      <div>
                        <span className="font-bold text-white">{turma.nome}</span>
                        <span className="ml-3 text-xs text-white/70">
                          {turma.etapaEnsino ?? "—"}{turma.ano ? ` · ${turma.ano}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{total} alunos</span>
                        <span className={`rounded px-2.5 py-0.5 text-xs font-bold ${freqMed >= 75 ? "bg-white/90 text-[#007A33]" : freqMed >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                          Freq. {freqMed}%
                        </span>
                        <span className={`rounded px-2.5 py-0.5 text-xs font-bold ${ativa ? "bg-white/90 text-[#007A33]" : "bg-white/20 text-white"}`}>
                          {ativa ? "Ativa" : "Encerrada"}
                        </span>
                      </div>
                    </div>

                    <div className="px-5 py-3">
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {SITUACOES.map((s) => {
                          const count = counts[s] ?? 0;
                          if (count === 0) return null;
                          const cfg = SITUACAO_CFG[s];
                          return (
                            <span key={s} className={`rounded px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
                              {cfg.label}: {count}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {turma.professores.map((p) => (
                          <span key={p} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{p}</span>
                        ))}
                      </div>
                    </div>

                    {total > 0 && (
                      <div className="px-5 pb-4">
                        <div className="mb-1 flex justify-between text-xs text-[#4B5563]">
                          <span>{ativos} ativos</span>
                          <span>{Math.round((ativos / total) * 100)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-[#009640]" style={{ width: `${Math.round((ativos / total) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
