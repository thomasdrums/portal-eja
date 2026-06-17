import type { Role } from "@/lib/mock-data/users";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    disciplina?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      disciplina?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    disciplina?: string | null;
  }
}
