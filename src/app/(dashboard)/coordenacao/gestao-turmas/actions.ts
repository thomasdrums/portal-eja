"use server";

import { revalidatePath } from "next/cache";
import {
  criarTurma,
  atualizarTurma,
  encerrarTurma,
  reabrirTurma,
  type NovaTurmaInput,
  type EdicaoTurmaInput,
  type ResultadoAcao,
} from "@/lib/queries/turmas";

const PATH = "/coordenacao/gestao-turmas";

export async function criarTurmaAction(dados: NovaTurmaInput): Promise<ResultadoAcao> {
  const res = await criarTurma(dados);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function atualizarTurmaAction(
  id: string,
  dados: EdicaoTurmaInput,
): Promise<ResultadoAcao> {
  const res = await atualizarTurma(id, dados);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function encerrarTurmaAction(id: string): Promise<ResultadoAcao> {
  const res = await encerrarTurma(id);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function reabrirTurmaAction(id: string): Promise<ResultadoAcao> {
  const res = await reabrirTurma(id);
  if (res.ok) revalidatePath(PATH);
  return res;
}
