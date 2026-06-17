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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#0f2d52] px-4 shadow-md md:h-16 md:px-6">
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-white md:hidden">
          Portal EJA
        </span>
        <span className="hidden text-sm font-medium text-white/70 md:block">
          {roleLabel[role] ?? role}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
            <span className="text-xs font-bold text-white">
              {getInitials(name)}
            </span>
          </div>
          <span className="hidden text-sm font-medium text-white md:block">
            {name}
          </span>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
