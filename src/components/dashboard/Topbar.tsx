import { Bell } from "lucide-react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

const roleLabel: Record<string, string> = {
  ALUNO: "Aluno",
  PROFESSOR: "Professor",
  COORDENACAO: "Coordenação",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

export function Topbar({ name, role }: { name: string; role: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#009640] px-4 shadow-sm md:h-16 md:px-6">
      {/* Logo + Portal name */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/20">
          <span className="text-[11px] font-extrabold leading-none text-white tracking-tight">EJA</span>
        </div>
        <div>
          <span className="text-sm font-bold text-white">Portal EJA SESI</span>
          <span className="hidden text-[10px] text-white/60 md:block">Educação de Jovens e Adultos</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <button
          title="Notificações"
          className="flex h-8 w-8 items-center justify-center rounded text-white/80 transition hover:bg-white/10"
        >
          <Bell size={18} />
        </button>

        <div className="mx-2 hidden h-5 w-px bg-white/20 md:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
            <span className="text-xs font-bold text-white">{getInitials(name)}</span>
          </div>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-xs font-semibold leading-none text-white">{name}</span>
            <span className="mt-0.5 text-[10px] leading-none text-white/60">
              {roleLabel[role] ?? role}
            </span>
          </div>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
