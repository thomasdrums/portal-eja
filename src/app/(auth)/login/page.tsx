"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { GraduationCap } from "lucide-react";

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

  const inputClass =
    "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";
  const labelClass = "mb-1 block text-xs font-semibold text-[#4B5563]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded bg-[#009640]">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Portal EJA SESI</h1>
          <p className="mt-1 text-sm text-[#4B5563]">Educação de Jovens e Adultos</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h2 className="mb-5 text-base font-semibold text-gray-800">Acesso ao sistema</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>E-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Senha</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded bg-[#009640] py-3 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-4 rounded border border-[#D9D9D9] bg-white px-4 py-3 text-xs text-[#4B5563]">
          <p className="mb-1 font-semibold text-gray-700">Usuários de teste:</p>
          <p>aluno@eja.com · aluno123</p>
          <p>professor@eja.com · professor123</p>
          <p>coordenacao@eja.com · coord123</p>
        </div>
      </div>
    </main>
  );
}
