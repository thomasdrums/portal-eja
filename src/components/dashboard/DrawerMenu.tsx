"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

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
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 active:bg-white/20"
        aria-label="Abrir menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User header */}
        <div className="relative bg-gradient-to-br from-[#0f2d52] to-[#1565c0] px-6 pb-6 pt-12">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            aria-label="Fechar menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 text-2xl font-bold text-white ring-2 ring-white/30">
            {getInitials(userName)}
          </div>
          <p className="mt-3 text-lg font-bold text-white">{userName}</p>
          <p className="text-sm text-white/60">Aluno · EJA</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/aluno"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-medium text-gray-700 transition hover:bg-[#e8f4fd] hover:text-[#0f2d52]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0f2d52" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75v-4.5H9V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
              </svg>
            </span>
            Início
          </Link>
          <Link
            href="/aluno/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-medium text-gray-700 transition hover:bg-[#e8f4fd] hover:text-[#0f2d52]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0f2d52" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
            Meu Perfil
          </Link>
        </nav>

        {/* Sign out */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold text-red-600 transition hover:bg-red-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="rgb(220,38,38)" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </span>
            Sair
          </button>
        </div>
      </div>
    </>
  );
}
