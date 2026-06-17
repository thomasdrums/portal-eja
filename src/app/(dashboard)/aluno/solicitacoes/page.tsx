"use client";

import { useState } from "react";
import Link from "next/link";
import { alunoSolicitacoes, tiposDocumento, type Solicitacao, type StatusSolicitacao } from "@/lib/mock-data/aluno";

const statusConfig: Record<StatusSolicitacao, { label: string; classes: string; dot: string }> = {
  EM_ANALISE:       { label: "Em análise",       classes: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-400" },
  EM_PROCESSAMENTO: { label: "Em processamento", classes: "bg-blue-50 text-blue-700",     dot: "bg-blue-500"   },
  CONCLUIDA:        { label: "Concluída",         classes: "bg-green-50 text-green-700",   dot: "bg-green-500"  },
};

function formatNow(): string {
  const now = new Date();
  return now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back */}
      <Link
        href="/aluno"
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-bold text-[#0f2d52]">Solicitações</h1>

      {/* Nova solicitação */}
      <div className="mb-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
        <h2 className="mb-4 font-bold text-gray-800">Nova Solicitação</h2>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            Tipo de documento
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
          >
            {tiposDocumento.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {sucesso && (
          <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            ✓ Solicitação enviada com sucesso!
          </div>
        )}

        <button
          onClick={handleSolicitar}
          className="w-full rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
        >
          Solicitar documento
        </button>
      </div>

      {/* Lista */}
      <h2 className="mb-3 font-bold text-gray-800">Minhas Solicitações</h2>

      {lista.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-400">Nenhuma solicitação ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((sol) => {
            const cfg = statusConfig[sol.status];
            return (
              <div key={sol.id} className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{sol.tipo}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{sol.dataHora}</p>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.classes}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
