// ── Tipos ────────────────────────────────────────────────
export type SituacaoAluno =
  | "APROVADO"
  | "CURSANDO"
  | "EM_PROCESSO"
  | "RDS"
  | "EVADIDO"
  | "DESISTENTE";

export const SITUACAO_CFG: Record<SituacaoAluno, { label: string; classes: string; descricao: string }> = {
  APROVADO:    { label: "Aprovado",    classes: "bg-green-50 text-green-700",   descricao: "Concluiu as competências."                                                             },
  CURSANDO:    { label: "Cursando",    classes: "bg-blue-50 text-blue-700",    descricao: "Aluno segue fazendo atividades e assistindo aula."                                    },
  EM_PROCESSO: { label: "Em Processo", classes: "bg-amber-50 text-amber-700",  descricao: "Aluno não conseguiu finalizar dentro do prazo."                                       },
  RDS:         { label: "RDS",         classes: "bg-purple-50 text-purple-700", descricao: "Reconhecimento de Saberes: aluno não avançou para o AVA (pode ser evadido ou desistente)." },
  EVADIDO:     { label: "Evadido",     classes: "bg-orange-50 text-orange-700", descricao: "Professor não consegue mais contato com o aluno."                                    },
  DESISTENTE:  { label: "Desistente",  classes: "bg-red-50 text-red-600",      descricao: "Aluno informou ao professor que não quer mais estudar."                               },
};

// Ativos = não evadido e não desistente
export function isAtivo(situacao: SituacaoAluno): boolean {
  return situacao !== "EVADIDO" && situacao !== "DESISTENTE";
}

export type AlunoDoc = {
  historicoEntregue: boolean;
  certificadoEmitido: boolean;
  certificadoRecebido: boolean;
};

export type AreaFreqData = { totalAulas: number; presencas: number };

export type AlunoNotas = {
  matematica: Record<string, number | null>;
  linguagens: Record<string, number | null>;
  cienciasNatureza: Record<string, number | null>;
  cienciasHumanas: Record<string, number | null>;
};

export type AlunoFrequencia = {
  matematica: AreaFreqData;
  linguagens: AreaFreqData;
  cienciasNatureza: AreaFreqData;
  cienciasHumanas: AreaFreqData;
  interarea: AreaFreqData;
};

export type Aluno = {
  id: string;
  ra: string;
  nome: string;
  cidade: string;
  telefone: string;
  escolaridade: string;
  dataMatricula: string;
  situacao: SituacaoAluno;
  documentacao: AlunoDoc;
  notas: AlunoNotas;
  frequencia: AlunoFrequencia;
};

export type Turma = { id: string; nome: string; alunos: Aluno[] };

// ── Configuração de áreas ─────────────────────────────────
export const AREAS_CONFIG = [
  { id: "matematica" as const,       nome: "Matemática",           competencias: ["C1","C2","C3","C4","C5"] },
  { id: "linguagens" as const,       nome: "Linguagens",           competencias: ["C1","C2","C3","C4"] },
  { id: "cienciasNatureza" as const, nome: "Ciências da Natureza", competencias: ["C1","C2","C3","C4"] },
  { id: "cienciasHumanas" as const,  nome: "Ciências Humanas",     competencias: ["C1","C2","C3","C4"] },
] as const;

export type AreaId = (typeof AREAS_CONFIG)[number]["id"];

// Áreas de frequência (inclui Interárea)
export const FREQ_AREAS_CONFIG = [
  { id: "matematica" as const,       nome: "Matemática"            },
  { id: "linguagens" as const,       nome: "Linguagens"            },
  { id: "cienciasNatureza" as const, nome: "Ciências da Natureza"  },
  { id: "cienciasHumanas" as const,  nome: "Ciências Humanas"      },
  { id: "interarea" as const,        nome: "Interárea"             },
] as const;

export type FreqAreaId = (typeof FREQ_AREAS_CONFIG)[number]["id"];

// Mapeamento disciplina (session) → AreaId
export const DISCIPLINA_TO_AREA_ID: Record<string, AreaId> = {
  "Matemática":           "matematica",
  "Linguagens":           "linguagens",
  "Ciências da Natureza": "cienciasNatureza",
  "Ciências Humanas":     "cienciasHumanas",
};

// Retorna as áreas de NOTAS que o professor pode editar
export function notasEditaveis(disciplina: string | null | undefined, role: string): AreaId[] {
  if (role === "COORDENACAO") return AREAS_CONFIG.map((a) => a.id);
  if (!disciplina) return [];
  const id = DISCIPLINA_TO_AREA_ID[disciplina];
  return id ? [id] : [];
}

// Retorna as áreas de FREQUÊNCIA que o professor pode editar
export function freqEditaveis(disciplina: string | null | undefined, role: string): FreqAreaId[] {
  if (role === "COORDENACAO") return FREQ_AREAS_CONFIG.map((a) => a.id);
  if (!disciplina) return ["interarea"];
  const id = DISCIPLINA_TO_AREA_ID[disciplina];
  return (id ? [id, "interarea"] : ["interarea"]) as FreqAreaId[];
}

