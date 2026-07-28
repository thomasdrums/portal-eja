// Rótulos das turmas — módulo sem Prisma (seguro para client e server).
import type { Modalidade } from "@prisma/client";

export const MODALIDADE_LABEL: Record<Modalidade, string> = {
  NOVA_EJA: "Nova EJA",
  SEJAPRO: "SEJAPRO",
};

export const MODALIDADES: Modalidade[] = ["NOVA_EJA", "SEJAPRO"];

// Rótulo legível a partir do valor do banco ("" quando nulo).
export function modalidadeLabel(v: Modalidade | null | undefined): string {
  return v ? MODALIDADE_LABEL[v] : "";
}
