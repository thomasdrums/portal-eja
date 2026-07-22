"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { salvarNotasDaArea, type ResultadoAcao } from "@/lib/queries/notas";
import type { CamposCompetencia } from "@/lib/regras-notas";
import type { AreaConfigId } from "@/lib/competencias-config";

// Salva as notas de UMA área da turma (Etapa C). O aluno/área/turma são validados no servidor.
export async function salvarNotasAction(
  turmaId: string,
  areaConfigId: AreaConfigId,
  notasPorAluno: Record<string, Record<string, CamposCompetencia>>,
): Promise<ResultadoAcao> {
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";

  const res = await salvarNotasDaArea(
    turmaId,
    areaConfigId,
    notasPorAluno,
    session?.user?.id,
    isCoordenacao,
  );

  if (res.ok) revalidatePath(`/professor/turmas/${turmaId}`);
  return res;
}
