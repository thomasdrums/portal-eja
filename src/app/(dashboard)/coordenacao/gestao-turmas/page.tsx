"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  turmasCoord,
  professoresCoord,
  POLOS_COORD,
  ETAPAS_COORD,
  type TurmaCoord,
  type PoloCoord,
  type EtapaCoord,
} from "@/lib/mock-data/coordenacao";

type Form = Omit<TurmaCoord, "id" | "status">;

const EMPTY_FORM: Form = {
  nome: "", polo: "Caruaru", ano: "2026", etapa: "Fundamental II", professores: [],
};

function Sel<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T; onChange: (v: T) => void; options: readonly T[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-[#D9D9D9] px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      />
    </div>
  );
}

const ANOS = ["2025", "2026", "2027"];

export default function GestaoTurmasPage() {
  const [lista, setLista] = useState<TurmaCoord[]>(turmasCoord);
  const [modo, setModo] = useState<"lista" | "novo" | "editar">("lista");
  const [editando, setEditando] = useState<TurmaCoord | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "ativa" | "encerrada">("todas");

  const visivel = lista.filter((t) =>
    filtroStatus === "todas" || t.status === filtroStatus
  );

  function abrirNovo() {
    setForm(EMPTY_FORM);
    setEditando(null);
    setModo("novo");
  }

  function abrirEditar(t: TurmaCoord) {
    setForm({ nome: t.nome, polo: t.polo, ano: t.ano, etapa: t.etapa, professores: [...t.professores] });
    setEditando(t);
    setModo("editar");
  }

  function salvar() {
    if (modo === "novo") {
      const nova: TurmaCoord = { ...form, id: `tc${Date.now()}`, status: "ativa" };
      setLista((l) => [...l, nova]);
    } else if (editando) {
      setLista((l) => l.map((t) => t.id === editando.id ? { ...editando, ...form } : t));
    }
    setModo("lista");
  }

  function encerrar(id: string) {
    setLista((l) => l.map((t) => t.id === id ? { ...t, status: "encerrada" } : t));
  }

  function reabrir(id: string) {
    setLista((l) => l.map((t) => t.id === id ? { ...t, status: "ativa" } : t));
  }

  function toggleProf(nome: string) {
    setForm((f) => ({
      ...f,
      professores: f.professores.includes(nome)
        ? f.professores.filter((p) => p !== nome)
        : [...f.professores, nome],
    }));
  }

  if (modo !== "lista") {
    const profsPolo = professoresCoord.filter((p) => p.ativo && p.polo === form.polo);
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={() => setModo("lista")} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
          <ChevronLeft size={15} />
          Turmas
        </button>

        <h1 className="text-xl font-semibold text-gray-900">
          {modo === "novo" ? "Criar Turma" : "Editar Turma"}
        </h1>

        <div className="space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Input label="Nome da turma" value={form.nome} onChange={(v) => setForm((f) => ({ ...f, nome: v }))} placeholder="Ex.: Turma 26.1" />
          <div className="grid grid-cols-3 gap-4">
            <Sel<PoloCoord>  label="Polo"  value={form.polo}  onChange={(v) => setForm((f) => ({ ...f, polo: v, professores: [] }))} options={POLOS_COORD}  />
            <Sel<EtapaCoord> label="Etapa" value={form.etapa} onChange={(v) => setForm((f) => ({ ...f, etapa: v }))}                options={ETAPAS_COORD} />
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#4B5563]">Ano</label>
              <select
                value={form.ano}
                onChange={(e) => setForm((f) => ({ ...f, ano: e.target.value }))}
                className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
              >
                {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#4B5563]">Professores ({form.polo})</p>
            {profsPolo.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum professor ativo neste polo.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profsPolo.map((p) => {
                  const sel = form.professores.includes(p.nome);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProf(p.nome)}
                      className={`rounded px-3 py-1 text-xs font-semibold transition ${sel ? "bg-[#009640] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {p.nome}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={salvar} className="rounded bg-[#009640] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#007A33]">
              {modo === "novo" ? "Criar" : "Salvar"}
            </button>
            <button onClick={() => setModo("lista")} className="rounded border border-[#D9D9D9] px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/coordenacao" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Coordenação
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Gestão de Turmas</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">{lista.filter((t) => t.status === "ativa").length} ativas · {lista.filter((t) => t.status === "encerrada").length} encerradas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert("Disponível na fase do banco de dados")}
            className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Importar planilha (Excel/CSV)
          </button>
          <button
            onClick={abrirNovo}
            className="rounded bg-[#009640] px-5 py-2 text-xs font-bold text-white hover:bg-[#007A33]"
          >
            + Criar turma
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["todas", "ativa", "encerrada"] as const).map((op) => (
          <button
            key={op}
            onClick={() => setFiltroStatus(op)}
            className={`rounded px-3 py-1.5 text-xs font-semibold capitalize transition ${filtroStatus === op ? "bg-[#009640] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {op === "todas" ? "Todas" : op === "ativa" ? "Ativas" : "Encerradas"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visivel.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#4B5563]">Nenhuma turma encontrada.</p>
          </div>
        )}
        {visivel.map((t) => (
          <div key={t.id} className={`overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${t.status !== "ativa" ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between bg-[#009640] px-5 py-3">
              <div>
                <span className="font-bold text-white">{t.nome}</span>
                <span className="ml-3 text-xs text-white/70">{t.polo} · {t.etapa} · {t.ano}</span>
              </div>
              <span className={`rounded px-2.5 py-0.5 text-xs font-bold ${t.status === "ativa" ? "bg-white/90 text-[#007A33]" : "bg-white/20 text-white"}`}>
                {t.status === "ativa" ? "Ativa" : "Encerrada"}
              </span>
            </div>
            <div className="px-5 py-3">
              {t.professores.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {t.professores.map((p) => (
                    <span key={p} className="rounded bg-[#EAF6EE] px-2.5 py-0.5 text-xs font-semibold text-[#007A33]">{p}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sem professores vinculados.</p>
              )}
            </div>
            <div className="flex gap-3 border-t border-[#E5E7EB] px-5 py-2.5">
              <button onClick={() => abrirEditar(t)} className="text-xs font-semibold text-[#009640] hover:underline">Editar</button>
              {t.status === "ativa"
                ? <button onClick={() => encerrar(t.id)} className="text-xs font-semibold text-red-500 hover:underline">Encerrar</button>
                : <button onClick={() => reabrir(t.id)}  className="text-xs font-semibold text-[#009640] hover:underline">Reabrir</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
