import { carregarRelatorioTurmas } from "@/lib/queries/relatorios";
import AcompanhamentoClient from "./acompanhamento-client";

// Turmas reais do banco a cada carga.
export const dynamic = "force-dynamic";

export default async function AcompanhamentoPage() {
  const { linhas, polos } = await carregarRelatorioTurmas();
  return <AcompanhamentoClient turmas={linhas} polos={polos} />;
}
