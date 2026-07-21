"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeft, Settings } from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  ALUNO: "/aluno",
  PROFESSOR: "/professor",
  COORDENACAO: "/coordenacao",
};

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const home = ROLE_HOME[session?.user?.role ?? ""] ?? "/";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={home} className="flex w-fit items-center gap-1 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={16} />
        Voltar
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>

      {/* TODO: definir na Fase 2 */}
      <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF6EE]">
          <Settings size={22} className="text-[#009640]" />
        </div>
        <p className="text-base font-semibold text-gray-900">Configurações</p>
        <p className="text-sm text-[#4B5563]">Disponível em breve.</p>
      </div>
    </div>
  );
}
