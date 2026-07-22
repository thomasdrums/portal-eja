// Rótulos e cores das solicitações — módulo sem Prisma (seguro para client e server).
import type { StatusSolicitacao, TipoDocumento } from "@prisma/client";

export const TIPO_LABEL: Record<TipoDocumento, string> = {
  DECLARACAO_MATRICULA: "Declaração de Matrícula",
  DECLARACAO_FREQUENCIA: "Declaração de Frequência",
  HISTORICO_ESCOLAR: "Histórico Escolar",
  CERTIFICADO: "Certificado",
  OUTROS: "Outros documentos",
};

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  "DECLARACAO_MATRICULA",
  "DECLARACAO_FREQUENCIA",
  "HISTORICO_ESCOLAR",
  "CERTIFICADO",
  "OUTROS",
];

export const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  RECEBIDA: "Recebida",
  EM_ANALISE: "Em análise",
  EM_PROCESSAMENTO: "Em processamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

// Ordem do FLUXO de atendimento (filtros/contadores/seletor da coordenação).
// CANCELADA não entra aqui: é um estado final acionado pelo aluno.
export const STATUSES: StatusSolicitacao[] = [
  "RECEBIDA",
  "EM_ANALISE",
  "EM_PROCESSAMENTO",
  "CONCLUIDA",
];

export const STATUS_COR: Record<StatusSolicitacao, string> = {
  RECEBIDA: "bg-gray-100 text-gray-600",
  EM_ANALISE: "bg-[#EAF6EE] text-[#007A33]",
  EM_PROCESSAMENTO: "bg-amber-50 text-amber-700",
  CONCLUIDA: "bg-green-100 text-green-700",
  CANCELADA: "bg-red-50 text-red-600",
};
