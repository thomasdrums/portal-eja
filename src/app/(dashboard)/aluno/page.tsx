import { auth } from "@/lib/auth";
import { carregarFrequenciaDoAlunoLogado } from "@/lib/queries/frequencia";
import AlunoDashboardClient from "./dashboard-client";

// Depende da sessão e mostra a frequência calculada na hora.
export const dynamic = "force-dynamic";

export default async function AlunoDashboardPage() {
  const session = await auth();
  const dados = await carregarFrequenciaDoAlunoLogado(session?.user?.id);
  const frequencia = dados.temAluno ? dados.frequencia : null;

  return (
    <AlunoDashboardClient
      nome={session?.user?.name ?? "Aluno"}
      turmaNome={frequencia?.turmaNome ?? null}
      temAluno={dados.temAluno}
      frequencia={frequencia}
    />
  );
}
