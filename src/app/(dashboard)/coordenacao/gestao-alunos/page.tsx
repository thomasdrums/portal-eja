import { listarAlunos, listarTurmas } from "@/lib/queries/alunos";
import GestaoAlunosClient from "./gestao-alunos-client";

// Sempre renderiza com dados atuais do banco (revalidado pelas Server Actions).
export const dynamic = "force-dynamic";

export default async function GestaoAlunosPage() {
  const [alunos, turmas] = await Promise.all([listarAlunos(), listarTurmas()]);
  return <GestaoAlunosClient alunosIniciais={alunos} turmas={turmas} />;
}
