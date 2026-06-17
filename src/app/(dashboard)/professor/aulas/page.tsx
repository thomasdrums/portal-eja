"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { alunoAulas, type AulaGravada } from "@/lib/mock-data/aluno";
import { aulasVisiveis } from "@/lib/mock-data/professor";

const ALL_AREAS = ["Matemática", "Linguagens", "Ciências da Natureza", "Ciências Humanas", "Interárea"] as const;
type Area = (typeof ALL_AREAS)[number];

const areaGradient: Record<Area, string> = {
  "Matemática":           "from-[#0f2d52] to-[#1565c0]",
  "Linguagens":           "from-[#0277bd] to-[#0288d1]",
  "Ciências da Natureza": "from-[#00695c] to-[#00897b]",
  "Ciências Humanas":     "from-[#6a1b9a] to-[#8e24aa]",
  "Interárea":            "from-[#b45309] to-[#d97706]",
};

function FormularioAula({
  value,
  onChange,
  onSave,
  onCancel,
  submitLabel,
  allowedAreas,
}: {
  value: Omit<AulaGravada, "id">;
  onChange: (f: Omit<AulaGravada, "id">) => void;
  onSave: () => void;
  onCancel: () => void;
  submitLabel: string;
  allowedAreas: Area[];
}) {
  function field(key: keyof Omit<AulaGravada, "id">, label: string, type = "text") {
    if (key === "area") {
      return (
        <div key={key}>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
          <select
            value={value.area}
            onChange={(e) => onChange({ ...value, area: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
          >
            {allowedAreas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div key={key}>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
        <input
          type={type}
          value={value[key] as string}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          placeholder={key.includes("Url") ? "https://" : ""}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1565c0] focus:bg-white focus:ring-2 focus:ring-[#1565c0]/20"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {field("area",         "Área do Conhecimento")}
      {field("titulo",       "Título da Aula")}
      {field("professor",    "Professor")}
      {field("data",         "Data")}
      {field("youtubeUrl",   "Link do YouTube", "url")}
      {field("formularioUrl","Link do Formulário de Presença", "url")}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={!value.titulo || !value.professor || !value.data}
          className="flex-1 rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function ProfessorAulasPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "PROFESSOR";
  const userDisciplina = session?.user?.disciplina ?? null;
  const AREAS = aulasVisiveis(userDisciplina, userRole) as Area[];

  const emptyForm = (): Omit<AulaGravada, "id"> => ({
    area: AREAS[0] ?? "Matemática",
    titulo: "",
    professor: "",
    data: "",
    youtubeUrl: "",
    formularioUrl: "",
  });

  const [aulas, setAulas] = useState<AulaGravada[]>(alunoAulas);
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState<Omit<AulaGravada, "id">>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<AulaGravada, "id">>(() => emptyForm());
  const [flash, setFlash] = useState("");

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3000);
  }

  function addAula() {
    const nova: AulaGravada = { id: `aula-${Date.now()}`, ...newForm };
    setAulas((prev) => [...prev, nova]);
    setNewForm(emptyForm());
    setShowForm(false);
    showFlash("Aula cadastrada com sucesso!");
  }

  function startEdit(aula: AulaGravada) {
    setEditingId(aula.id);
    setEditForm({ area: aula.area, titulo: aula.titulo, professor: aula.professor, data: aula.data, youtubeUrl: aula.youtubeUrl, formularioUrl: aula.formularioUrl });
  }

  function saveEdit() {
    setAulas((prev) => prev.map((a) => a.id === editingId ? { ...a, ...editForm } : a));
    setEditingId(null);
    showFlash("Aula atualizada!");
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
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/professor" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#1565c0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#0f2d52]">Aulas Gravadas</h1>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1565c0] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Aula
          </button>
        )}
      </div>

      {flash && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ {flash}
        </div>
      )}

      {/* Cadastro */}
      {showForm && (
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
          <h2 className="mb-5 font-bold text-gray-800">Cadastrar Nova Aula</h2>
          <FormularioAula
            value={newForm}
            onChange={setNewForm}
            onSave={addAula}
            onCancel={() => setShowForm(false)}
            submitLabel="Salvar Aula"
            allowedAreas={AREAS}
          />
        </div>
      )}

      {/* Lista por área */}
      <div className="space-y-8">
        {byArea.map(({ area, aulas: aulasDaArea }) => {
            const gradient = areaGradient[area as Area] ?? "from-[#0f2d52] to-[#1565c0]";
            return (
              <section key={area}>
                <div className={`mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r ${gradient} px-5 py-3.5`}>
                  <span className="font-bold text-white">{area}</span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                    {aulasDaArea.length} aula{aulasDaArea.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {aulasDaArea.length === 0 && (
                  <div className="rounded-3xl bg-white px-5 py-6 text-center shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm text-gray-400">Nenhuma aula cadastrada nessa área.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {aulasDaArea.map((aula) => (
                    <div key={aula.id} className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
                      {editingId === aula.id ? (
                        <div className="p-5">
                          <p className="mb-4 font-bold text-gray-800">Editar aula</p>
                          <FormularioAula
                            value={editForm}
                            onChange={setEditForm}
                            onSave={saveEdit}
                            onCancel={() => setEditingId(null)}
                            submitLabel="Salvar alterações"
                            allowedAreas={AREAS}
                          />
                        </div>
                      ) : (
                        <div className="flex gap-4 p-5">
                          <div className={`w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b ${gradient}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 leading-snug">{aula.titulo}</p>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                              <span>{aula.professor}</span>
                              <span>{aula.data}</span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                href={aula.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${gradient} px-3 py-1.5 text-xs font-bold text-white hover:opacity-90`}
                              >
                                <svg viewBox="0 0 24 24" fill="white" className="h-3.5 w-3.5">
                                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                                </svg>
                                YouTube
                              </a>
                              <a
                                href={aula.formularioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Formulário
                              </a>
                              <button
                                onClick={() => startEdit(aula)}
                                className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1565c0] hover:bg-blue-100"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                </svg>
                                Editar
                              </button>
                              <button
                                onClick={() => deleteAula(aula.id)}
                                className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
    </div>
  );
}
