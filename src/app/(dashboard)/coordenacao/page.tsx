import Link from "next/link";

const MODULOS = [
  { href: "/coordenacao/gestao",         emoji: "⚙️",  title: "Gestão",           desc: "Professores e turmas" },
  { href: "/coordenacao/acompanhamento", emoji: "📋",  title: "Acompanhamento",   desc: "Situação das turmas e alunos" },
  { href: "/coordenacao/relatorios",     emoji: "📊",  title: "Relatórios",       desc: "Relatório por turma completo" },
  { href: "/coordenacao/relatorios/solicitacoes", emoji: "📨", title: "Documentos", desc: "Solicitações de documentos" },
  { href: "/coordenacao/relatorios/certificados", emoji: "📜", title: "Certificados","desc": "Emissão e entrega" },
  { href: "/coordenacao/relatorios/concluintes",  emoji: "🎓", title: "Concluintes", desc: "Alunos que concluíram" },
] as const;

export default function CoordenacaoDashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0f2d52]">Portal EJA SESI</h1>
        <p className="mt-1 text-sm text-gray-500">Coordenação · Acesso rápido aos módulos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULOS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-center gap-5 rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition hover:shadow-lg hover:ring-[#1565c0]/40"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] text-3xl shadow">
              {m.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-800 group-hover:text-[#0f2d52]">{m.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{m.desc}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="ml-auto h-5 w-5 shrink-0 text-gray-300 group-hover:text-[#1565c0]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
