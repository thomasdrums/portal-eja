import { carregarRelatorioFrequencia } from "@/lib/queries/frequencia";
import RelatorioFrequenciaClient from "./frequencia-client";

// Calculada a cada acesso a partir das respostas validadas.
export const dynamic = "force-dynamic";

export default async function RelatorioFrequenciaPage() {
  const dados = await carregarRelatorioFrequencia();
  return <RelatorioFrequenciaClient dados={dados} />;
}
