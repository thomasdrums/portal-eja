import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/mock-data/users";

const roleHome: Record<Role, string> = {
  ALUNO: "/aluno",
  PROFESSOR: "/professor",
  COORDENACAO: "/coordenacao",
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(roleHome[session.user.role]);
}
