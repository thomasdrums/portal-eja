import { CheckCircle2, Clock, Calendar } from "lucide-react";
import type { AreaAcademica } from "@/lib/mock-data/aluno";

function isAreaAprovada(area: AreaAcademica): boolean {
  return (
    area.frequencia === 100 && area.competencias.every((c) => c.nota >= 60)
  );
}

function CompBar({ nota }: { nota: number }) {
  const pct = Math.min(nota, 100);
  const ok = nota >= 60;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
      <div
        className={`h-full rounded-full ${ok ? "bg-[#009640]" : "bg-red-400"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function AreaCard({ area }: { area: AreaAcademica }) {
  const aprovada = isAreaAprovada(area);
  const freqOk = area.frequencia === 100;

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#009640] px-5 py-3.5">
        <h3 className="text-sm font-semibold text-white">{area.nome}</h3>
        <span
          className={`flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-semibold ${
            aprovada ? "bg-white/20 text-white" : "bg-white/10 text-white/80"
          }`}
        >
          {aprovada ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {aprovada ? "APROVADO" : "EM ANDAMENTO"}
        </span>
      </div>

      {/* Competencias */}
      <div className="divide-y divide-[#F3F4F6] px-5">
        {area.competencias.map((c) => {
          const ok = c.nota >= 60;
          return (
            <div key={c.id} className="py-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4B5563]">{c.id}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${ok ? "text-[#009640]" : "text-red-500"}`}>
                    {c.nota}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      ok ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {ok ? "Aprovado" : "Pendente"}
                  </span>
                </div>
              </div>
              <CompBar nota={c.nota} />
            </div>
          );
        })}
      </div>

      {/* Frequencia */}
      <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3">
        <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
          <Calendar size={13} />
          Frequência
        </div>
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-bold ${
            freqOk ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-600"
          }`}
        >
          {area.frequencia}%{freqOk ? " — Completa" : ""}
        </span>
      </div>

      {/* CTA aprovado */}
      {aprovada && (
        <div className="border-t border-[#E5E7EB] px-5 py-4">
          <p className="mb-2 text-sm font-semibold text-[#007A33]">
            Area concluida com sucesso. Voce pode ingressar no grupo da proxima etapa.
          </p>
          <a
            href={area.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#009640] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33]"
          >
            Entrar no grupo da proxima etapa
          </a>
        </div>
      )}
    </div>
  );
}
