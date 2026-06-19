"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; exact?: boolean };

const navByRole: Record<string, NavItem[]> = {
  PROFESSOR: [
    { href: "/professor",            label: "Visão Geral",   exact: true },
    { href: "/professor/turmas",     label: "Turmas" },
    { href: "/professor/aulas",      label: "Aulas Gravadas" },
    { href: "/professor/relatorios", label: "Relatórios" },
  ],
};

export function HorizontalNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = navByRole[role];
  if (!items) return null;

  return (
    <nav className="border-b border-[#D9D9D9] bg-white shadow-sm">
      <div className="flex overflow-x-auto px-4 md:px-6">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 border-b-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "border-[#009640] text-[#009640]"
                  : "border-transparent text-[#4B5563] hover:border-[#009640]/40 hover:text-[#009640]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
