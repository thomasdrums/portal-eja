import Link from "next/link";

const cards = [
  {
    href: "/professor/turmas",
    label: "Turmas",
    sub: "Alunos e fichas",
    gradient: "from-[#1565c0] to-[#1e88e5]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    href: "/professor/aulas",
    label: "Aulas Gravadas",
    sub: "Cadastrar e gerenciar",
    gradient: "from-[#00695c] to-[#00897b]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
    ),
  },
];

export default function ProfessorDashboardPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-5 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#0f2d52]">Olá, Professor! 👋</h1>
        <p className="mt-1 text-sm text-gray-500">Portal EJA · Área do Professor</p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <div className="flex aspect-square flex-col items-center justify-center gap-4 rounded-3xl bg-white shadow-lg ring-1 ring-gray-100 transition-all active:scale-95 group-hover:shadow-xl">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} shadow-md`}>
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
