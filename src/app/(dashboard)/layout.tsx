import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/dashboard/Topbar";
import { HorizontalNav } from "@/components/dashboard/HorizontalNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DrawerMenu } from "@/components/dashboard/DrawerMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { name, role } = session.user;

  if (role === "ALUNO") {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <header className="sticky top-0 z-30 flex h-14 items-center bg-[#009640] px-3 shadow-sm">
          <DrawerMenu userName={name ?? "Aluno"} />
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-white">
            Portal EJA SESI
          </span>
        </header>
        <main className="px-4 py-6">{children}</main>
      </div>
    );
  }

  if (role === "PROFESSOR") {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Topbar name={name ?? ""} role="PROFESSOR" />
        <HorizontalNav role="PROFESSOR" />
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Topbar name={name ?? ""} role="COORDENACAO" />
      <div className="flex" style={{ minHeight: "calc(100vh - 4rem)" }}>
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
