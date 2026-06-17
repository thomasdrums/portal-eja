// ── Tipos ────────────────────────────────────────────────
export const POLOS = ["Caruaru", "Recife", "Olinda", "Garanhuns"] as const;
export type Polo = (typeof POLOS)[number];

export const TURMAS_NOMES = [
  "Turma 26.1","Turma 26.2","Turma 26.3","Turma 26.4",
  "Turma 26.5","Turma 26.6","Turma 26.7","Turma 26.8",
] as const;

export type SituacaoAluno = "Em andamento" | "Aprovado" | "Reprovado";
export type StatusSolicitacao = "Recebida" | "Em análise" | "Em processamento" | "Concluída";

export type AlunoRel = {
  id: string;
  nome: string;
  polo: Polo;
  turmaNome: string;
  cidade: string;
  situacao: SituacaoAluno;
  dataConclusao: string | null;
  documentacao: { historicoEntregue: boolean; certificadoEmitido: boolean; certificadoRecebido: boolean };
  freq: { matematica: number; linguagens: number; cienciasNatureza: number; cienciasHumanas: number; interarea: number };
  notas: {
    matematica:      Record<string, number | null>;
    linguagens:      Record<string, number | null>;
    cienciasNatureza: Record<string, number | null>;
    cienciasHumanas:  Record<string, number | null>;
  };
};

export type ProfessorRel = {
  id: string;
  nome: string;
  disciplina: string;
  polo: Polo;
  turmas: number;
  alunos: number;
  aulasCadastradas: number;
};

export type SolicitacaoRel = {
  id: string;
  nomeAluno: string;
  tipoDocumento: string;
  polo: Polo;
  turmaNome: string;
  dataSolicitacao: string;
  status: StatusSolicitacao;
};

