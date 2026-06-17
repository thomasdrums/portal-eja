import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { BottomNav } from "@/components/dashboard/BottomNav";
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
      <div className="min-h-screen bg-[#f5f8fc]">
        <header className="sticky top-0 z-30 flex h-14 items-center bg-[#0f2d52] px-3 shadow-md">
          <DrawerMenu userName={name ?? "Aluno"} />
          <span className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-white">
            Portal EJA
          </span>
        </header>
        <main className="pb-24">{children}</main>
        <BottomNav role="ALUNO" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f8fc]">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar name={name ?? ""} role={role} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
