import { auth } from "@/lib/auth";
import { listarAulasDoProfessor, carregarOpcoesAula } from "@/lib/queries/aulas";
import AulasProfessorClient from "./aulas-client";

// Depende da sessão e reflete o banco a cada acesso.
export const dynamic = "force-dynamic";

export default async function ProfessorAulasPage() {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";

  const [aulas, opcoes] = await Promise.all([
    listarAulasDoProfessor(session?.user?.id, isCoordenacao),
    carregarOpcoesAula(session?.user?.id, isCoordenacao),
  ]);

  return (
    <AulasProfessorClient
      aulasIniciais={aulas}
      opcoes={opcoes}
      professorNome={session?.user?.name ?? ""}
    />
  );
}
