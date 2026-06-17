"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { relatorioAlunos, type AlunoRel, type Observacao } from "@/lib/mock-data/relatorios";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";
import { turmasCoord } from "@/lib/mock-data/coordenacao";

const SITS = ["APROVADO","CURSANDO","EM_PROCESSO","RDS","EVADIDO","DESISTENTE"] as const;

const AREAS = [
  { key: "matematica"        as const, label: "Matemática",    comps: ["C1","C2","C3","C4","C5"] },
  { key: "linguagens"        as const, label: "Linguagens",    comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasNatureza"  as const, label: "C. Natureza",   comps: ["C1","C2","C3","C4"]      },
  { key: "cienciasHumanas"   as const, label: "C. Humanas",    comps: ["C1","C2","C3","C4"]      },
];

function freqMed(a: AlunoRel) {
  const vals = Object.values(a.freq);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}
function freqColor(p: number) { return p >= 75 ? "text-green-600" : p >= 50 ? "text-amber-600" : "text-red-500"; }
function notaColor(n: number | null) {
  if (n === null) return "text-gray-300";
  return n >= 60 ? "text-green-600" : "text-red-500";
}

// ── Componente: painel por aluno ────────────────────────────
function AlunoPanel({ aluno, obsMap, onAddObs, onEditObs }: {
  aluno: AlunoRel;
  obsMap: Record<string, Observacao[]>;
  onAddObs: (alunoId: string, texto: string) => void;
  onEditObs: (alunoId: string, idx: number, texto: string) => void;
}) {
  const [tab, setTab]     = useState<"dados" | "notas" | "obs">("dados");
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
    <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
      {/* Cabeçalho do aluno */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3">
        <div>
          <p className="font-bold text-white">{aluno.nome}</p>
          <p className="text-xs text-white/60">{aluno.cidade} · Freq. geral: <span className="font-semibold text-white">{freq}%</span></p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.classes}`} title={cfg.descricao}>{cfg.label}</span>
      </div>

      {/* Abas */}
      <div className="flex border-b border-gray-100">
        {([["dados","Dados"],["notas","Notas"],["obs","Observações"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${tab === k ? "border-b-2 border-[#1565c0] text-[#1565c0]" : "text-gray-500 hover:text-gray-700"}`}
          >{l}</button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <div className="p-5">
        {/* Dados */}
        {tab === "dados" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {AREAS.map((ar) => {
                const f = aluno.freq[ar.key];
                return (
                  <div key={ar.key} className={`rounded-2xl p-3 text-center ${f >= 75 ? "bg-green-50" : f >= 50 ? "bg-amber-50" : "bg-red-50"}`}>
                    <p className={`text-lg font-extrabold ${freqColor(f)}`}>{f}%</p>
                    <p className="text-xs text-gray-500">{ar.label}</p>
                  </div>
                );
              })}
              <div className={`rounded-2xl p-3 text-center ${freq >= 75 ? "bg-green-50" : freq >= 50 ? "bg-amber-50" : "bg-red-50"}`}>
                <p className={`text-lg font-extrabold ${freqColor(freq)}`}>{freq}%</p>
                <p className="text-xs text-gray-500">Geral</p>
              </div>
            </div>
            {aluno.dataConclusao && (
              <p className="text-xs text-gray-500">Conclusão: <span className="font-semibold text-green-700">{aluno.dataConclusao}</span></p>
            )}
          </div>
        )}

        {/* Notas */}
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

        {/* Observações */}
        {tab === "obs" && (
          <div className="space-y-3">
            {obs.length === 0 && (
              <p className="text-xs text-gray-400">Sem observações registradas.</p>
            )}
            {obs.map((o, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                {editIdx === i ? (
                  <div className="space-y-2">
                    <textarea
                      value={editTxt}
                      onChange={(e) => setEditTxt(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#1565c0]"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => submitEdit(i)} className="rounded-xl bg-[#1565c0] px-3 py-1 text-xs font-bold text-white hover:opacity-90">Salvar</button>
                      <button onClick={() => setEditIdx(null)} className="rounded-xl border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-100">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-1">{o.data} · {o.professor}</p>
                    <p className="text-xs text-gray-700">{o.texto}</p>
                    <button onClick={() => { setEditIdx(i); setEditTxt(o.texto); }} className="mt-1 text-[10px] font-semibold text-[#1565c0] hover:underline">
                      Editar
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* Nova observação */}
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500">Nova observação</p>
              <textarea
                value={novaObs}
                onChange={(e) => setNovaObs(e.target.value)}
                rows={2}
                placeholder="Escreva uma observação pedagógica…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0]/20"
              />
              {/* TODO: persistir no banco (Fase 2) */}
              <button
                onClick={submitObs}
                disabled={!novaObs.trim()}
                className="rounded-xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40 hover:opacity-90"
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

// ── Página principal ────────────────────────────────────────
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
    // TODO: persistir no banco (Fase 2)
    setObsMap((m) => ({
      ...m,
      [alunoId]: [...(m[alunoId] ?? []), { data: new Date().toLocaleDateString("pt-BR"), professor: "Coordenação", texto }],
    }));
  }

  function editObs(alunoId: string, idx: number, texto: string) {
    // TODO: persistir no banco (Fase 2)
    setObsMap((m) => {
      const arr = [...(m[alunoId] ?? [])];
      arr[idx] = { ...arr[idx]!, texto };
      return { ...m, [alunoId]: arr };
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/coordenacao/acompanhamento" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Acompanhamento
      </Link>

      {/* Cabeçalho da turma */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] p-6 text-white shadow-lg">
        <h1 className="text-xl font-extrabold">{turma.nome}</h1>
        <p className="text-sm text-white/70">{turma.polo} · {turma.etapa} · {turma.ano}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {turma.professores.map((p) => (
            <span key={p} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{p}</span>
          ))}
        </div>
      </div>

      {/* Resumo de situações */}
      {alunosIniciais.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {SITS.map((s) => {
            const count = alunosIniciais.filter((a) => a.situacao === s).length;
            const cfg   = SITUACAO_CFG[s];
            return (
              <div key={s} className={`rounded-3xl p-3 text-center ${cfg.classes}`}>
                <p className="text-2xl font-extrabold">{count}</p>
                <p className="text-xs font-semibold">{cfg.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Painel por aluno */}
      {alunosIniciais.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-400">Nenhum aluno registrado para esta turma.</p>
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
