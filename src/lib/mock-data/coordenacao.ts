// ── Tipos ────────────────────────────────────────────────
export const POLOS_COORD = ["Caruaru", "Recife", "Olinda", "Garanhuns"] as const;
export type PoloCoord = (typeof POLOS_COORD)[number];

export const AREAS_COORD = [
  "Matemática",
  "Linguagens",
  "Ciências da Natureza",
  "Ciências Humanas",
  "Interárea",
] as const;
export type AreaCoord = (typeof AREAS_COORD)[number];

export const ETAPAS_COORD = ["Fundamental II", "Ensino Médio"] as const;
export type EtapaCoord = (typeof ETAPAS_COORD)[number];

export type ProfessorCoord = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  polo: PoloCoord;
  area: AreaCoord;
  turmasVinculadas: string[];
  ativo: boolean;
};

export type TurmaCoord = {
  id: string;
  nome: string;
  polo: PoloCoord;
  ano: string;
  etapa: EtapaCoord;
  professores: string[];
  status: "ativa" | "encerrada";
};

// Mapa turmaCoord.id → turmaNome usado em relatorios.ts
export const TURMA_ID_TO_NOME: Record<string, string> = {
  tc261: "Turma 26.1",
  tc262: "Turma 26.2",
  tc263: "Turma 26.3",
  tc264: "Turma 26.4",
  tc265: "Turma 26.5",
  tc266: "Turma 26.6",
  tc267: "Turma 26.7",
  tc268: "Turma 26.8",
};

// ── Professores ───────────────────────────────────────────
export const professoresCoord: ProfessorCoord[] = [
  // Caruaru
  { id:"pc1", nome:"João Pereira",    cpf:"123.456.789-01", email:"joao.pereira@ejasesi.org.br",    telefone:"(81) 99111-2222", polo:"Caruaru",   area:"Matemática",           turmasVinculadas:["Turma 26.1","Turma 26.2","Turma 26.3"], ativo:true  },
  { id:"pc2", nome:"Carla Mendes",    cpf:"234.567.890-12", email:"carla.mendes@ejasesi.org.br",    telefone:"(81) 99222-3333", polo:"Caruaru",   area:"Linguagens",           turmasVinculadas:["Turma 26.1","Turma 26.2"],               ativo:true  },
  // Recife
  { id:"pc3", nome:"Rafael Costa",    cpf:"345.678.901-23", email:"rafael.costa@ejasesi.org.br",    telefone:"(81) 99333-4444", polo:"Recife",    area:"Ciências da Natureza", turmasVinculadas:["Turma 26.3","Turma 26.4"],               ativo:true  },
  { id:"pc4", nome:"Adriana Lima",    cpf:"456.789.012-34", email:"adriana.lima@ejasesi.org.br",    telefone:"(81) 99444-5555", polo:"Recife",    area:"Ciências Humanas",     turmasVinculadas:["Turma 26.3","Turma 26.4"],               ativo:true  },
  // Olinda
  { id:"pc5", nome:"Bruno Almeida",   cpf:"567.890.123-45", email:"bruno.almeida@ejasesi.org.br",   telefone:"(87) 99555-6666", polo:"Olinda",    area:"Matemática",           turmasVinculadas:["Turma 26.5","Turma 26.6"],               ativo:true  },
  { id:"pc6", nome:"Cristina Farias", cpf:"678.901.234-56", email:"cristina.farias@ejasesi.org.br", telefone:"(87) 99666-7777", polo:"Olinda",    area:"Linguagens",           turmasVinculadas:["Turma 26.5","Turma 26.6"],               ativo:true  },
  // Garanhuns
  { id:"pc7", nome:"Diego Matos",     cpf:"789.012.345-67", email:"diego.matos@ejasesi.org.br",     telefone:"(87) 99777-8888", polo:"Garanhuns", area:"Ciências da Natureza", turmasVinculadas:["Turma 26.7","Turma 26.8"],               ativo:true  },
  { id:"pc8", nome:"Elaine Torres",   cpf:"890.123.456-78", email:"elaine.torres@ejasesi.org.br",   telefone:"(87) 99888-9999", polo:"Garanhuns", area:"Ciências Humanas",     turmasVinculadas:["Turma 26.7","Turma 26.8"],               ativo:true  },
  // Inativos
  { id:"pc9",  nome:"Marcos Vinicius", cpf:"901.234.567-89", email:"marcos.vinicius@ejasesi.org.br", telefone:"(81) 99999-0000", polo:"Caruaru",   area:"Interárea",  turmasVinculadas:[], ativo:false },
  { id:"pc10", nome:"Letícia Barros",  cpf:"012.345.678-90", email:"leticia.barros@ejasesi.org.br",  telefone:"(81) 98000-1111", polo:"Recife",    area:"Matemática", turmasVinculadas:[], ativo:false },
];

