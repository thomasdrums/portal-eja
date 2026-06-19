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
  { href: "/coordenacao",                label: "Visão Geral",    Icon: LayoutDashboard, exact: true },
  { href: "/coordenacao/gestao",         label: "Gestão",         Icon: Settings2 },
  { href: "/coordenacao/acompanhamento", label: "Acompanhamento", Icon: BookOpen },
  { href: "/coordenacao/relatorios",     label: "Relatórios",     Icon: BarChart2 },
  { href: "/coordenacao/relatorios/solicitacoes", label: "Documentos", Icon: FileText },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-white border-r border-[#D9D9D9] transition-all duration-200 ${
        collapsed ? "w-14" : "w-52"
      }`}
    >
      {/* Collapse toggle */}
      <div className="flex h-11 items-center border-b border-[#D9D9D9] px-2.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`flex h-7 w-7 items-center justify-center rounded border border-[#D9D9D9] text-[#4B5563] hover:bg-[#F5F5F5] transition-colors ${
            collapsed ? "ml-auto mr-auto" : "ml-auto"
          }`}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {navItems.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded px-2.5 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                active
                  ? "bg-[#EAF6EE] text-[#009640]"
                  : "text-[#4B5563] hover:bg-[#F5F5F5] hover:text-[#009640]"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${active ? "text-[#009640]" : "text-[#4B5563]"}`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-[#D9D9D9] p-3">
          <p className="text-center text-[10px] text-[#D9D9D9]">Portal EJA SESI · 2026</p>
        </div>
      )}
    </aside>
  );
}
