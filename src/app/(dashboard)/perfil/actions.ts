"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  salvarPerfilConta,
  type EdicaoPerfilInput,
  type ResultadoPerfil,
} from "@/lib/queries/perfil";

// Salva o perfil da PRÓPRIA conta. O userId vem da sessão no servidor —
// nunca de um id enviado pelo cliente (cada um edita só o próprio perfil).
export async function salvarPerfilAction(
  dados: EdicaoPerfilInput,
): Promise<ResultadoPerfil> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sessão expirada. Faça login novamente." };

  const res = await salvarPerfilConta(userId, dados);
  if (res.ok) revalidatePath("/perfil");
  return res;
}
