"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import type { CertificadoRow } from "@/lib/queries/certificados";
import {
  definirHistoricoEntregueAction,
  emitirCertificadoAction,
  marcarCertificadoEntregueAction,
} from "./actions";

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

const btnBase =
  "rounded px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed";

export default function CertificadosClient({ rows }: { rows: CertificadoRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [polo, setPolo] = useState("");
  const [turma, setTurma] = useState("");
  const [erro, setErro] = useState("");
  const [flash, setFlash] = useState("");

  // Opções de filtro derivadas dos alunos reais (só polos/turmas que existem).
  const polos = useMemo(
    () => [...new Set(rows.map((r) => r.poloNome).filter((p) => p !== "—"))].sort(),
    [rows],
  );
  const turmas = useMemo(
    () => [...new Set(rows.map((r) => r.turmaNome).filter((t) => t !== "—"))].sort(),
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!polo || r.poloNome === polo) && (!turma || r.turmaNome === turma),
      ),
    [rows, polo, turma],
  );

  // Indicadores calculados a partir do banco (recorte atual dos filtros).
  const emitidos = filtered.filter((r) => r.certificadoEmitido).length;
  const entregues = filtered.filter((r) => r.certificadoRecebido).length;
  const pendentes = filtered.length - emitidos;

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3500);
  }

  function executar(acao: () => Promise<{ ok: boolean; message: string }>) {
    setErro("");
    startTransition(async () => {
      const res = await acao();
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      showFlash(res.message);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/coordenacao/relatorios"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline"
      >
        <ChevronLeft size={15} />
        Relatórios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Certificados</h1>
      </div>

      {flash && (
        <div className="rounded-lg border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
          {flash}
        </div>
      )}
      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Emitidos", value: emitidos, extra: "bg-[#EAF6EE]", text: "text-[#007A33]" },
          { label: "Entregues", value: entregues, extra: "border border-[#E5E7EB] bg-white", text: "text-gray-900" },
          { label: "Pendentes", value: pendentes, extra: "border border-amber-100 bg-amber-50", text: "text-amber-700" },
        ].map((c) => (
          <div key={c.label} className={`rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${c.extra}`}>
            <p className="text-xs font-semibold text-[#4B5563]">{c.label}</p>
            <p className={`mt-1 text-3xl font-extrabold ${c.text}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Select label="Polo" value={polo} onChange={setPolo} options={polos} />
        <Select label="Turma" value={turma} onChange={setTurma} options={turmas} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-5 py-3">Nome</th>
              <th className="px-3 py-3">Turma</th>
              <th className="px-3 py-3">Polo</th>
              <th className="px-3 py-3 text-center">Histórico</th>
              <th className="px-3 py-3 text-center">Certificado</th>
              <th className="px-3 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-[#4B5563]">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="align-top hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-semibold text-gray-800">{a.nome}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{a.turmaNome}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{a.poloNome}</td>

                  {/* Histórico */}
                  <td className="px-3 py-3 text-center">
                    {a.historicoEntregue ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-bold text-[#007A33]">
                          Entregue
                        </span>
                        {a.historicoEntregueEm && (
                          <span className="text-[11px] text-[#4B5563]">{a.historicoEntregueEm}</span>
                        )}
                      </div>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                        Não entregue
                      </span>
                    )}
                  </td>

                  {/* Certificado */}
                  <td className="px-3 py-3 text-center">
                    {a.certificadoRecebido ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-bold text-[#007A33]">
                          Entregue
                        </span>
                        {a.certificadoEntregueEm && (
                          <span className="text-[11px] text-[#4B5563]">{a.certificadoEntregueEm}</span>
                        )}
                      </div>
                    ) : a.certificadoEmitido ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-bold text-[#007A33]">
                          Emitido
                        </span>
                        {a.certificadoEmitidoEm && (
                          <span className="text-[11px] text-[#4B5563]">{a.certificadoEmitidoEm}</span>
                        )}
                      </div>
                    ) : (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                        Pendente
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1.5">
                      {/* Histórico entregue / desmarcar */}
                      {a.historicoEntregue ? (
                        <button
                          disabled={isPending || a.certificadoEmitido}
                          title={
                            a.certificadoEmitido
                              ? "Não é possível desmarcar após emitir o certificado"
                              : undefined
                          }
                          onClick={() =>
                            executar(() => definirHistoricoEntregueAction(a.id, false))
                          }
                          className={`${btnBase} border border-[#D9D9D9] bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40`}
                        >
                          Desmarcar histórico
                        </button>
                      ) : (
                        <button
                          disabled={isPending}
                          onClick={() =>
                            executar(() => definirHistoricoEntregueAction(a.id, true))
                          }
                          className={`${btnBase} bg-[#009640] text-white hover:bg-[#007A33] disabled:opacity-50`}
                        >
                          Marcar histórico como entregue
                        </button>
                      )}

                      {/* Emitir certificado — bloqueado sem histórico */}
                      {!a.certificadoEmitido &&
                        (a.historicoEntregue ? (
                          <button
                            disabled={isPending}
                            onClick={() => executar(() => emitirCertificadoAction(a.id))}
                            className={`${btnBase} bg-[#009640] text-white hover:bg-[#007A33] disabled:opacity-50`}
                          >
                            Emitir certificado
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Aguardando entrega do histórico original"
                            className={`${btnBase} inline-flex items-center justify-center gap-1 border border-amber-200 bg-amber-50 text-amber-700 opacity-90`}
                          >
                            <AlertTriangle size={13} />
                            Aguardando histórico
                          </button>
                        ))}

                      {/* Entregar ao aluno — só depois de emitido */}
                      {a.certificadoEmitido && !a.certificadoRecebido && (
                        <button
                          disabled={isPending}
                          onClick={() =>
                            executar(() => marcarCertificadoEntregueAction(a.id))
                          }
                          className={`${btnBase} bg-[#009640] text-white hover:bg-[#007A33] disabled:opacity-50`}
                        >
                          Marcar como entregue ao aluno
                        </button>
                      )}
                    </div>
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
