"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Check } from "lucide-react";
import type { PerfilConta } from "@/lib/queries/perfil";
import { salvarPerfilAction } from "./actions";

const ROLE_CFG: Record<string, { label: string; home: string }> = {
  PROFESSOR:   { label: "Professor · EJA SESI",   home: "/professor" },
  COORDENACAO: { label: "Coordenação · EJA SESI", home: "/coordenacao" },
};

const inputClass =
  "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";
const readOnlyClass =
  "w-full rounded border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#4B5563]";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

function Field({
  label, value, onChange, type = "text", readOnly = false,
}: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      {readOnly ? (
        <p className={readOnlyClass}>{value || <span className="text-[#D9D9D9]">—</span>}</p>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

export default function PerfilClient({ conta }: { conta: PerfilConta }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nome, setNome] = useState(conta.nome);
  const [email, setEmail] = useState(conta.email);
  const [telefone, setTelefone] = useState(conta.telefone ?? "");
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState("");

  const cfg = ROLE_CFG[conta.role] ?? { label: "EJA SESI", home: "/" };

  function salvar() {
    setErro("");
    startTransition(async () => {
      const res = await salvarPerfilAction({ nome, email, telefone });
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={cfg.home} className="flex w-fit items-center gap-1 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={16} />
        Voltar
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">Meu Perfil</h1>

      {/* Cartão institucional / avatar */}
      <div className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] ring-2 ring-[#009640]/20">
          <span className="text-xl font-bold text-[#009640]">{getInitials(nome)}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-gray-900">{nome}</p>
          <p className="text-sm text-[#4B5563]">{cfg.label}</p>
        </div>
        <div className="ml-auto">
          <User size={22} className="text-[#D9D9D9]" />
        </div>
      </div>

      {/* Feedback */}
      {saved && (
        <div className="flex items-center gap-2 rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
          <Check size={16} className="shrink-0" />
          Dados salvos
        </div>
      )}
      {erro && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {erro}
        </div>
      )}

      {/* Formulário */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">Informações pessoais</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome completo" value={nome} onChange={setNome} />
          </div>
          <Field label="E-mail" type="email" value={email} onChange={setEmail} />

          {/* Telefone/Área/Polo só existem para o PROFESSOR no banco. */}
          {conta.temProfessor && (
            <>
              <Field label="Telefone" type="tel" value={telefone} onChange={setTelefone} />
              <Field label="Área de atuação" value={conta.areaNome ?? ""} readOnly />
              <Field label="Polo" value={conta.poloNome ?? ""} readOnly />
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={salvar}
            disabled={isPending}
            className="rounded bg-[#009640] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
          >
            {isPending ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
