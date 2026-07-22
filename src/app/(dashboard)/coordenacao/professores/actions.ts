"use server";

import { revalidatePath } from "next/cache";
import {
  criarProfessor,
  atualizarProfessor,
  definirAtivoProfessor,
  arquivarProfessor,
  desarquivarProfessor,
  type NovoProfessorInput,
  type EdicaoProfessorInput,
  type ResultadoAcao,
} from "@/lib/queries/professores";

const PATH = "/coordenacao/professores";

export async function criarProfessorAction(dados: NovoProfessorInput): Promise<ResultadoAcao> {
  const res = await criarProfessor(dados);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function atualizarProfessorAction(
  id: string,
  dados: EdicaoProfessorInput,
): Promise<ResultadoAcao> {
  const res = await atualizarProfessor(id, dados);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function definirAtivoProfessorAction(
  id: string,
  ativo: boolean,
): Promise<ResultadoAcao> {
  const res = await definirAtivoProfessor(id, ativo);
  if (res.ok) revalidatePath(PATH);
  return res;
}

// "Excluir" = arquivar (soft delete). O registro sai das listas mas fica no banco.
export async function arquivarProfessorAction(id: string): Promise<ResultadoAcao> {
  const res = await arquivarProfessor(id);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function desarquivarProfessorAction(id: string): Promise<ResultadoAcao> {
  const res = await desarquivarProfessor(id);
  if (res.ok) revalidatePath(PATH);
  return res;
}
