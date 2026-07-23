import { auth } from "@/lib/auth";
import { listarRespostasParaValidacao } from "@/lib/queries/aulas";
import RespostasProfessorClient from "./respostas-client";

// Depende da sessão e reflete o banco a cada acesso.
export const dynamic = "force-dynamic";

export default async function ProfessorRespostasPage() {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";

  const dados = await listarRespostasParaValidacao(session?.user?.id, isCoordenacao);

  return <RespostasProfessorClient dados={dados} />;
}
