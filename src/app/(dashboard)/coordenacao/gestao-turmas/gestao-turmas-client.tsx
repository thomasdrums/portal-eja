"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Opcao } from "@/lib/queries/professores";
import type { TurmaRow } from "@/lib/queries/turmas";
import {
  criarTurmaAction,
  atualizarTurmaAction,
  encerrarTurmaAction,
  reabrirTurmaAction,
} from "./actions";

type Form = {
  nome: string;
  poloId: string;
  ano: string;
  etapaEnsino: string;
  professorIds: string[];
};

const ANOS = ["2025", "2026", "2027"];
const ETAPAS = ["Fundamental II", "Ensino Médio"];

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-[#D9D9D9] px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      />
    </div>
  );
}

function Selecao({
  label, value, onChange, children,
}: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      >
        {children}
      </select>
    </div>
  );
}

export default function GestaoTurmasClient({
  turmasIniciais,
  polos,
  professores,
}: {
  turmasIniciais: TurmaRow[];
  polos: Opcao[];
  professores: Opcao[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const lista = turmasIniciais;
  const [modo, setModo] = useState<"lista" | "novo" | "editar">("lista");
  const [editando, setEditando] = useState<TurmaRow | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "ativa" | "encerrada">("todas");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const formVazio: Form = useMemo(
    () => ({ nome: "", poloId: polos[0]?.id ?? "", ano: "2026", etapaEnsino: ETAPAS[0], professorIds: [] }),
    [polos],
  );
  const [form, setForm] = useState<Form>(formVazio);

  const visivel = lista.filter((t) => filtroStatus === "todas" || t.status === filtroStatus);

  function showAviso(msg: string) {
    setAviso(msg);
    setTimeout(() => setAviso(""), 3500);
  }

  function abrirNovo() {
    setForm(formVazio);
    setEditando(null);
    setErro("");
    setModo("novo");
  }

  function abrirEditar(t: TurmaRow) {
    setForm({
      nome: t.nome,
      poloId: t.poloId,
      ano: t.ano || "2026",
      etapaEnsino: t.etapa || ETAPAS[0],
      professorIds: professores.filter((p) => t.professores.includes(p.nome)).map((p) => p.id),
    });
    setEditando(t);
    setErro("");
    setModo("editar");
  }

  function salvar() {
    if (!form.nome.trim()) {
      setErro("Nome da turma é obrigatório.");
      return;
    }
    const dados = {
      nome: form.nome,
      poloId: form.poloId,
      ano: form.ano,
      etapaEnsino: form.etapaEnsino,
      status: (editando?.status ?? "ativa") as "ativa" | "encerrada",
      professorIds: form.professorIds,
    };
    startTransition(async () => {
      const res = modo === "novo"
        ? await criarTurmaAction(dados)
        : await atualizarTurmaAction(editando!.id, dados);
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setModo("lista");
      showAviso(res.message);
      router.refresh();
    });
  }

  function mudarStatus(id: string, encerrar: boolean) {
    startTransition(async () => {
      const res = encerrar ? await encerrarTurmaAction(id) : await reabrirTurmaAction(id);
      if (res.ok) {
        showAviso(res.message);
        router.refresh();
      }
    });
  }

  function toggleProf(id: string) {
    setForm((f) => ({
      ...f,
      professorIds: f.professorIds.includes(id)
        ? f.professorIds.filter((p) => p !== id)
        : [...f.professorIds, id],
    }));
  }

  if (modo !== "lista") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={() => setModo("lista")} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
          <ChevronLeft size={15} />
          Turmas
        </button>

        <h1 className="text-xl font-semibold text-gray-900">
          {modo === "novo" ? "Criar Turma" : "Editar Turma"}
        </h1>

        <div className="space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Input label="Nome da turma" value={form.nome} onChange={(v) => setForm((f) => ({ ...f, nome: v }))} placeholder="Ex.: Turma 26.1" />
          <div className="grid grid-cols-3 gap-4">
            <Selecao label="Polo" value={form.poloId} onChange={(v) => setForm((f) => ({ ...f, poloId: v }))}>
              {polos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Selecao>
            <Selecao label="Etapa" value={form.etapaEnsino} onChange={(v) => setForm((f) => ({ ...f, etapaEnsino: v }))}>
              {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Selecao>
            <Selecao label="Ano" value={form.ano} onChange={(v) => setForm((f) => ({ ...f, ano: v }))}>
              {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Selecao>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#4B5563]">Professores</p>
            {professores.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum professor cadastrado ainda.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {professores.map((p) => {
                  const sel = form.professorIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProf(p.id)}
                      className={`rounded px-3 py-1 text-xs font-semibold transition ${sel ? "bg-[#009640] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {p.nome}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {erro && <p className="text-xs font-semibold text-red-600">{erro}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={salvar} disabled={isPending} className="rounded bg-[#009640] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#007A33] disabled:opacity-50">
              {isPending ? "Salvando…" : modo === "novo" ? "Criar" : "Salvar"}
            </button>
            <button onClick={() => setModo("lista")} className="rounded border border-[#D9D9D9] px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/coordenacao" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Coordenação
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Gestão de Turmas</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">{lista.filter((t) => t.status === "ativa").length} ativas · {lista.filter((t) => t.status === "encerrada").length} encerradas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert("Disponível na fase do banco de dados")}
            className="rounded border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Importar planilha (Excel/CSV)
          </button>
          <button
            onClick={abrirNovo}
            className="rounded bg-[#009640] px-5 py-2 text-xs font-bold text-white hover:bg-[#007A33]"
          >
            + Criar turma
          </button>
        </div>
      </div>

      {aviso && (
        <div className="rounded border border-[#009640]/30 bg-[#EAF6EE] px-4 py-2.5 text-sm font-semibold text-[#007A33]">
          {aviso}
        </div>
      )}

      <div className="flex gap-2">
        {(["todas", "ativa", "encerrada"] as const).map((op) => (
          <button
            key={op}
            onClick={() => setFiltroStatus(op)}
            className={`rounded px-3 py-1.5 text-xs font-semibold capitalize transition ${filtroStatus === op ? "bg-[#009640] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {op === "todas" ? "Todas" : op === "ativa" ? "Ativas" : "Encerradas"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visivel.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#4B5563]">Nenhuma turma encontrada.</p>
          </div>
        )}
        {visivel.map((t) => (
          <div key={t.id} className={`overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${t.status !== "ativa" ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between bg-[#009640] px-5 py-3">
              <div>
                <span className="font-bold text-white">{t.nome}</span>
                <span className="ml-3 text-xs text-white/70">{t.poloNome || "sem polo"} · {t.etapa || "—"} · {t.ano || "—"} · {t.qtdAlunos} alunos</span>
              </div>
              <span className={`rounded px-2.5 py-0.5 text-xs font-bold ${t.status === "ativa" ? "bg-white/90 text-[#007A33]" : "bg-white/20 text-white"}`}>
                {t.status === "ativa" ? "Ativa" : "Encerrada"}
              </span>
            </div>
            <div className="px-5 py-3">
              {t.professores.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {t.professores.map((p) => (
                    <span key={p} className="rounded bg-[#EAF6EE] px-2.5 py-0.5 text-xs font-semibold text-[#007A33]">{p}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sem professores vinculados.</p>
              )}
            </div>
            <div className="flex gap-3 border-t border-[#E5E7EB] px-5 py-2.5">
              <button onClick={() => abrirEditar(t)} className="text-xs font-semibold text-[#009640] hover:underline">Editar</button>
              {t.status === "ativa"
                ? <button onClick={() => mudarStatus(t.id, true)} disabled={isPending} className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50">Encerrar</button>
                : <button onClick={() => mudarStatus(t.id, false)} disabled={isPending} className="text-xs font-semibold text-[#009640] hover:underline disabled:opacity-50">Reabrir</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
