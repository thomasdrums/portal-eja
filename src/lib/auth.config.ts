import type { NextAuthConfig } from "next-auth";
import { findMockUserById } from "@/lib/mock-data/users";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Novo login: grava tudo do objeto user
        token.id = user.id as string;
        token.role = user.role;
        token.disciplina = user.disciplina ?? null;
      } else if (token.disciplina === undefined) {
        // Sessão antiga sem disciplina: busca no mock pelo id e corrige o token
        const found = findMockUserById(token.id as string);
        token.disciplina = found?.disciplina ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.disciplina = token.disciplina ?? null;
      }
      return session;
    },
  },
};
