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

const variants = {
  default: "bg-[#009640] shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
  wine:    "bg-[#8B1E3F] shadow-[0_2px_8px_rgba(139,30,63,0.22)]",
};

export function Topbar({
  name,
  role,
  variant = "default",
}: {
  name: string;
  role: string;
  variant?: keyof typeof variants;
}) {
  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center justify-between px-4 md:h-16 md:px-6 ${variants[variant]}`}
    >
      {/* Logo + nome do portal */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
          <span className="text-[11px] font-extrabold leading-none tracking-tight text-white">
            EJA
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-bold leading-tight text-white">
            Portal EJA SESI
          </span>
          <span className="hidden text-[10.5px] leading-none text-white/55 md:block">
            Educação de Jovens e Adultos
          </span>
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-1">
        <button
          title="Notificações"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-all hover:bg-white/12 hover:text-white"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>

        <div className="mx-2 hidden h-5 w-px bg-white/20 md:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
            <span className="text-[12px] font-bold leading-none text-white">
              {getInitials(name)}
            </span>
          </div>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-[12.5px] font-semibold leading-tight text-white">{name}</span>
            <span className="mt-0.5 text-[10.5px] leading-none text-white/55">
              {roleLabel[role] ?? role}
            </span>
          </div>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
