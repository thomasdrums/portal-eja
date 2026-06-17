import Link from "next/link";
import { alunoAulas } from "@/lib/mock-data/aluno";

type AreaConfig = {
  gradient: string;
  icon: React.ReactNode;
};

const areaConfig: Record<string, AreaConfig> = {
  "Matemática": {
    gradient: "from-[#0f2d52] to-[#1565c0]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-5 w-5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.745 3A23.933 23.933 0 003 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.759 1.5 5.74 1.5 9s-.533 6.241-1.5 9M8.25 8.885l1.444-.89a.75.75 0 011.105.402l2.402 7.206a.75.75 0 001.104.401l1.445-.889m-8.25.75l.213.09a1.687 1.687 0 002.062-.617l4.45-6.676a1.688 1.688 0 012.062-.618l.213.09" />
      </svg>
    ),
  },
  "Linguagens": {
    gradient: "from-[#0277bd] to-[#0288d1]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-5 w-5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  "Ciências da Natureza": {
    gradient: "from-[#00695c] to-[#00897b]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-5 w-5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  "Ciências Humanas": {
    gradient: "from-[#6a1b9a] to-[#8e24aa]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-5 w-5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  "Interárea": {
    gradient: "from-[#b45309] to-[#d97706]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-5 w-5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
};

const areaOrder = [
  "Matemática",
  "Linguagens",
  "Ciências da Natureza",
  "Ciências Humanas",
  "Interárea",
];

export default function AulasPage() {
  const byArea = areaOrder
    .map((area) => ({
      area,
      aulas: alunoAulas
        .filter((a) => a.area === area)
        .sort((a, b) => {
          const parseDate = (d: string) => {
            const [day, month, year] = d.split("/").map(Number);
            return new Date(year!, month! - 1, day!).getTime();
          };
          return parseDate(a.data) - parseDate(b.data);
        }),
    }))
    .filter((g) => g.aulas.length > 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back */}
      <Link
        href="/aluno"
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-bold text-[#0f2d52]">Aulas Gravadas</h1>

      <div className="space-y-8">
        {byArea.map(({ area, aulas }) => {
          const cfg = areaConfig[area] ?? areaConfig["Interárea"]!;

          return (
            <section key={area}>
              {/* Area header */}
              <div
                className={`mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r ${cfg.gradient} px-5 py-3.5 shadow-sm`}
              >
                {cfg.icon}
                <span className="font-bold text-white">{area}</span>
                <span className="ml-auto rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                  {aulas.length} aula{aulas.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Aula cards */}
              <div className="space-y-3">
                {aulas.map((aula) => (
                  <div
                    key={aula.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100"
                  >
                    {/* Left accent bar */}
                    <div className={`flex gap-4 p-5`}>
                      <div className={`w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b ${cfg.gradient}`} />

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 leading-snug">{aula.titulo}</p>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            {aula.professor}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {aula.data}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <a
                            href={aula.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${cfg.gradient} py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95`}
                          >
                            <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                            </svg>
                            Assistir Aula
                          </a>
                          <a
                            href={aula.formularioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 active:scale-95"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Registrar Presença
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
