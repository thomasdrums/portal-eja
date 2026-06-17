export type Role = "ALUNO" | "PROFESSOR" | "COORDENACAO";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  disciplina?: string; // only for PROFESSOR
};

// Senhas em texto puro (somente para referência em ambiente de testes):
// aluno@eja.com / aluno123
// professor@eja.com / professor123  → disciplina: Matemática
// coordenacao@eja.com / coord123
export const mockUsers: MockUser[] = [
  {
    id: "user-aluno-1",
    name: "Maria Souza",
    email: "aluno@eja.com",
    passwordHash: "$2b$10$axPp60/RPnrQYtpXpq8M5.6wmBte2vmiC9t38W2ZbWGxDPdRhNNt2",
    role: "ALUNO",
  },
  {
    id: "user-professor-1",
    name: "João Pereira",
    email: "professor@eja.com",
    passwordHash: "$2b$10$e.exugiwPkEn47ZwCxlYTu26GBM3DViLoyyk7fzOgcyEMnWEQMPbG",
    role: "PROFESSOR",
    disciplina: "Matemática",
  },
  {
    id: "user-coordenacao-1",
    name: "Ana Lima",
    email: "coordenacao@eja.com",
    passwordHash: "$2b$10$rPd4kKqnH7TbfHngrBPBee33TuQqI/WG2HSOH35TIvY/Rjm/sl6za",
    role: "COORDENACAO",
  },
];

export function findMockUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findMockUserById(id: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}
