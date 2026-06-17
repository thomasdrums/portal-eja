"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  professorTurmas,
  AREAS_CONFIG,
  FREQ_AREAS_CONFIG,
  SITUACAO_CFG,
  notasEditaveis,
  freqEditaveis,
  type Aluno,
  type AreaId,
  type FreqAreaId,
} from "@/lib/mock-data/professor";

// ── helpers ─────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

function pct(presencas: number, total: number) {
  if (total === 0) return 0;
  return Math.round((presencas / total) * 100);
}

type Observacao = { id: string; data: string; texto: string };

// Observações de exemplo — TODO: persistir no banco (Fase 2)
const OBS_INICIAIS: Observacao[] = [
  { id: "obs-1", data: "10/03/2026", texto: "Aluno necessita acompanhamento pedagógico." },
  { id: "obs-2", data: "15/04/2026", texto: "Aluno retornou após período de evasão." },
];

// ── sub-components ───────────────────────────────────────
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition sm:text-sm ${
        active
          ? "bg-gradient-to-r from-[#0f2d52] to-[#1565c0] text-white shadow-sm"
          : "text-gray-500 hover:text-[#0f2d52]"
      }`}
    >
      {label}
    </button>
  );
}

function SaveBar({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        onClick={onCancel}
        className="flex-1 rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        onClick={onSave}
        className="flex-1 rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] py-3 text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-[0.98]"
      >
        Salvar
      </button>
    </div>
  );
}

function ReadOnlyBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white/90">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      Somente Visualização
    </span>
  );
}

// ── main component ───────────────────────────────────────
export default function AlunoPage({
  params,
}: {
  params: Promise<{ turmaId: string; alunoId: string }>;
}) {
  const { turmaId, alunoId } = use(params);
  const { data: session } = useSession();
  const userRole       = session?.user?.role       ?? "PROFESSOR";
  const userDisciplina = session?.user?.disciplina ?? null;

  const editableNotasIds = notasEditaveis(userDisciplina, userRole);
  const editableFreqIds  = freqEditaveis(userDisciplina, userRole);

  const canEditNotas = (id: AreaId)     => editableNotasIds.includes(id);
  const canEditFreq  = (id: FreqAreaId) => editableFreqIds.includes(id);

  const turma         = professorTurmas.find((t) => t.id === turmaId);
  const alunoOriginal = turma?.alunos.find((a) => a.id === alunoId);

  const [aluno, setAluno]     = useState<Aluno | undefined>(alunoOriginal);
  const [tab, setTab]         = useState<"dados" | "notas" | "frequencia" | "observacoes">("dados");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<Aluno | undefined>(alunoOriginal);
  const [flashMsg, setFlashMsg] = useState("");

  // Observações — TODO: persistir no banco (Fase 2)
  const [obs, setObs] = useState<Observacao[]>(OBS_INICIAIS);

  if (!aluno || !draft) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Aluno não encontrado.</p>
      </div>
    );
  }

  function flash(msg: string) {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 3000);
  }

  function startEdit()  { setDraft({ ...aluno! }); setEditing(true); }
  function cancelEdit() { setDraft({ ...aluno! }); setEditing(false); }
  function saveEdit()   { setAluno({ ...draft! }); setEditing(false); flash("Salvo com sucesso!"); }

  // ── Aba: Dados ──────────────────────────────────────────
  function DadosTab() {
    /* aluno e draft são garantidamente não-nulos pelo early-return acima */
    const al = aluno!;
    const dr = draft!;

    const personalFields: { key: keyof Aluno; label: string }[] = [
      { key: "nome",          label: "Nome" },
      { key: "cidade",        label: "Cidade" },
      { key: "telefone",      label: "Telefone" },
      { key: "escolaridade",  label: "Escolaridade" },
      { key: "dataMatricula", label: "Data de Matrícula" },
    ];

    return (
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-700">Dados Pessoais</h3>
            {!editing && (
              <button
                onClick={startEdit}
                className="flex items-center gap-1 rounded-xl bg-[#e8f4fd] px-3 py-1.5 text-xs font-bold text-[#1565c0] hover:bg-blue-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Editar
              </button>
            )}
          </div>
          <div className="space-y-3">
            {personalFields.map(({ key, label }) => (
              <div key={key}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                {editing ? (
                  <input
                    value={(dr[key] as string) ?? ""}
                    onChange={(e) => setDraft((d) => d ? { ...d, [key]: e.target.value } : d)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
                  />
                ) : (
                  <p className="rounded-2xl bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-800">
                    {(al[key] as string) || "—"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold text-gray-700">Documentação</h3>
          <div className="space-y-3">
            {([
              { key: "historicoEntregue",   label: "Histórico Entregue"   },
              { key: "certificadoEmitido",  label: "Certificado Emitido"  },
              { key: "certificadoRecebido", label: "Certificado Recebido" },
            ] as { key: keyof typeof dr.documentacao; label: string }[]).map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <input
                  type="checkbox"
                  checked={editing ? (dr.documentacao[key] ?? false) : al.documentacao[key]}
                  disabled={!editing}
                  onChange={(e) =>
                    setDraft((d) =>
                      d ? { ...d, documentacao: { ...d.documentacao, [key]: e.target.checked } } : d
                    )
                  }
                  className="h-5 w-5 rounded accent-[#1565c0]"
                />
              </label>
            ))}
          </div>
        </div>

        {editing && <SaveBar onSave={saveEdit} onCancel={cancelEdit} />}
      </div>
    );
  }

  // ── Aba: Notas ──────────────────────────────────────────
  function NotasTab() {
    const al = aluno!;
    const [editingNotas, setEditingNotas] = useState(false);
    const [notasDraft, setNotasDraft]     = useState({ ...al.notas });

    const hasEditableArea = editableNotasIds.length > 0;

    function saveNotas() {
      setAluno((a) => a ? { ...a, notas: notasDraft } : a);
      setDraft((d) => d ? { ...d, notas: notasDraft } : d);
      setEditingNotas(false);
      flash("Notas salvas!");
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Verde ≥ 60 · Vermelho &lt; 60</p>
          {hasEditableArea && !editingNotas && (
            <button
              onClick={() => setEditingNotas(true)}
              className="flex items-center gap-1 rounded-xl bg-[#e8f4fd] px-3 py-1.5 text-xs font-bold text-[#1565c0] hover:bg-blue-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editar notas
            </button>
          )}
        </div>

        {AREAS_CONFIG.map((area) => {
          const areaKey  = area.id as AreaId;
          const editable = canEditNotas(areaKey);
          const isEditing = editingNotas && editable;

          return (
            <div
              key={area.id}
              className={`overflow-hidden rounded-3xl shadow-md ${
                editable ? "bg-white ring-1 ring-gray-100" : "bg-gray-50 ring-1 ring-gray-200"
              }`}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3">
                <h3 className="font-bold text-white text-sm">{area.nome}</h3>
                {!editable && <ReadOnlyBadge />}
              </div>

              <div className="divide-y divide-gray-100 px-5">
                {area.competencias.map((comp) => {
                  const nota = isEditing
                    ? (notasDraft[areaKey][comp] ?? null)
                    : (al.notas[areaKey][comp] ?? null);
                  const ok      = nota !== null && nota >= 60;
                  const pending = nota === null;

                  return (
                    <div key={comp} className="flex items-center justify-between py-3">
                      <span className="text-sm font-semibold text-gray-600">{comp}</span>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={notasDraft[areaKey][comp] ?? ""}
                          placeholder="—"
                          onChange={(e) => {
                            const v = e.target.value === "" ? null : Number(e.target.value);
                            setNotasDraft((d) => ({ ...d, [areaKey]: { ...d[areaKey], [comp]: v } }));
                          }}
                          className="w-20 rounded-xl border border-[#1565c0]/40 bg-white px-3 py-1.5 text-center text-sm font-bold outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
                        />
                      ) : (
                        <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${editable ? "" : "bg-gray-100"}`}>
                          <span className={`text-sm font-bold ${pending ? "text-gray-400" : ok ? "text-green-600" : "text-red-500"}`}>
                            {nota ?? "—"}
                          </span>
                          {!pending && (
                            <span className={`text-base ${ok ? "text-green-500" : "text-red-400"}`}>
                              {ok ? "✓" : "✗"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {editingNotas && (
          <SaveBar
            onSave={saveNotas}
            onCancel={() => { setNotasDraft({ ...al.notas }); setEditingNotas(false); }}
          />
        )}
      </div>
    );
  }

  // ── Aba: Frequência ─────────────────────────────────────
  function FrequenciaTab() {
    const al = aluno!;
    const [editingFreq, setEditingFreq] = useState(false);
    const [freqDraft, setFreqDraft]     = useState({ ...al.frequencia });

    const hasEditableArea = editableFreqIds.length > 0;

    function saveFreq() {
      setAluno((a) => a ? { ...a, frequencia: freqDraft } : a);
      setDraft((d) => d ? { ...d, frequencia: freqDraft } : d);
      setEditingFreq(false);
      flash("Frequência salva!");
    }

    const freqSource    = editingFreq ? freqDraft : al.frequencia;
    const totalPresencas = Object.values(freqSource).reduce((s, v) => s + v.presencas, 0);
    const totalAulas     = Object.values(freqSource).reduce((s, v) => s + v.totalAulas, 0);
    const totalFaltas    = totalAulas - totalPresencas;
    const totalPct       = pct(totalPresencas, totalAulas);

    return (
      <div className="space-y-4">
        {/* Card de totais */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg">
          <p className="mb-3 text-sm font-semibold text-white/70">Frequência Total do Aluno</p>
          <div className="mb-4 flex items-end gap-2">
            <span className="text-4xl font-extrabold">{totalPct}%</span>
            <span className="mb-1 text-sm text-white/70">de presença geral</span>
          </div>
          <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full ${totalPct >= 100 ? "bg-green-400" : totalPct >= 75 ? "bg-white" : "bg-red-300"}`}
              style={{ width: `${Math.min(totalPct, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/10 py-2.5">
              <p className="text-xs text-white/60">Presenças</p>
              <p className="text-xl font-bold">{totalPresencas}</p>
            </div>
            <div className="rounded-2xl bg-white/10 py-2.5">
              <p className="text-xs text-white/60">Faltas</p>
              <p className="text-xl font-bold">{totalFaltas}</p>
            </div>
            <div className="rounded-2xl bg-white/10 py-2.5">
              <p className="text-xs text-white/60">Total</p>
              <p className="text-xl font-bold">{totalAulas}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Necessário 100% para aprovação por área</p>
          {hasEditableArea && !editingFreq && (
            <button
              onClick={() => setEditingFreq(true)}
              className="flex items-center gap-1 rounded-xl bg-[#e8f4fd] px-3 py-1.5 text-xs font-bold text-[#1565c0] hover:bg-blue-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editar frequência
            </button>
          )}
        </div>

        {FREQ_AREAS_CONFIG.map((area) => {
          const areaKey   = area.id as FreqAreaId;
          const editable  = canEditFreq(areaKey);
          const isEditing = editingFreq && editable;

          const display = (editingFreq && editable) ? freqDraft[areaKey] : al.frequencia[areaKey];
          const p       = pct(display.presencas, display.totalAulas);
          const faltas  = display.totalAulas - display.presencas;

          const isInterarea    = areaKey === "interarea";
          const headerGradient = isInterarea
            ? "from-[#b45309] to-[#d97706]"
            : "from-[#0f2d52] to-[#1565c0]";

          return (
            <div
              key={area.id}
              className={`overflow-hidden rounded-3xl shadow-md ${
                editable ? "bg-white ring-1 ring-gray-100" : "bg-gray-50 ring-1 ring-gray-200"
              }`}
            >
              <div className={`flex items-center justify-between bg-gradient-to-r ${headerGradient} px-5 py-3`}>
                <h3 className="font-bold text-white text-sm">{area.nome}</h3>
                <div className="flex items-center gap-2">
                  {!editable && <ReadOnlyBadge />}
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                    {p}%
                  </span>
                </div>
              </div>

              <div className="p-5">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-400">Presenças</p>
                      <input
                        type="number"
                        min={0}
                        max={freqDraft[areaKey].totalAulas}
                        value={freqDraft[areaKey].presencas}
                        onChange={(e) =>
                          setFreqDraft((d) => ({ ...d, [areaKey]: { ...d[areaKey], presencas: Number(e.target.value) } }))
                        }
                        className="w-full rounded-xl border border-[#1565c0]/40 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-400">Total de aulas</p>
                      <input
                        type="number"
                        min={1}
                        value={freqDraft[areaKey].totalAulas}
                        onChange={(e) =>
                          setFreqDraft((d) => ({ ...d, [areaKey]: { ...d[areaKey], totalAulas: Number(e.target.value) } }))
                        }
                        className="w-full rounded-xl border border-[#1565c0]/40 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${p >= 100 ? "bg-green-500" : p >= 75 ? "bg-[#1565c0]" : "bg-red-400"}`}
                        style={{ width: `${Math.min(p, 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className={`rounded-2xl py-2 ${editable ? "bg-green-50" : "bg-gray-100"}`}>
                        <p className="text-xs text-gray-500">Presenças</p>
                        <p className={`text-base font-bold ${editable ? "text-green-600" : "text-gray-600"}`}>
                          {display.presencas}
                        </p>
                      </div>
                      <div className={`rounded-2xl py-2 ${editable ? "bg-red-50" : "bg-gray-100"}`}>
                        <p className="text-xs text-gray-500">Faltas</p>
                        <p className={`text-base font-bold ${editable ? "text-red-500" : "text-gray-600"}`}>
                          {faltas}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-100 py-2">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-base font-bold text-gray-700">{display.totalAulas}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {editingFreq && (
          <SaveBar
            onSave={saveFreq}
            onCancel={() => { setFreqDraft({ ...al.frequencia }); setEditingFreq(false); }}
          />
        )}
      </div>
    );
  }

  // ── Aba: Observações Pedagógicas ────────────────────────
  function ObservacoesTab() {
    const [novaObs, setNovaObs]         = useState("");
    const [editingObsId, setEditingObsId] = useState<string | null>(null);
    const [editObsText, setEditObsText]   = useState("");

    function addObs() {
      if (!novaObs.trim()) return;
      const d    = new Date();
      const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      // TODO: persistir no banco (Fase 2)
      setObs((prev) => [...prev, { id: `obs-${Date.now()}`, data, texto: novaObs.trim() }]);
      setNovaObs("");
      flash("Observação salva!");
    }

    function startEditObs(o: Observacao) {
      setEditingObsId(o.id);
      setEditObsText(o.texto);
    }

    function saveEditObs() {
      // TODO: persistir no banco (Fase 2)
      setObs((prev) =>
        prev.map((o) => (o.id === editingObsId ? { ...o, texto: editObsText } : o))
      );
      setEditingObsId(null);
      flash("Observação atualizada!");
    }

    return (
      <div className="space-y-4">
        {/* Histórico */}
        <div className="space-y-3">
          {obs.length === 0 && (
            <p className="rounded-3xl bg-white px-5 py-6 text-center text-sm text-gray-400 shadow-sm ring-1 ring-gray-100">
              Nenhuma observação registrada.
            </p>
          )}
          {obs.map((o) => (
            <div key={o.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              {editingObsId === o.id ? (
                <div>
                  <textarea
                    value={editObsText}
                    onChange={(e) => setEditObsText(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setEditingObsId(null)}
                      className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveEditObs}
                      className="rounded-xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">{o.data}</span>
                    <button
                      onClick={() => startEditObs(o)}
                      className="text-xs font-semibold text-[#1565c0] hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{o.texto}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nova observação */}
        <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100">
          <h3 className="mb-3 font-bold text-gray-700">Nova Observação</h3>
          <textarea
            value={novaObs}
            onChange={(e) => setNovaObs(e.target.value)}
            placeholder="Digite a observação pedagógica..."
            rows={3}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
          />
          <button
            onClick={addObs}
            disabled={!novaObs.trim()}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            Salvar observação
          </button>
        </div>
      </div>
    );
  }

  const situacaoCfg = SITUACAO_CFG[aluno.situacao];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Voltar */}
      <Link
        href={`/professor/turmas/${turmaId}`}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para a turma
      </Link>

      {/* Flash */}
      {flashMsg && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ {flashMsg}
        </div>
      )}

      {/* Cabeçalho do aluno */}
      <div className="mb-6 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] p-5 text-white shadow-lg">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-xl font-bold ring-2 ring-white/30">
          {getInitials(aluno.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold leading-tight">{aluno.nome}</p>
          <p className="text-xs text-white/60">RA {aluno.ra}</p>
          <p className="text-sm text-white/70">{aluno.cidade}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${situacaoCfg.classes}`}>
          {situacaoCfg.label}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-2xl bg-gray-100 p-1">
        <TabButton label="Dados"       active={tab === "dados"}       onClick={() => { setEditing(false); setTab("dados");        }} />
        <TabButton label="Notas"       active={tab === "notas"}       onClick={() => { setEditing(false); setTab("notas");        }} />
        <TabButton label="Frequência"  active={tab === "frequencia"}  onClick={() => { setEditing(false); setTab("frequencia");   }} />
        <TabButton label="Observações" active={tab === "observacoes"} onClick={() => { setEditing(false); setTab("observacoes");  }} />
      </div>

      {tab === "dados"       && <DadosTab />}
      {tab === "notas"       && <NotasTab />}
      {tab === "frequencia"  && <FrequenciaTab />}
      {tab === "observacoes" && <ObservacoesTab />}
    </div>
  );
}
