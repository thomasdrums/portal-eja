import Link from "next/link";

const ITENS = [
  { href: "/coordenacao/professores",   emoji: "👨‍🏫", title: "Gestão de Professores", desc: "Cadastrar, editar e inativar professores" },
  { href: "/coordenacao/gestao-turmas", emoji: "📚",  title: "Gestão de Turmas",       desc: "Criar, editar e encerrar turmas" },
] as const;

export default function GestaoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/coordenacao" className="mb-6 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Visão Geral
      </Link>

      <h1 className="mb-8 text-xl font-extrabold text-[#0f2d52]">⚙️ Gestão</h1>

      <div className="space-y-4">
        {ITENS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-5 rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition hover:shadow-lg hover:ring-[#1565c0]/40"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] text-3xl shadow">
              {item.emoji}
            </span>
            <div>
              <p className="font-bold text-gray-800 group-hover:text-[#0f2d52]">{item.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
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
