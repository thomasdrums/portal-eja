"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

type NavItem = { href: string; label: string; exact?: boolean };

const navByRole: Record<string, NavItem[]> = {
  ALUNO: [
    { href: "/aluno",              label: "Início",          exact: true },
    { href: "/aluno/notas",        label: "Notas" },
    { href: "/aluno/frequencia",   label: "Frequência" },
    { href: "/aluno/aulas",        label: "Aulas Gravadas" },
    { href: "/aluno/solicitacoes", label: "Solicitações" },
  ],
  PROFESSOR: [
    { href: "/professor",            label: "Visão Geral",   exact: true },
    { href: "/professor/turmas",     label: "Turmas" },
    { href: "/professor/aulas",      label: "Aulas Gravadas" },
    { href: "/professor/relatorios", label: "Relatórios" },
  ],
  COORDENACAO: [
    { href: "/coordenacao",                         label: "Visão Geral",   exact: true },
    { href: "/coordenacao/gestao",                  label: "Gestão" },
    { href: "/coordenacao/acompanhamento",          label: "Acompanhamento" },
    { href: "/coordenacao/relatorios",              label: "Relatórios" },
    { href: "/coordenacao/relatorios/solicitacoes", label: "Documentos" },
  ],
};

/**
 * mobileOnly=true → barra horizontal oculta em md+; só o hamburger aparece no mobile.
 * Usado para coordenação, onde o sidebar cuida da nav em desktop.
 */
export function MenuPrincipal({
  role,
  mobileOnly = false,
}: {
  role: string;
  mobileOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navByRole[role] ?? [];

  if (!items.length) return null;

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  const activeLabel = items.find(isActive)?.label;

  return (
    // Quando mobileOnly=true, o componente inteiro some em md+
    <div className={`border-b border-[#D9D9D9] bg-white shadow-sm ${mobileOnly ? "md:hidden" : ""}`}>
      {/* Barra horizontal — desktop; oculta quando mobileOnly */}
      {!mobileOnly && (
        <div className="hidden overflow-x-auto px-4 md:flex md:px-6">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border-b-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#009640] text-[#009640]"
                    : "border-transparent text-[#4B5563] hover:bg-[#EAF6EE] hover:text-[#009640]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Botão hambúrguer — mobile */}
      <div className="flex items-center justify-between px-4 py-2.5 md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 text-sm font-medium text-[#4B5563]"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
          Menu
        </button>
        {activeLabel && (
          <span className="text-xs font-medium text-[#9CA3AF]">{activeLabel}</span>
        )}
      </div>

      {/* Dropdown mobile */}
      {open && (
        <nav className="border-t border-[#E5E7EB] bg-white md:hidden">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block border-l-4 px-6 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-[#009640] bg-[#EAF6EE] text-[#009640]"
                    : "border-transparent text-[#4B5563] hover:bg-[#F5F5F5]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
