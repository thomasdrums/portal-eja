"use server";

import { revalidatePath } from "next/cache";
import {
  atualizarStatusSolicitacao,
  definirLinkDocumento,
  type ResultadoAcao,
} from "@/lib/queries/solicitacoes";
import type { StatusSolicitacao } from "@prisma/client";

// A tela é acessível por /relatorios/solicitacoes e re-exportada em /documentos.
function revalidar() {
  revalidatePath("/coordenacao/relatorios/solicitacoes");
  revalidatePath("/coordenacao/documentos");
}

export async function atualizarStatusAction(
  id: string,
  status: StatusSolicitacao,
): Promise<ResultadoAcao> {
  const res = await atualizarStatusSolicitacao(id, status);
  if (res.ok) revalidar();
  return res;
}

export async function definirLinkDocumentoAction(
  id: string,
  url: string,
): Promise<ResultadoAcao> {
  const res = await definirLinkDocumento(id, url);
  if (res.ok) revalidar();
  return res;
}
