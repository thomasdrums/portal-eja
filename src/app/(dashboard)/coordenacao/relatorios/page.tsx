import Link from "next/link";
import {
  indicadoresGerais,
  freqMediaPorArea,
  concluentesPorMes,
  solicitacoesPorTipo,
  dadosPorPolo,
  freqColor,
} from "@/lib/mock-data/relatorios";

// ── componentes locais ───────────────────────────────────
function StatCard({ label, value, sub, color = "blue" }: { label: string; value: string | number; sub?: string; color?: "blue" | "green" | "purple" | "amber" | "rose" | "teal" }) {
  const colors = {
    blue:   "from-[#0f2d52] to-[#1565c0]",
    green:  "from-[#166534] to-[#16a34a]",
    purple: "from-[#581c87] to-[#7e22ce]",
    amber:  "from-[#78350f] to-[#d97706]",
    rose:   "from-[#881337] to-[#e11d48]",
    teal:   "from-[#134e4a] to-[#0d9488]",
  };
  return (
    <div className={`rounded-3xl bg-gradient-to-br ${colors[color]} p-5 text-white shadow-lg`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/60">{sub}</p>}
    </div>
  );
}

function ReportCard({ href, emoji, title, desc }: { href: string; emoji: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group flex items-start gap-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 transition hover:shadow-lg hover:ring-[#1565c0]/30">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f4fd] text-2xl group-hover:bg-[#1565c0]/10">{emoji}</span>
      <div>
        <p className="font-bold text-gray-800">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="ml-auto h-5 w-5 shrink-0 text-gray-300 group-hover:text-[#1565c0]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 truncate text-xs font-medium text-gray-600">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-3">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-bold text-gray-700">{value}</span>
    </div>
  );
}

// ── página ───────────────────────────────────────────────
export default function RelatoriosPage() {
  const ind  = indicadoresGerais;
  const freq = freqMediaPorArea();
  const meses = concluentesPorMes();
  const tipos = solicitacoesPorTipo();
  const polos = dadosPorPolo();

  const maxMes  = Math.max(...meses.map(([,v]) => v), 1);
  const maxTipo = Math.max(...tipos.map(([,v]) => v), 1);
  const maxPolo = Math.max(...polos.map((p) => p.alunos), 1);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f2d52]">📊 Relatórios</h1>
          <p className="text-sm text-gray-500">Visão gerencial completa do sistema EJA</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">
            ⬇ Exportar PDF
          </button>
          <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">
            ⬇ Exportar Excel
          </button>
        </div>
      </div>

      {/* Indicadores gerais */}
      <section>
        <h2 className="mb-4 font-bold text-gray-700">Indicadores Gerais</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Alunos"             value={ind.totalAlunos}              color="blue"   />
          <StatCard label="Professores"         value={ind.totalProfessores}          color="teal"   />
          <StatCard label="Turmas"              value={ind.totalTurmas}               color="purple" />
          <StatCard label="Polos"               value={ind.totalPolos}                color="amber"  />
          <StatCard label="Solicitações"        value={ind.totalSolicitacoes}         color="rose"   />
          <StatCard label="Certificados emitidos" value={ind.totalCertificadosEmitidos} color="green"  />
        </div>
      </section>

      {/* Acesso rápido aos relatórios */}
      <section>
        <h2 className="mb-4 font-bold text-gray-700">Relatórios Detalhados</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReportCard href="/coordenacao/relatorios/alunos"       emoji="👥" title="Relatório de Alunos"       desc="Filtrar por polo, turma, cidade e situação" />
          <ReportCard href="/coordenacao/relatorios/frequencia"   emoji="📅" title="Relatório de Frequência"   desc="Frequência por área com indicadores de cor" />
          <ReportCard href="/coordenacao/relatorios/notas"        emoji="📝" title="Relatório de Notas"        desc="Competências, situação por área e contagens" />
          <ReportCard href="/coordenacao/relatorios/concluintes"  emoji="🎓" title="Relatório de Concluintes"  desc="Filtrar por mês, ano e polo" />
          <ReportCard href="/coordenacao/relatorios/certificados" emoji="📜" title="Relatório de Certificados" desc="Emitidos, entregues e pendentes" />
          <ReportCard href="/coordenacao/relatorios/professores"  emoji="👨‍🏫" title="Relatório de Professores"  desc="Área, polo, turmas e alunos atendidos" />
          <ReportCard href="/coordenacao/relatorios/solicitacoes" emoji="📨" title="Relatório de Solicitações" desc="Status e indicadores por tipo" />
          <ReportCard href="/coordenacao/relatorios/polo"         emoji="📍" title="Relatório por Polo"        desc="Visão gerencial por polo" />
        </div>
      </section>

      {/* Gráficos */}
      <section>
        <h2 className="mb-6 font-bold text-gray-700">Gráficos</h2>
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Frequência média por área */}
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
            <p className="mb-4 font-bold text-gray-800">Frequência Média por Área</p>
            <div className="space-y-3">
              {freq.map((f) => (
                <div key={f.area}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-gray-600">{f.nome}</span>
                    <span className="font-bold text-gray-700">{f.avg}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${freqColor(f.avg)}`} style={{ width: `${f.avg}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>🟢 ≥ 75%</span><span>🟡 50–74%</span><span>🔴 &lt; 50%</span>
            </div>
          </div>

          {/* Alunos por polo */}
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
            <p className="mb-4 font-bold text-gray-800">Alunos por Polo</p>
            <div className="space-y-3">
              {polos.map((p) => (
                <HBar key={p.polo} label={p.polo} value={p.alunos} max={maxPolo} color="bg-[#1565c0]" />
              ))}
            </div>
          </div>

          {/* Concluintes por mês */}
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
            <p className="mb-4 font-bold text-gray-800">Concluintes por Mês</p>
            {meses.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum concluinte ainda.</p>
            ) : (
              <div className="space-y-3">
                {meses.map(([mes, qtd]) => (
                  <HBar key={mes} label={mes} value={qtd} max={maxMes} color="bg-green-500" />
                ))}
              </div>
            )}
          </div>

          {/* Solicitações por tipo */}
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
            <p className="mb-4 font-bold text-gray-800">Solicitações por Tipo</p>
            <div className="space-y-3">
              {tipos.map(([tipo, qtd]) => (
                <HBar key={tipo} label={tipo} value={qtd} max={maxTipo} color="bg-purple-500" />
              ))}
            </div>
          </div>

          {/* Certificados emitidos por polo */}
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100 lg:col-span-2">
            <p className="mb-4 font-bold text-gray-800">Certificados Emitidos por Polo</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {polos.map((p) => {
                const pct = p.alunos > 0 ? Math.round((p.certificados / p.alunos) * 100) : 0;
                return (
                  <div key={p.polo} className="rounded-2xl bg-gray-50 p-4 text-center">
                    <p className="text-xs font-semibold text-gray-500">{p.polo}</p>
                    <p className="text-2xl font-extrabold text-[#0f2d52]">{p.certificados}</p>
                    <div className="mx-auto mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{pct}% dos alunos</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
