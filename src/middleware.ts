import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/lib/mock-data/users";

const { auth } = NextAuth(authConfig);

const roleHome: Record<Role, string> = {
  ALUNO: "/aluno",
  PROFESSOR: "/professor",
  COORDENACAO: "/coordenacao",
};

const roleByPathPrefix: { prefix: string; role: Role }[] = [
  { prefix: "/aluno", role: "ALUNO" },
  { prefix: "/professor", role: "PROFESSOR" },
  { prefix: "/coordenacao", role: "COORDENACAO" },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const matchedRoute = roleByPathPrefix.find((r) => pathname.startsWith(r.prefix));
  if (!matchedRoute) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.role !== matchedRoute.role) {
    const homeUrl = new URL(roleHome[session.user.role], req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/aluno/:path*", "/professor/:path*", "/coordenacao/:path*"],
};
