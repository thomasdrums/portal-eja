import { listarAlunos, listarAlunosArquivados, listarTurmas } from "@/lib/queries/alunos";
import { listarPolos } from "@/lib/queries/professores";
import GestaoAlunosClient from "./gestao-alunos-client";

// Sempre renderiza com dados atuais do banco (revalidado pelas Server Actions).
export const dynamic = "force-dynamic";

export default async function GestaoAlunosPage() {
  const [alunos, arquivados, turmas, polos] = await Promise.all([
    listarAlunos(),
    listarAlunosArquivados(),
    listarTurmas(),
    listarPolos(),
  ]);
  return (
    <GestaoAlunosClient
      alunosIniciais={alunos}
      arquivadosIniciais={arquivados}
      turmas={turmas}
      polos={polos}
    />
  );
}
