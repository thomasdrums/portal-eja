"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8fc] px-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#0f2d52]/5" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#1565c0]/5" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2d52] to-[#1565c0] shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0f2d52]">Portal EJA</h1>
          <p className="mt-1 text-sm text-gray-500">
            Educação de Jovens e Adultos
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <h2 className="mb-6 text-lg font-bold text-gray-800">Entrar na conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Test credentials */}
        <div className="mt-4 rounded-2xl bg-white/70 p-4 text-xs text-gray-500 ring-1 ring-gray-200">
          <p className="mb-1 font-semibold text-gray-600">Usuários de teste:</p>
          <p>aluno@eja.com · aluno123</p>
          <p>professor@eja.com · professor123</p>
          <p>coordenacao@eja.com · coord123</p>
        </div>
      </div>
    </main>
  );
}
