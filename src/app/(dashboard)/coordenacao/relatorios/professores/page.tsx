import Link from "next/link";
import { relatorioProfessores, POLOS } from "@/lib/mock-data/relatorios";

const DISCIPLINAS = [...new Set(relatorioProfessores.map((p) => p.disciplina))].sort();

const disciplinaColor: Record<string, string> = {
  "Matemática":           "bg-blue-100 text-blue-700",
  "Linguagens":           "bg-teal-100 text-teal-700",
  "Ciências da Natureza": "bg-green-100 text-green-700",
  "Ciências Humanas":     "bg-purple-100 text-purple-700",
};

export default function RelatorioProfessoresPage() {
  const totalTurmas = relatorioProfessores.reduce((s, p) => s + p.turmas, 0);
  const totalAlunos = relatorioProfessores.reduce((s, p) => s + p.alunos, 0);
  const totalAulas  = relatorioProfessores.reduce((s, p) => s + p.aulasCadastradas, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/coordenacao/relatorios" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Relatórios
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#0f2d52]">👨‍🏫 Relatório de Professores</h1>
        <button className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50">⬇ Exportar</button>
      </div>

      {/* Indicadores */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Total de Professores</p>
          <p className="text-3xl font-extrabold">{relatorioProfessores.length}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#581c87] to-[#7e22ce] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Turmas atendidas</p>
          <p className="text-3xl font-extrabold">{totalTurmas}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#134e4a] to-[#0d9488] p-5 text-white shadow-lg">
          <p className="text-xs font-semibold text-white/60">Aulas cadastradas</p>
          <p className="text-3xl font-extrabold">{totalAulas}</p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {POLOS.map((polo) => {
          const profs = relatorioProfessores.filter((p) => p.polo === polo);
          if (profs.length === 0) return null;
          return (
            <div key={polo} className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
              <div className="bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3">
                <p className="font-bold text-white text-sm">📍 Polo {polo}</p>
              </div>
              <ul className="divide-y divide-gray-50">
                {profs.map((p) => (
                  <li key={p.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f4fd] text-sm font-bold text-[#1565c0]">
                      {p.nome.split(" ").map((n) => n[0]).slice(0,2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{p.nome}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${disciplinaColor[p.disciplina] ?? "bg-gray-100 text-gray-600"}`}>
                        {p.disciplina}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <p className="font-extrabold text-[#0f2d52] text-base">{p.turmas}</p>
                        <p className="text-gray-400">turmas</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-[#0f2d52] text-base">{p.alunos}</p>
                        <p className="text-gray-400">alunos</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-[#0f2d52] text-base">{p.aulasCadastradas}</p>
                        <p className="text-gray-400">aulas</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
