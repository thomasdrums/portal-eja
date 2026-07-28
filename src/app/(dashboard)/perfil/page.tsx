import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { carregarPerfilConta } from "@/lib/queries/perfil";
import PerfilClient from "./perfil-client";

// Dados da própria conta, do banco. Depende da sessão.
export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await auth();
  // O aluno tem a própria tela (somente leitura) em /aluno/perfil.
  if (session?.user?.role === "ALUNO") redirect("/aluno/perfil");

  const conta = await carregarPerfilConta(session?.user?.id);
  if (!conta) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-[#4B5563]">Não foi possível carregar o perfil.</p>
      </div>
    );
  }

  return <PerfilClient conta={conta} />;
}
