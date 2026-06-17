"use client";

import { useState } from "react";
import Link from "next/link";
import {
  professoresCoord,
  POLOS_COORD,
  AREAS_COORD,
  turmasCoord,
  type ProfessorCoord,
  type PoloCoord,
  type AreaCoord,
} from "@/lib/mock-data/coordenacao";

type Form = Omit<ProfessorCoord, "id" | "ativo">;

const EMPTY_FORM: Form = {
  nome: "", cpf: "", email: "", telefone: "",
  polo: "Caruaru", area: "Matemática", turmasVinculadas: [],
};

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{text}</span>;
}

function Input({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
      />
    </div>
  );
}

function Sel<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T; onChange: (v: T) => void; options: readonly T[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function GestaoProfessoresPage() {
  const [lista, setLista] = useState<ProfessorCoord[]>(professoresCoord);
  const [modo, setModo] = useState<"lista" | "novo" | "editar">("lista");
  const [editando, setEditando] = useState<ProfessorCoord | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [busca, setBusca] = useState("");

  const visivel = lista.filter((p) => {
    const ativoOk = filtroAtivo === "todos" || (filtroAtivo === "ativos" ? p.ativo : !p.ativo);
    const buscaOk = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.polo.toLowerCase().includes(busca.toLowerCase());
    return ativoOk && buscaOk;
  });

  function abrirNovo() {
    setForm(EMPTY_FORM);
    setEditando(null);
    setModo("novo");
  }

  function abrirEditar(p: ProfessorCoord) {
    setForm({ nome: p.nome, cpf: p.cpf, email: p.email, telefone: p.telefone, polo: p.polo, area: p.area, turmasVinculadas: [...p.turmasVinculadas] });
    setEditando(p);
    setModo("editar");
  }

  function salvar() {
    if (modo === "novo") {
      // TODO: persistir no banco (Fase 2)
      const novo: ProfessorCoord = { ...form, id: `pc${Date.now()}`, ativo: true };
      setLista((l) => [...l, novo]);
    } else if (editando) {
      // TODO: persistir no banco (Fase 2)
      setLista((l) => l.map((p) => p.id === editando.id ? { ...editando, ...form } : p));
    }
    setModo("lista");
  }

  function inativar(id: string) {
    // TODO: persistir no banco (Fase 2)
    setLista((l) => l.map((p) => p.id === id ? { ...p, ativo: false } : p));
  }

  function reativar(id: string) {
    // TODO: persistir no banco (Fase 2)
    setLista((l) => l.map((p) => p.id === id ? { ...p, ativo: true } : p));
  }

  function toggleTurma(nome: string) {
    setForm((f) => ({
      ...f,
      turmasVinculadas: f.turmasVinculadas.includes(nome)
        ? f.turmasVinculadas.filter((t) => t !== nome)
        : [...f.turmasVinculadas, nome],
    }));
  }

  if (modo !== "lista") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button onClick={() => setModo("lista")} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Professores
        </button>

        <h1 className="mb-6 text-xl font-extrabold text-[#0f2d52]">
          {modo === "novo" ? "Cadastrar Professor" : "Editar Professor"}
        </h1>

        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Nome completo" value={form.nome} onChange={(v) => setForm((f) => ({ ...f, nome: v }))} placeholder="Ex.: João Pereira" />
            </div>
            <Input label="CPF" value={form.cpf}      onChange={(v) => setForm((f) => ({ ...f, cpf: v }))}      placeholder="000.000.000-00" />
            <Input label="Telefone" value={form.telefone} onChange={(v) => setForm((f) => ({ ...f, telefone: v }))} placeholder="(81) 99999-9999" />
            <div className="col-span-2">
              <Input label="E-mail" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" placeholder="professor@ejasesi.org.br" />
            </div>
            <Sel<PoloCoord> label="Polo" value={form.polo} onChange={(v) => setForm((f) => ({ ...f, polo: v }))} options={POLOS_COORD} />
            <Sel<AreaCoord> label="Área" value={form.area} onChange={(v) => setForm((f) => ({ ...f, area: v }))} options={AREAS_COORD} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">Turmas vinculadas</p>
            <div className="flex flex-wrap gap-2">
              {turmasCoord.map((t) => {
                const sel = form.turmasVinculadas.includes(t.nome);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTurma(t.nome)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${sel ? "bg-[#1565c0] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {t.nome}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={salvar} className="rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-6 py-2.5 text-sm font-bold text-white shadow hover:opacity-90">
              {modo === "novo" ? "Cadastrar" : "Salvar"}
            </button>
            <button onClick={() => setModo("lista")} className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/coordenacao" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Coordenação
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f2d52]">👨‍🏫 Gestão de Professores</h1>
          <p className="text-sm text-gray-500">{lista.filter((p) => p.ativo).length} ativos · {lista.filter((p) => !p.ativo).length} inativos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert("Disponível na fase do banco de dados")}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50"
          >
            📥 Importar planilha (Excel/CSV)
          </button>
          <button
            onClick={abrirNovo}
            className="rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-2 text-xs font-bold text-white shadow hover:opacity-90"
          >
            + Cadastrar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou polo…"
          className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20 sm:w-64"
        />
        {(["ativos", "inativos", "todos"] as const).map((op) => (
          <button
            key={op}
            onClick={() => setFiltroAtivo(op)}
            className={`rounded-2xl px-3 py-1.5 text-xs font-semibold capitalize transition ${filtroAtivo === op ? "bg-[#1565c0] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {visivel.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-400">Nenhum professor encontrado.</p>
          </div>
        )}
        {visivel.map((p) => (
          <div key={p.id} className={`overflow-hidden rounded-3xl bg-white shadow-md ring-1 ${p.ativo ? "ring-gray-100" : "ring-gray-200 opacity-60"}`}>
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-5 py-3">
              <div>
                <span className="font-bold text-white">{p.nome}</span>
                <span className="ml-3 text-xs text-white/60">{p.polo} · {p.area}</span>
              </div>
              <Badge text={p.ativo ? "Ativo" : "Inativo"} color={p.ativo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 text-xs text-gray-600 sm:grid-cols-3">
              <span><span className="font-semibold">CPF:</span> {p.cpf}</span>
              <span><span className="font-semibold">Tel:</span> {p.telefone}</span>
              <span className="col-span-2 sm:col-span-1 truncate"><span className="font-semibold">E-mail:</span> {p.email}</span>
              {p.turmasVinculadas.length > 0 && (
                <div className="col-span-2 sm:col-span-3 flex flex-wrap gap-1.5 pt-1">
                  {p.turmasVinculadas.map((t) => (
                    <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-gray-50 px-5 py-2.5">
              <button onClick={() => abrirEditar(p)} className="text-xs font-semibold text-[#1565c0] hover:underline">Editar</button>
              {p.ativo
                ? <button onClick={() => inativar(p.id)} className="text-xs font-semibold text-red-500 hover:underline">Inativar</button>
                : <button onClick={() => reativar(p.id)} className="text-xs font-semibold text-green-600 hover:underline">Reativar</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
