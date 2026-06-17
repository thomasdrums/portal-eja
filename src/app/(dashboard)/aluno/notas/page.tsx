import Link from "next/link";
import { alunoAreas } from "@/lib/mock-data/aluno";

function isAprovada(area: (typeof alunoAreas)[number]) {
  return area.frequencia === 100 && area.competencias.every((c) => c.nota >= 60);
}

export default function NotasPage() {
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

      <h1 className="mb-6 text-xl font-bold text-[#0f2d52]">Notas por Área</h1>

      <div className="space-y-4">
        {alunoAreas.map((area) => {
          const aprovada = isAprovada(area);
          const freqOk = area.frequencia === 100;

          return (
            <div
              key={area.id}
              className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100"
            >
              {/* Card header */}
              <div
                className={`flex items-center justify-between px-5 py-4 ${
                  aprovada
                    ? "bg-gradient-to-r from-green-600 to-emerald-500"
                    : "bg-gradient-to-r from-[#0f2d52] to-[#1565c0]"
                }`}
              >
                <h2 className="font-bold text-white">{area.nome}</h2>
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
                  {aprovada ? "✓ APROVADO" : "EM ANDAMENTO"}
                </span>
              </div>

              {/* Competências */}
              <div className="divide-y divide-gray-50 px-5">
                {area.competencias.map((c) => {
                  const ok = c.nota >= 60;
                  return (
                    <div key={c.id} className="flex items-center justify-between py-3.5">
                      <span className="text-sm font-semibold text-gray-600">{c.id}</span>
                      <div className="flex items-center gap-3">
                        {/* Mini bar */}
                        <div className="hidden w-20 overflow-hidden rounded-full bg-gray-100 sm:block" style={{ height: 6 }}>
                          <div
                            className={`h-full rounded-full ${ok ? "bg-green-500" : "bg-red-400"}`}
                            style={{ width: `${Math.min(c.nota, 100)}%` }}
                          />
                        </div>
                        <span className={`w-8 text-right text-sm font-bold ${ok ? "text-green-600" : "text-red-500"}`}>
                          {c.nota}
                        </span>
                        <span className={`w-5 text-center text-base ${ok ? "text-green-500" : "text-red-400"}`}>
                          {ok ? "✓" : "✗"}
                        </span>
                        <span
                          className={`hidden w-16 rounded-lg py-0.5 text-center text-xs font-semibold sm:block ${
                            ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                          }`}
                        >
                          {ok ? "Aprovado" : "Pendente"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: frequência + situação */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Frequência:
                  <span className={`font-bold ${freqOk ? "text-green-600" : "text-red-500"}`}>
                    {area.frequencia}%
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                    aprovada
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {aprovada ? "Área concluída" : "Em andamento"}
                </span>
              </div>

              {/* WhatsApp CTA */}
              {aprovada && (
                <div className="mx-4 mb-4 mt-1 rounded-2xl bg-green-50 p-4 text-center">
                  <p className="mb-1 text-sm font-bold text-green-700">🎉 Parabéns! Área aprovada!</p>
                  <a
                    href={area.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Entrar no grupo do WhatsApp
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
