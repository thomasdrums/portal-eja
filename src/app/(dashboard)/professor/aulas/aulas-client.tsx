"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, PlayCircle, HelpCircle, X } from "lucide-react";
import type { TipoAula } from "@prisma/client";
import type { AulaRow, OpcoesAula } from "@/lib/queries/aulas";
import { criarAulaAction, atualizarAulaAction, excluirAulaAction } from "./actions";

const TIPO_LABEL: Record<TipoAula, string> = {
  AREA: "Da área",
  INTERAREA: "Interárea",
  GERAL: "Geral",
};

type FormState = {
  tipo: TipoAula;
  areaId: string;
  competenciaId: string;
  titulo: string;
  data: string; // yyyy-mm-dd
  youtubeUrl: string;
  pergunta: string;
  turmaId: string; // "" = todas as turmas
};

const fieldClasses =
  "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";
const labelClasses =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]";

export default function AulasProfessorClient({
  aulasIniciais,
  opcoes,
  professorNome,
}: {
  aulasIniciais: AulaRow[];
  opcoes: OpcoesAula;
  professorNome: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Se o usuário só tem uma área (professor), já deixa selecionada.
  const areaPadrao = opcoes.areas.length === 1 ? opcoes.areas[0]!.id : "";

  const emptyForm = (): FormState => ({
    tipo: "AREA",
    areaId: areaPadrao,
    competenciaId: "",
    titulo: "",
    data: "",
    youtubeUrl: "",
    pergunta: "",
    turmaId: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [erro, setErro] = useState("");
  const [flash, setFlash] = useState("");

  // Exclusão.
  const [alvoExcluir, setAlvoExcluir] = useState<AulaRow | null>(null);
  const [erroExcluir, setErroExcluir] = useState("");

  const competenciasDaArea = form.areaId ? opcoes.competenciasPorArea[form.areaId] ?? [] : [];

  const canSave = useMemo(() => {
    if (!form.titulo.trim() || !form.data || !form.youtubeUrl.trim()) return false;
    if (form.tipo === "AREA") {
      return !!form.areaId && !!form.competenciaId && !!form.pergunta.trim();
    }
    if (form.tipo === "INTERAREA") return !!form.pergunta.trim();
    return true; // GERAL
  }, [form]);

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3500);
  }

  function abrirNovo() {
    setForm(emptyForm());
    setEditingId(null);
    setErro("");
    setFormOpen(true);
  }

  function abrirEdicao(a: AulaRow) {
    setForm({
      tipo: a.tipo,
      areaId: a.areaId ?? "",
      competenciaId: a.competenciaId ?? "",
      titulo: a.titulo,
      data: a.dataInput,
      youtubeUrl: a.youtubeUrl,
      pergunta: a.pergunta ?? "",
      turmaId: a.turmaId ?? "",
    });
    setEditingId(a.id);
    setErro("");
    setFormOpen(true);
  }

  function fecharForm() {
    setFormOpen(false);
    setEditingId(null);
    setErro("");
  }

  function salvar() {
    setErro("");
    const input = {
      tipo: form.tipo,
      titulo: form.titulo,
      data: form.data,
      youtubeUrl: form.youtubeUrl,
      areaId: form.tipo === "AREA" ? form.areaId || null : null,
      competenciaId: form.tipo === "AREA" ? form.competenciaId || null : null,
      pergunta: form.tipo === "GERAL" ? null : form.pergunta || null,
      turmaId: form.turmaId || null,
    };
    startTransition(async () => {
      const res = editingId
        ? await atualizarAulaAction(editingId, input)
        : await criarAulaAction(input);
      if (!res.ok) {
        setErro(res.message);
        return;
      }
      fecharForm();
      showFlash(res.message);
      router.refresh();
    });
  }

  function confirmarExclusao() {
    if (!alvoExcluir) return;
    setErroExcluir("");
    const id = alvoExcluir.id;
    startTransition(async () => {
      const res = await excluirAulaAction(id);
      if (!res.ok) {
        setErroExcluir(res.message);
        return;
      }
      setAlvoExcluir(null);
      showFlash(res.message);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aulas Gravadas</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            Cadastre as aulas e a pergunta de presença. A frequência é calculada a partir das
            respostas validadas.
          </p>
        </div>
        {opcoes.podeCriar && !formOpen && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-1.5 rounded bg-[#009640] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007A33]"
          >
            <Plus size={16} />
            Nova Aula
          </button>
        )}
      </div>

      {!opcoes.podeCriar && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta não está vinculada a um cadastro de professor. Fale com a coordenação.
        </div>
      )}

      {flash && (
        <div className="rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
          {flash}
        </div>
      )}

      {/* Formulário (criar/editar) */}
      {formOpen && (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">
            {editingId ? "Editar aula" : "Cadastrar nova aula"}
          </h2>

          <div className="space-y-4">
            {/* Tipo */}
            <div>
              <label className={labelClasses}>Tipo da aula</label>
              <select
                value={form.tipo}
                onChange={(e) => {
                  const tipo = e.target.value as TipoAula;
                  setForm((f) => ({
                    ...f,
                    tipo,
                    // Ao voltar para AREA, se só há uma área, já seleciona.
                    areaId: tipo === "AREA" ? f.areaId || areaPadrao : f.areaId,
                    competenciaId: tipo === "AREA" ? f.competenciaId : "",
                  }));
                }}
                className={fieldClasses}
              >
                <option value="AREA">Da área (conta presença na área)</option>
                <option value="INTERAREA">Interárea (conta nas 4 áreas)</option>
                <option value="GERAL">Geral (vídeo informativo, sem presença)</option>
              </select>
            </div>

            {/* Área + Competência (só AREA) */}
            {form.tipo === "AREA" && (
              <>
                <div>
                  <label className={labelClasses}>Área do conhecimento</label>
                  <select
                    value={form.areaId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, areaId: e.target.value, competenciaId: "" }))
                    }
                    disabled={opcoes.areas.length <= 1}
                    className={`${fieldClasses} disabled:bg-[#F5F5F5]`}
                  >
                    <option value="">Selecione…</option>
                    {opcoes.areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>Competência</label>
                  <select
                    value={form.competenciaId}
                    onChange={(e) => setForm((f) => ({ ...f, competenciaId: e.target.value }))}
                    disabled={!form.areaId}
                    className={`${fieldClasses} disabled:bg-[#F5F5F5]`}
                  >
                    <option value="">Selecione…</option>
                    {competenciasDaArea.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} — {c.aulasPrevistas} previstas · {c.aulasCadastradas} cadastradas
                      </option>
                    ))}
                  </select>
                  {form.areaId && competenciasDaArea.length === 0 && (
                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      Esta área ainda não tem competências cadastradas.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Título */}
            <div>
              <label className={labelClasses}>Título da aula</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                className={fieldClasses}
              />
            </div>

            {/* Data */}
            <div>
              <label className={labelClasses}>Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                className={fieldClasses}
              />
            </div>

            {/* YouTube */}
            <div>
              <label className={labelClasses}>Link do YouTube</label>
              <input
                type="url"
                value={form.youtubeUrl}
                onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                placeholder="https://"
                className={fieldClasses}
              />
            </div>

            {/* Pergunta (AREA e INTERAREA) */}
            {form.tipo !== "GERAL" && (
              <div>
                <label className={labelClasses}>Pergunta sobre o conteúdo</label>
                <textarea
                  value={form.pergunta}
                  onChange={(e) => setForm((f) => ({ ...f, pergunta: e.target.value }))}
                  rows={3}
                  placeholder="Ex.: A partir da aula de hoje, como se identifica uma raiz da equação?"
                  className={fieldClasses}
                />
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  O aluno responde no portal; você valida depois para contar a presença.
                </p>
              </div>
            )}

            {/* Publicar para */}
            <div>
              <label className={labelClasses}>Publicar para</label>
              <select
                value={form.turmaId}
                onChange={(e) => setForm((f) => ({ ...f, turmaId: e.target.value }))}
                className={fieldClasses}
              >
                <option value="">Todas as turmas</option>
                {opcoes.turmas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            {/* Responsável (automático) */}
            <div>
              <label className={labelClasses}>Professor responsável</label>
              <input
                type="text"
                value={professorNome || "—"}
                readOnly
                className={`${fieldClasses} bg-[#F5F5F5] text-[#6B7280]`}
              />
            </div>

            {erro && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {erro}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <button
                onClick={fecharForm}
                className="flex-1 rounded border border-[#D9D9D9] py-2.5 text-sm font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={!canSave || isPending}
                className="flex-1 rounded bg-[#009640] py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
              >
                {isPending ? "Salvando…" : editingId ? "Salvar alterações" : "Salvar aula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de aulas (do banco) */}
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Aulas cadastradas ({aulasIniciais.length})
          </h2>
        </div>

        {aulasIniciais.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#4B5563]">
            Nenhuma aula cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Data</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Título</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Tipo</th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-semibold text-[#4B5563] md:table-cell">Área / Comp.</th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-semibold text-[#4B5563] sm:table-cell">Turma</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {aulasIniciais.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F8FAFC]">
                    <td className="whitespace-nowrap px-4 py-3 text-[#4B5563]">{a.dataLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={a.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#009640] hover:text-[#007A33]"
                          title="Abrir no YouTube"
                        >
                          <PlayCircle size={15} />
                        </a>
                        <span className="font-medium text-gray-800">{a.titulo}</span>
                        {a.temPergunta && (
                          <HelpCircle size={13} className="text-[#009640]" aria-label="Tem pergunta" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#9CA3AF] sm:hidden">
                        {TIPO_LABEL[a.tipo]} · {a.turmaNome}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-[#EAF6EE] px-2 py-0.5 text-[11px] font-semibold text-[#007A33]">
                        {TIPO_LABEL[a.tipo]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-[#4B5563] md:table-cell">
                      {a.areaNome
                        ? `${a.areaNome}${a.competenciaCodigo ? " · " + a.competenciaCodigo : ""}`
                        : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-[#4B5563] sm:table-cell">{a.turmaNome}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEdicao(a)}
                          className="flex items-center gap-1 rounded border border-[#D9D9D9] px-2.5 py-1.5 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
                        >
                          <Pencil size={11} />
                          Editar
                        </button>
                        <button
                          onClick={() => { setErroExcluir(""); setAlvoExcluir(a); }}
                          className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={11} />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmação de exclusão */}
      {alvoExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900">Excluir aula</h2>
              <button
                onClick={() => setAlvoExcluir(null)}
                className="text-[#9CA3AF] transition hover:text-gray-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 p-5">
              <p className="text-sm text-gray-700">
                Deseja excluir a aula{" "}
                <span className="font-semibold">{alvoExcluir.titulo}</span>?
              </p>
              {alvoExcluir.qtdRespostas > 0 && (
                <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                  Atenção: esta aula já tem {alvoExcluir.qtdRespostas} resposta
                  {alvoExcluir.qtdRespostas !== 1 ? "s" : ""} de aluno
                  {alvoExcluir.qtdRespostas !== 1 ? "s" : ""}. Ao excluir, essas respostas também
                  serão apagadas.
                </p>
              )}
              {erroExcluir && <p className="text-xs font-semibold text-red-600">{erroExcluir}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3.5">
              <button
                onClick={() => setAlvoExcluir(null)}
                className="rounded border border-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 size={15} />
                {isPending ? "Excluindo…" : "Excluir aula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
