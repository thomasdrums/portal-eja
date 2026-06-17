"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 active:scale-95"
    >
      Sair
    </button>
  );
}
