// (Resumo/áreas do aluno saíram do mock: nome e turma vêm da sessão e do banco;
//  notas por área vêm de src/lib/queries/notas.ts — telas /aluno e /aluno/notas.)

// (Frequência do aluno agora é CALCULADA a partir das respostas validadas —
//  ver src/lib/queries/frequencia.ts. O mock alunoFrequencia foi removido na Etapa 5.)

// ── Solicitações ─────────────────────────────────────────
export type StatusSolicitacao =
  | "EM_ANALISE"
  | "EM_PROCESSAMENTO"
  | "CONCLUIDA";

export type Solicitacao = {
  id: string;
  tipo: string;
  dataHora: string;
  status: StatusSolicitacao;
};

export const alunoSolicitacoes: Solicitacao[] = [
  {
    id: "sol-1",
    tipo: "Declaração de Matrícula",
    dataHora: "10/06/2026 14:30",
    status: "CONCLUIDA",
  },
  {
    id: "sol-2",
    tipo: "Histórico Escolar",
    dataHora: "14/06/2026 09:15",
    status: "EM_PROCESSAMENTO",
  },
];

export const tiposDocumento = [
  "Declaração de Matrícula",
  "Declaração de Frequência",
  "Histórico Escolar",
  "Certificado",
  "Outros documentos",
] as const;

// (Aulas Gravadas do aluno agora vêm do banco — ver src/lib/queries/aulas.ts
//  e a rota /aluno/aulas. O mock antigo foi removido na Etapa 3.)

// ── Perfil ────────────────────────────────────────────────
export type AlunoPerfil = {
  nome: string;
  cidade: string;
  telefone: string;
  cep: string;
  nomePai: string;
  nomeMae: string;
};

export const alunoPerfil: AlunoPerfil = {
  nome: "Maria Souza",
  cidade: "São Paulo",
  telefone: "(11) 99999-9999",
  cep: "01310-100",
  nomePai: "José Souza",
  nomeMae: "Ana Souza",
};
