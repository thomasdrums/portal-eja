import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Novo login: grava tudo do objeto user (vindo do authorize, que consultou o banco).
        token.id = user.id as string;
        token.role = user.role;
        token.disciplina = user.disciplina ?? null;
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
