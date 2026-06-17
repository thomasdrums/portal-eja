import Link from "next/link";
import { relatorioAlunos, POLOS } from "@/lib/mock-data/relatorios";
import { SITUACAO_CFG, isAtivo } from "@/lib/mock-data/professor";
import { turmasCoord } from "@/lib/mock-data/coordenacao";

const SITUACOES = ["APROVADO","CURSANDO","EM_PROCESSO","RDS","EVADIDO","DESISTENTE"] as const;

export default function RelatorioTurmasPage() {
  const dados = turmasCoord.map((turma) => {
    const alunos = relatorioAlunos.filter((a) => a.turmaNome === turma.nome);
    const total  = alunos.length;
    const ativos = alunos.filter((a) => isAtivo(a.situacao)).length;
    const freqs  = alunos.map((a) => {
      const vals = Object.values(a.freq);
      return vals.reduce((s, v) => s + v, 0) / vals.length;
    });
    const freqMed = freqs.length > 0 ? Math.round(freqs.reduce((s, v) => s + v, 0) / freqs.length) : 0;
    const counts  = Object.fromEntries(SITUACOES.map((s) => [s, alunos.filter((a) => a.situacao === s).length])) as Record<string, number>;
    return { turma, total, ativos, freqMed, counts };
  });

  const totalAlunos    = dados.reduce((s, d) => s + d.total, 0);
  const totalAtivos    = dados.reduce((s, d) => s + d.ativos, 0);
  const turmasAtivas   = turmasCoord.filter((t) => t.status === "ativa").length;
  const freqGeral      = dados.filter((d) => d.total > 0).length > 0
    ? Math.round(dados.filter((d) => d.total > 0).reduce((s, d) => s + d.freqMed, 0) / dados.filter((d) => d.total > 0).length)
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/coordenacao/relatorios" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Relatórios
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f2d52]">📚 Relatório de Turmas</h1>
          <p className="text-sm text-gray-500">{turmasCoord.length} turmas cadastradas</p>
        </div>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      {/* Indicadores */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Turmas Ativas</p>
          <p className="text-3xl font-extrabold">{turmasAtivas}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#166534] to-[#16a34a] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Total de Alunos</p>
          <p className="text-3xl font-extrabold">{totalAlunos}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#581c87] to-[#7e22ce] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Alunos Ativos</p>
          <p className="text-3xl font-extrabold">{totalAtivos}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#134e4a] to-[#0d9488] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Freq. Média Geral</p>
          <p className="text-3xl font-extrabold">{freqGeral}%</p>
        </div>
      </div>

      {/* Cards por polo */}
      {POLOS.map((polo) => {
        const turmasPolo = dados.filter((d) => d.turma.polo === polo);
        if (turmasPolo.length === 0) return null;
        return (
          <section key={polo} className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">{polo}</h2>
            <div className="space-y-3">
              {turmasPolo.map(({ turma, total, ativos, freqMed, counts }) => (
                <div key={turma.id} className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3">
                    <div>
                      <span className="font-bold text-white">{turma.nome}</span>
                      <span className="ml-3 text-xs text-white/60">{turma.etapa} · {turma.ano}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{total} alunos</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${freqMed >= 75 ? "bg-green-100 text-green-700" : freqMed >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                        Freq. {freqMed}%
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${turma.status === "ativa" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                        {turma.status === "ativa" ? "Ativa" : "Encerrada"}
                      </span>
                    </div>
                  </div>

                  {/* Situações + professores */}
                  <div className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {SITUACOES.map((s) => {
                        const count = counts[s] ?? 0;
                        if (count === 0) return null;
                        const cfg = SITUACAO_CFG[s];
                        return (
                          <span key={s} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
                            {cfg.label}: {count}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {turma.professores.map((p) => (
                        <span key={p} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{p}</span>
                      ))}
                    </div>
                  </div>

                  {/* Barra ativos */}
                  {total > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{ativos} ativos</span>
                        <span>{Math.round((ativos / total) * 100)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-[#1565c0]" style={{ width: `${Math.round((ativos / total) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
