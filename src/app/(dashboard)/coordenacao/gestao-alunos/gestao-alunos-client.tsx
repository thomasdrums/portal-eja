"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Search, Pencil, KeyRound, X, Check, Plus } from "lucide-react";
import { SITUACAO_CFG, ETAPA_CFG } from "@/lib/mock-data/professor";
import type { EtapaAluno, SituacaoAluno } from "@prisma/client";
import type { AlunoRow, TurmaOption } from "@/lib/queries/alunos";
import {
  criarAlunoAction,
  atualizarAlunoAction,
  definirAtivoAction,
  resetarSenhaAction,
} from "./actions";

type FormData = {
  nome: string;
  ra: string;
  cidade: string;
  telefone: string;
  email: string;
  etapa: EtapaAluno;
};

type NovoAlunoForm = {
  nome: string;
  ra: string;
  cidade: string;
  telefone: string;
  email: string;
  turmaId: string;
  etapa: EtapaAluno;
  situacao: SituacaoAluno;
};

// Situações oferecidas no cadastro (labels a partir da config de exibição).
const SITUACOES = Object.keys(SITUACAO_CFG) as (keyof typeof SITUACAO_CFG)[];

const NOVO_ALUNO_VAZIO: NovoAlunoForm = {
  nome: "",
  ra: "",
  cidade: "",
  telefone: "",
  email: "",
  turmaId: "",
  etapa: "AVA",
  situacao: "CURSANDO",
};