// ── Alunos ───────────────────────────────────────────────
export const relatorioAlunos: AlunoRel[] = [
  // Polo Caruaru — Turma 26.1
  {
    id:"r-a1", nome:"João Silva",     polo:"Caruaru", turmaNome:"Turma 26.1", cidade:"Caruaru",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:85, linguagens:90, cienciasNatureza:83, cienciasHumanas:95, interarea:90 },
    notas:{ matematica:{C1:75,C2:45,C3:80,C4:62,C5:55}, linguagens:{C1:80,C2:70,C3:90,C4:65}, cienciasNatureza:{C1:60,C2:72,C3:58,C4:65}, cienciasHumanas:{C1:70,C2:68,C3:74,C4:80} },
  },
  {
    id:"r-a2", nome:"Ana Costa",      polo:"Caruaru", turmaNome:"Turma 26.1", cidade:"Caruaru",
    situacao:"Aprovado", dataConclusao:"04/2026",
    documentacao:{ historicoEntregue:true,  certificadoEmitido:true,  certificadoRecebido:true  },
    freq:{ matematica:100, linguagens:100, cienciasNatureza:100, cienciasHumanas:100, interarea:100 },
    notas:{ matematica:{C1:90,C2:85,C3:88,C4:92,C5:87}, linguagens:{C1:95,C2:88,C3:91,C4:89}, cienciasNatureza:{C1:82,C2:78,C3:85,C4:80}, cienciasHumanas:{C1:88,C2:92,C3:86,C4:90} },
  },
  {
    id:"r-a3", nome:"Pedro Ferreira", polo:"Caruaru", turmaNome:"Turma 26.1", cidade:"Caruaru",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:false, certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:40, linguagens:50, cienciasNatureza:39, cienciasHumanas:45, interarea:40 },
    notas:{ matematica:{C1:40,C2:35,C3:null,C4:null,C5:null}, linguagens:{C1:55,C2:48,C3:null,C4:null}, cienciasNatureza:{C1:38,C2:null,C3:null,C4:null}, cienciasHumanas:{C1:60,C2:52,C3:null,C4:null} },
  },
  // Polo Caruaru — Turma 26.2
  {
    id:"r-b1", nome:"Maria Santos",   polo:"Caruaru", turmaNome:"Turma 26.2", cidade:"Caruaru",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:90, linguagens:100, cienciasNatureza:94, cienciasHumanas:100, interarea:90 },
    notas:{ matematica:{C1:65,C2:70,C3:68,C4:72,C5:66}, linguagens:{C1:75,C2:80,C3:70,C4:78}, cienciasNatureza:{C1:62,C2:68,C3:70,C4:65}, cienciasHumanas:{C1:80,C2:75,C3:82,C4:78} },
  },
  {
    id:"r-b2", nome:"Carlos Oliveira",polo:"Caruaru", turmaNome:"Turma 26.2", cidade:"Campinas",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:70, linguagens:80, cienciasNatureza:72, cienciasHumanas:75, interarea:70 },
    notas:{ matematica:{C1:50,C2:45,C3:55,C4:48,C5:52}, linguagens:{C1:60,C2:58,C3:62,C4:55}, cienciasNatureza:{C1:48,C2:52,C3:50,C4:54}, cienciasHumanas:{C1:62,C2:60,C3:58,C4:65} },
  },
  {
    id:"r-b3", nome:"Lucia Pereira",  polo:"Caruaru", turmaNome:"Turma 26.2", cidade:"Santos",
    situacao:"Aprovado", dataConclusao:"03/2026",
    documentacao:{ historicoEntregue:true,  certificadoEmitido:true,  certificadoRecebido:false },
    freq:{ matematica:100, linguagens:100, cienciasNatureza:100, cienciasHumanas:100, interarea:100 },
    notas:{ matematica:{C1:85,C2:88,C3:90,C4:82,C5:86}, linguagens:{C1:92,C2:88,C3:95,C4:90}, cienciasNatureza:{C1:78,C2:82,C3:80,C4:85}, cienciasHumanas:{C1:90,C2:88,C3:92,C4:86} },
  },
  // Polo Recife — Turma 26.3
  {
    id:"r-c1", nome:"Roberto Lima",   polo:"Recife",  turmaNome:"Turma 26.3", cidade:"Recife",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:false, certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:80, linguagens:85, cienciasNatureza:83, cienciasHumanas:90, interarea:80 },
    notas:{ matematica:{C1:70,C2:65,C3:72,C4:68,C5:70}, linguagens:{C1:75,C2:72,C3:78,C4:70}, cienciasNatureza:{C1:65,C2:68,C3:70,C4:62}, cienciasHumanas:{C1:72,C2:70,C3:75,C4:68} },
  },
  {
    id:"r-c2", nome:"Fernanda Souza", polo:"Recife",  turmaNome:"Turma 26.3", cidade:"Recife",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:95, linguagens:100, cienciasNatureza:89, cienciasHumanas:95, interarea:100 },
    notas:{ matematica:{C1:60,C2:62,C3:58,C4:65,C5:60}, linguagens:{C1:70,C2:68,C3:72,C4:65}, cienciasNatureza:{C1:55,C2:60,C3:58,C4:62}, cienciasHumanas:{C1:68,C2:65,C3:70,C4:72} },
  },
  {
    id:"r-c3", nome:"Marcos Alves",   polo:"Recife",  turmaNome:"Turma 26.3", cidade:"Olinda",
    situacao:"Aprovado", dataConclusao:"05/2026",
    documentacao:{ historicoEntregue:true,  certificadoEmitido:true,  certificadoRecebido:true  },
    freq:{ matematica:100, linguagens:100, cienciasNatureza:100, cienciasHumanas:100, interarea:100 },
    notas:{ matematica:{C1:88,C2:92,C3:85,C4:90,C5:88}, linguagens:{C1:90,C2:87,C3:93,C4:88}, cienciasNatureza:{C1:82,C2:85,C3:80,C4:88}, cienciasHumanas:{C1:92,C2:89,C3:94,C4:90} },
  },
  // Polo Recife — Turma 26.4
  {
    id:"r-d1", nome:"Beatriz Costa",  polo:"Recife",  turmaNome:"Turma 26.4", cidade:"Recife",
    situacao:"Aprovado", dataConclusao:"04/2026",
    documentacao:{ historicoEntregue:true,  certificadoEmitido:true,  certificadoRecebido:true  },
    freq:{ matematica:100, linguagens:95, cienciasNatureza:100, cienciasHumanas:100, interarea:100 },
    notas:{ matematica:{C1:78,C2:80,C3:75,C4:82,C5:78}, linguagens:{C1:85,C2:88,C3:82,C4:86}, cienciasNatureza:{C1:72,C2:75,C3:78,C4:70}, cienciasHumanas:{C1:80,C2:85,C3:82,C4:88} },
  },
  {
    id:"r-d2", nome:"Paulo Rocha",    polo:"Recife",  turmaNome:"Turma 26.4", cidade:"Mauá",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:false, certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:60, linguagens:70, cienciasNatureza:56, cienciasHumanas:65, interarea:60 },
    notas:{ matematica:{C1:55,C2:58,C3:50,C4:60,C5:null}, linguagens:{C1:62,C2:60,C3:58,C4:65}, cienciasNatureza:{C1:48,C2:55,C3:null,C4:null}, cienciasHumanas:{C1:60,C2:58,C3:62,C4:null} },
  },
  // Polo Olinda — Turma 26.5
  {
    id:"r-e1", nome:"Simone Barbosa", polo:"Olinda",  turmaNome:"Turma 26.5", cidade:"Olinda",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:88, linguagens:92, cienciasNatureza:85, cienciasHumanas:90, interarea:88 },
    notas:{ matematica:{C1:72,C2:68,C3:75,C4:70,C5:68}, linguagens:{C1:82,C2:78,C3:85,C4:80}, cienciasNatureza:{C1:70,C2:65,C3:72,C4:68}, cienciasHumanas:{C1:78,C2:82,C3:75,C4:80} },
  },
  {
    id:"r-e2", nome:"André Campos",   polo:"Olinda",  turmaNome:"Turma 26.5", cidade:"Olinda",
    situacao:"Reprovado", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:45, linguagens:50, cienciasNatureza:42, cienciasHumanas:48, interarea:45 },
    notas:{ matematica:{C1:35,C2:40,C3:38,C4:42,C5:30}, linguagens:{C1:45,C2:42,C3:48,C4:40}, cienciasNatureza:{C1:32,C2:38,C3:35,C4:40}, cienciasHumanas:{C1:42,C2:38,C3:44,C4:40} },
  },
  {
    id:"r-e3", nome:"Juliana Ramos",  polo:"Olinda",  turmaNome:"Turma 26.5", cidade:"Paulista",
    situacao:"Aprovado", dataConclusao:"05/2026",
    documentacao:{ historicoEntregue:true,  certificadoEmitido:true,  certificadoRecebido:true  },
    freq:{ matematica:100, linguagens:100, cienciasNatureza:100, cienciasHumanas:100, interarea:100 },
    notas:{ matematica:{C1:95,C2:90,C3:92,C4:88,C5:94}, linguagens:{C1:98,C2:92,C3:95,C4:90}, cienciasNatureza:{C1:88,C2:92,C3:90,C4:95}, cienciasHumanas:{C1:94,C2:90,C3:96,C4:92} },
  },
  // Polo Olinda — Turma 26.6
  {
    id:"r-f1", nome:"Rafael Moura",   polo:"Olinda",  turmaNome:"Turma 26.6", cidade:"Olinda",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:78, linguagens:82, cienciasNatureza:80, cienciasHumanas:85, interarea:80 },
    notas:{ matematica:{C1:68,C2:72,C3:65,C4:70,C5:68}, linguagens:{C1:75,C2:70,C3:78,C4:72}, cienciasNatureza:{C1:62,C2:68,C3:65,C4:70}, cienciasHumanas:{C1:72,C2:68,C3:75,C4:70} },
  },
  {
    id:"r-f2", nome:"Cláudia Nunes",  polo:"Olinda",  turmaNome:"Turma 26.6", cidade:"Recife",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:false, certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:65, linguagens:70, cienciasNatureza:62, cienciasHumanas:68, interarea:65 },
    notas:{ matematica:{C1:58,C2:62,C3:55,C4:60,C5:null}, linguagens:{C1:65,C2:60,C3:68,C4:62}, cienciasNatureza:{C1:52,C2:58,C3:55,C4:60}, cienciasHumanas:{C1:62,C2:58,C3:65,C4:60} },
  },
  // Polo Garanhuns — Turma 26.7
  {
    id:"r-g1", nome:"Tânia Vieira",   polo:"Garanhuns", turmaNome:"Turma 26.7", cidade:"Garanhuns",
    situacao:"Aprovado", dataConclusao:"03/2026",
    documentacao:{ historicoEntregue:true,  certificadoEmitido:true,  certificadoRecebido:true  },
    freq:{ matematica:100, linguagens:100, cienciasNatureza:100, cienciasHumanas:100, interarea:100 },
    notas:{ matematica:{C1:82,C2:85,C3:88,C4:80,C5:84}, linguagens:{C1:88,C2:85,C3:90,C4:86}, cienciasNatureza:{C1:78,C2:80,C3:82,C4:85}, cienciasHumanas:{C1:85,C2:88,C3:82,C4:90} },
  },
  {
    id:"r-g2", nome:"Fábio Lopes",    polo:"Garanhuns", turmaNome:"Turma 26.7", cidade:"Caruaru",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:75, linguagens:80, cienciasNatureza:78, cienciasHumanas:82, interarea:75 },
    notas:{ matematica:{C1:62,C2:65,C3:60,C4:68,C5:62}, linguagens:{C1:70,C2:68,C3:72,C4:65}, cienciasNatureza:{C1:60,C2:65,C3:62,C4:68}, cienciasHumanas:{C1:68,C2:65,C3:70,C4:72} },
  },
  {
    id:"r-g3", nome:"Sandra Melo",    polo:"Garanhuns", turmaNome:"Turma 26.7", cidade:"Garanhuns",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:true,  certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:55, linguagens:60, cienciasNatureza:58, cienciasHumanas:62, interarea:55 },
    notas:{ matematica:{C1:50,C2:55,C3:48,C4:52,C5:null}, linguagens:{C1:58,C2:55,C3:60,C4:52}, cienciasNatureza:{C1:45,C2:50,C3:48,C4:55}, cienciasHumanas:{C1:55,C2:52,C3:58,C4:50} },
  },
  // Polo Garanhuns — Turma 26.8
  {
    id:"r-h1", nome:"Renato Souza",   polo:"Garanhuns", turmaNome:"Turma 26.8", cidade:"Garanhuns",
    situacao:"Aprovado", dataConclusao:"05/2026",
    documentacao:{ historicoEntregue:true,  certificadoEmitido:true,  certificadoRecebido:false },
    freq:{ matematica:100, linguagens:100, cienciasNatureza:100, cienciasHumanas:100, interarea:100 },
    notas:{ matematica:{C1:80,C2:78,C3:82,C4:85,C5:80}, linguagens:{C1:85,C2:82,C3:88,C4:84}, cienciasNatureza:{C1:75,C2:78,C3:80,C4:82}, cienciasHumanas:{C1:82,C2:80,C3:85,C4:88} },
  },
  {
    id:"r-h2", nome:"Patrícia Gomes", polo:"Garanhuns", turmaNome:"Turma 26.8", cidade:"Arcoverde",
    situacao:"Em andamento", dataConclusao: null,
    documentacao:{ historicoEntregue:false, certificadoEmitido:false, certificadoRecebido:false },
    freq:{ matematica:72, linguagens:78, cienciasNatureza:70, cienciasHumanas:75, interarea:72 },
    notas:{ matematica:{C1:65,C2:68,C3:62,C4:70,C5:65}, linguagens:{C1:72,C2:70,C3:75,C4:68}, cienciasNatureza:{C1:60,C2:65,C3:62,C4:68}, cienciasHumanas:{C1:70,C2:68,C3:72,C4:75} },
  },
];

