import { carregarRelatorioConcluintes } from "@/lib/queries/relatorios-avaliacao";
import ConcluintesClient from "./concluintes-client";

// Concluinte é calculado (4 áreas concluídas) a partir do banco a cada carga.
export const dynamic = "force-dynamic";

export default async function RelatorioConcluentesPage() {
  const dados = await carregarRelatorioConcluintes();
  return <ConcluintesClient dados={dados} />;
}
