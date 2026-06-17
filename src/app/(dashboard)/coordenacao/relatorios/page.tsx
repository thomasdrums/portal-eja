"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { turmasCoord, professoresCoord, POLOS_COORD } from "@/lib/mock-data/coordenacao";
import { relatorioAlunos, type AlunoRel, type Observacao } from "@/lib/mock-data/relatorios";
import { SITUACAO_CFG } from "@/lib/mock-data/professor";

// ── Configuração das áreas ────────────────────────────────
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
function notaColor(n: number | null) {
  if (n === null) return "text-gray-300";
  return n >= 60 ? "text-green-600 font-semibold" : "text-red-500 font-semibold";
}
function freqTextColor(p: number) { return p >= 75 ? "text-green-600" : p >= 50 ? "text-amber-600" : "text-red-500"; }

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20">
        <option value="">Todos</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Painel completo do aluno (usado dentro do relatório) ──
function PainelAluno({ aluno, obsExtra, onAddObs, onEditObs }: {
  aluno: AlunoRel;
  obsExtra: Observacao[];
  onAddObs: (texto: string) => void;
  onEditObs: (idx: number, texto: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const [novaObs, setNovaObs] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editTxt, setEditTxt] = useState("");
  const cfg  = SITUACAO_CFG[aluno.situacao];
  const freq = freqMed(aluno);

  const todasObs: Observacao[] = [...aluno.observacoes, ...obsExtra];

  function submitObs() { if (!novaObs.trim()) return; onAddObs(novaObs.trim()); setNovaObs(""); }
  function submitEdit(idx: number) {
    if (!editTxt.trim()) return;
    // Para obs iniciais: só pode editar as extra (obsExtra começa depois do índice das obs iniciais)
    const extraIdx = idx - aluno.observacoes.length;
    if (extraIdx >= 0) onEditObs(extraIdx, editTxt.trim());
    setEditIdx(null);
  }

  return (
    <div className="rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* Linha do aluno */}
      <button
        onClick={() => setExpandido((v) => !v)}
        className="w-full flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800">{aluno.nome}</span>
          <span className="text-xs text-gray-500">{aluno.cidade}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${freqTextColor(freq)}`}>{freq}%</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>{cfg.label}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-4 w-4 text-gray-400 transition-transform ${expandido ? "rotate-90" : ""}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expandido && (
        <div className="border-t border-gray-50 px-5 pb-5 pt-4 space-y-5">
          {/* Frequência por área */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Frequência por área</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {AREAS.map((ar) => {
                const f = aluno.freq[ar.key];
                return (
                  <div key={ar.key} className={`rounded-2xl p-3 text-center ${f >= 75 ? "bg-green-50" : f >= 50 ? "bg-amber-50" : "bg-red-50"}`}>
                    <p className={`text-base font-extrabold ${freqTextColor(f)}`}>{f}%</p>
                    <p className="text-xs text-gray-500">{ar.label}</p>
                  </div>
                );
              })}
              <div className={`rounded-2xl p-3 text-center ${freq >= 75 ? "bg-green-50" : freq >= 50 ? "bg-amber-50" : "bg-red-50"}`}>
                <p className={`text-base font-extrabold ${freqTextColor(freq)}`}>{freq}%</p>
                <p className="text-xs text-gray-500">Geral</p>
              </div>
            </div>
          </div>

          {/* Notas por competência */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Notas por competência</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {AREAS.map((ar) => (
                <div key={ar.key}>
                  <p className="mb-1 text-xs font-bold text-gray-600">{ar.label}</p>
                  <div className="space-y-1">
                    {ar.comps.map((c) => {
                      const nota = aluno.notas[ar.key][c];
                      return (
                        <div key={c} className="flex justify-between text-xs">
                          <span className="text-gray-400">{c}</span>
                          <span className={notaColor(nota)}>{nota ?? "—"}</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-100 pt-1 flex justify-between text-xs">
                      <span className="text-gray-400 font-medium">Média</span>
                      {(() => {
                        const vals = ar.comps.map((c) => aluno.notas[ar.key][c]).filter((v): v is number => v !== null);
                        const avg  = vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
                        return <span className={notaColor(avg)}>{avg ?? "—"}</span>;
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comentários pedagógicos */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Comentários pedagógicos</p>
            {todasObs.length === 0 && <p className="text-xs text-gray-400">Nenhuma observação registrada.</p>}
            <div className="space-y-2">
              {todasObs.map((o, i) => {
                const isExtra = i >= aluno.observacoes.length;
                const extraIdx = i - aluno.observacoes.length;
                return (
                  <div key={i} className="rounded-2xl bg-gray-50 px-4 py-3">
                    {editIdx === i && isExtra ? (
                      <div className="space-y-2">
                        <textarea rows={2} value={editTxt} onChange={(e) => setEditTxt(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#1565c0]" />
                        <div className="flex gap-2">
                          <button onClick={() => submitEdit(i)} className="rounded-xl bg-[#1565c0] px-3 py-1 text-xs font-bold text-white">Salvar</button>
                          <button onClick={() => setEditIdx(null)} className="rounded-xl border border-gray-200 px-3 py-1 text-xs text-gray-500">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400 mb-1">{o.data} · {o.professor}</p>
                        <p className="text-xs text-gray-700">{o.texto}</p>
                        {isExtra && (
                          <button onClick={() => { setEditIdx(i); setEditTxt(o.texto); setEditIdx(i); setEditTxt(o.texto); }}
                            className="mt-1 text-[10px] font-semibold text-[#1565c0] hover:underline">Editar</button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Adicionar observação */}
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              <textarea rows={2} value={novaObs} onChange={(e) => setNovaObs(e.target.value)}
                placeholder="Adicionar comentário pedagógico…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0]/20" />
              {/* TODO: persistir no banco (Fase 2) */}
              <button onClick={submitObs} disabled={!novaObs.trim()}
                className="rounded-xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ────────────────────────────────────────
export default function RelatoriosPage() {
  const [polo,      setPolo]      = useState("");
  const [profNome,  setProfNome]  = useState("");
  const [turmaNome, setTurmaNome] = useState("");

  // Observações extra adicionadas pela coordenação (per-aluno)
  const [obsExtra, setObsExtra] = useState<Record<string, Observacao[]>>({});

  // Filtrar turmas por polo e professor
  const turmasFiltradas = useMemo(() => turmasCoord.filter((t) => {
    const poloOk = !polo || t.polo === polo;
    const profOk = !profNome || t.professores.includes(profNome);
    return poloOk && profOk;
  }), [polo, profNome]);

  const professoresFiltrados = useMemo(() =>
    professoresCoord.filter((p) => p.ativo && (!polo || p.polo === polo)),
    [polo]);

  const turmaSelecionada = turmasCoord.find((t) => t.nome === turmaNome);
  const alunos = turmaSelecionada ? relatorioAlunos.filter((a) => a.turmaNome === turmaSelecionada.nome) : [];

  function addObs(alunoId: string, texto: string) {
    // TODO: persistir no banco (Fase 2)
    setObsExtra((m) => ({
      ...m,
      [alunoId]: [...(m[alunoId] ?? []), { data: new Date().toLocaleDateString("pt-BR"), professor: "Coordenação", texto }],
    }));
  }

  function editObs(alunoId: string, idx: number, texto: string) {
    // TODO: persistir no banco (Fase 2)
    setObsExtra((m) => {
      const arr = [...(m[alunoId] ?? [])];
      arr[idx] = { ...arr[idx]!, texto };
      return { ...m, [alunoId]: arr };
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/coordenacao" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Visão Geral
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f2d52]">📊 Relatório por Turma</h1>
          <p className="text-sm text-gray-500">Selecione polo, professor e turma para gerar o relatório</p>
        </div>
        <button
          disabled
          title="Disponível em breve"
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
        >
          ⬇ Exportar relatório
          {/* TODO: implementar exportação (Fase 2) */}
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:grid-cols-3">
        <Select label="Polo"      value={polo}     onChange={(v) => { setPolo(v); setProfNome(""); setTurmaNome(""); }} options={[...POLOS_COORD]}   />
        <Select label="Professor" value={profNome} onChange={(v) => { setProfNome(v); setTurmaNome(""); }}             options={professoresFiltrados.map((p) => p.nome)} />
        <Select label="Turma"    value={turmaNome} onChange={setTurmaNome}                                             options={turmasFiltradas.map((t) => t.nome)} />
      </div>

      {/* Estado: nenhuma turma selecionada */}
      {!turmaSelecionada && (
        <div className="flex h-40 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-400">Selecione uma turma para visualizar o relatório.</p>
        </div>
      )}

      {/* Relatório da turma */}
      {turmaSelecionada && (
        <div className="space-y-6">
          {/* Dados da turma */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] p-6 text-white shadow-lg">
            <h2 className="text-lg font-extrabold">{turmaSelecionada.nome}</h2>
            <p className="text-sm text-white/70">{turmaSelecionada.polo} · {turmaSelecionada.etapa} · {turmaSelecionada.ano}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-white/80">{alunos.length} alunos</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${turmaSelecionada.status === "ativa" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                {turmaSelecionada.status === "ativa" ? "Ativa" : "Encerrada"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {turmaSelecionada.professores.map((p) => (
                <span key={p} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{p}</span>
              ))}
            </div>
          </div>

          {/* Alunos */}
          {alunos.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
              <p className="text-sm text-gray-400">Nenhum aluno registrado nesta turma.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-wide text-gray-400">Alunos ({alunos.length})</p>
              {alunos.map((a) => (
                <PainelAluno
                  key={a.id}
                  aluno={a}
                  obsExtra={obsExtra[a.id] ?? []}
                  onAddObs={(texto) => addObs(a.id, texto)}
                  onEditObs={(idx, texto) => editObs(a.id, idx, texto)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
