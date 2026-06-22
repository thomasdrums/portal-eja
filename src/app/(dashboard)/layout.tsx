import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/layout/Topbar";
import { MenuPrincipal } from "@/components/layout/MenuPrincipal";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { name, email, role } = session.user;

  /* ── ALUNO ── */
  if (role === "ALUNO") {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Topbar name={name ?? "Aluno"} email={email} role="ALUNO" />
        <MenuPrincipal role="ALUNO" />
        <main className="px-4 py-6">{children}</main>
      </div>
    );
  }

  /* ── PROFESSOR ── */
  if (role === "PROFESSOR") {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Topbar name={name ?? "Professor"} email={email} role="PROFESSOR" />
        <MenuPrincipal role="PROFESSOR" />
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>
    );
  }

  /* ── COORDENAÇÃO ── */
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Topbar name={name ?? "Coordenação"} email={email} role="COORDENACAO" />
      {/* Hambúrguer visível só no mobile; sidebar cuida do desktop */}
      <MenuPrincipal role="COORDENACAO" mobileOnly />
      <div className="flex" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
