"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Undo2, Clock, MessageSquare, User } from "lucide-react";
import type { StatusResposta } from "@prisma/client";
import type { RespostaValidacaoRow, RespostasValidacaoResult } from "@/lib/queries/aulas";
import {
  validarRespostaAction,
  validarRespostasEmLoteAction,
  recusarRespostaAction,
  desfazerValidacaoAction,
} from "./actions";

type FiltroStatus = StatusResposta | "TODAS";

const STATUS_TABS: { valor: FiltroStatus; label: string }[] = [
  { valor: "PENDENTE", label: "Pendentes" },
  { valor: "VALIDADA", label: "Validadas" },
  { valor: "RECUSADA", label: "Recusadas" },
  { valor: "TODAS", label: "Todas" },
];

const STATUS_BADGE: Record<StatusResposta, string> = {
  PENDENTE: "bg-amber-50 text-amber-800 border-amber-200",
  VALIDADA: "bg-[#EAF6EE] text-[#007A33] border-[#009640]/20",
  RECUSADA: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<StatusResposta, string> = {
  PENDENTE: "Aguardando validação",
  VALIDADA: "Validada",
  RECUSADA: "Recusada",
};

const fieldClasses =
  "rounded border border-[#D9D9D9] bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";

export default function RespostasProfessorClient({
  dados,
}: {
  dados: RespostasValidacaoResult;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Abre nas pendentes — é o que exige ação do professor.
  const [status, setStatus] = useState<FiltroStatus>("PENDENTE");
  const [aulaId, setAulaId] = useState("");
  const [turmaId, setTurmaId] = useState("");

  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [alvoRecusa, setAlvoRecusa] = useState<RespostaValidacaoRow | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [flash, setFlash] = useState("");

  const totalPendentes = useMemo(
    () => dados.respostas.filter((r) => r.status === "PENDENTE").length,
    [dados.respostas],
  );

  const lista = useMemo(() => {
    return dados.respostas.filter((r) => {
      if (status !== "TODAS" && r.status !== status) return false;
      if (aulaId && r.aulaId !== aulaId) return false;
      if (turmaId && r.turmaId !== turmaId) return false;
      return true;
    });
  }, [dados.respostas, status, aulaId, turmaId]);

  // Só as pendentes da lista atual entram na validação em lote.
  const pendentesVisiveis = useMemo(
    () => lista.filter((r) => r.status === "PENDENTE"),
    [lista],
  );
  const idsSelecionados = useMemo(
    () => pendentesVisiveis.filter((r) => selecionadas.has(r.id)).map((r) => r.id),
    [pendentesVisiveis, selecionadas],
  );
  const todasMarcadas =
    pendentesVisiveis.length > 0 && idsSelecionados.length === pendentesVisiveis.length;

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3500);
  }

  function alternar(id: string) {
    setSelecionadas((antes) => {
      const proximo = new Set(antes);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function alternarTodas() {
    setSelecionadas(todasMarcadas ? new Set() : new Set(pendentesVisiveis.map((r) => r.id)));
  }

  function executar(acao: () => Promise<{ ok: boolean; message: string }>) {
    setErro("");
    startTransition(async () => {
      const res = await acao();
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setSelecionadas(new Set());
      showFlash(res.message);
      router.refresh();
    });
  }

  function confirmarRecusa() {
    if (!alvoRecusa) return;
    const id = alvoRecusa.id;
    const texto = motivo;
    setErro("");
    startTransition(async () => {
      const res = await recusarRespostaAction(id, texto);
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setAlvoRecusa(null);
      setMotivo("");
      showFlash(res.message);
      router.refresh();
    });
  }

  if (!dados.podeValidar) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta não está vinculada a um cadastro de professor. Fale com a coordenação.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho + contador de pendentes */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Validar respostas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          Confira as respostas dos alunos às perguntas das suas aulas. A presença só conta depois
          da validação.
        </p>
        <div
          className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
            totalPendentes > 0
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-[#009640]/20 bg-[#EAF6EE] text-[#007A33]"
          }`}
        >
          <Clock size={16} />
          {totalPendentes === 0
            ? "Nenhuma resposta aguardando validação."
            : `${totalPendentes} resposta${totalPendentes > 1 ? "s" : ""} aguardando validação`}
        </div>
      </div>

      {flash && (
        <div className="rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
          {flash}
        </div>
      )}
      {erro && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => {
            const ativo = status === t.valor;
            const qtd =
              t.valor === "TODAS"
                ? dados.respostas.length
                : dados.respostas.filter((r) => r.status === t.valor).length;
            return (
              <button
                key={t.valor}
                onClick={() => {
                  setStatus(t.valor);
                  setSelecionadas(new Set());
                }}
                className={`rounded border px-3 py-1.5 text-xs font-semibold transition ${
                  ativo
                    ? "border-[#009640] bg-[#EAF6EE] text-[#007A33]"
                    : "border-[#D9D9D9] text-[#4B5563] hover:bg-[#F5F5F5]"
                }`}
              >
                {t.label} ({qtd})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={aulaId}
            onChange={(e) => {
              setAulaId(e.target.value);
              setSelecionadas(new Set());
            }}
            className={`${fieldClasses} sm:flex-1`}
          >
            <option value="">Todas as aulas</option>
            {dados.aulas.map((a) => (
              <option key={a.id} value={a.id}>{a.titulo}</option>
            ))}
          </select>
          <select
            value={turmaId}
            onChange={(e) => {
              setTurmaId(e.target.value);
              setSelecionadas(new Set());
            }}
            className={`${fieldClasses} sm:w-56`}
          >
            <option value="">Todas as turmas</option>
            {dados.turmas.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Barra de validação em lote */}
      {pendentesVisiveis.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <label className="flex items-center gap-2 text-sm text-[#4B5563]">
            <input
              type="checkbox"
              checked={todasMarcadas}
              onChange={alternarTodas}
              className="h-4 w-4 accent-[#009640]"
            />
            Selecionar as {pendentesVisiveis.length} pendentes exibidas
          </label>
          <button
            onClick={() => executar(() => validarRespostasEmLoteAction(idsSelecionados))}
            disabled={idsSelecionados.length === 0 || isPending}
            className="inline-flex items-center gap-1.5 rounded bg-[#009640] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
          >
            <Check size={15} />
            {isPending ? "Validando…" : `Validar selecionadas (${idsSelecionados.length})`}
          </button>
        </div>
      )}

      {/* Lista */}
      {lista.length === 0 ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <MessageSquare size={22} className="mx-auto mb-2 text-[#9CA3AF]" />
          <p className="text-sm text-[#4B5563]">
            {status === "PENDENTE"
              ? "Nenhuma resposta pendente com esses filtros."
              : "Nenhuma resposta encontrada com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              {/* Aluno + status */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {r.status === "PENDENTE" && (
                    <input
                      type="checkbox"
                      checked={selecionadas.has(r.id)}
                      onChange={() => alternar(r.id)}
                      aria-label={`Selecionar resposta de ${r.alunoNome}`}
                      className="mt-1 h-4 w-4 accent-[#009640]"
                    />
                  )}
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                      <User size={14} className="text-[#009640]" />
                      {r.alunoNome}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">
                      RA {r.alunoRa} · {r.turmaNome}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>

              {/* Aula */}
              <div className="mt-3 rounded border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5">
                <p className="text-sm font-medium text-gray-800">{r.aulaTitulo}</p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                  {r.aulaDataLabel}
                  {r.areaNome ? ` · ${r.areaNome}` : ""}
                  {r.competenciaCodigo ? ` · ${r.competenciaCodigo}` : ""}
                  {r.aulaTipo === "INTERAREA" ? " · Interárea" : ""}
                </p>
                {r.pergunta && (
                  <p className="mt-2 text-sm text-[#4B5563]">
                    <span className="font-semibold text-gray-700">Pergunta: </span>
                    {r.pergunta}
                  </p>
                )}
              </div>

              {/* Resposta do aluno */}
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                  Resposta do aluno
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{r.texto}</p>
                <p className="mt-2 text-[11px] text-[#9CA3AF]">
                  Enviada em {r.enviadaEmLabel}
                  {r.reenviadaEmLabel ? ` · reenviada em ${r.reenviadaEmLabel}` : ""}
                </p>
              </div>

              {/* Histórico da decisão */}
              {r.status === "RECUSADA" && r.motivoRecusa && (
                <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  Motivo da recusa: {r.motivoRecusa}
                </p>
              )}
              {r.status !== "PENDENTE" && r.validadaEmLabel && (
                <p className="mt-2 text-[11px] text-[#9CA3AF]">
                  {r.status === "VALIDADA" ? "Validada" : "Recusada"} em {r.validadaEmLabel}
                  {r.validadaPorNome ? ` por ${r.validadaPorNome}` : ""}
                </p>
              )}

              {/* Ações */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#F3F4F6] pt-3">
                {r.status !== "VALIDADA" && (
                  <button
                    onClick={() => executar(() => validarRespostaAction(r.id))}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded bg-[#009640] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
                  >
                    <Check size={15} />
                    Validar
                  </button>
                )}
                {r.status !== "RECUSADA" && (
                  <button
                    onClick={() => {
                      setErro("");
                      setMotivo("");
                      setAlvoRecusa(r);
                    }}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <X size={15} />
                    Recusar
                  </button>
                )}
                {r.status === "VALIDADA" && (
                  <button
                    onClick={() => executar(() => desfazerValidacaoAction(r.id))}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F5F5F5] disabled:opacity-50"
                  >
                    <Undo2 size={15} />
                    Desfazer validação
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de recusa (motivo obrigatório) */}
      {alvoRecusa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900">Recusar resposta</h2>
              <button
                onClick={() => setAlvoRecusa(null)}
                className="text-[#9CA3AF] transition hover:text-gray-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-gray-700">
                Resposta de <span className="font-semibold">{alvoRecusa.alunoNome}</span> na aula{" "}
                <span className="font-semibold">{alvoRecusa.aulaTitulo}</span>.
              </p>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                  Motivo da recusa
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder="Ex.: a resposta não trata do conteúdo da aula. Assista de novo e explique com suas palavras."
                  className={`${fieldClasses} w-full`}
                />
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  O aluno verá este motivo e poderá responder de novo.
                </p>
              </div>
              {erro && <p className="text-xs font-semibold text-red-600">{erro}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3.5">
              <button
                onClick={() => setAlvoRecusa(null)}
                className="rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={confirmarRecusa}
                disabled={!motivo.trim() || isPending}
                className="inline-flex items-center gap-1.5 rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                <X size={15} />
                {isPending ? "Recusando…" : "Recusar resposta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
