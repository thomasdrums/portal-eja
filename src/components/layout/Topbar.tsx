"use client";

import { useState, useRef, useEffect } from "react";
import { User, ChevronDown, KeyRound, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const portalLabel: Record<string, string> = {
  ALUNO:       "Portal do Aluno",
  PROFESSOR:   "Portal do Professor",
  COORDENACAO: "Portal da Coordenação",
};

export function Topbar({
  name,
  email,
  role,
}: {
  name: string;
  email?: string | null;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#009640] px-4 shadow-sm md:px-6">
      {/* Identidade do portal */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/20 ring-1 ring-white/25">
          <span className="text-[11px] font-extrabold leading-none tracking-tight text-white">
            EJA
          </span>
        </div>
        <div>
          <p className="text-[14px] font-bold leading-tight text-white">EJA SESI</p>
          <p className="hidden text-[10.5px] leading-none text-white/60 md:block">
            {portalLabel[role] ?? "Portal"}
          </p>
        </div>
      </div>

      {/* Usuário + dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="true"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/10"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
            <User size={15} className="text-white" />
          </div>
          <div className="hidden text-left md:block">
            <p className="text-[13px] font-bold leading-tight text-white">{name}</p>
            {email && (
              <p className="text-[10.5px] leading-none text-white/60">{email}</p>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-white/80 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Menu suspenso */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <Link
              href="#"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 transition hover:bg-[#F5F5F5]"
            >
              <User size={14} className="shrink-0 text-[#4B5563]" />
              Meu Perfil
            </Link>
            <Link
              href="#"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 transition hover:bg-[#F5F5F5]"
            >
              <KeyRound size={14} className="shrink-0 text-[#4B5563]" />
              Alterar Senha
            </Link>
            <Link
              href="#"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 transition hover:bg-[#F5F5F5]"
            >
              <Settings size={14} className="shrink-0 text-[#4B5563]" />
              Configurações
            </Link>
            <div className="my-1 border-t border-[#E5E7EB]" />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={14} className="shrink-0" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
