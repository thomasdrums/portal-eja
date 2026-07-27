import { carregarRelatorioNotas } from "@/lib/queries/relatorios-avaliacao";
import NotasClient from "./notas-client";

// Notas reais do banco (médias e aprovação pela regra única) a cada carga.
export const dynamic = "force-dynamic";

export default async function RelatorioNotasPage() {
  const dados = await carregarRelatorioNotas();
  return <NotasClient dados={dados} />;
}
