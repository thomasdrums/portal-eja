"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { criarSolicitacao, alunoIdDoUsuario, type ResultadoAcao } from "@/lib/queries/solicitacoes";
import type { TipoDocumento } from "@prisma/client";

export async function criarSolicitacaoAction(
  tipo: TipoDocumento,
  tipoOutros?: string,
): Promise<ResultadoAcao> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." };
  }

  // O aluno é sempre derivado da sessão no servidor (não confia no cliente).
  const alunoId = await alunoIdDoUsuario(userId);
  if (!alunoId) {
    return { ok: false, message: "Sua conta ainda não está vinculada a um cadastro de aluno." };
  }

  const res = await criarSolicitacao(alunoId, tipo, tipoOutros);
  if (res.ok) revalidatePath("/aluno/solicitacoes");
  return res;
}
