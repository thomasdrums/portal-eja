import { listarTurmas } from "@/lib/queries/turmas";
import { listarPolos, listarProfessoresOpcoes } from "@/lib/queries/professores";
import GestaoTurmasClient from "./gestao-turmas-client";

export const dynamic = "force-dynamic";

export default async function GestaoTurmasPage() {
  const [turmas, polos, professores] = await Promise.all([
    listarTurmas(),
    listarPolos(),
    listarProfessoresOpcoes(),
  ]);
  return (
    <GestaoTurmasClient turmasIniciais={turmas} polos={polos} professores={professores} />
  );
}
