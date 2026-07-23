import {
  COMPETENCIAS_CONFIG,
  type AreaConfigId,
} from "@/lib/competencias-config";
import { CAMPOS_VAZIOS, type CamposCompetencia } from "@/lib/regras-notas";

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

// Etapa do percurso do aluno — independente da situação.
// AVA = Ambiente Virtual de Aprendizagem · RDS = Reconhecimento de Saberes.
export type EtapaAluno = "AVA" | "RDS";

export const ETAPA_CFG: Record<EtapaAluno, { label: string; descricao: string }> = {
  AVA: { label: "AVA", descricao: "Ambiente Virtual de Aprendizagem" },
  RDS: { label: "RDS", descricao: "Reconhecimento de Saberes" },
};

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

// Notas no formato de 5 campos por competência (lógica da planilha SESI).
// Estrutura: área → competência (C1, C2, …) → 5 campos.
export type NotasGrade = Record<AreaId, Record<string, CamposCompetencia>>;

export type Aluno = {
  id: string;
  ra: string;
  nome: string;
  email: string;
  cidade: string;
  telefone: string;
  escolaridade: string;
  dataMatricula: string;
  situacao: SituacaoAluno;
  // Etapa do percurso (AVA ou RDS), independente da situação.
  etapa: EtapaAluno;
  // Aluno ativo no portal (Gestão de Alunos pode inativar).
  ativo: boolean;
  documentacao: AlunoDoc;
  notas: AlunoNotas;
  notasGrade: NotasGrade;
  frequencia: AlunoFrequencia;
  // Observação pedagógica do aluno (preenchida no relatório da turma).
  observacao?: string;
};

export type Turma = {
  id: string;
  nome: string;
  // Campos institucionais para o cabeçalho do relatório da turma.
  polo: string;
  etapaEnsino: string;
  periodoLetivo: string;
  professorResponsavel: string;
  alunos: Aluno[];
};

// ── Configuração de áreas ─────────────────────────────────
export const AREAS_CONFIG = [
  { id: "matematica" as const,       nome: "Matemática",           competencias: ["C1","C2","C3","C4","C5"] },
  { id: "linguagens" as const,       nome: "Linguagens",           competencias: ["C1","C2","C3","C4"] },
  { id: "cienciasNatureza" as const, nome: "Ciências da Natureza", competencias: ["C1","C2","C3","C4"] },
  { id: "cienciasHumanas" as const,  nome: "Ciências Humanas",     competencias: ["C1","C2","C3","C4"] },
] as const;

export type AreaId = (typeof AREAS_CONFIG)[number]["id"];

// (FREQ_AREAS_CONFIG/FreqAreaId foram removidos na Etapa 5: a frequência não é
//  mais digitada por área — é calculada em src/lib/queries/frequencia.ts.)

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

// (freqEditaveis foi removido na Etapa 5: ninguém edita frequência na mão.)

// Retorna as áreas de AULAS visíveis/gerenciáveis
export function aulasVisiveis(disciplina: string | null | undefined, role: string): string[] {
  if (role === "COORDENACAO") return ["Matemática","Linguagens","Ciências da Natureza","Ciências Humanas","Interárea"];
  return [disciplina ?? "", "Interárea"].filter(Boolean);
}

// ── Construção das notas em grade (formato planilha) ──────
// Converte as notas simples (0–100) no formato de 5 campos, alternando entre
// certificação, nota composta e vazio para gerar exemplos realistas na grade.

const AREAS_GRADE: AreaConfigId[] = [
  "matematica",
  "linguagens",
  "cienciasNatureza",
  "cienciasHumanas",
];

// Distribui uma nota 0–100 nos 4 campos (Presença/Diag./Aval. ≤ 20, VA ≤ 40).
function notaComposta(nota: number): CamposCompetencia {
  const voceAutor = Math.min(40, Math.round(nota * 0.4));
  const resto = nota - voceAutor; // 0–60
  const presenca = Math.min(20, Math.round(resto / 3));
  const diagnostica = Math.min(20, Math.round(resto / 3));
  const avaliativa = Math.max(0, Math.min(20, resto - presenca - diagnostica));
  return { certificacao: null, presenca, diagnostica, avaliativa, voceAutor };
}

