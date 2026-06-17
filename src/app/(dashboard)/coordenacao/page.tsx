import Link from "next/link";
import { CardStat } from "@/components/dashboard/CardStat";
import {
  coordenacaoIndicadores,
  coordenacaoProfessores,
  coordenacaoTurmas,
} from "@/lib/mock-data/coordenacao";

export default function CoordenacaoDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Visão geral</h1>
        <p className="text-sm text-gray-500">Painel da coordenação</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardStat label="Alunos" value={coordenacaoIndicadores.totalAlunos} />
        <CardStat label="Professores" value={coordenacaoIndicadores.totalProfessores} />
        <CardStat label="Turmas" value={coordenacaoIndicadores.totalTurmas} />
        <CardStat
          label="Frequência média"
          value={`${coordenacaoIndicadores.frequenciaMediaGeral}%`}
        />
      </div>

      {/* Acesso rápido — Relatórios */}
      <Link
        href="/coordenacao/relatorios"
        className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg transition hover:opacity-90"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">📊</span>
        <div>
          <p className="font-bold text-lg">Relatórios</p>
          <p className="text-sm text-white/70">Indicadores gerais, frequência, notas, concluintes, certificados e mais</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="ml-auto h-5 w-5 shrink-0 text-white/60">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Turmas</h2>
          <ul className="space-y-3">
            {coordenacaoTurmas.map((turma) => (
              <li key={turma.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">{turma.nome}</p>
                  <span className="text-gray-500">{turma.alunos} alunos</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{turma.professor}</span>
                  <span
                    className={
                      turma.status.startsWith("Atenção")
                        ? "font-medium text-amber-600"
                        : ""
                    }
                  >
                    {turma.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Professores
          </h2>
          <ul className="space-y-3">
            {coordenacaoProfessores.map((professor) => (
              <li
                key={professor.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-gray-700">{professor.nome}</p>
                  <p className="text-xs text-gray-400">{professor.disciplina}</p>
                </div>
                <span className="text-gray-500">{professor.turmas} turmas</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
