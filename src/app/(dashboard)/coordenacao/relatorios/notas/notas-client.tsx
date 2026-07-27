"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";
import type { SituacaoAluno } from "@prisma/client";
import type { RelatorioNotasData, NotasAreaCard } from "@/lib/queries/relatorios-avaliacao";

// Rótulo da situação, com fallback para valores fora da lista (ex.: INATIVO).
function cfgDe(s: SituacaoAluno): { label: string; classes: string } {
  return (
    SITUACAO_CFG[s as keyof typeof SITUACAO_CFG] ?? {
      label: s,
      classes: "bg-gray-100 text-gray-600",
    }
  );
}

// Cor da média por competência: aprovada = verde; tem nota mas não aprovada = vermelho; vazia = cinza.
function notaClasses(comp: NotasAreaCard["competencias"][number]) {
  if (!comp.temNota) return "text-gray-300";
  return comp.aprovada ? "text-green-600 font-bold" : "text-red-500 font-bold";
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20">
        <option value="">Todos</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function NotasClient({ dados }: { dados: RelatorioNotasData }) {
  const [polo,  setPolo]  = useState("");
  const [turma, setTurma] = useState("");
  const [area,  setArea]  = useState("");

  // Opções do seletor de Área (as 4 áreas, na ordem que os cards já usam).
  const areasOpcoes = useMemo(
    () => (dados.alunos[0]?.areas ?? []).map((a) => ({ value: a.areaId, label: a.label })),
    [dados.alunos],
  );

  const filtered = useMemo(() =>
    dados.alunos.filter((a) =>
      (!polo  || a.poloNome  === polo) &&
      (!turma || a.turmaNome === turma)
    ), [dados.alunos, polo, turma]);

  const aprovados   = filtered.filter((a) => a.situacao === "APROVADO").length;
  const emAndamento = filtered.filter((a) => a.situacao === "CURSANDO" || a.situacao === "EM_PROCESSO").length;
  const reprovados  = filtered.filter((a) => a.situacao === "EVADIDO" || a.situacao === "DESISTENTE").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Relatório de Notas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">{filtered.length} aluno{filtered.length !== 1 ? "s" : ""} · Verde ≥ 60 · Vermelho &lt; 60</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aprovados",     value: aprovados,   extra: "bg-[#EAF6EE]",                    text: "text-[#007A33]" },
          { label: "Em Processo",   value: emAndamento, extra: "border border-[#E5E7EB] bg-white", text: "text-gray-900"  },
          { label: "Evad./Desist.", value: reprovados,  extra: "border border-red-100 bg-red-50",  text: "text-red-600"   },
        ].map((c) => (
          <div key={c.label} className={`rounded-lg p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${c.extra}`}>
            <p className={`text-2xl font-extrabold ${c.text}`}>{c.value}</p>
            <p className="text-xs font-semibold text-[#4B5563]">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:grid-cols-3">
        <Select label="Polo"  value={polo}  onChange={setPolo}  options={dados.polos.map((p) => ({ value: p, label: p }))} />
        <Select label="Turma" value={turma} onChange={setTurma} options={dados.turmas.map((t) => ({ value: t, label: t }))} />
        <Select label="Área"  value={area}  onChange={setArea}  options={areasOpcoes} />
      </div>

      <div className="flex justify-end">
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#4B5563]">Nenhum aluno encontrado.</p>
          </div>
        ) : filtered.map((a) => {
          const cfg = cfgDe(a.situacao);
          const visibleAreas = area ? a.areas.filter((ar) => ar.areaId === area) : a.areas;
          return (
            <div key={a.id} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between bg-[#009640] px-5 py-3">
                <div>
                  <span className="font-bold text-white">{a.nome}</span>
                  <span className="ml-3 text-xs text-white/70">{a.poloNome} · {a.turmaNome}</span>
                </div>
                <span className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                  {cfg.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[#E5E7EB] sm:grid-cols-4">
                {visibleAreas.map((ar) => (
                  <div key={ar.areaId} className="bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-600">{ar.label}</p>
                      {ar.aprovadaArea !== null && (
                        <span className={`text-xs font-bold ${ar.aprovadaArea ? "text-green-600" : "text-red-500"}`}>
                          {ar.aprovadaArea ? "OK" : "—"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {ar.competencias.map((c) => (
                        <div key={c.codigo} className="flex justify-between text-xs">
                          <span className="text-gray-400">{c.codigo}</span>
                          <span className={notaClasses(c)}>{c.temNota ? c.mediaTexto : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
