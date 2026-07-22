"use server";

import { revalidatePath } from "next/cache";
import { atualizarStatusSolicitacao, type ResultadoAcao } from "@/lib/queries/solicitacoes";
import type { StatusSolicitacao } from "@prisma/client";

export async function atualizarStatusAction(
  id: string,
  status: StatusSolicitacao,
): Promise<ResultadoAcao> {
  const res = await atualizarStatusSolicitacao(id, status);
  if (res.ok) {
    // A tela é acessível por /relatorios/solicitacoes e re-exportada em /documentos.
    revalidatePath("/coordenacao/relatorios/solicitacoes");
    revalidatePath("/coordenacao/documentos");
  }
  return res;
}
