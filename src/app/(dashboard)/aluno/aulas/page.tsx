import { auth } from "@/lib/auth";
import { listarAulasDoAluno } from "@/lib/queries/aulas";
import AulasAlunoClient from "./aulas-client";

// Depende da sessão e reflete o banco a cada acesso.
export const dynamic = "force-dynamic";

export default async function AulasPage() {
  const session = await auth();
  const data = await listarAulasDoAluno(session?.user?.id);

  return (
    <AulasAlunoClient
      temAluno={data.temAluno}
      temTurma={data.temTurma}
      aulas={data.aulas}
    />
  );
}
