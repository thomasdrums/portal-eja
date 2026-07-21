"use server";

import { revalidatePath } from "next/cache";
import {
  criarAluno,
  atualizarAluno,
  definirAtivo,
  resetarSenhaAluno,
  type NovoAlunoInput,
  type EdicaoAlunoInput,
  type ResultadoAluno,
} from "@/lib/queries/alunos";

const PATH = "/coordenacao/gestao-alunos";

export async function criarAlunoAction(dados: NovoAlunoInput): Promise<ResultadoAluno> {
  const res = await criarAluno(dados);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function atualizarAlunoAction(
  id: string,
  dados: EdicaoAlunoInput,
): Promise<ResultadoAluno> {
  const res = await atualizarAluno(id, dados);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function definirAtivoAction(id: string, ativo: boolean): Promise<ResultadoAluno> {
  const res = await definirAtivo(id, ativo);
  if (res.ok) revalidatePath(PATH);
  return res;
}

export async function resetarSenhaAction(id: string): Promise<ResultadoAluno> {
  // Não altera a lista de alunos, então não precisa revalidar a rota.
  return resetarSenhaAluno(id);
}
