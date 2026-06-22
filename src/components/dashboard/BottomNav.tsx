"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, Calendar, PlayCircle } from "lucide-react";
import type { Role } from "@/lib/mock-data/users";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ElementType;
};

const navByRole: Partial<Record<Role, NavItem[]>> = {
  ALUNO: [
    { href: "/aluno",           label: "Início",     Icon: Home },
    { href: "/aluno/notas",     label: "Notas",      Icon: Star },
    { href: "/aluno/frequencia",label: "Frequência", Icon: Calendar },
    { href: "/aluno/aulas",     label: "Aulas",      Icon: PlayCircle },
  ],
};

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navByRole[role];
  if (!items) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#D9D9D9] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:hidden">
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2"
          >
            <Icon
              size={22}
              className={active ? "text-[#009640]" : "text-[#9CA3AF]"}
              strokeWidth={active ? 2.25 : 1.75}
            />
            <span
              className={`text-[10px] font-semibold ${
                active ? "text-[#009640]" : "text-[#9CA3AF]"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
