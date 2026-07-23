"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Calendar,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import type { FrequenciaAluno } from "@/lib/queries/frequencia";
import FrequenciaAlunoView from "./frequencia/frequencia-view";

// Estilo compartilhado dos cards de módulo (accordion e link usam a mesma base).
const tileBase =
  "flex flex-col items-center gap-2.5 rounded-lg border p-4 text-sm font-medium transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.06)]";
const tileInactive =
  "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#009640] hover:text-[#009640]";
const tileActive = "border-[#009640] bg-[#009640] text-white";

export default function AlunoDashboardClient({
  nome,
  turmaNome,
  temAluno,
  frequencia,
}: {
  nome: string;
  turmaNome: string | null;
  temAluno: boolean;
  frequencia: FrequenciaAluno | null;
}) {
  // Frequência é o único módulo que ainda abre aqui; Notas, Aulas e Solicitações
  // são páginas próprias ligadas ao banco (sem caminho paralelo com mock).
  const [aberto, setAberto] = useState(false);

  const primeiroNome = nome.split(" ")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Bem-vindo, {primeiroNome}</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">{turmaNome ?? "Sem turma vinculada"}</p>
      </div>

      {!temAluno && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta ainda não está vinculada a um cadastro de aluno. Procure a coordenação.
        </div>
      )}

      {/* Módulos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/aluno/notas" className={`${tileBase} ${tileInactive}`}>
          <Star size={22} />
          <span>Notas</span>
          <ChevronRight size={14} />
        </Link>

        <button
          onClick={() => setAberto((v) => !v)}
          className={`${tileBase} ${aberto ? tileActive : tileInactive}`}
        >
          <Calendar size={22} />
          <span>Frequência</span>
          {aberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <Link href="/aluno/aulas" className={`${tileBase} ${tileInactive}`}>
          <PlayCircle size={22} />
          <span>Aulas Gravadas</span>
          <ChevronRight size={14} />
        </Link>

        <Link href="/aluno/solicitacoes" className={`${tileBase} ${tileInactive}`}>
          <FileText size={22} />
          <span>Solicitações</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Frequência calculada a partir das respostas validadas */}
      {aberto && frequencia && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Frequência</h2>
            <Link
              href="/aluno/frequencia"
              className="text-xs font-semibold text-[#009640] hover:underline"
            >
              Ver detalhes
            </Link>
          </div>
          <FrequenciaAlunoView frequencia={frequencia} />
        </section>
      )}
    </div>
  );
}
