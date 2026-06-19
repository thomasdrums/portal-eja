"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X, Home, User, LogOut } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

export function DrawerMenu({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/10 active:bg-white/20"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#009640] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
              <span className="text-sm font-bold text-white">{getInitials(userName)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{userName}</p>
              <p className="text-[11px] text-white/60 leading-tight">Aluno · EJA SESI</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded text-white/70 hover:bg-white/10"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <Link
            href="/aluno"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-[#4B5563] transition hover:bg-[#EAF6EE] hover:text-[#009640]"
          >
            <Home size={17} className="shrink-0" />
            Início
          </Link>
          <Link
            href="/aluno/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-[#4B5563] transition hover:bg-[#EAF6EE] hover:text-[#009640]"
          >
            <User size={17} className="shrink-0" />
            Meu Perfil
          </Link>
        </nav>

        {/* Sign out */}
        <div className="border-t border-[#D9D9D9] p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={17} className="shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </>
  );
}