// ── Professores ──────────────────────────────────────────
export const relatorioProfessores: ProfessorRel[] = [
  { id:"p1", nome:"João Pereira",    disciplina:"Matemática",          polo:"Caruaru",   turmas:3, alunos:21, aulasCadastradas:8  },
  { id:"p2", nome:"Carla Mendes",    disciplina:"Linguagens",          polo:"Caruaru",   turmas:2, alunos:14, aulasCadastradas:6  },
  { id:"p3", nome:"Rafael Costa",    disciplina:"Ciências da Natureza", polo:"Recife",    turmas:2, alunos:14, aulasCadastradas:5  },
  { id:"p4", nome:"Adriana Lima",    disciplina:"Ciências Humanas",    polo:"Recife",    turmas:2, alunos:14, aulasCadastradas:7  },
  { id:"p5", nome:"Bruno Almeida",   disciplina:"Matemática",          polo:"Olinda",    turmas:2, alunos:10, aulasCadastradas:4  },
  { id:"p6", nome:"Cristina Farias", disciplina:"Linguagens",          polo:"Olinda",    turmas:2, alunos:10, aulasCadastradas:5  },
  { id:"p7", nome:"Diego Matos",     disciplina:"Ciências da Natureza", polo:"Garanhuns", turmas:2, alunos:10, aulasCadastradas:3  },
  { id:"p8", nome:"Elaine Torres",   disciplina:"Ciências Humanas",    polo:"Garanhuns", turmas:2, alunos:10, aulasCadastradas:4  },
];

