"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  criarAula,
  atualizarAula,
  excluirAula,
  type AulaInput,
  type ResultadoAcao,
} from "@/lib/queries/aulas";

export async function criarAulaAction(input: AulaInput): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const res = await criarAula(input, session?.user?.id, isCoordenacao);
  if (res.ok) revalidatePath("/professor/aulas");
  return res;
}

export async function atualizarAulaAction(
  id: string,
  input: AulaInput,
): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const res = await atualizarAula(id, input, session?.user?.id, isCoordenacao);
  if (res.ok) revalidatePath("/professor/aulas");
  return res;
}

export async function excluirAulaAction(id: string): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";
  const res = await excluirAula(id, session?.user?.id, isCoordenacao);
  if (res.ok) revalidatePath("/professor/aulas");
  return res;
}
