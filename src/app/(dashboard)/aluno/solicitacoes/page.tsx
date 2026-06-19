"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  alunoSolicitacoes,
  tiposDocumento,
  type Solicitacao,
  type StatusSolicitacao,
} from "@/lib/mock-data/aluno";

const statusConfig: Record<StatusSolicitacao, { label: string; classes: string }> = {
  EM_ANALISE:       { label: "Em análise",       classes: "bg-yellow-50 text-yellow-700" },
  EM_PROCESSAMENTO: { label: "Em processamento", classes: "bg-blue-50 text-blue-700" },
  CONCLUIDA:        { label: "Concluída",         classes: "bg-[#EAF6EE] text-[#007A33]" },
};

function formatNow(): string {
  const now = new Date();
  return `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function SolicitacoesPage() {
  const [lista, setLista] = useState<Solicitacao[]>(alunoSolicitacoes);
  const [tipo, setTipo] = useState<string>(tiposDocumento[0]);
  const [sucesso, setSucesso] = useState(false);

  function handleSolicitar() {
    const nova: Solicitacao = {
      id: `sol-${Date.now()}`,
      tipo,
      dataHora: formatNow(),
      status: "EM_ANALISE",
    };
    setLista((prev) => [nova, ...prev]);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
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

      {/* Formulário */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">Nova Solicitação</h2>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-[#4B5563]">
            Tipo de documento
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
          >
            {tiposDocumento.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {sucesso && (
          <div className="mb-3 rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
            Solicitação enviada com sucesso.
          </div>
        )}

        <button
          onClick={handleSolicitar}
          className="w-full rounded bg-[#009640] py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33]"
        >
          Solicitar documento
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
              {lista.map((sol) => {
                const cfg = statusConfig[sol.status];
                return (
                  <tr key={sol.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {sol.tipo}
                      <p className="text-[11px] text-[#4B5563] sm:hidden">{sol.dataHora}</p>
                    </td>
                    <td className="hidden px-5 py-3 text-[#4B5563] sm:table-cell">{sol.dataHora}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`rounded px-2.5 py-0.5 text-[11px] font-semibold ${cfg.classes}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
