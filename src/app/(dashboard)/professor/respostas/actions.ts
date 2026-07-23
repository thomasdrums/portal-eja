"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  validarResposta,
  validarRespostasEmLote,
  recusarResposta,
  desfazerValidacao,
  type ResultadoAcao,
} from "@/lib/queries/aulas";

// A tela do aluno também muda de estado quando o professor valida/recusa.
function revalidar() {
  revalidatePath("/professor/respostas");
  revalidatePath("/professor");
  revalidatePath("/aluno/aulas");
}

export async function validarRespostaAction(id: string): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const res = await validarResposta(id, session?.user?.id, isCoordenacao);
  if (res.ok) revalidar();
  return res;
}

export async function validarRespostasEmLoteAction(ids: string[]): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const res = await validarRespostasEmLote(ids, session?.user?.id, isCoordenacao);
  if (res.ok) revalidar();
  return res;
}

export async function recusarRespostaAction(
  id: string,
  motivo: string,
): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const res = await recusarResposta(id, motivo, session?.user?.id, isCoordenacao);
  if (res.ok) revalidar();
  return res;
}

export async function desfazerValidacaoAction(id: string): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const res = await desfazerValidacao(id, session?.user?.id, isCoordenacao);
  if (res.ok) revalidar();
  return res;
}