// Retorna as áreas de AULAS visíveis/gerenciáveis
export function aulasVisiveis(disciplina: string | null | undefined, role: string): string[] {
  if (role === "COORDENACAO") return ["Matemática","Linguagens","Ciências da Natureza","Ciências Humanas","Interárea"];
  return [disciplina ?? "", "Interárea"].filter(Boolean);
}

// ── Turmas e alunos ────────────────────────────────────────
export const professorTurmas: Turma[] = [
  {
    id: "t261",
    nome: "Turma 26.1",
    alunos: [
      {
        id: "a1",
        ra: "2026000101",
        nome: "João Silva",
        cidade: "São Paulo",
        telefone: "(11) 98888-1111",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: true,  certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 75, C2: 45, C3: 80, C4: 62, C5: 55 },
          linguagens:       { C1: 80, C2: 70, C3: 90, C4: 65 },
          cienciasNatureza: { C1: 60, C2: 72, C3: 58, C4: 65 },
          cienciasHumanas:  { C1: 70, C2: 68, C3: 74, C4: 80 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 17 },
          linguagens:       { totalAulas: 20, presencas: 18 },
          cienciasNatureza: { totalAulas: 18, presencas: 15 },
          cienciasHumanas:  { totalAulas: 20, presencas: 19 },
          interarea:        { totalAulas: 10, presencas: 9  },
        },
      },
      {
        id: "a2",
        ra: "2026000102",
        nome: "Ana Costa",
        cidade: "Guarulhos",
        telefone: "(11) 97777-2222",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "APROVADO",
        documentacao: { historicoEntregue: true, certificadoEmitido: true, certificadoRecebido: true },
        notas: {
          matematica:       { C1: 90, C2: 85, C3: 88, C4: 92, C5: 87 },
          linguagens:       { C1: 95, C2: 88, C3: 91, C4: 89 },
          cienciasNatureza: { C1: 82, C2: 78, C3: 85, C4: 80 },
          cienciasHumanas:  { C1: 88, C2: 92, C3: 86, C4: 90 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 20 },
          linguagens:       { totalAulas: 20, presencas: 20 },
          cienciasNatureza: { totalAulas: 18, presencas: 18 },
          cienciasHumanas:  { totalAulas: 20, presencas: 20 },
          interarea:        { totalAulas: 10, presencas: 10 },
        },
      },
      {
        id: "a3",
        ra: "2026000103",
        nome: "Pedro Ferreira",
        cidade: "Osasco",
        telefone: "(11) 96666-3333",
        escolaridade: "Ensino Médio Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "EVADIDO",
        documentacao: { historicoEntregue: false, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 40, C2: 35, C3: null, C4: null, C5: null },
          linguagens:       { C1: 55, C2: 48, C3: null, C4: null },
          cienciasNatureza: { C1: 38, C2: null, C3: null, C4: null },
          cienciasHumanas:  { C1: 60, C2: 52, C3: null, C4: null },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 8 },
          linguagens:       { totalAulas: 20, presencas: 10 },
          cienciasNatureza: { totalAulas: 18, presencas: 7 },
          cienciasHumanas:  { totalAulas: 20, presencas: 9 },
          interarea:        { totalAulas: 10, presencas: 4 },
        },
      },
    ],
  },
  {
    id: "t262",
    nome: "Turma 26.2",
    alunos: [
      {
        id: "b1",
        ra: "2026000201",
        nome: "Maria Santos",
        cidade: "São Paulo",
        telefone: "(11) 95555-4444",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 65, C2: 70, C3: 68, C4: 72, C5: 66 },
          linguagens:       { C1: 75, C2: 80, C3: 70, C4: 78 },
          cienciasNatureza: { C1: 62, C2: 68, C3: 70, C4: 65 },
          cienciasHumanas:  { C1: 80, C2: 75, C3: 82, C4: 78 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 18 },
          linguagens:       { totalAulas: 20, presencas: 20 },
          cienciasNatureza: { totalAulas: 18, presencas: 17 },
          cienciasHumanas:  { totalAulas: 20, presencas: 20 },
          interarea:        { totalAulas: 10, presencas: 9  },
        },
      },
      {
        id: "b2",
        ra: "2026000202",
        nome: "Carlos Oliveira",
        cidade: "Campinas",
        telefone: "(19) 94444-5555",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "DESISTENTE",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 50, C2: 45, C3: 55, C4: 48, C5: 52 },
          linguagens:       { C1: 60, C2: 58, C3: 62, C4: 55 },
          cienciasNatureza: { C1: 48, C2: 52, C3: 50, C4: 54 },
          cienciasHumanas:  { C1: 62, C2: 60, C3: 58, C4: 65 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 14 },
          linguagens:       { totalAulas: 20, presencas: 16 },
          cienciasNatureza: { totalAulas: 18, presencas: 13 },
          cienciasHumanas:  { totalAulas: 20, presencas: 15 },
          interarea:        { totalAulas: 10, presencas: 7  },
        },
      },
      {
        id: "b3",
        ra: "2026000203",
        nome: "Lucia Pereira",
        cidade: "Santos",
        telefone: "(13) 93333-6666",
        escolaridade: "Ensino Médio Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "APROVADO",
        documentacao: { historicoEntregue: true, certificadoEmitido: true, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 85, C2: 88, C3: 90, C4: 82, C5: 86 },
          linguagens:       { C1: 92, C2: 88, C3: 95, C4: 90 },
          cienciasNatureza: { C1: 78, C2: 82, C3: 80, C4: 85 },
          cienciasHumanas:  { C1: 90, C2: 88, C3: 92, C4: 86 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 20 },
          linguagens:       { totalAulas: 20, presencas: 20 },
          cienciasNatureza: { totalAulas: 18, presencas: 18 },
          cienciasHumanas:  { totalAulas: 20, presencas: 20 },
          interarea:        { totalAulas: 10, presencas: 10 },
        },
      },
    ],
  },
  {
    id: "t263",
    nome: "Turma 26.3",
    alunos: [
      {
        id: "c1",
        ra: "2026000301",
        nome: "Roberto Lima",
        cidade: "Ribeirão Preto",
        telefone: "(16) 92222-7777",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "RDS",
        documentacao: { historicoEntregue: false, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 70, C2: 65, C3: 72, C4: 68, C5: 70 },
          linguagens:       { C1: 75, C2: 72, C3: 78, C4: 70 },
          cienciasNatureza: { C1: 65, C2: 68, C3: 70, C4: 62 },
          cienciasHumanas:  { C1: 72, C2: 70, C3: 75, C4: 68 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 16 },
          linguagens:       { totalAulas: 20, presencas: 17 },
          cienciasNatureza: { totalAulas: 18, presencas: 15 },
          cienciasHumanas:  { totalAulas: 20, presencas: 18 },
          interarea:        { totalAulas: 10, presencas: 8  },
        },
      },
      {
        id: "c2",
        ra: "2026000302",
        nome: "Fernanda Souza",
        cidade: "Sorocaba",
        telefone: "(15) 91111-8888",
        escolaridade: "Ensino Fundamental Completo",
        dataMatricula: "03/02/2026",
        situacao: "EM_PROCESSO",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 60, C2: 62, C3: 58, C4: 65, C5: 60 },
          linguagens:       { C1: 70, C2: 68, C3: 72, C4: 65 },
          cienciasNatureza: { C1: 55, C2: 60, C3: 58, C4: 62 },
          cienciasHumanas:  { C1: 68, C2: 65, C3: 70, C4: 72 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 19 },
          linguagens:       { totalAulas: 20, presencas: 20 },
          cienciasNatureza: { totalAulas: 18, presencas: 16 },
          cienciasHumanas:  { totalAulas: 20, presencas: 19 },
          interarea:        { totalAulas: 10, presencas: 10 },
        },
      },
    ],
  },
  {
    id: "t264",
    nome: "Turma 26.4",
    alunos: [
      {
        id: "d1",
        ra: "2026000401",
        nome: "Beatriz Costa",
        cidade: "São Paulo",
        telefone: "(11) 90000-9999",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "APROVADO",
        documentacao: { historicoEntregue: true, certificadoEmitido: true, certificadoRecebido: true },
        notas: {
          matematica:       { C1: 78, C2: 80, C3: 75, C4: 82, C5: 78 },
          linguagens:       { C1: 85, C2: 88, C3: 82, C4: 86 },
          cienciasNatureza: { C1: 72, C2: 75, C3: 78, C4: 70 },
          cienciasHumanas:  { C1: 80, C2: 85, C3: 82, C4: 88 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 20 },
          linguagens:       { totalAulas: 20, presencas: 19 },
          cienciasNatureza: { totalAulas: 18, presencas: 18 },
          cienciasHumanas:  { totalAulas: 20, presencas: 20 },
          interarea:        { totalAulas: 10, presencas: 10 },
        },
      },
      {
        id: "d2",
        ra: "2026000402",
        nome: "Paulo Rocha",
        cidade: "Mauá",
        telefone: "(11) 89999-0000",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: false, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 55, C2: 58, C3: 50, C4: 60, C5: null },
          linguagens:       { C1: 62, C2: 60, C3: 58, C4: 65 },
          cienciasNatureza: { C1: 48, C2: 55, C3: null, C4: null },
          cienciasHumanas:  { C1: 60, C2: 58, C3: 62, C4: null },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 12 },
          linguagens:       { totalAulas: 20, presencas: 14 },
          cienciasNatureza: { totalAulas: 18, presencas: 10 },
          cienciasHumanas:  { totalAulas: 20, presencas: 13 },
          interarea:        { totalAulas: 10, presencas: 6  },
        },
      },
    ],
  },
];
