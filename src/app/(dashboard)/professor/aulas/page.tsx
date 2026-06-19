"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, PlayCircle, CheckCircle2 } from "lucide-react";
import { alunoAulas, type AulaGravada } from "@/lib/mock-data/aluno";
import { aulasVisiveis } from "@/lib/mock-data/professor";

const ALL_AREAS = ["Matemática", "Linguagens", "Ciências da Natureza", "Ciências Humanas", "Interárea"] as const;
type Area = (typeof ALL_AREAS)[number];

function FormularioAula({
  value,
  onChange,
  onSaveAula,
  onSaveFreq,
  onCancel,
  allowedAreas,
  editMode,
}: {
  value: Omit<AulaGravada, "id">;
  onChange: (f: Omit<AulaGravada, "id">) => void;
  onSaveAula: () => void;
  onSaveFreq?: () => void;
  onCancel: () => void;
  allowedAreas: Area[];
  editMode?: boolean;
}) {
  const canSave     = !!value.titulo && !!value.professor && !!value.data;
  const canSaveFreq = canSave && !!value.formularioUrl;

  function fieldClasses() {
    return "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";
  }

  function labelClasses() {
    return "mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]";
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClasses()}>Área do Conhecimento</label>
        <select
          value={value.area}
          onChange={(e) => onChange({ ...value, area: e.target.value })}
          className={fieldClasses()}
        >
          {allowedAreas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {(["titulo", "professor", "data", "youtubeUrl", "formularioUrl"] as const).map((key) => {
        const labels: Record<string, string> = {
          titulo: "Título da Aula",
          professor: "Professor Responsável",
          data: "Data",
          youtubeUrl: "Link do YouTube",
          formularioUrl: "Link do Forms (Frequência)",
        };
        return (
          <div key={key}>
            <label className={labelClasses()}>{labels[key]}</label>
            <input
              type={key.includes("Url") ? "url" : "text"}
              value={value[key] as string}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              placeholder={key.includes("Url") ? "https://" : ""}
              className={fieldClasses()}
            />
          </div>
        );
      })}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <button
          onClick={onCancel}
          className="flex-1 rounded border border-[#D9D9D9] py-2.5 text-sm font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
        >
          Cancelar
        </button>
        <button
          onClick={onSaveAula}
          disabled={!canSave}
          className="flex-1 rounded bg-[#009640] py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33] disabled:opacity-50"
        >
          {editMode ? "Salvar alterações" : "Salvar Aula"}
        </button>
        {!editMode && onSaveFreq && (
          <button
            onClick={onSaveFreq}
            disabled={!canSaveFreq}
            className="flex-1 rounded border border-[#009640] py-2.5 text-sm font-semibold text-[#009640] transition hover:bg-[#EAF6EE] disabled:opacity-50"
          >
            Salvar com Frequência
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProfessorAulasPage() {
  const { data: session } = useSession();
  const userRole       = session?.user?.role       ?? "PROFESSOR";
  const userDisciplina = session?.user?.disciplina ?? null;
  const AREAS = aulasVisiveis(userDisciplina, userRole) as Area[];

  const emptyForm = (): Omit<AulaGravada, "id"> => ({
    area:          AREAS[0] ?? "Matemática",
    titulo:        "",
    professor:     "",
    data:          "",
    youtubeUrl:    "",
    formularioUrl: "",
  });

  const [aulas, setAulas]         = useState<AulaGravada[]>(alunoAulas);
  const [showForm, setShowForm]   = useState(false);
  const [newForm, setNewForm]     = useState<Omit<AulaGravada, "id">>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<Omit<AulaGravada, "id">>(() => emptyForm());
  const [flash, setFlash]         = useState("");

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3000);
  }

  function addAula() {
    setAulas((prev) => [...prev, { id: `aula-${Date.now()}`, ...newForm }]);
    setNewForm(emptyForm());
    setShowForm(false);
    showFlash("Aula cadastrada com sucesso.");
  }

  function addAulaComFreq() {
    setAulas((prev) => [...prev, { id: `aula-${Date.now()}`, ...newForm }]);
    setNewForm(emptyForm());
    setShowForm(false);
    showFlash("Aula e frequência cadastradas.");
  }

  function startEdit(aula: AulaGravada) {
    setEditingId(aula.id);
    setEditForm({ area: aula.area, titulo: aula.titulo, professor: aula.professor, data: aula.data, youtubeUrl: aula.youtubeUrl, formularioUrl: aula.formularioUrl });
  }

  function saveEdit() {
    setAulas((prev) => prev.map((a) => a.id === editingId ? { ...a, ...editForm } : a));
    setEditingId(null);
    showFlash("Aula atualizada.");
  }

  function deleteAula(id: string) {
    setAulas((prev) => prev.filter((a) => a.id !== id));
    showFlash("Aula removida.");
  }

  const byArea = AREAS.map((area) => ({
    area,
    aulas: aulas.filter((a) => a.area === area),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aulas Gravadas</h1>
          <p className="mt-0.5 text-sm text-[#4B5563]">Cadastre e gerencie as aulas por área do conhecimento</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="flex items-center gap-1.5 rounded bg-[#009640] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007A33]"
          >
            <Plus size={16} />
            Nova Aula
          </button>
        )}
      </div>

      {flash && (
        <div className="rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
          {flash}
        </div>
      )}

      {/* Formulário de cadastro */}
      {showForm && (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Cadastrar Nova Aula</h2>
          <FormularioAula
            value={newForm}
            onChange={setNewForm}
            onSaveAula={addAula}
            onSaveFreq={addAulaComFreq}
            onCancel={() => setShowForm(false)}
            allowedAreas={AREAS}
          />
        </div>
      )}

      {/* Lista por área */}
      <div className="space-y-5">
        {byArea.map(({ area, aulas: aulasDaArea }) => (
          <div
            key={area}
            className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#009640] px-5 py-3">
              <span className="text-sm font-semibold text-white">{area}</span>
              <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
                {aulasDaArea.length} aula{aulasDaArea.length !== 1 ? "s" : ""}
              </span>
            </div>

            {aulasDaArea.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-[#4B5563]">
                Nenhuma aula cadastrada nesta área.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Título</th>
                    <th className="hidden px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563] sm:table-cell">Professor</th>
                    <th className="hidden px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563] md:table-cell">Data</th>
                    <th className="px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Links</th>
                    <th className="px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {aulasDaArea.map((aula) =>
                    editingId === aula.id ? (
                      <tr key={aula.id}>
                        <td colSpan={5} className="px-5 py-4">
                          <p className="mb-3 text-sm font-semibold text-gray-800">Editar aula</p>
                          <FormularioAula
                            value={editForm}
                            onChange={setEditForm}
                            onSaveAula={saveEdit}
                            onCancel={() => setEditingId(null)}
                            allowedAreas={AREAS}
                            editMode
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr key={aula.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800">{aula.titulo}</p>
                          <p className="text-[11px] text-[#4B5563] sm:hidden">{aula.professor}</p>
                        </td>
                        <td className="hidden px-5 py-3 text-[#4B5563] sm:table-cell">{aula.professor}</td>
                        <td className="hidden px-5 py-3 text-[#4B5563] md:table-cell">{aula.data}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={aula.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded bg-[#009640] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#007A33]"
                            >
                              <PlayCircle size={11} />
                              YouTube
                            </a>
                            {aula.formularioUrl && (
                              <a
                                href={aula.formularioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded border border-[#D9D9D9] px-2.5 py-1.5 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
                              >
                                <CheckCircle2 size={11} />
                                Forms
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(aula)}
                              className="flex items-center gap-1 rounded border border-[#D9D9D9] px-2.5 py-1.5 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
                            >
                              <Pencil size={11} />
                              Editar
                            </button>
                            <button
                              onClick={() => deleteAula(aula.id)}
                              className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={11} />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
