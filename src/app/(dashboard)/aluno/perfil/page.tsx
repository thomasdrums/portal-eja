"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Pencil, User } from "lucide-react";
import { alunoPerfil, type AlunoPerfil } from "@/lib/mock-data/aluno";

const fields: { key: keyof AlunoPerfil; label: string; type?: string }[] = [
  { key: "nome",     label: "Nome completo" },
  { key: "cidade",   label: "Cidade" },
  { key: "telefone", label: "Telefone", type: "tel" },
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

  const inputClass =
    "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/aluno"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-gray-900">Meu Perfil</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6EE] ring-2 ring-[#009640]/20">
          <span className="text-xl font-bold text-[#009640]">{getInitials(form.nome)}</span>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{form.nome}</p>
          <p className="text-sm text-[#4B5563]">Aluno · EJA SESI</p>
        </div>
        <div className="ml-auto">
          <User size={22} className="text-[#D9D9D9]" />
        </div>
      </div>

      {/* Feedback */}
      {saved && (
        <div className="rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
          Perfil atualizado com sucesso.
        </div>
      )}

      {/* Formulário */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Informações pessoais</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded border border-[#009640] px-3 py-1.5 text-xs font-semibold text-[#009640] transition hover:bg-[#EAF6EE]"
            >
              <Pencil size={13} />
              Editar
            </button>
          )}
        </div>

        <div className="space-y-4">
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
              {editing ? (
                <input
                  type={type ?? "text"}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className={inputClass}
                />
              ) : (
                <p className="rounded border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm text-gray-800">
                  {form[key] || <span className="text-[#D9D9D9]">—</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => { setForm(alunoPerfil); setEditing(false); }}
              className="flex-1 rounded border border-[#D9D9D9] py-2.5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F5F5F5]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded bg-[#009640] py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33]"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
