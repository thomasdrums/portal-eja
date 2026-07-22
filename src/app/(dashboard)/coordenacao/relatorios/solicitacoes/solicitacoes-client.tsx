"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import type { StatusSolicitacao } from "@prisma/client";
import type { SolicitacaoCoordRow } from "@/lib/queries/solicitacoes";
import { STATUSES, STATUS_LABEL, STATUS_COR } from "@/lib/solicitacoes-labels";
import { atualizarStatusAction, definirLinkDocumentoAction } from "./actions";

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20">
        <option value="">Todos</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function RelatorioSolicitacoesClient({
  solicitacoesIniciais,
}: {
  solicitacoesIniciais: SolicitacaoCoordRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const lista = solicitacoesIniciais;
  const [polo, setPolo] = useState("");
  const [turma, setTurma] = useState("");
  const [status, setStatus] = useState("");
  const [tipo, setTipo] = useState("");
  const [buscaProtocolo, setBuscaProtocolo] = useState("");

  // Rascunho do link por linha e aviso de salvamento por linha.
  const [linkDraft, setLinkDraft] = useState<Record<string, string>>({});
  const [linkFlash, setLinkFlash] = useState<Record<string, { msg: string; ok: boolean }>>({});

  // Opções de filtro derivadas dos dados reais.
  const POLOS = useMemo(() => [...new Set(lista.map((s) => s.polo))].filter(Boolean).sort(), [lista]);
  const TURMAS = useMemo(() => [...new Set(lista.map((s) => s.turmaNome))].filter(Boolean).sort(), [lista]);
  const TIPOS = useMemo(() => [...new Set(lista.map((s) => s.tipoLabel))].sort(), [lista]);

  const filtered = useMemo(() => {
    const q = buscaProtocolo.trim().toLowerCase();
    return lista.filter((s) => {
      const protoOk = !q || s.protocolo.toLowerCase().includes(q);
      // Canceladas somem das pendências ativas, mas continuam acháveis por protocolo.
      const canceladaOk = s.status !== "CANCELADA" || q !== "";
      return (
        (!polo || s.polo === polo) &&
        (!turma || s.turmaNome === turma) &&
        (!status || STATUS_LABEL[s.status] === status) &&
        (!tipo || s.tipoLabel === tipo) &&
        protoOk &&
        canceladaOk
      );
    });
  }, [lista, polo, turma, status, tipo, buscaProtocolo]);

  const contadores = STATUSES.map((st) => ({
    status: st,
    label: STATUS_LABEL[st],
    value: lista.filter((s) => s.status === st).length,
  }));

  function atualizarStatus(id: string, novoStatus: StatusSolicitacao) {
    startTransition(async () => {
      const res = await atualizarStatusAction(id, novoStatus);
      if (res.ok) router.refresh();
    });
  }

  // Link atual do campo: rascunho editado, senão o valor vindo do banco.
  function linkAtual(s: SolicitacaoCoordRow): string {
    return linkDraft[s.id] ?? s.linkDocumento;
  }

  function salvarLink(s: SolicitacaoCoordRow) {
    const url = linkAtual(s);
    startTransition(async () => {
      const res = await definirLinkDocumentoAction(s.id, url);
      setLinkFlash((f) => ({ ...f, [s.id]: { msg: res.message, ok: res.ok } }));
      if (res.ok) {
        setTimeout(() => setLinkFlash((f) => ({ ...f, [s.id]: { msg: "", ok: true } })), 3000);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/coordenacao/relatorios" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Relatório de Solicitações</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            {filtered.length} solicitaç{filtered.length !== 1 ? "ões" : "ão"} encontrada{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {contadores.map((c) => (
          <div key={c.status} className={`rounded-lg p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${STATUS_COR[c.status]}`}>
            <p className="text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs font-semibold">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
            Buscar por protocolo
          </label>
          <input
            type="text"
            value={buscaProtocolo}
            onChange={(e) => setBuscaProtocolo(e.target.value)}
            placeholder="Ex.: 2026-000123"
            className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20 sm:max-w-xs"
          />
          <p className="mt-1 text-[11px] text-[#9CA3AF]">
            A busca por protocolo também localiza solicitações canceladas (que ficam fora das pendências).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Select label="Polo" value={polo} onChange={setPolo} options={POLOS} />
          <Select label="Turma" value={turma} onChange={setTurma} options={TURMAS} />
          <Select label="Status" value={status} onChange={setStatus} options={STATUSES.map((st) => STATUS_LABEL[st])} />
          <Select label="Tipo" value={tipo} onChange={setTipo} options={TIPOS} />
        </div>
      </div>

      <p className="text-[11px] text-[#6B7280]">
        <span className="font-semibold">Documento (link):</span> o acesso é controlado pela permissão do
        próprio link no Drive/OneDrive. Use links restritos/compartilhados, não públicos.
      </p>

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Protocolo</th>
              <th className="px-3 py-3">Aluno</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Polo</th>
              <th className="px-3 py-3">Turma</th>
              <th className="px-3 py-3">Data</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3">Documento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhuma solicitação encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-mono text-[12px] text-[#4B5563]">{s.protocolo || "—"}</td>
                  <td className="px-3 py-3 font-semibold text-gray-800">{s.nomeAluno}</td>
                  <td className="px-3 py-3 text-xs text-[#4B5563]">{s.tipoLabel}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{s.polo}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{s.turmaNome}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{s.dataSolicitacao}</td>
                  <td className="px-3 py-3 text-center">
                    {s.status === "CANCELADA" ? (
                      <span className={`inline-block rounded px-2.5 py-1 text-xs font-semibold ${STATUS_COR.CANCELADA}`}>
                        {STATUS_LABEL.CANCELADA}
                      </span>
                    ) : (
                      <select
                        value={s.status}
                        disabled={isPending}
                        onChange={(e) => atualizarStatus(s.id, e.target.value as StatusSolicitacao)}
                        className={`w-full cursor-pointer rounded border-0 px-2.5 py-1 text-xs font-semibold outline-none disabled:opacity-50 ${STATUS_COR[s.status]}`}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>{STATUS_LABEL[st]}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {s.status === "CANCELADA" ? (
                      <span className="text-[11px] text-[#9CA3AF]">—</span>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={linkAtual(s)}
                            onChange={(e) => setLinkDraft((d) => ({ ...d, [s.id]: e.target.value }))}
                            placeholder="https://drive.google.com/…"
                            className="w-48 rounded border border-[#D9D9D9] px-2 py-1 text-xs text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
                          />
                          <button
                            onClick={() => salvarLink(s)}
                            disabled={isPending}
                            className="rounded bg-[#009640] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
                          >
                            Salvar
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {s.linkDocumento && (
                            <a
                              href={s.linkDocumento}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#009640] hover:underline"
                            >
                              <ExternalLink size={11} />
                              Abrir
                            </a>
                          )}
                          {s.status !== "CONCLUIDA" && (
                            <button
                              onClick={() => atualizarStatus(s.id, "CONCLUIDA")}
                              disabled={isPending}
                              className="text-[11px] font-semibold text-[#4B5563] hover:underline disabled:opacity-50"
                            >
                              Marcar concluída
                            </button>
                          )}
                          {linkFlash[s.id]?.msg && (
                            <span className={`text-[11px] font-semibold ${linkFlash[s.id].ok ? "text-[#007A33]" : "text-red-600"}`}>
                              {linkFlash[s.id].msg}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
