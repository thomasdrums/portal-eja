"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trash2, RotateCcw, X, KeyRound, Check } from "lucide-react";
import type { Opcao, ProfessorRow } from "@/lib/queries/professores";
import {
  criarProfessorAction,
  atualizarProfessorAction,
  definirAtivoProfessorAction,
  resetarSenhaProfessorAction,
  definirSenhaProfessorAction,
  arquivarProfessorAction,
  desarquivarProfessorAction,
} from "./actions";

type Form = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  poloId: string;
  areaId: string;
  ativo: boolean;
  turmaIds: string[];
};

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${color}`}>{text}</span>;
}

function Input({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-[#D9D9D9] px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      />
    </div>
  );
}

function SelOpcao({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: Opcao[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
      </select>
    </div>
  );
}

export default function GestaoProfessoresClient({
  professoresIniciais,
  arquivadosIniciais,
  areas,
  polos,
  turmas,
}: {
  professoresIniciais: ProfessorRow[];
  arquivadosIniciais: ProfessorRow[];
  areas: Opcao[];
  polos: Opcao[];
  turmas: Opcao[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const lista = professoresIniciais;
  const arquivados = arquivadosIniciais;
  const [aba, setAba] = useState<"ativos" | "arquivados">("ativos");
  const [modo, setModo] = useState<"lista" | "novo" | "editar">("lista");
  const [editando, setEditando] = useState<ProfessorRow | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  // Confirmação de "Excluir" (arquivar) — guarda o professor-alvo.
  const [excluirAlvo, setExcluirAlvo] = useState<ProfessorRow | null>(null);

  // Senha: alvo do modal "Definir senha" + avisos curtos por professor.
  const [senhaAlvo, setSenhaAlvo] = useState<ProfessorRow | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [flash, setFlash] = useState<Record<string, string>>({});

  const formVazio: Form = useMemo(
    () => ({
      nome: "", cpf: "", email: "", telefone: "",
      poloId: polos[0]?.id ?? "", areaId: areas[0]?.id ?? "", ativo: true, turmaIds: [],
    }),
    [polos, areas],
  );
  const [form, setForm] = useState<Form>(formVazio);

  const visivel = (aba === "ativos" ? lista : arquivados).filter((p) => {
    // Na aba "arquivados", o filtro ativo/inativo não se aplica.
    const ativoOk =
      aba === "arquivados" || filtroAtivo === "todos" || (filtroAtivo === "ativos" ? p.ativo : !p.ativo);
    const buscaOk = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.poloNome.toLowerCase().includes(busca.toLowerCase());
    return ativoOk && buscaOk;
  });

  function showAviso(msg: string) {
    setAviso(msg);
    setTimeout(() => setAviso(""), 3500);
  }

  // Aviso curto no cartão do próprio professor (ex.: senha redefinida).
  function showFlash(id: string, msg: string) {
    setFlash((f) => ({ ...f, [id]: msg }));
    setTimeout(() => setFlash((f) => ({ ...f, [id]: "" })), 4000);
  }

  function resetarSenha(id: string) {
    startTransition(async () => {
      const res = await resetarSenhaProfessorAction(id);
      showFlash(id, res.message);
    });
  }

  function abrirDefinirSenha(p: ProfessorRow) {
    setSenhaAlvo(p);
    setNovaSenha("");
    setErroSenha("");
  }

  function salvarSenha() {
    if (!senhaAlvo) return;
    if (novaSenha.length < 6) {
      setErroSenha("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    const id = senhaAlvo.id;
    startTransition(async () => {
      const res = await definirSenhaProfessorAction(id, novaSenha);
      if (!res.ok) {
        setErroSenha(res.message);
        return;
      }
      setSenhaAlvo(null);
      setNovaSenha("");
      showFlash(id, res.message);
    });
  }

  function abrirNovo() {
    setForm(formVazio);
    setEditando(null);
    setErro("");
    setModo("novo");
  }

  function abrirEditar(p: ProfessorRow) {
    setForm({
      nome: p.nome, cpf: p.cpf, email: p.email, telefone: p.telefone,
      poloId: p.poloId ?? "", areaId: p.areaId ?? "", ativo: p.ativo,
      turmaIds: turmas.filter((t) => p.turmasVinculadas.includes(t.nome)).map((t) => t.id),
    });
    setEditando(p);
    setErro("");
    setModo("editar");
  }

  function salvar() {
    if (!form.nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }
    const dados = {
      nome: form.nome,
      areaId: form.areaId || null,
      poloId: form.poloId || null,
      cpf: form.cpf,
      email: form.email,
      telefone: form.telefone,
      ativo: form.ativo,
      turmaIds: form.turmaIds,
    };
    startTransition(async () => {
      const res = modo === "novo"
        ? await criarProfessorAction(dados)
        : await atualizarProfessorAction(editando!.id, dados);
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      setModo("lista");
      showAviso(res.message);
      router.refresh();
    });
  }

  function definirAtivo(id: string, ativo: boolean) {
    startTransition(async () => {
      const res = await definirAtivoProfessorAction(id, ativo);
      showAviso(res.message);
      if (res.ok) router.refresh();
    });
  }

  // "Excluir" = arquivar (soft delete). Sai da lista; continua no banco.
  function confirmarExcluir() {
    if (!excluirAlvo) return;
    const id = excluirAlvo.id;
    startTransition(async () => {
      const res = await arquivarProfessorAction(id);
      setExcluirAlvo(null);
      showAviso(res.message);
      if (res.ok) router.refresh();
    });
  }

  function restaurar(id: string) {
    startTransition(async () => {
      const res = await desarquivarProfessorAction(id);
      showAviso(res.message);
      if (res.ok) router.refresh();
    });
  }

  function toggleTurma(id: string) {
    setForm((f) => ({
      ...f,
      turmaIds: f.turmaIds.includes(id)
        ? f.turmaIds.filter((t) => t !== id)
        : [...f.turmaIds, id],
    }));
  }

  if (modo !== "lista") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={() => setModo("lista")} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
          <ChevronLeft size={15} />
          Professores
        </button>

        <h1 className="text-xl font-semibold text-gray-900">
          {modo === "novo" ? "Cadastrar Professor" : "Editar Professor"}
        </h1>

        <div className="space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Nome completo" value={form.nome} onChange={(v) => setForm((f) => ({ ...f, nome: v }))} placeholder="Ex.: João Pereira" />
            </div>
            <Input label="CPF"      value={form.cpf}      onChange={(v) => setForm((f) => ({ ...f, cpf: v }))}      placeholder="000.000.000-00" />
            <Input label="Telefone" value={form.telefone} onChange={(v) => setForm((f) => ({ ...f, telefone: v }))} placeholder="(81) 99999-9999" />
            <div className="col-span-2">
              <Input label="E-mail" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" placeholder="professor@ejasesi.org.br" />
              <p className="mt-1 text-[11px] text-[#6B7280]">
                Acesso à plataforma:{" "}
                {editando?.temAcesso ? (
                  <span className="font-semibold text-[#007A33]">Sim</span>
                ) : (
                  <span className="font-semibold text-gray-500">
                    Não — preencha o e-mail e salve para criar a conta (senha inicial Prof@sesi)
                  </span>
                )}
              </p>
            </div>
            <SelOpcao label="Polo" value={form.poloId} onChange={(v) => setForm((f) => ({ ...f, poloId: v }))} options={polos} />
            <SelOpcao label="Área" value={form.areaId} onChange={(v) => setForm((f) => ({ ...f, areaId: v }))} options={areas} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#4B5563]">Turmas vinculadas</p>
            {turmas.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma turma cadastrada ainda.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {turmas.map((t) => {
                  const sel = form.turmaIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTurma(t.id)}
                      className={`rounded px-3 py-1 text-xs font-semibold transition ${sel ? "bg-[#009640] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {t.nome}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {erro && <p className="text-xs font-semibold text-red-600">{erro}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={salvar} disabled={isPending} className="rounded bg-[#009640] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#007A33] disabled:opacity-50">
              {isPending ? "Salvando…" : modo === "novo" ? "Cadastrar" : "Salvar"}
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
          <h1 className="text-xl font-semibold text-gray-900">Gestão de Professores</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">{lista.filter((p) => p.ativo).length} ativos · {lista.filter((p) => !p.ativo).length} inativos</p>
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
            + Cadastrar
          </button>
        </div>
      </div>

      {aviso && (
        <div className="rounded border border-[#009640]/30 bg-[#EAF6EE] px-4 py-2.5 text-sm font-semibold text-[#007A33]">
          {aviso}
        </div>
      )}

      {/* Abas: professores ativos x arquivados */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ativos", "arquivados"] as const).map((op) => (
          <button
            key={op}
            onClick={() => setAba(op)}
            className={`rounded px-3 py-1.5 text-xs font-semibold capitalize transition ${
              aba === op ? "bg-[#009640] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {op} ({op === "ativos" ? lista.length : arquivados.length})
          </button>
        ))}
      </div>

      <p className="text-xs text-[#9CA3AF]">
        {aba === "ativos"
          ? '"Excluir" arquiva o professor: ele sai das listas, mas continua salvo no banco. Restaure na aba "Arquivados".'
          : "Professores arquivados (não aparecem nas listas normais e não conseguem acessar a plataforma)."}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou polo…"
          className="rounded border border-[#D9D9D9] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20 sm:w-64"
        />
        {aba === "ativos" &&
          (["ativos", "inativos", "todos"] as const).map((op) => (
            <button
              key={op}
              onClick={() => setFiltroAtivo(op)}
              className={`rounded px-3 py-1.5 text-xs font-semibold capitalize transition ${filtroAtivo === op ? "bg-[#009640] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {op}
            </button>
          ))}
      </div>

      <div className="space-y-3">
        {visivel.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#4B5563]">Nenhum professor encontrado.</p>
          </div>
        )}
        {visivel.map((p) => (
          <div key={p.id} className={`overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${aba === "ativos" && !p.ativo ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between bg-[#009640] px-5 py-3">
              <div>
                <span className="font-bold text-white">{p.nome}</span>
                <span className="ml-3 text-xs text-white/70">{p.poloNome || "sem polo"} · {p.areaNome || "sem área"}</span>
              </div>
              <Badge text={p.ativo ? "Ativo" : "Inativo"} color={p.ativo ? "bg-white/90 text-[#007A33]" : "bg-white/20 text-white"} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 text-xs text-[#4B5563] sm:grid-cols-3">
              <span><span className="font-semibold">CPF:</span> {p.cpf || "—"}</span>
              <span><span className="font-semibold">Tel:</span> {p.telefone || "—"}</span>
              <span className="col-span-2 truncate sm:col-span-1"><span className="font-semibold">E-mail:</span> {p.email || "—"}</span>
              <span title={p.temAcesso ? "Conta de login criada" : "Cadastre um e-mail para gerar o acesso"}>
                <span className="font-semibold">Tem acesso:</span>{" "}
                <span className={p.temAcesso ? "font-semibold text-[#007A33]" : "font-semibold text-gray-500"}>
                  {p.temAcesso ? "sim" : "não"}
                </span>
              </span>
              {flash[p.id] && (
                <span className="col-span-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#007A33] sm:col-span-3">
                  <Check size={12} /> {flash[p.id]}
                </span>
              )}
              {p.turmasVinculadas.length > 0 && (
                <div className="col-span-2 flex flex-wrap gap-1.5 pt-1 sm:col-span-3">
                  {p.turmasVinculadas.map((t) => (
                    <span key={t} className="rounded bg-[#EAF6EE] px-2 py-0.5 text-xs font-semibold text-[#007A33]">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 border-t border-[#E5E7EB] px-5 py-2.5">
              {aba === "arquivados" ? (
                <>
                  <span className="text-xs text-gray-400">Arquivado em {p.arquivadoEm ?? "—"}</span>
                  <button
                    onClick={() => restaurar(p.id)}
                    disabled={isPending}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#009640] hover:underline disabled:opacity-50"
                  >
                    <RotateCcw size={13} />
                    Restaurar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => abrirEditar(p)} className="text-xs font-semibold text-[#009640] hover:underline">Editar</button>
                  <button
                    onClick={() => resetarSenha(p.id)}
                    disabled={isPending || !p.temAcesso}
                    title={p.temAcesso ? "Redefinir senha para Prof@sesi" : "Cadastre um e-mail para gerar o acesso"}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4B5563] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
                  >
                    <KeyRound size={13} />
                    Redefinir senha
                  </button>
                  <button
                    onClick={() => abrirDefinirSenha(p)}
                    disabled={isPending || !p.temAcesso}
                    title={p.temAcesso ? "Definir uma senha específica" : "Cadastre um e-mail para gerar o acesso"}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4B5563] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
                  >
                    <KeyRound size={13} />
                    Definir senha
                  </button>
                  {p.ativo
                    ? <button onClick={() => definirAtivo(p.id, false)} disabled={isPending} className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50">Inativar</button>
                    : <button onClick={() => definirAtivo(p.id, true)} disabled={isPending} className="text-xs font-semibold text-[#009640] hover:underline disabled:opacity-50">Reativar</button>
                  }
                  <button
                    onClick={() => setExcluirAlvo(p)}
                    disabled={isPending}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    Excluir
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de definir senha específica */}
      {senhaAlvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900">Definir senha — {senhaAlvo.nome}</h2>
              <button
                onClick={() => setSenhaAlvo(null)}
                className="text-[#9CA3AF] transition hover:text-gray-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <Input
                label="Nova senha"
                value={novaSenha}
                onChange={setNovaSenha}
                placeholder="Mínimo 6 caracteres"
              />
              <p className="text-[11px] text-[#6B7280]">
                A senha é gravada de forma segura (bcrypt). O professor acessa com o e-mail{" "}
                <span className="font-semibold">{senhaAlvo.email}</span>.
              </p>
              {erroSenha && <p className="text-xs font-semibold text-red-600">{erroSenha}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3.5">
              <button
                onClick={() => setSenhaAlvo(null)}
                className="rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarSenha}
                disabled={isPending}
                className="rounded bg-[#009640] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
              >
                {isPending ? "Salvando…" : "Salvar senha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de excluir (arquivar) */}
      {excluirAlvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900">Excluir professor</h2>
              <button
                onClick={() => setExcluirAlvo(null)}
                className="text-[#9CA3AF] transition hover:text-gray-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 p-5">
              <p className="text-sm text-gray-700">
                Tem certeza que deseja excluir <span className="font-semibold">{excluirAlvo.nome}</span>?
              </p>
              <p className="text-xs text-[#6B7280]">
                O registro sairá das listas, mas ficará <span className="font-semibold">arquivado no banco</span>{" "}
                (nada é apagado). Se o professor tiver acesso, o login fica bloqueado enquanto arquivado.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3.5">
              <button
                onClick={() => setExcluirAlvo(null)}
                className="rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExcluir}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 size={15} />
                {isPending ? "Arquivando…" : "Excluir (arquivar)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