// ── Solicitações ─────────────────────────────────────────
export const relatorioSolicitacoes: SolicitacaoRel[] = [
  { id:"s1",  nomeAluno:"Ana Costa",       tipoDocumento:"Histórico Escolar",     polo:"Caruaru",   turmaNome:"Turma 26.1", dataSolicitacao:"02/04/2026", status:"Concluída"        },
  { id:"s2",  nomeAluno:"Pedro Ferreira",  tipoDocumento:"Declaração de Matrícula",polo:"Caruaru",  turmaNome:"Turma 26.1", dataSolicitacao:"10/04/2026", status:"Em análise"       },
  { id:"s3",  nomeAluno:"Maria Santos",    tipoDocumento:"Certificado de Conclusão",polo:"Caruaru", turmaNome:"Turma 26.2", dataSolicitacao:"05/04/2026", status:"Em processamento" },
  { id:"s4",  nomeAluno:"Carlos Oliveira", tipoDocumento:"Histórico Escolar",     polo:"Caruaru",   turmaNome:"Turma 26.2", dataSolicitacao:"12/04/2026", status:"Recebida"         },
  { id:"s5",  nomeAluno:"Lucia Pereira",   tipoDocumento:"Certificado de Conclusão",polo:"Caruaru", turmaNome:"Turma 26.2", dataSolicitacao:"01/03/2026", status:"Concluída"        },
  { id:"s6",  nomeAluno:"Roberto Lima",    tipoDocumento:"Declaração de Matrícula",polo:"Recife",   turmaNome:"Turma 26.3", dataSolicitacao:"08/04/2026", status:"Em análise"       },
  { id:"s7",  nomeAluno:"Marcos Alves",    tipoDocumento:"Certificado de Conclusão",polo:"Recife",  turmaNome:"Turma 26.3", dataSolicitacao:"15/05/2026", status:"Concluída"        },
  { id:"s8",  nomeAluno:"Beatriz Costa",   tipoDocumento:"Histórico Escolar",     polo:"Recife",    turmaNome:"Turma 26.4", dataSolicitacao:"20/04/2026", status:"Concluída"        },
  { id:"s9",  nomeAluno:"Paulo Rocha",     tipoDocumento:"Declaração de Matrícula",polo:"Recife",   turmaNome:"Turma 26.4", dataSolicitacao:"22/04/2026", status:"Recebida"         },
  { id:"s10", nomeAluno:"Simone Barbosa",  tipoDocumento:"Histórico Escolar",     polo:"Olinda",    turmaNome:"Turma 26.5", dataSolicitacao:"14/04/2026", status:"Em processamento" },
  { id:"s11", nomeAluno:"Juliana Ramos",   tipoDocumento:"Certificado de Conclusão",polo:"Olinda",  turmaNome:"Turma 26.5", dataSolicitacao:"18/05/2026", status:"Concluída"        },
  { id:"s12", nomeAluno:"Rafael Moura",    tipoDocumento:"Declaração de Matrícula",polo:"Olinda",   turmaNome:"Turma 26.6", dataSolicitacao:"25/04/2026", status:"Em análise"       },
  { id:"s13", nomeAluno:"Tânia Vieira",    tipoDocumento:"Certificado de Conclusão",polo:"Garanhuns",turmaNome:"Turma 26.7",dataSolicitacao:"10/03/2026", status:"Concluída"        },
  { id:"s14", nomeAluno:"Fábio Lopes",     tipoDocumento:"Histórico Escolar",     polo:"Garanhuns", turmaNome:"Turma 26.7", dataSolicitacao:"28/04/2026", status:"Recebida"         },
  { id:"s15", nomeAluno:"Renato Souza",    tipoDocumento:"Certificado de Conclusão",polo:"Garanhuns",turmaNome:"Turma 26.8",dataSolicitacao:"20/05/2026", status:"Em processamento" },
];

