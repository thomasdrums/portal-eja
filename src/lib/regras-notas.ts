// ── Regras de cálculo de notas (lógica da planilha real do SESI) ──────────────
// Por competência, o professor digita 5 campos. A média da competência pode ser:
//   - por CERTIFICAÇÃO: percentual de habilidades validadas, ou
//   - por NOTA: soma de Presença + Diagnóstica + Avaliativa + Você Autor (0–100).

export type CamposCompetencia = {
  certificacao: number | null; // habilidades validadas (0 … total da competência)
  presenca: number | null; // 0 a 20
  diagnostica: number | null; // 0 a 20
  avaliativa: number | null; // 0 a 20
  voceAutor: number | null; // (VA) 0 a 40
};

export const CAMPOS_VAZIOS: CamposCompetencia = {
  certificacao: null,
  presenca: null,
  diagnostica: null,
  avaliativa: null,
  voceAutor: null,
};

export type MediaResultado =
  | { tipo: "certificado"; percentual: number }
  | { tipo: "nota"; valor: number }
  | { tipo: "vazio" };

// a) Percentual de certificação (inteiro).
export function percentualCertificacao(validadas: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((validadas / total) * 100);
}

// b) Mínimo de habilidades para certificar (maioria): 4→3, 5→3, 7→4, 3→2.
export function minParaCertificar(total: number): number {
  return Math.floor(total / 2) + 1;
}

function preenchido(v: number | null): boolean {
  return v !== null;
}

// c) Média da competência.
export function mediaCompetencia(
  campos: CamposCompetencia,
  total: number,
): MediaResultado {
  // Certificação tem precedência quando preenchida (> 0).
  if (campos.certificacao !== null && campos.certificacao > 0) {
    return {
      tipo: "certificado",
      percentual: percentualCertificacao(campos.certificacao, total),
    };
  }

  // Senão, se algum dos 4 campos de nota estiver preenchido → soma (0–100).
  const camposNota = [
    campos.presenca,
    campos.diagnostica,
    campos.avaliativa,
    campos.voceAutor,
  ];
  if (camposNota.some(preenchido)) {
    const soma =
      (campos.presenca ?? 0) +
      (campos.diagnostica ?? 0) +
      (campos.avaliativa ?? 0) +
      (campos.voceAutor ?? 0);
    return { tipo: "nota", valor: soma };
  }

  return { tipo: "vazio" };
}

// d) Competência aprovada?
export function competenciaAprovada(
  campos: CamposCompetencia,
  total: number,
): boolean {
  const media = mediaCompetencia(campos, total);
  if (media.tipo === "certificado") {
    return (campos.certificacao ?? 0) >= minParaCertificar(total);
  }
  if (media.tipo === "nota") {
    return media.valor >= 60;
  }
  return false;
}

// Situação resumida de UMA competência (usada no painel "Visão Geral").
//  - "aprovado": média é Certificado OU nota ≥ 60
//  - "cursando": há nota lançada, mas ainda não atingiu
//  - "vazio":    nada lançado
export type SituacaoCompetencia = "aprovado" | "cursando" | "vazio";

export function situacaoCompetencia(
  campos: CamposCompetencia,
  total: number,
): SituacaoCompetencia {
  const media = mediaCompetencia(campos, total);
  if (media.tipo === "vazio") return "vazio";
  if (media.tipo === "certificado") return "aprovado";
  return media.valor >= 60 ? "aprovado" : "cursando";
}

export type SituacaoArea = "Aprovado" | "Em Processo";

// e) Situação da área: "Aprovado" se TODAS as competências estiverem aprovadas.
export function situacaoArea(
  competencias: { campos: CamposCompetencia; total: number }[],
): SituacaoArea {
  // TODO: incluir frequência ≥ 75% nesta regra (Fase 2)
  if (competencias.length === 0) return "Em Processo";
  const todasAprovadas = competencias.every((c) =>
    competenciaAprovada(c.campos, c.total),
  );
  return todasAprovadas ? "Aprovado" : "Em Processo";
}
