"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { relatorioAlunos, type AlunoRel, type Observacao } from "@/lib/mock-data/relatorios";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";
import { turmasCoord } from "@/lib/mock-data/coordenacao";

const SITS = ["APROVADO","CURSANDO","EM_PROCESSO","RDS","EVADIDO","DESISTENTE"] as const;

const AREAS = [
  { key: "matematica"       as const, label: "Matemática",  comps: ["C1","C2","C3","C4","C5"] },
  { key: "linguagens"       as const, label: "Linguagens",  comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasNatureza" as const, label: "C. Natureza", comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasHumanas"  as const, label: "C. Humanas",  comps: ["C1","C2","C3","C4"]      },
];

function freqMed(a: AlunoRel) {
  const vals = Object.values(a.freq);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}
function freqColor(p: number) { return p >= 75 ? "text-green-600" : p >= 50 ? "text-amber-600" : "text-red-500"; }
function freqBg(p: number)    { return p >= 75 ? "bg-[#EAF6EE]"   : p >= 50 ? "bg-amber-50"   : "bg-red-50";   }
function notaColor(n: number | null) {
  if (n === null) return "text-gray-300";
  return n >= 60 ? "text-green-600" : "text-red-500";
}

function AlunoPanel({ aluno, obsMap, onAddObs, onEditObs }: {
  aluno: AlunoRel;
  obsMap: Record<string, Observacao[]>;
  onAddObs: (alunoId: string, texto: string) => void;
  onEditObs: (alunoId: string, idx: number, texto: string) => void;
}) {
  const [tab, setTab]         = useState<"dados" | "notas" | "obs">("dados");
  const [novaObs, setNovaObs] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editTxt, setEditTxt] = useState("");
  const cfg  = SITUACAO_CFG[aluno.situacao];
  const freq = freqMed(aluno);
  const obs  = obsMap[aluno.id] ?? [];

  function submitObs() {
    if (!novaObs.trim()) return;
    onAddObs(aluno.id, novaObs.trim());
    setNovaObs("");
  }
  function submitEdit(idx: number) {
    if (!editTxt.trim()) return;
    onEditObs(aluno.id, idx, editTxt.trim());
    setEditIdx(null);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#009640] px-5 py-3">
        <div>
          <p className="font-bold text-white">{aluno.nome}</p>
          <p className="text-xs text-white/70">{aluno.cidade} · Freq. geral: <span className="font-semibold text-white">{freq}%</span></p>
        </div>
        <span className={`rounded px-2.5 py-0.5 text-xs font-bold ${cfg.classes}`} title={cfg.descricao}>{cfg.label}</span>
      </div>

      <div className="flex border-b border-[#E5E7EB]">
        {([["dados","Dados"],["notas","Notas"],["obs","Observações"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${tab === k ? "border-b-2 border-[#009640] text-[#009640]" : "text-[#4B5563] hover:text-gray-700"}`}
          >{l}</button>
        ))}
      </div>

      <div className="p-5">
        {tab === "dados" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {AREAS.map((ar) => {
                const f = aluno.freq[ar.key];
                return (
                  <div key={ar.key} className={`rounded p-3 text-center ${freqBg(f)}`}>
                    <p className={`text-lg font-extrabold ${freqColor(f)}`}>{f}%</p>
                    <p className="text-xs text-[#4B5563]">{ar.label}</p>
                  </div>
                );
              })}
              <div className={`rounded p-3 text-center ${freqBg(freq)}`}>
                <p className={`text-lg font-extrabold ${freqColor(freq)}`}>{freq}%</p>
                <p className="text-xs text-[#4B5563]">Geral</p>
              </div>
            </div>
            {aluno.dataConclusao && (
              <p className="text-xs text-[#4B5563]">Conclusão: <span className="font-semibold text-[#007A33]">{aluno.dataConclusao}</span></p>
            )}
          </div>
        )}

        {tab === "notas" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {AREAS.map((ar) => (
              <div key={ar.key}>
                <p className="mb-2 text-xs font-bold text-gray-600">{ar.label}</p>
                <div className="space-y-1">
                  {ar.comps.map((c) => {
                    const nota = aluno.notas[ar.key][c];
                    return (
                      <div key={c} className="flex justify-between text-xs">
                        <span className="text-gray-400">{c}</span>
                        <span className={`font-bold ${notaColor(nota)}`}>{nota ?? "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "obs" && (
          <div className="space-y-3">
            {obs.length === 0 && (
              <p className="text-xs text-gray-400">Sem observações registradas.</p>
            )}
            {obs.map((o, i) => (
              <div key={i} className="rounded border border-[#E5E7EB] bg-gray-50 p-3">
                {editIdx === i ? (
                  <div className="space-y-2">
                    <textarea
                      value={editTxt}
                      onChange={(e) => setEditTxt(e.target.value)}
                      rows={2}
                      className="w-full rounded border border-[#D9D9D9] px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009640]"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => submitEdit(i)} className="rounded bg-[#009640] px-3 py-1 text-xs font-bold text-white hover:bg-[#007A33]">Salvar</button>
                      <button onClick={() => setEditIdx(null)} className="rounded border border-[#D9D9D9] px-3 py-1 text-xs text-gray-500 hover:bg-gray-100">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-1 text-xs text-gray-400">{o.data} · {o.professor}</p>
                    <p className="text-xs text-gray-700">{o.texto}</p>
                    <button onClick={() => { setEditIdx(i); setEditTxt(o.texto); }} className="mt-1 text-[10px] font-semibold text-[#009640] hover:underline">
                      Editar
                    </button>
                  </>
                )}
              </div>
            ))}

            <div className="mt-3 space-y-2 border-t border-[#E5E7EB] pt-3">
              <p className="text-xs font-semibold text-[#4B5563]">Nova observação</p>
              <textarea
                value={novaObs}
                onChange={(e) => setNovaObs(e.target.value)}
                rows={2}
                placeholder="Escreva uma observação pedagógica…"
                className="w-full rounded border border-[#D9D9D9] px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#009640] focus:ring-1 focus:ring-[#009640]/20"
              />
              <button
                onClick={submitObs}
                disabled={!novaObs.trim()}
                className="rounded bg-[#009640] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-[#007A33]"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcompanhamentoTurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = use(params);
  const turma = turmasCoord.find((t) => t.id === turmaId);
  if (!turma) notFound();

  const alunosIniciais = relatorioAlunos.filter((a) => a.turmaNome === turma.nome);

  const [obsMap, setObsMap] = useState<Record<string, Observacao[]>>(() =>
    Object.fromEntries(alunosIniciais.map((a) => [a.id, [...a.observacoes]]))
  );

  function addObs(alunoId: string, texto: string) {
    setObsMap((m) => ({
      ...m,
      [alunoId]: [...(m[alunoId] ?? []), { data: new Date().toLocaleDateString("pt-BR"), professor: "Coordenação", texto }],
    }));
  }

  function editObs(alunoId: string, idx: number, texto: string) {
    setObsMap((m) => {
      const arr = [...(m[alunoId] ?? [])];
      arr[idx] = { ...arr[idx]!, texto };
      return { ...m, [alunoId]: arr };
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/coordenacao/acompanhamento" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Acompanhamento
      </Link>

      <div className="overflow-hidden rounded-lg bg-[#009640] p-6 text-white">
        <h1 className="text-xl font-extrabold">{turma.nome}</h1>
        <p className="text-sm text-white/70">{turma.polo} · {turma.etapa} · {turma.ano}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {turma.professores.map((p) => (
            <span key={p} className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{p}</span>
          ))}
        </div>
      </div>

      {alunosIniciais.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {SITS.map((s) => {
            const count = alunosIniciais.filter((a) => a.situacao === s).length;
            const cfg   = SITUACAO_CFG[s];
            return (
              <div key={s} className={`rounded-lg p-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${cfg.classes}`}>
                <p className="text-2xl font-extrabold">{count}</p>
                <p className="text-xs font-semibold">{cfg.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {alunosIniciais.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
          <p className="text-sm text-[#4B5563]">Nenhum aluno registrado para esta turma.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alunosIniciais.map((a) => (
            <AlunoPanel key={a.id} aluno={a} obsMap={obsMap} onAddObs={addObs} onEditObs={editObs} />
          ))}
        </div>
      )}
    </div>
  );
}