// ── Indicadores gerais ───────────────────────────────────
export const indicadoresGerais = {
  totalAlunos:              relatorioAlunos.length,
  totalProfessores:         relatorioProfessores.length,
  totalTurmas:              8,
  totalPolos:               POLOS.length,
  totalSolicitacoes:        relatorioSolicitacoes.length,
  totalCertificadosEmitidos: relatorioAlunos.filter((a) => a.documentacao.certificadoEmitido).length,
};

// ── Helpers ──────────────────────────────────────────────
export function freqMedia(a: AlunoRel) {
  const { matematica, linguagens, cienciasNatureza, cienciasHumanas, interarea } = a.freq;
  return Math.round((matematica + linguagens + cienciasNatureza + cienciasHumanas + interarea) / 5);
}

export function freqColor(p: number) {
  if (p >= 75) return "bg-green-500";
  if (p >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function freqTextColor(p: number) {
  if (p >= 75) return "text-green-600";
  if (p >= 50) return "text-yellow-600";
  return "text-red-500";
}

export function freqEmoji(p: number) {
  if (p >= 75) return "🟢";
  if (p >= 50) return "🟡";
  return "🔴";
}

// Agrega dados de frequência por área, calculando a média de todos os alunos
export function freqMediaPorArea() {
  const areas = ["matematica","linguagens","cienciasNatureza","cienciasHumanas","interarea"] as const;
  type AreaKey = typeof areas[number];
  return areas.map((area) => {
    const values = relatorioAlunos.map((a) => a.freq[area as AreaKey]);
    const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
    return {
      area,
      nome: { matematica:"Matemática", linguagens:"Linguagens", cienciasNatureza:"C. Natureza", cienciasHumanas:"C. Humanas", interarea:"Interárea" }[area as AreaKey],
      avg,
    };
  });
}

// Concluintes agrupados por mês
export function concluentesPorMes() {
  const meses: Record<string, number> = {};
  relatorioAlunos
    .filter((a) => a.dataConclusao !== null)
    .forEach((a) => {
      const k = a.dataConclusao!;
      meses[k] = (meses[k] ?? 0) + 1;
    });
  return Object.entries(meses).sort();
}

// Solicitações agrupadas por tipo
export function solicitacoesPorTipo() {
  const tipos: Record<string, number> = {};
  relatorioSolicitacoes.forEach((s) => {
    tipos[s.tipoDocumento] = (tipos[s.tipoDocumento] ?? 0) + 1;
  });
  return Object.entries(tipos).sort((a, b) => b[1] - a[1]);
}

// Dados por polo para visão gerencial
export function dadosPorPolo() {
  return POLOS.map((polo) => {
    const alunos      = relatorioAlunos.filter((a) => a.polo === polo);
    const professores = relatorioProfessores.filter((p) => p.polo === polo);
    const turmas      = [...new Set(alunos.map((a) => a.turmaNome))];
    const concluintes = alunos.filter((a) => a.situacao === "Aprovado");
    const certEmitidos = alunos.filter((a) => a.documentacao.certificadoEmitido);
    const freqGeral   = alunos.length > 0
      ? Math.round(alunos.reduce((s, a) => s + freqMedia(a), 0) / alunos.length)
      : 0;
    return { polo, alunos: alunos.length, professores: professores.length, turmas: turmas.length, freqGeral, concluintes: concluintes.length, certificados: certEmitidos.length };
  });
}
