"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      title="Sair"
      className="flex h-8 w-8 items-center justify-center rounded text-white/80 transition hover:bg-white/10 active:scale-95"
    >
      <LogOut size={16} />
    </button>
  );
}
