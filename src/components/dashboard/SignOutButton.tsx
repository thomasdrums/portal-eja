"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      title="Sair"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-white/75 transition-all hover:bg-white/15 hover:text-white active:scale-95"
    >
      <LogOut size={17} strokeWidth={1.75} />
    </button>
  );
}
