"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Info,
} from "lucide-react";
import type { TipoAula } from "@prisma/client";
import type { AulaAlunoRow } from "@/lib/queries/aulas";
import { responderAulaAction } from "./actions";

const TIPO_LABEL: Record<TipoAula, string> = {
  AREA: "Da área",
  INTERAREA: "Interárea",
  GERAL: "Geral",
};

function AulaCard({ aula }: { aula: AulaAlunoRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const r = aula.resposta;

  // Abre o campo de resposta quando ainda não respondeu ou quando foi recusada.
  const [editing, setEditing] = useState(r === null || r.status === "RECUSADA");
  const [texto, setTexto] = useState(r?.texto ?? "");
  const [erro, setErro] = useState("");

  const respondivel = aula.tipo !== "GERAL" && !aula.dispensada;

  function enviar() {
    setErro("");
    startTransition(async () => {
      const res = await responderAulaAction(aula.id, texto);
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E5E7EB] px-5 py-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800">{aula.titulo}</p>
          <p className="mt-0.5 text-[11px] text-[#4B5563]">
            {aula.dataLabel}
            {aula.areaNome && (
              <>
                {" · "}
                {aula.areaNome}
                {aula.competenciaCodigo ? ` · ${aula.competenciaCodigo}` : ""}
              </>
            )}
          </p>
        </div>
        <span className="shrink-0 rounded bg-[#EAF6EE] px-2 py-0.5 text-[11px] font-semibold text-[#007A33]">
          {TIPO_LABEL[aula.tipo]}
        </span>
      </div>

      <div className="space-y-3 px-5 py-4">
        <a
          href={aula.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded bg-[#009640] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#007A33]"
        >
          <PlayCircle size={15} />
          Assistir aula
        </a>

        {/* Aula geral: só vídeo informativo */}
        {aula.tipo === "GERAL" && (
          <p className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Info size={13} />
            Aula informativa — não conta presença.
          </p>
        )}

        {/* Dispensa por certificação (só AREA) */}
        {aula.dispensada && (
          <div className="flex items-center gap-1.5 rounded border border-[#009640]/20 bg-[#EAF6EE] px-3 py-2 text-sm font-medium text-[#007A33]">
            <Award size={15} />
            Dispensado — competência certificada.
          </div>
        )}

        {/* Pergunta + resposta (AREA/INTERAREA não dispensadas) */}
        {respondivel && aula.pergunta && (
          <div className="space-y-2 rounded border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
              Pergunta do professor
            </p>
            <p className="text-sm text-gray-800">{aula.pergunta}</p>

            {/* Resposta validada: travada */}
            {r?.status === "VALIDADA" ? (
              <div className="space-y-1.5">
                <p className="rounded border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-700">
                  {r.texto}
                </p>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#007A33]">
                  <CheckCircle2 size={14} />
                  Validada — presença confirmada.
                </p>
              </div>
            ) : r?.status === "PENDENTE" && !editing ? (
              /* Pendente: mostra a resposta enviada, permite editar */
              <div className="space-y-1.5">
                <p className="rounded border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-700">
                  {r.texto}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    <Clock size={14} />
                    Aguardando validação do professor.
                  </p>
                  <button
                    onClick={() => { setTexto(r.texto); setEditing(true); }}
                    className="rounded border border-[#D9D9D9] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
                  >
                    Editar resposta
                  </button>
                </div>
              </div>
            ) : (
              /* Sem resposta, recusada, ou editando */
              <div className="space-y-2">
                {r?.status === "RECUSADA" && r.motivoRecusa && (
                  <p className="flex items-start gap-1.5 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    <XCircle size={14} className="mt-0.5 shrink-0" />
                    <span>Resposta recusada: {r.motivoRecusa}. Responda novamente.</span>
                  </p>
                )}
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={3}
                  placeholder="Escreva sua resposta…"
                  className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
                />
                {erro && <p className="text-xs font-semibold text-red-600">{erro}</p>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={enviar}
                    disabled={isPending || !texto.trim()}
                    className="rounded bg-[#009640] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
                  >
                    {isPending ? "Enviando…" : "Enviar resposta"}
                  </button>
                  {r?.status === "PENDENTE" && (
                    <button
                      onClick={() => { setEditing(false); setErro(""); }}
                      className="rounded border border-[#D9D9D9] px-3 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AulasAlunoClient({
  temAluno,
  temTurma,
  aulas,
}: {
  temAluno: boolean;
  temTurma: boolean;
  aulas: AulaAlunoRow[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/aluno"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Aulas Gravadas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          Assista às aulas e responda a pergunta para registrar sua presença.
        </p>
      </div>

      {!temAluno ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta ainda não está vinculada a um cadastro de aluno. Procure a coordenação.
        </div>
      ) : !temTurma ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#4B5563] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          Você ainda não está em uma turma. Assim que a coordenação te vincular a uma turma, as aulas
          aparecem aqui.
        </div>
      ) : aulas.length === 0 ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#4B5563] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          Nenhuma aula publicada para a sua turma ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {aulas.map((a) => (
            <AulaCard key={a.id} aula={a} />
          ))}
        </div>
      )}
    </div>
  );
}