export default function GestaoAlunosClient({
  alunosIniciais,
  turmas,
}: {
  alunosIniciais: AlunoRow[];
  turmas: TurmaOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Fonte da verdade = dados do banco vindos do Server Component (via props).
  const alunos = alunosIniciais;
  const [busca, setBusca] = useState("");

  // Modal de edição.
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [erroEdicao, setErroEdicao] = useState("");

  // Modal de cadastro.
  const [novoAberto, setNovoAberto] = useState(false);
  const [novoForm, setNovoForm] = useState<NovoAlunoForm>(NOVO_ALUNO_VAZIO);
  const [erroNovo, setErroNovo] = useState("");

  // Aviso transitório no topo (cadastro) e por linha (edição/senha/acesso).
  const [avisoTopo, setAvisoTopo] = useState("");
  const [flash, setFlash] = useState<Record<string, string>>({});

  const alunosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return alunos;
    return alunos.filter(
      (a) => a.nome.toLowerCase().includes(q) || a.ra.toLowerCase().includes(q),
    );
  }, [alunos, busca]);

  function showFlash(id: string, msg: string) {
    setFlash((f) => ({ ...f, [id]: msg }));
    setTimeout(() => setFlash((f) => ({ ...f, [id]: "" })), 3500);
  }

  function showAvisoTopo(msg: string) {
    setAvisoTopo(msg);
    setTimeout(() => setAvisoTopo(""), 3500);
  }

  function abrirEdicao(a: AlunoRow) {
    setEditId(a.id);
    setErroEdicao("");
    setForm({
      nome: a.nome,
      ra: a.ra,
      cidade: a.cidade,
      telefone: a.telefone,
      email: a.email,
      etapa: a.etapa,
    });
  }

  function salvarEdicao() {
    if (!editId || !form) return;
    if (!form.nome.trim() || !form.ra.trim()) {
      setErroEdicao("Nome e RA são obrigatórios.");
      return;
    }
    const id = editId;
    startTransition(async () => {
      const res = await atualizarAlunoAction(id, form);
      if (!res.ok) {
        setErroEdicao(res.message);
        return;
      }
      setEditId(null);
      setForm(null);
      showFlash(id, res.message);
      router.refresh();
    });
  }

  function abrirCadastro() {
    setNovoForm(NOVO_ALUNO_VAZIO);
    setErroNovo("");
    setNovoAberto(true);
  }

  function salvarCadastro() {
    if (!novoForm.nome.trim() || !novoForm.ra.trim()) {
      setErroNovo("Nome e RA são obrigatórios.");
      return;
    }
    startTransition(async () => {
      const res = await criarAlunoAction({
        nome: novoForm.nome,
        ra: novoForm.ra,
        cidade: novoForm.cidade,
        telefone: novoForm.telefone,
        email: novoForm.email,
        turmaId: novoForm.turmaId || null,
        etapa: novoForm.etapa,
        situacao: novoForm.situacao,
      });
      if (!res.ok) {
        setErroNovo(res.message);
        return;
      }
      setNovoAberto(false);
      setNovoForm(NOVO_ALUNO_VAZIO);
      showAvisoTopo(res.message);
      router.refresh();
    });
  }

  function resetarSenha(id: string) {
    startTransition(async () => {
      const res = await resetarSenhaAction(id);
      showFlash(id, res.message);
    });
  }

  function toggleAtivo(a: AlunoRow) {
    startTransition(async () => {
      const res = await definirAtivoAction(a.id, !a.ativo);
      if (res.ok) {
        showFlash(a.id, res.message);
        router.refresh();
      }
    });
  }

  const alunoEmEdicao = alunos.find((a) => a.id === editId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/coordenacao/gestao"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline"
      >
        <ChevronLeft size={15} />
        Gestão
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Gestão de Alunos</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            {alunos.length} alunos cadastrados · edite dados, redefina senha e ative/inative o acesso
          </p>
        </div>
        <button
          onClick={abrirCadastro}
          className="inline-flex items-center gap-1.5 rounded bg-[#009640] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#007A33]"
        >
          <Plus size={15} />
          Cadastrar aluno
        </button>
      </div>

      {avisoTopo && (
        <div className="flex items-center gap-2 rounded border border-[#009640]/30 bg-[#EAF6EE] px-4 py-2.5 text-sm font-semibold text-[#007A33]">
          <Check size={16} /> {avisoTopo}
        </div>
      )}

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por RA ou nome…"
          className="w-full rounded border border-[#D9D9D9] bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20"
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="bg-[#009640]">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white">Nome</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white">RA</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white">Turma</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white">Cidade</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-white">Etapa</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-white">Acesso</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-white">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {alunosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#4B5563]">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              alunosFiltrados.map((a) => (
                <tr key={a.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{a.nome}</span>
                    <span className="block text-[11px] text-[#9CA3AF]">{a.email || "sem acesso"}</span>
                    {flash[a.id] && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#007A33]">
                        <Check size={12} /> {flash[a.id]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#4B5563]">{a.ra}</td>
                  <td className="px-4 py-3 text-[#4B5563]">{a.turmaNome}</td>
                  <td className="px-4 py-3 text-[#4B5563]">{a.cidade}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="rounded bg-[#EAF6EE] px-2 py-0.5 text-[11px] font-semibold text-[#007A33]"
                      title={ETAPA_CFG[a.etapa].descricao}
                    >
                      {ETAPA_CFG[a.etapa].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                        a.ativo ? "bg-[#EAF6EE] text-[#007A33]" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {a.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => abrirEdicao(a)}
                        title="Editar dados pessoais"
                        className="inline-flex items-center gap-1 rounded border border-[#009640] px-2.5 py-1.5 text-xs font-semibold text-[#009640] transition hover:bg-[#EAF6EE]"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => resetarSenha(a.id)}
                        disabled={isPending}
                        title="Redefinir senha"
                        className="inline-flex items-center gap-1 rounded border border-[#D9D9D9] px-2.5 py-1.5 text-xs font-semibold text-[#4B5563] transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        <KeyRound size={13} />
                        Senha
                      </button>
                      <button
                        onClick={() => toggleAtivo(a)}
                        disabled={isPending}
                        title={a.ativo ? "Inativar aluno" : "Ativar aluno"}
                        className={`inline-flex items-center rounded px-2.5 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 ${
                          a.ativo ? "bg-red-500 hover:bg-red-600" : "bg-[#009640] hover:bg-[#007A33]"
                        }`}
                      >
                        {a.ativo ? "Inativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#9CA3AF]">
        As alterações são salvas no banco de dados e permanecem após recarregar a página.
      </p>

      {/* Modal de edição */}
      {editId && form && alunoEmEdicao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900">Editar dados — {alunoEmEdicao.nome}</h2>
              <button
                onClick={() => { setEditId(null); setForm(null); }}
                className="text-[#9CA3AF] transition hover:text-gray-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <Field label="Nome">
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="RA">
                  <input
                    value={form.ra}
                    onChange={(e) => setForm({ ...form, ra: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Cidade">
                  <input
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefone">
                  <input
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Etapa">
                  <select
                    value={form.etapa}
                    onChange={(e) => setForm({ ...form, etapa: e.target.value as EtapaAluno })}
                    className={inputCls}
                  >
                    <option value="AVA">AVA — Ambiente Virtual de Aprendizagem</option>
                    <option value="RDS">RDS — Reconhecimento de Saberes</option>
                  </select>
                </Field>
              </div>
              <Field label="E-mail">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                />
              </Field>

              {erroEdicao && <p className="text-xs font-semibold text-red-600">{erroEdicao}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3.5">
              <button
                onClick={() => { setEditId(null); setForm(null); }}
                className="rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={isPending}
                className="rounded bg-[#009640] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
              >
                {isPending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cadastro */}
      {novoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900">Cadastrar aluno</h2>
              <button
                onClick={() => setNovoAberto(false)}
                className="text-[#9CA3AF] transition hover:text-gray-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <Field label="Nome">
                <input
                  value={novoForm.nome}
                  onChange={(e) => setNovoForm({ ...novoForm, nome: e.target.value })}
                  placeholder="Nome completo"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="RA">
                  <input
                    value={novoForm.ra}
                    onChange={(e) => setNovoForm({ ...novoForm, ra: e.target.value })}
                    placeholder="0000000"
                    className={inputCls}
                  />
                </Field>
                <Field label="Cidade">
                  <input
                    value={novoForm.cidade}
                    onChange={(e) => setNovoForm({ ...novoForm, cidade: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefone">
                  <input
                    value={novoForm.telefone}
                    onChange={(e) => setNovoForm({ ...novoForm, telefone: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Turma">
                  <select
                    value={novoForm.turmaId}
                    onChange={(e) => setNovoForm({ ...novoForm, turmaId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">— Sem turma —</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="E-mail">
                <input
                  type="email"
                  value={novoForm.email}
                  onChange={(e) => setNovoForm({ ...novoForm, email: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Etapa">
                  <select
                    value={novoForm.etapa}
                    onChange={(e) => setNovoForm({ ...novoForm, etapa: e.target.value as EtapaAluno })}
                    className={inputCls}
                  >
                    <option value="AVA">AVA — Ambiente Virtual de Aprendizagem</option>
                    <option value="RDS">RDS — Reconhecimento de Saberes</option>
                  </select>
                </Field>
                <Field label="Situação">
                  <select
                    value={novoForm.situacao}
                    onChange={(e) => setNovoForm({ ...novoForm, situacao: e.target.value as SituacaoAluno })}
                    className={inputCls}
                  >
                    {SITUACOES.map((s) => (
                      <option key={s} value={s}>{SITUACAO_CFG[s].label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {erroNovo && <p className="text-xs font-semibold text-red-600">{erroNovo}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3.5">
              <button
                onClick={() => setNovoAberto(false)}
                className="rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarCadastro}
                disabled={isPending}
                className="rounded bg-[#009640] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
              >
                {isPending ? "Cadastrando…" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        {label}
      </label>
      {children}
    </div>
  );
}
