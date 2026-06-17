// ── Resumo ──────────────────────────────────────────────
export const alunoResumo = {
  nome: "Maria Souza",
  turma: "EJA - Etapa III - Turma B",
};

// ── Notas / Áreas ────────────────────────────────────────
export type Competencia = { id: string; nota: number };

export type AreaAcademica = {
  id: string;
  nome: string;
  competencias: Competencia[];
  frequencia: number;
  whatsappLink: string;
};

export const alunoAreas: AreaAcademica[] = [
  {
    id: "matematica",
    nome: "Matemática",
    competencias: [
      { id: "C1", nota: 75 },
      { id: "C2", nota: 45 },
      { id: "C3", nota: 80 },
      { id: "C4", nota: 62 },
      { id: "C5", nota: 55 },
    ],
    frequencia: 85,
    whatsappLink: "https://chat.whatsapp.com/matematica",
  },
  {
    id: "linguagens",
    nome: "Linguagens",
    competencias: [
      { id: "C1", nota: 80 },
      { id: "C2", nota: 70 },
      { id: "C3", nota: 90 },
      { id: "C4", nota: 65 },
    ],
    frequencia: 100,
    whatsappLink: "https://chat.whatsapp.com/linguagens",
  },
  {
    id: "ciencias-natureza",
    nome: "Ciências da Natureza",
    competencias: [
      { id: "C1", nota: 55 },
      { id: "C2", nota: 70 },
      { id: "C3", nota: 48 },
      { id: "C4", nota: 60 },
    ],
    frequencia: 90,
    whatsappLink: "https://chat.whatsapp.com/ciencias-natureza",
  },
  {
    id: "ciencias-humanas",
    nome: "Ciências Humanas",
    competencias: [
      { id: "C1", nota: 72 },
      { id: "C2", nota: 68 },
      { id: "C3", nota: 80 },
      { id: "C4", nota: 75 },
    ],
    frequencia: 95,
    whatsappLink: "https://chat.whatsapp.com/ciencias-humanas",
  },
];

// ── Frequência ───────────────────────────────────────────
export type AreaFrequencia = {
  area: string;
  totalAulas: number;
  presencas: number;
};

export const alunoFrequencia: AreaFrequencia[] = [
  { area: "Matemática", totalAulas: 20, presencas: 17 },
  { area: "Linguagens", totalAulas: 20, presencas: 20 },
  { area: "Ciências da Natureza", totalAulas: 18, presencas: 16 },
  { area: "Ciências Humanas", totalAulas: 20, presencas: 19 },
];

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

// ── Aulas Gravadas ────────────────────────────────────────
export type AulaGravada = {
  id: string;
  area: string;
  titulo: string;
  professor: string;
  data: string;
  youtubeUrl: string;
  formularioUrl: string;
};

export const alunoAulas: AulaGravada[] = [
  {
    id: "aula-1",
    area: "Matemática",
    titulo: "Equações do 1º Grau",
    professor: "Prof. Carlos Silva",
    data: "02/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example1",
  },
  {
    id: "aula-2",
    area: "Matemática",
    titulo: "Geometria Básica",
    professor: "Prof. Carlos Silva",
    data: "09/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example2",
  },
  {
    id: "aula-3",
    area: "Linguagens",
    titulo: "Interpretação de Texto",
    professor: "Profa. Ana Lima",
    data: "03/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example3",
  },
  {
    id: "aula-4",
    area: "Linguagens",
    titulo: "Gramática: Sujeito e Predicado",
    professor: "Profa. Ana Lima",
    data: "10/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example4",
  },
  {
    id: "aula-5",
    area: "Ciências da Natureza",
    titulo: "Sistema Solar",
    professor: "Prof. Pedro Costa",
    data: "04/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example5",
  },
  {
    id: "aula-6",
    area: "Ciências da Natureza",
    titulo: "Células e Organismos",
    professor: "Prof. Pedro Costa",
    data: "11/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example6",
  },
  {
    id: "aula-7",
    area: "Ciências Humanas",
    titulo: "Brasil Colonial",
    professor: "Profa. Lucia Ferreira",
    data: "05/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example7",
  },
  {
    id: "aula-8",
    area: "Ciências Humanas",
    titulo: "Globalização e Sociedade",
    professor: "Profa. Lucia Ferreira",
    data: "12/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example8",
  },
  {
    id: "aula-9",
    area: "Interárea",
    titulo: "Projeto de Vida e Cidadania",
    professor: "Equipe Pedagógica",
    data: "06/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example9",
  },
  {
    id: "aula-10",
    area: "Interárea",
    titulo: "Meio Ambiente e Sustentabilidade",
    professor: "Profa. Sandra Melo",
    data: "13/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example10",
  },
  {
    id: "aula-11",
    area: "Interárea",
    titulo: "Direitos e Deveres do Cidadão",
    professor: "Prof. Roberto Alves",
    data: "16/06/2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    formularioUrl: "https://forms.gle/example11",
  },
];

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
