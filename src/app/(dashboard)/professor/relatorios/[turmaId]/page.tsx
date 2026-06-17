import Link from "next/link";
import { notFound } from "next/navigation";
import {
  professorTurmas,
  SITUACAO_CFG,
  isAtivo,
  type Aluno,
} from "@/lib/mock-data/professor";

function freqGeral(aluno: Aluno): number {
  const areas = Object.values(aluno.frequencia);
  const totalAulas    = areas.reduce((s, a) => s + a.totalAulas, 0);
  const totalPresenca = areas.reduce((s, a) => s + a.presencas, 0);
  if (totalAulas === 0) return 0;
  return Math.round((totalPresenca / totalAulas) * 100);
}

function freqColor(p: number) {
  if (p >= 75) return "text-green-600";
  if (p >= 50) return "text-yellow-600";
  return "text-red-500";
}

export default async function RelatorioTurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const turma = professorTurmas.find((t) => t.id === turmaId);
  if (!turma) notFound();

  const alunos      = turma.alunos;
  const total       = alunos.length;
  const aprovados   = alunos.filter((a) => a.situacao === "APROVADO").length;
  const cursando    = alunos.filter((a) => a.situacao === "CURSANDO").length;
  const emProcesso  = alunos.filter((a) => a.situacao === "EM_PROCESSO").length;
  const rds         = alunos.filter((a) => a.situacao === "RDS").length;
  const evadidos    = alunos.filter((a) => a.situacao === "EVADIDO").length;
  const desistentes = alunos.filter((a) => a.situacao === "DESISTENTE").length;

  const resumo = [
    { label: "Total",       value: total,        bg: "bg-gray-50",    text: "text-gray-700"  },
    { label: "Aprovados",   value: aprovados,    bg: "bg-green-50",   text: "text-green-700" },
    { label: "Cursando",    value: cursando,     bg: "bg-blue-50",    text: "text-blue-700"  },
    { label: "Em Processo", value: emProcesso,   bg: "bg-amber-50",   text: "text-amber-700" },
    { label: "RDS",         value: rds,          bg: "bg-purple-50",  text: "text-purple-700"},
    { label: "Evadidos",    value: evadidos,     bg: "bg-orange-50",  text: "text-orange-700"},
    { label: "Desistentes", value: desistentes,  bg: "bg-red-50",     text: "text-red-600"   },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/professor/relatorios"
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Relatórios
      </Link>

      <h1 className="mb-1 text-xl font-bold text-[#0f2d52]">{turma.nome}</h1>
      <p className="mb-6 text-sm text-gray-500">Relatório da turma</p>

      {/* Resumo da Turma */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-gray-700">Resumo da Turma</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {resumo.map((r) => (
            <div key={r.label} className={`rounded-2xl ${r.bg} p-3 text-center`}>
              <p className={`text-xs font-semibold ${r.text}`}>{r.label}</p>
              <p className={`mt-1 text-2xl font-bold ${r.text}`}>{r.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Relatório Individual */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-gray-700">Relatório Individual</h2>
        <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
          {/* Cabeçalho da tabela */}
          <div className="hidden grid-cols-4 gap-4 bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white sm:grid">
            <span>Nome</span>
            <span>Cidade</span>
            <span>Freq. Geral</span>
            <span>Situação</span>
          </div>

          <ul className="divide-y divide-gray-50">
            {alunos.map((aluno) => {
              const freq = freqGeral(aluno);
              const cfg  = SITUACAO_CFG[aluno.situacao];
              return (
                <li
                  key={aluno.id}
                  className="grid grid-cols-1 gap-1 px-5 py-4 text-sm sm:grid-cols-4 sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e8f4fd] text-xs font-bold text-[#0f2d52]">
                      {aluno.nome.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                    </div>
                    <span className="font-semibold text-gray-800 truncate">{aluno.nome}</span>
                  </div>
                  <span className="text-gray-600">{aluno.cidade}</span>
                  <span className={`font-bold ${freqColor(freq)}`}>{freq}%</span>
                  <span>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