// Converte uma nota 0–100 em nº de habilidades validadas (certificação).
function notaCertificada(nota: number, total: number): CamposCompetencia {
  const validadas = Math.max(0, Math.min(total, Math.round((nota / 100) * total)));
  return {
    certificacao: validadas,
    presenca: null,
    diagnostica: null,
    avaliativa: null,
    voceAutor: null,
  };
}

function buildNotasGrade(notas: AlunoNotas): NotasGrade {
  const grade = {} as NotasGrade;
  for (const area of AREAS_GRADE) {
    const comps = Object.keys(COMPETENCIAS_CONFIG[area].competencias);
    const areaObj: Record<string, CamposCompetencia> = {};
    comps.forEach((comp, idx) => {
      const nota = notas[area]?.[comp] ?? null;
      const total = COMPETENCIAS_CONFIG[area].competencias[comp];
      if (nota === null) {
        areaObj[comp] = { ...CAMPOS_VAZIOS };
      } else if (idx % 2 === 0) {
        // competências em posição par → certificação
        areaObj[comp] = notaCertificada(nota, total);
      } else {
        // ímpar → nota composta (5 campos)
        areaObj[comp] = notaComposta(nota);
      }
    });
    grade[area] = areaObj;
  }
  return grade;
}

// ── Turmas e alunos ────────────────────────────────────────
type AlunoBase = Omit<Aluno, "notasGrade">;
type TurmaBase = {
  id: string;
  nome: string;
  polo: string;
  etapaEnsino: string;
  periodoLetivo: string;
  professorResponsavel: string;
  alunos: AlunoBase[];
};

