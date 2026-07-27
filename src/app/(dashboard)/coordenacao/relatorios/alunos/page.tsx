import { carregarRelatorioAlunos } from "@/lib/queries/relatorios";
import RelatorioAlunosClient from "./alunos-client";

// Lê os alunos reais do banco a cada carga.
export const dynamic = "force-dynamic";

export default async function RelatorioAlunosPage() {
  const dados = await carregarRelatorioAlunos();
  return <RelatorioAlunosClient dados={dados} />;
}
