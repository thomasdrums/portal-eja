import { carregarTurmasResumo } from "@/lib/queries/relatorios";
import RelatorioPorTurmaClient from "./por-turma-client";

// Turmas reais do banco a cada carga.
export const dynamic = "force-dynamic";

export default async function RelatorioPorTurmaPage() {
  const { turmas } = await carregarTurmasResumo();
  return <RelatorioPorTurmaClient turmas={turmas} />;
}