const turmasBase: TurmaBase[] = [
  {
    id: "t261",
    nome: "Turma 26.1",
    polo: "Caruaru",
    etapaEnsino: "Ensino Fundamental — Anos Finais (EJA)",
    periodoLetivo: "2026.1",
    professorResponsavel: "João Pereira",
    alunos: [
      {
        id: "a1",
        ra: "2026000101",
        email: "joao.silva@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
        nome: "João Silva",
        observacao: "Aluno demonstra bom progresso em Matemática, mas precisa reforçar as competências C2 e C5. Participação ativa nas aulas e entrega das atividades em dia.",
        cidade: "Caruaru",
        telefone: "(81) 98888-1101",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 75, C2: 45, C3: 80, C4: 62, C5: null },
          linguagens:       { C1: 80, C2: 70, C3: 55, C4: null },
          cienciasNatureza: { C1: 60, C2: 48, C3: null, C4: null },
          cienciasHumanas:  { C1: 70, C2: 68, C3: 74, C4: null },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 17 },
          linguagens:       { totalAulas: 20, presencas: 18 },
          cienciasNatureza: { totalAulas: 18, presencas: 15 },
          cienciasHumanas:  { totalAulas: 20, presencas: 19 },
          interarea:        { totalAulas: 10, presencas: 9 },
        },
      },
      {
        id: "a2",
        ra: "2026000102",
        email: "maria.oliveira@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
        nome: "Maria Oliveira",
        observacao: "Aluna concluiu todas as competências com excelência. Frequência integral e desempenho consistente. Recomendada para certificação.",
        cidade: "Recife",
        telefone: "(81) 98888-1102",
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
        email: "jose.santos@aluno.ejasesi.org.br",
        etapa: "RDS",
        ativo: true,
        nome: "José Santos",
        observacao: "Frequência regular. Apresenta dificuldade em Ciências da Natureza; orientado a refazer as atividades diagnósticas pendentes.",
        cidade: "Caruaru",
        telefone: "(81) 98888-1103",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 65, C2: 70, C3: 55, C4: 48, C5: 60 },
          linguagens:       { C1: 72, C2: 58, C3: 64, C4: 50 },
          cienciasNatureza: { C1: 55, C2: 62, C3: 45, C4: null },
          cienciasHumanas:  { C1: 68, C2: 60, C3: null, C4: null },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 16 },
          linguagens:       { totalAulas: 20, presencas: 17 },
          cienciasNatureza: { totalAulas: 18, presencas: 14 },
          cienciasHumanas:  { totalAulas: 20, presencas: 16 },
          interarea:        { totalAulas: 10, presencas: 8 },
        },
      },
      {
        id: "a4",
        ra: "2026000104",
        email: "ana.souza@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: false,
        nome: "Ana Souza",
        observacao: "Aluna parou de acessar o AVA e não responde aos contatos da equipe. Situação registrada como Evadida após tentativas de retomada.",
        cidade: "Recife",
        telefone: "(81) 98888-1104",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "EVADIDO",
        documentacao: { historicoEntregue: false, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 40, C2: 35, C3: null, C4: null, C5: null },
          linguagens:       { C1: 50, C2: null, C3: null, C4: null },
          cienciasNatureza: { C1: 38, C2: null, C3: null, C4: null },
          cienciasHumanas:  { C1: 45, C2: 42, C3: null, C4: null },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 8 },
          linguagens:       { totalAulas: 20, presencas: 9 },
          cienciasNatureza: { totalAulas: 18, presencas: 6 },
          cienciasHumanas:  { totalAulas: 20, presencas: 8 },
          interarea:        { totalAulas: 10, presencas: 3 },
        },
      },
      {
        id: "a5",
        ra: "2026000105",
        email: "carlos.pereira@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
        nome: "Carlos Pereira",
        observacao: "Bom engajamento nas aulas presenciais. Evolução perceptível em Matemática ao longo do bimestre.",
        cidade: "Caruaru",
        telefone: "(81) 98888-1105",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 78, C2: 55, C3: 67, C4: 72, C5: 58 },
          linguagens:       { C1: 65, C2: 70, C3: 60, C4: 55 },
          cienciasNatureza: { C1: 72, C2: 68, C3: 64, C4: 58 },
          cienciasHumanas:  { C1: 60, C2: 55, C3: 62, C4: 50 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 18 },
          linguagens:       { totalAulas: 20, presencas: 17 },
          cienciasNatureza: { totalAulas: 18, presencas: 16 },
          cienciasHumanas:  { totalAulas: 20, presencas: 18 },
          interarea:        { totalAulas: 10, presencas: 9 },
        },
      },
      {
        id: "a6",
        ra: "2026000106",
        email: "fernanda.lima@aluno.ejasesi.org.br",
        etapa: "RDS",
        ativo: true,
        nome: "Fernanda Lima",
        observacao: "Aluna informou que não poderá continuar por questões de trabalho. Registrada como Desistente após contato com a coordenação.",
        cidade: "Recife",
        telefone: "(81) 98888-1106",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "DESISTENTE",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 52, C2: 48, C3: 55, C4: null, C5: null },
          linguagens:       { C1: 58, C2: 50, C3: null, C4: null },
          cienciasNatureza: { C1: 45, C2: 52, C3: null, C4: null },
          cienciasHumanas:  { C1: 60, C2: 55, C3: 48, C4: null },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 11 },
          linguagens:       { totalAulas: 20, presencas: 12 },
          cienciasNatureza: { totalAulas: 18, presencas: 9 },
          cienciasHumanas:  { totalAulas: 20, presencas: 11 },
          interarea:        { totalAulas: 10, presencas: 5 },
        },
      },
      {
        id: "a7",
        ra: "2026000107",
        email: "paulo.costa@aluno.ejasesi.org.br",
        etapa: "RDS",
        ativo: true,
        nome: "Paulo Costa",
        cidade: "Caruaru",
        telefone: "(81) 98888-1107",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 68, C2: 72, C3: 60, C4: 55, C5: 64 },
          linguagens:       { C1: 75, C2: 68, C3: 70, C4: 62 },
          cienciasNatureza: { C1: 58, C2: 64, C3: 55, C4: 60 },
          cienciasHumanas:  { C1: 70, C2: 66, C3: 72, C4: 58 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 16 },
          linguagens:       { totalAulas: 20, presencas: 18 },
          cienciasNatureza: { totalAulas: 18, presencas: 15 },
          cienciasHumanas:  { totalAulas: 20, presencas: 17 },
          interarea:        { totalAulas: 10, presencas: 8 },
        },
      },
      {
        id: "a8",
        ra: "2026000108",
        email: "juliana.almeida@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
        nome: "Juliana Almeida",
        observacao: "Ótimo desempenho em Linguagens. Frequência elevada e participação destacada nos encontros interárea.",
        cidade: "Recife",
        telefone: "(81) 98888-1108",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: true, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 82, C2: 60, C3: 75, C4: 48, C5: 70 },
          linguagens:       { C1: 88, C2: 72, C3: 65, C4: 80 },
          cienciasNatureza: { C1: 55, C2: 60, C3: 68, C4: 52 },
          cienciasHumanas:  { C1: 75, C2: 70, C3: 58, C4: 64 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 19 },
          linguagens:       { totalAulas: 20, presencas: 20 },
          cienciasNatureza: { totalAulas: 18, presencas: 16 },
          cienciasHumanas:  { totalAulas: 20, presencas: 18 },
          interarea:        { totalAulas: 10, presencas: 9 },
        },
      },
      {
        id: "a9",
        ra: "2026000109",
        email: "roberto.ferreira@aluno.ejasesi.org.br",
        etapa: "RDS",
        ativo: true,
        nome: "Roberto Ferreira",
        observacao: "Concluiu o percurso com ótimas notas em todas as áreas. Certificado emitido, aguardando retirada na unidade.",
        cidade: "Caruaru",
        telefone: "(81) 98888-1109",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "APROVADO",
        documentacao: { historicoEntregue: true, certificadoEmitido: true, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 85, C2: 80, C3: 90, C4: 78, C5: 82 },
          linguagens:       { C1: 90, C2: 85, C3: 88, C4: 84 },
          cienciasNatureza: { C1: 80, C2: 82, C3: 78, C4: 85 },
          cienciasHumanas:  { C1: 86, C2: 84, C3: 90, C4: 88 },
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
        id: "a10",
        ra: "2026000110",
        email: "patricia.rodrigues@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
        nome: "Patrícia Rodrigues",
        cidade: "Recife",
        telefone: "(81) 98888-1110",
        escolaridade: "Ensino Fundamental Incompleto",
        dataMatricula: "03/02/2026",
        situacao: "CURSANDO",
        documentacao: { historicoEntregue: false, certificadoEmitido: false, certificadoRecebido: false },
        notas: {
          matematica:       { C1: 70, C2: 58, C3: 65, C4: 50, C5: 55 },
          linguagens:       { C1: 62, C2: 55, C3: 68, C4: 48 },
          cienciasNatureza: { C1: 60, C2: 52, C3: 58, C4: 45 },
          cienciasHumanas:  { C1: 65, C2: 60, C3: 55, C4: 50 },
        },
        frequencia: {
          matematica:       { totalAulas: 20, presencas: 15 },
          linguagens:       { totalAulas: 20, presencas: 16 },
          cienciasNatureza: { totalAulas: 18, presencas: 13 },
          cienciasHumanas:  { totalAulas: 20, presencas: 15 },
          interarea:        { totalAulas: 10, presencas: 7 },
        },
      },
    ],
  },
  {
    id: "t262",
    nome: "Turma 26.2",
    polo: "Caruaru",
    etapaEnsino: "Ensino Fundamental — Anos Finais (EJA)",
    periodoLetivo: "2026.1",
    professorResponsavel: "Carla Mendes",
    alunos: [
      {
        id: "b1",
        ra: "2026000201",
        email: "maria.santos@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
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
        email: "carlos.oliveira@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: false,
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
        email: "lucia.pereira@aluno.ejasesi.org.br",
        etapa: "RDS",
        ativo: true,
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
    polo: "Recife",
    etapaEnsino: "Ensino Médio (EJA)",
    periodoLetivo: "2026.1",
    professorResponsavel: "Rafael Costa",
    alunos: [
      {
        id: "c1",
        ra: "2026000301",
        email: "roberto.lima@aluno.ejasesi.org.br",
        etapa: "RDS",
        ativo: true,
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
        email: "fernanda.souza@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
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
    polo: "Recife",
    etapaEnsino: "Ensino Médio (EJA)",
    periodoLetivo: "2026.1",
    professorResponsavel: "Adriana Lima",
    alunos: [
      {
        id: "d1",
        ra: "2026000401",
        email: "beatriz.costa@aluno.ejasesi.org.br",
        etapa: "AVA",
        ativo: true,
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
        email: "paulo.rocha@aluno.ejasesi.org.br",
        etapa: "RDS",
        ativo: true,
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

// Anexa as notas em grade (formato de 5 campos) a cada aluno.
export const professorTurmas: Turma[] = turmasBase.map((turma) => ({
  ...turma,
  alunos: turma.alunos.map((aluno) => ({
    ...aluno,
    notasGrade: buildNotasGrade(aluno.notas),
  })),
}));
