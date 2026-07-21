"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeft, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  ALUNO: "/aluno",
  PROFESSOR: "/professor",
  COORDENACAO: "/coordenacao",
};

const inputClass =
  "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 pr-10 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";

function PasswordField({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#009640]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function AlterarSenhaPage() {
  const { data: session } = useSession();
  const home = ROLE_HOME[session?.user?.role ?? ""] ?? "/";

  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(false);

    // Validações no cliente
    if (!atual) {
      setErro("Informe a senha atual.");
      return;
    }
    if (nova.length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (nova !== confirmar) {
      setErro("A confirmação não corresponde à nova senha.");
      return;
    }

    // TODO: persistir no banco (Fase 2) — não altera a autenticação real.
    setErro("");
    setOk(true);
    setAtual("");
    setNova("");
    setConfirmar("");
    setTimeout(() => setOk(false), 3000);
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <Link href={home} className="flex w-fit items-center gap-1 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={16} />
        Voltar
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">Alterar Senha</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      >
        <PasswordField label="Senha atual" value={atual} onChange={setAtual} />
        <PasswordField label="Nova senha" value={nova} onChange={setNova} />
        <PasswordField label="Confirmar nova senha" value={confirmar} onChange={setConfirmar} />

        <p className="text-xs text-[#9CA3AF]">
          A nova senha deve ter no mínimo 6 caracteres. Nesta etapa a alteração é apenas simulada e
          não persiste (em breve, com o banco de dados).
        </p>

        {erro && (
          <div className="flex items-center gap-2 rounded border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {erro}
          </div>
        )}
        {ok && (
          <div className="flex items-center gap-2 rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
            <Check size={16} className="shrink-0" />
            Senha alterada com sucesso
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded bg-[#009640] py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33]"
        >
          Alterar senha
        </button>
      </form>
    </div>
  );
}
