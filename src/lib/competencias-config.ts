// ── Configuração das competências (fonte única) ──────────────────────────────
// Para cada área: as competências e o total de HABILIDADES de cada uma.
// O total de habilidades é usado no cálculo de certificação (% = validadas / total).
//
// TODO: tornar editável pela coordenação (Fase 2)

export type AreaConfigId =
  | "matematica"
  | "linguagens"
  | "cienciasNatureza"
  | "cienciasHumanas";

export type AreaCompetencias = {
  nome: string;
  // chave = id da competência (C1, C2, …) · valor = total de habilidades
  competencias: Record<string, number>;
};

export const COMPETENCIAS_CONFIG: Record<AreaConfigId, AreaCompetencias> = {
  matematica: {
    nome: "Matemática",
    competencias: { C1: 4, C2: 7, C3: 5, C4: 3, C5: 4 },
  },
  linguagens: {
    nome: "Linguagens",
    competencias: { C1: 5, C2: 5, C3: 5, C4: 3 },
  },
  cienciasNatureza: {
    nome: "Ciências da Natureza",
    competencias: { C1: 5, C2: 4, C3: 4, C4: 5 },
  },
  cienciasHumanas: {
    nome: "Ciências Humanas",
    competencias: { C1: 5, C2: 4, C3: 4, C4: 5 },
  },
};

// Ordem padrão para exibição do seletor de áreas.
export const AREA_CONFIG_ORDER: AreaConfigId[] = [
  "matematica",
  "linguagens",
  "cienciasNatureza",
  "cienciasHumanas",
];

// Lista de competências (C1, C2, …) de uma área, na ordem de configuração.
export function competenciasDaArea(area: AreaConfigId): string[] {
  return Object.keys(COMPETENCIAS_CONFIG[area].competencias);
}

// Total de habilidades de uma competência específica.
export function totalHabilidades(area: AreaConfigId, comp: string): number {
  return COMPETENCIAS_CONFIG[area].competencias[comp] ?? 0;
}
