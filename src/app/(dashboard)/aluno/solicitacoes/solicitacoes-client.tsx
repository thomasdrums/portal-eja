"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, X, Ban, Download } from "lucide-react";
import type { StatusSolicitacao, TipoDocumento } from "@prisma/client";
import type { SolicitacaoAlunoRow } from "@/lib/queries/solicitacoes";
import { TIPOS_DOCUMENTO, TIPO_LABEL, STATUS_LABEL, STATUS_COR } from "@/lib/solicitacoes-labels";
import { criarSolicitacaoAction, cancelarSolicitacaoAction } from "./actions";

// O aluno só pode cancelar enquanto a secretaria ainda não começou a processar.
function podeCancelar(status: StatusSolicitacao): boolean {
  return status === "RECEBIDA" || status === "EM_ANALISE";
}

export default function SolicitacoesAlunoClient({
  temAluno,
  solicitacoesIniciais,
}: {
  temAluno: boolean;
  solicitacoesIniciais: SolicitacaoAlunoRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const lista = solicitacoesIniciais;
  const [tipo, setTipo] = useState<TipoDocumento>(TIPOS_DOCUMENTO[0]);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  // Confirmação de cancelamento.
  const [cancelAlvo, setCancelAlvo] = useState<SolicitacaoAlunoRow | null>(null);
  const [erroCancel, setErroCancel] = useState("");

  function handleSolicitar() {
    setErro("");
    startTransition(async () => {
      const res = await criarSolicitacaoAction(tipo);
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setSucesso(res.message);
      setTimeout(() => setSucesso(""), 4000);
      router.refresh();
    });
  }

  function confirmarCancelamento() {
    if (!cancelAlvo) return;
    setErroCancel("");
    const id = cancelAlvo.id;
    startTransition(async () => {
      const res = await cancelarSolicitacaoAction(id);
      if (!res.ok) {
        setErroCancel(res.message);
        return;
      }
      setCancelAlvo(null);
      setSucesso(res.message);
      setTimeout(() => setSucesso(""), 4000);
      router.refresh();
    });
  }

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
        <h1 className="text-xl font-semibold text-gray-900">Solicitações de Documentos</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Solicite documentos acadêmicos e acompanhe o status</p>
      </div>

      {!temAluno && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta ainda não está vinculada a um cadastro de aluno. Procure a coordenação para
          liberar as solicitações de documentos.
        </div>
      )}

      {/* Formulário */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">Nova Solicitação</h2>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-[#4B5563]">
            Tipo de documento
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoDocumento)}
            disabled={!temAluno}
            className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20 disabled:opacity-50"
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>{TIPO_LABEL[t]}</option>
            ))}
          </select>
        </div>

        {sucesso && (
          <div className="mb-3 rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
            {sucesso}
          </div>
        )}
        {erro && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        <button
          onClick={handleSolicitar}
          disabled={!temAluno || isPending}
          className="w-full rounded bg-[#009640] py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
        >
          {isPending ? "Enviando…" : "Solicitar documento"}
        </button>
      </div>

      {/* Tabela de solicitações */}
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Histórico de Solicitações</h2>
        </div>

        {lista.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#4B5563]">
            Nenhuma solicitação registrada.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#009640]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-white">Protocolo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white">Documento</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold text-white sm:table-cell">Data / Hora</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-white">Situação</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-white">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {lista.map((sol) => (
                <tr key={sol.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-mono text-[12px] text-[#4B5563]">{sol.protocolo || "—"}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {sol.tipoLabel}
                    <p className="text-[11px] text-[#4B5563] sm:hidden">{sol.dataHora}</p>
                  </td>
                  <td className="hidden px-5 py-3 text-[#4B5563] sm:table-cell">{sol.dataHora}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`rounded px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COR[sol.status]}`}>
                      {STATUS_LABEL[sol.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {sol.linkDocumento ? (
                        <a
                          href={sol.linkDocumento}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-[#009640] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#007A33]"
                        >
                          <Download size={12} />
                          Baixar documento
                        </a>
                      ) : (
                        sol.status !== "CANCELADA" && (
                          <span className="text-[11px] text-[#9CA3AF]">Documento ainda não disponível</span>
                        )
                      )}
                      {podeCancelar(sol.status) && (
                        <button
                          onClick={() => { setErroCancel(""); setCancelAlvo(sol); }}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 rounded border border-red-300 px-2.5 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Ban size={12} />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmação de cancelamento */}
      {cancelAlvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900">Cancelar solicitação</h2>
              <button
                onClick={() => setCancelAlvo(null)}
                className="text-[#9CA3AF] transition hover:text-gray-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 p-5">
              <p className="text-sm text-gray-700">
                Deseja cancelar a solicitação{" "}
                <span className="font-semibold">{cancelAlvo.tipoLabel}</span>{" "}
                (protocolo <span className="font-mono">{cancelAlvo.protocolo || "—"}</span>)?
              </p>
              <p className="text-xs text-[#6B7280]">
                A solicitação continuará no seu histórico com o selo &quot;Cancelada&quot; (nada é apagado).
                Só é possível cancelar enquanto ainda não foi para processamento.
              </p>
              {erroCancel && <p className="text-xs font-semibold text-red-600">{erroCancel}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3.5">
              <button
                onClick={() => setCancelAlvo(null)}
                className="rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={confirmarCancelamento}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                <Ban size={15} />
                {isPending ? "Cancelando…" : "Cancelar solicitação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
