"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  BookOpen,
  BarChart2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/coordenacao",                         label: "Visão Geral",    Icon: LayoutDashboard, exact: true },
  { href: "/coordenacao/gestao",                  label: "Gestão",         Icon: Settings2 },
  { href: "/coordenacao/acompanhamento",          label: "Acompanhamento", Icon: BookOpen },
  { href: "/coordenacao/relatorios",              label: "Relatórios",     Icon: BarChart2 },
  { href: "/coordenacao/relatorios/solicitacoes", label: "Documentos",     Icon: FileText },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-white border-r border-[#D9D9D9] transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Navegação */}
      <nav className="flex-1 space-y-0.5 p-2 pt-2">
        {/* Botão recolher */}
        <div className={`mb-1 flex ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className="flex h-6 w-6 items-center justify-center rounded border border-[#D9D9D9] text-[#9CA3AF] transition hover:border-[#009640]/30 hover:bg-[#EAF6EE] hover:text-[#009640]"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>
        {navItems.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded px-2.5 py-2 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : "gap-2.5"
              } ${
                active
                  ? "bg-[#EAF6EE] text-[#009640]"
                  : "text-[#4B5563] hover:bg-[#EAF6EE] hover:text-[#009640]"
              }`}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.25 : 1.75}
                className={`shrink-0 transition-colors ${
                  active ? "text-[#009640]" : "text-[#4B5563]"
                }`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      {!collapsed && (
        <div className="border-t border-[#D9D9D9] px-4 py-3">
          <p className="text-center text-[10px] font-medium tracking-widest text-[#D9D9D9]">
            Portal EJA SESI · 2026
          </p>
        </div>
      )}
    </aside>
  );
}
