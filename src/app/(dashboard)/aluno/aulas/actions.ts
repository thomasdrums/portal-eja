"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { responderAula, type ResultadoAcao } from "@/lib/queries/aulas";

// O aluno é derivado da sessão no servidor — nunca de um id vindo do cliente.
export async function responderAulaAction(
  aulaId: string,
  texto: string,
): Promise<ResultadoAcao> {
  const session = await auth();
  const res = await responderAula(aulaId, texto, session?.user?.id);
  if (res.ok) {
    revalidatePath("/aluno/aulas");
    revalidatePath("/aluno");
  }
  return res;
}
