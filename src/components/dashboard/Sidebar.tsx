import Link from "next/link";
import type { Role } from "@/lib/mock-data/users";

const navByRole: Record<Role, { href: string; label: string }[]> = {
  ALUNO: [{ href: "/aluno", label: "Início" }],
  PROFESSOR: [
    { href: "/professor",       label: "Início" },
    { href: "/professor/turmas", label: "Turmas" },
    { href: "/professor/aulas",  label: "Aulas Gravadas" },
  ],
  COORDENACAO: [
    { href: "/coordenacao",               label: "Visão Geral"     },
    { href: "/coordenacao/gestao",        label: "Gestão"          },
    { href: "/coordenacao/acompanhamento",label: "Acompanhamento"  },
    { href: "/coordenacao/relatorios",    label: "Relatórios"      },
  ],
};

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0f2d52] md:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white">Portal EJA</span>
          <span className="text-xs text-white/50">Educação de Jovens e Adultos</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navByRole[role].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-white/30 text-center">v1.0 · 2026</p>
      </div>
    </aside>
  );
}
