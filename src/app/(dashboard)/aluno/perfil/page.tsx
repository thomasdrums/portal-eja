"use client";

import { useState } from "react";
import Link from "next/link";
import { alunoPerfil, type AlunoPerfil } from "@/lib/mock-data/aluno";

const fields: { key: keyof AlunoPerfil; label: string; type?: string }[] = [
  { key: "nome",     label: "Nome completo" },
  { key: "cidade",   label: "Cidade" },
  { key: "telefone", label: "Telefone",      type: "tel" },
  { key: "cep",      label: "CEP" },
  { key: "nomePai",  label: "Nome do Pai" },
  { key: "nomeMae",  label: "Nome da Mãe" },
];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

export default function PerfilPage() {
  const [form, setForm] = useState<AlunoPerfil>(alunoPerfil);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleChange(key: keyof AlunoPerfil, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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

      <h1 className="mb-6 text-xl font-bold text-[#0f2d52]">Meu Perfil</h1>

      {/* Avatar card */}
      <div className="mb-6 flex flex-col items-center rounded-3xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] py-8 shadow-lg">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/25 text-4xl font-bold text-white ring-4 ring-white/30">
          {getInitials(form.nome)}
        </div>
        <p className="mt-4 text-lg font-bold text-white">{form.nome}</p>
        <p className="text-sm text-white/60">Aluno · EJA</p>
      </div>

      {/* Success feedback */}
      {saved && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ Perfil atualizado com sucesso!
        </div>
      )}

      {/* Form */}
      <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Informações pessoais</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#e8f4fd] px-3 py-1.5 text-xs font-bold text-[#1565c0] transition hover:bg-blue-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Editar
            </button>
          )}
        </div>

        <div className="space-y-4">
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                {label}
              </label>
              {editing ? (
                <input
                  type={type ?? "text"}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
                />
              ) : (
                <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
                  {form[key] || <span className="text-gray-300">—</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => { setForm(alunoPerfil); setEditing(false); }}
              className="flex-1 rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-500 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
