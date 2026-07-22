import { auth } from "@/lib/auth";
import { listarSolicitacoesDoAluno, alunoIdDoUsuario } from "@/lib/queries/solicitacoes";
import SolicitacoesAlunoClient from "./solicitacoes-client";

export const dynamic = "force-dynamic";

export default async function SolicitacoesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const alunoId = userId ? await alunoIdDoUsuario(userId) : null;

  const solicitacoes = alunoId ? await listarSolicitacoesDoAluno(alunoId) : [];

  return (
    <SolicitacoesAlunoClient
      temAluno={alunoId !== null}
      solicitacoesIniciais={solicitacoes}
    />
  );
}