// ── Turmas ────────────────────────────────────────────────
export const turmasCoord: TurmaCoord[] = [
  { id:"tc261", nome:"Turma 26.1", polo:"Caruaru",   ano:"2026", etapa:"Fundamental II", professores:["João Pereira","Carla Mendes"],     status:"ativa"     },
  { id:"tc262", nome:"Turma 26.2", polo:"Caruaru",   ano:"2026", etapa:"Ensino Médio",   professores:["João Pereira","Carla Mendes"],     status:"ativa"     },
  { id:"tc263", nome:"Turma 26.3", polo:"Recife",    ano:"2026", etapa:"Fundamental II", professores:["Rafael Costa","Adriana Lima"],     status:"ativa"     },
  { id:"tc264", nome:"Turma 26.4", polo:"Recife",    ano:"2026", etapa:"Ensino Médio",   professores:["Rafael Costa","Adriana Lima"],     status:"ativa"     },
  { id:"tc265", nome:"Turma 26.5", polo:"Olinda",    ano:"2026", etapa:"Fundamental II", professores:["Bruno Almeida","Cristina Farias"], status:"ativa"     },
  { id:"tc266", nome:"Turma 26.6", polo:"Olinda",    ano:"2026", etapa:"Ensino Médio",   professores:["Bruno Almeida","Cristina Farias"], status:"encerrada" },
  { id:"tc267", nome:"Turma 26.7", polo:"Garanhuns", ano:"2026", etapa:"Fundamental II", professores:["Diego Matos","Elaine Torres"],     status:"ativa"     },
  { id:"tc268", nome:"Turma 26.8", polo:"Garanhuns", ano:"2026", etapa:"Ensino Médio",   professores:["Diego Matos","Elaine Torres"],     status:"ativa"     },
];

// ── Indicadores para o dashboard ─────────────────────────
export const indicadoresCoord = {
  totalAlunos:            21,
  totalProfessores:       professoresCoord.length,
  totalTurmas:            turmasCoord.length,
  totalPolos:             4,
  concluentesMes:         2,   // junho/2026
  certificadosPendentes:  14,  // alunos sem certificado emitido
  solicitacoesPendentes:  9,   // status !== "Concluída"
};

// ── Legacy exports (compatibilidade) ─────────────────────
export const coordenacaoIndicadores = {
  totalAlunos:          indicadoresCoord.totalAlunos,
  totalProfessores:     indicadoresCoord.totalProfessores,
  totalTurmas:          indicadoresCoord.totalTurmas,
  frequenciaMediaGeral: 83,
};
export const coordenacaoTurmas = turmasCoord.map((t) => ({
  id: t.id, nome: t.nome,
  professor: t.professores[0] ?? "",
  alunos: 0,
  status: t.status === "ativa" ? "Em andamento" : "Encerrada",
}));
export const coordenacaoProfessores = professoresCoord
  .filter((p) => p.ativo)
  .map((p) => ({ id: p.id, nome: p.nome, disciplina: p.area, turmas: p.turmasVinculadas.length }));
