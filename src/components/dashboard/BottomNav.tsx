"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/mock-data/users";

type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "#0f2d52" : "none"} stroke={active ? "#0f2d52" : "#94a3b8"} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75v-4.5H9V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
    </svg>
  );
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "#0f2d52" : "none"} stroke={active ? "#0f2d52" : "#94a3b8"} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "#0f2d52" : "none"} stroke={active ? "#0f2d52" : "#94a3b8"} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function PlayIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "#0f2d52" : "none"} stroke={active ? "#0f2d52" : "#94a3b8"} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  );
}

const navByRole: Record<Role, NavItem[]> = {
  ALUNO: [
    { href: "/aluno", label: "Início", icon: (a) => <HomeIcon active={a} /> },
    { href: "/aluno/notas", label: "Notas", icon: (a) => <StarIcon active={a} /> },
    { href: "/aluno/frequencia", label: "Frequência", icon: (a) => <CalendarIcon active={a} /> },
    { href: "/aluno/aulas", label: "Aulas", icon: (a) => <PlayIcon active={a} /> },
  ],
  PROFESSOR: [
    { href: "/professor", label: "Início", icon: (a) => <HomeIcon active={a} /> },
  ],
  COORDENACAO: [
    { href: "/coordenacao", label: "Início", icon: (a) => <HomeIcon active={a} /> },
  ],
};

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2"
          >
            {item.icon(active)}
            <span className={`text-[10px] font-semibold ${active ? "text-[#0f2d52]" : "text-slate-400"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
