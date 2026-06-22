import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { relatorioProfessores, POLOS } from "@/lib/mock-data/relatorios";

const disciplinaColor: Record<string, string> = {
  "Matemática":           "bg-[#EAF6EE] text-[#007A33]",
  "Linguagens":           "bg-teal-50 text-teal-700",
  "Ciências da Natureza": "bg-green-50 text-green-700",
  "Ciências Humanas":     "bg-purple-50 text-purple-700",
};

export default function RelatorioProfessoresPage() {
  const totalTurmas = relatorioProfessores.reduce((s, p) => s + p.turmas, 0);
  const totalAulas  = relatorioProfessores.reduce((s, p) => s + p.aulasCadastradas, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Relatório de Professores</h1>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total de Professores", value: relatorioProfessores.length },
          { label: "Turmas atendidas",     value: totalTurmas                 },
          { label: "Aulas cadastradas",    value: totalAulas                  },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-semibold text-[#4B5563]">{c.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {POLOS.map((polo) => {
          const profs = relatorioProfessores.filter((p) => p.polo === polo);
          if (profs.length === 0) return null;
          return (
            <div key={polo} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="bg-[#009640] px-5 py-3">
                <p className="text-sm font-bold text-white">Polo {polo}</p>
              </div>
              <ul className="divide-y divide-[#E5E7EB]">
                {profs.map((p) => (
                  <li key={p.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#EAF6EE] text-sm font-bold text-[#009640]">
                      {p.nome.split(" ").map((n) => n[0]).slice(0,2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800">{p.nome}</p>
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${disciplinaColor[p.disciplina] ?? "bg-gray-100 text-gray-600"}`}>
                        {p.disciplina}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <p className="text-base font-extrabold text-gray-900">{p.turmas}</p>
                        <p className="text-[#4B5563]">turmas</p>
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-gray-900">{p.alunos}</p>
                        <p className="text-[#4B5563]">alunos</p>
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-gray-900">{p.aulasCadastradas}</p>
                        <p className="text-[#4B5563]">aulas</p>
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
