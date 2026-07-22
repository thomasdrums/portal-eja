"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { TipoDocumento } from "@prisma/client";
import type { SolicitacaoAlunoRow } from "@/lib/queries/solicitacoes";
import { TIPOS_DOCUMENTO, TIPO_LABEL, STATUS_LABEL, STATUS_COR } from "@/lib/solicitacoes-labels";
import { criarSolicitacaoAction } from "./actions";

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

  function handleSolicitar() {
    setErro("");
    startTransition(async () => {
      const res = await criarSolicitacaoAction(tipo);
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setSucesso(res.message);
      setTimeout(() => setSucesso(""), 3000);
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-white">Documento</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold text-white sm:table-cell">Data / Hora</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-white">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {lista.map((sol) => (
                <tr key={sol.id} className="hover:bg-[#F8FAFC]">
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
