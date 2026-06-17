import Link from "next/link";
import { alunoResumo } from "@/lib/mock-data/aluno";

const cards = [
  {
    href: "/aluno/notas",
    label: "Notas",
    sub: "Ver competências",
    gradient: "from-[#1565c0] to-[#1e88e5]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    href: "/aluno/frequencia",
    label: "Frequência",
    sub: "Presenças e faltas",
    gradient: "from-[#0277bd] to-[#0288d1]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    href: "/aluno/solicitacoes",
    label: "Solicitações",
    sub: "Documentos",
    gradient: "from-[#6a1b9a] to-[#8e24aa]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    href: "/aluno/aulas",
    label: "Aulas Gravadas",
    sub: "YouTube + presença",
    gradient: "from-[#00695c] to-[#00897b]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
    ),
  },
];

export default function AlunoDashboardPage() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem-5rem)] flex-col items-center justify-center px-5 py-8">
      {/* Greeting */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#0f2d52]">
          Olá, {alunoResumo.nome.split(" ")[0]}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">{alunoResumo.turma}</p>
      </div>

      {/* 4 big cards */}
      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <div className="flex aspect-square flex-col items-center justify-center gap-4 rounded-3xl bg-white shadow-lg ring-1 ring-gray-100 transition-all active:scale-95 group-hover:shadow-xl">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} shadow-md`}
              >
                {card.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">{card.label}</p>
                <p className="text-[10px] text-gray-400">{card.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
