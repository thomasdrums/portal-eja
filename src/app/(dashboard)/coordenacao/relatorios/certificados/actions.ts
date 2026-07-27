"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  definirHistoricoEntregue,
  emitirCertificado,
  marcarCertificadoEntregue,
  type ResultadoCertificado,
} from "@/lib/queries/certificados";

// As duas rotas que mostram a tela de certificados leem do banco a cada carga.
function revalidar() {
  revalidatePath("/coordenacao/certificados");
  revalidatePath("/coordenacao/relatorios/certificados");
}

// Só a COORDENAÇÃO altera a documentação. Barra qualquer outro papel no servidor.
async function garantirCoordenacao(): Promise<ResultadoCertificado | null> {
  const session = await auth();
  if (session?.user?.role !== "COORDENACAO") {
    return { ok: false, message: "Ação permitida apenas à coordenação." };
  }
  return null;
}

export async function definirHistoricoEntregueAction(
  id: string,
  entregue: boolean,
): Promise<ResultadoCertificado> {
  const bloqueio = await garantirCoordenacao();
  if (bloqueio) return bloqueio;

  const res = await definirHistoricoEntregue(id, entregue);
  if (res.ok) revalidar();
  return res;
}

export async function emitirCertificadoAction(id: string): Promise<ResultadoCertificado> {
  const bloqueio = await garantirCoordenacao();
  if (bloqueio) return bloqueio;

  const res = await emitirCertificado(id);
  if (res.ok) revalidar();
  return res;
}

export async function marcarCertificadoEntregueAction(
  id: string,
): Promise<ResultadoCertificado> {
  const bloqueio = await garantirCoordenacao();
  if (bloqueio) return bloqueio;

  const res = await marcarCertificadoEntregue(id);
  if (res.ok) revalidar();
  return res;
}
