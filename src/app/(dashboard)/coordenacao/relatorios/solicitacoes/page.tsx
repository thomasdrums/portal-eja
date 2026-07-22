import { listarSolicitacoes } from "@/lib/queries/solicitacoes";
import RelatorioSolicitacoesClient from "./solicitacoes-client";

export const dynamic = "force-dynamic";

export default async function RelatorioSolicitacoesPage() {
  const solicitacoes = await listarSolicitacoes();
  return <RelatorioSolicitacoesClient solicitacoesIniciais={solicitacoes} />;
}
