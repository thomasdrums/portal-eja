import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Busca o usuário no banco, incluindo os perfis relacionados.
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            aluno: true,
            professor: { include: { area: true } },
          },
        });
        if (!user) return null;

        const isValid = bcrypt.compareSync(password, user.passwordHash);
        if (!isValid) return null;

        // Aluno/Professor arquivado (soft delete) não pode acessar a plataforma.
        if (user.aluno?.arquivado || user.professor?.arquivado) return null;

        // Para PROFESSOR, a disciplina vem do nome da área do perfil Professor.
        const disciplina =
          user.role === "PROFESSOR" ? user.professor?.area?.nome ?? null : null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          disciplina,
        };
      },
    }),
  ],
});
