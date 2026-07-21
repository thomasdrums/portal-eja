"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeft, User, Check } from "lucide-react";
import { alunoPerfil } from "@/lib/mock-data/aluno";
import { professoresCoord } from "@/lib/mock-data/coordenacao";

// Rótulos e rota "Voltar" por perfil.
const ROLE_CFG: Record<string, { label: string; home: string }> = {
  ALUNO:       { label: "Aluno · EJA SESI",        home: "/aluno" },
  PROFESSOR:   { label: "Professor · EJA SESI",    home: "/professor" },
  COORDENACAO: { label: "Coordenação · EJA SESI",  home: "/coordenacao" },
};

// Modelo do formulário (todos os campos possíveis; os visíveis dependem do perfil).
type PerfilForm = {
  nome: string;
  email: string;
  telefone: string;
  // Aluno
  cidade: string;
  cep: string;
  nomePai: string;
  nomeMae: string;
  // Professor (somente leitura)
  area: string;
  poloProfessor: string;
  // Coordenação
  cargo: string;
  polo: string;
};

const EMPTY: PerfilForm = {
  nome: "", email: "", telefone: "",
  cidade: "", cep: "", nomePai: "", nomeMae: "",
  area: "", poloProfessor: "",
  cargo: "", polo: "",
};

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

const inputClass =
  "w-full rounded border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#009640]/20";
const readOnlyClass =
  "w-full rounded border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#4B5563]";

function Field({
  label, value, onChange, type = "text", readOnly = false,
}: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      {readOnly ? (
        <p className={readOnlyClass}>{value || <span className="text-[#D9D9D9]">—</span>}</p>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState<PerfilForm | null>(null);
  const [saved, setSaved] = useState(false);

  // Preenche os valores iniciais a partir da sessão + mocks (uma vez).
  useEffect(() => {
    if (!session?.user || form) return;
    const role = session.user.role;
    const nome = session.user.name ?? "";
    const email = session.user.email ?? "";

    if (role === "ALUNO") {
      setForm({
        ...EMPTY,
        nome: alunoPerfil.nome || nome,
        email,
        telefone: alunoPerfil.telefone,
        cidade: alunoPerfil.cidade,
        cep: alunoPerfil.cep,
        nomePai: alunoPerfil.nomePai,
        nomeMae: alunoPerfil.nomeMae,
      });
    } else if (role === "PROFESSOR") {
      const registro = professoresCoord.find((p) => p.nome === nome);
      setForm({
        ...EMPTY,
        nome,
        email,
        telefone: registro?.telefone ?? "",
        area: session.user.disciplina ?? registro?.area ?? "—",
        poloProfessor: registro?.polo ?? "—",
      });
    } else {
      setForm({
        ...EMPTY,
        nome,
        email,
        telefone: "",
        cargo: "Coordenação Pedagógica",
        polo: "Caruaru",
      });
    }
  }, [session, form]);

  function set<K extends keyof PerfilForm>(key: K, value: PerfilForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleSave() {
    // TODO: persistir no banco (Fase 2)
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const role = session?.user?.role ?? "";
  const cfg = ROLE_CFG[role] ?? { label: "EJA SESI", home: "/" };

  if (status === "loading" || !form) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-[#4B5563]">Carregando perfil…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={cfg.home} className="flex w-fit items-center gap-1 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={16} />
        Voltar
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">Meu Perfil</h1>

      {/* Cartão institucional / avatar */}
      <div className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] ring-2 ring-[#009640]/20">
          <span className="text-xl font-bold text-[#009640]">{getInitials(form.nome)}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-gray-900">{form.nome}</p>
          <p className="text-sm text-[#4B5563]">{cfg.label}</p>
        </div>
        <div className="ml-auto">
          <User size={22} className="text-[#D9D9D9]" />
        </div>
      </div>

      {/* Feedback */}
      {saved && (
        <div className="flex items-center gap-2 rounded border border-[#009640]/20 bg-[#EAF6EE] px-4 py-2.5 text-sm font-medium text-[#007A33]">
          <Check size={16} className="shrink-0" />
          Dados salvos
        </div>
      )}

      {/* Formulário */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">Informações pessoais</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome completo" value={form.nome} onChange={(v) => set("nome", v)} />
          </div>
          <Field label="E-mail" type="email" value={form.email} onChange={(v) => set("email", v)} />
          <Field label="Telefone" type="tel" value={form.telefone} onChange={(v) => set("telefone", v)} />

          {/* Campos específicos do ALUNO */}
          {role === "ALUNO" && (
            <>
              <Field label="Cidade" value={form.cidade} onChange={(v) => set("cidade", v)} />
              <Field label="CEP" value={form.cep} onChange={(v) => set("cep", v)} />
              <Field label="Nome do Pai" value={form.nomePai} onChange={(v) => set("nomePai", v)} />
              <Field label="Nome da Mãe" value={form.nomeMae} onChange={(v) => set("nomeMae", v)} />
            </>
          )}

          {/* Campos específicos do PROFESSOR (somente leitura) */}
          {role === "PROFESSOR" && (
            <>
              <Field label="Área de atuação" value={form.area} readOnly />
              <Field label="Polo" value={form.poloProfessor} readOnly />
            </>
          )}

          {/* Campos específicos da COORDENAÇÃO */}
          {role === "COORDENACAO" && (
            <>
              <Field label="Cargo / Função" value={form.cargo} onChange={(v) => set("cargo", v)} />
              <Field label="Polo" value={form.polo} onChange={(v) => set("polo", v)} />
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-[#9CA3AF]">
          As alterações são locais nesta etapa e ainda não persistem após recarregar (em breve, com o
          banco de dados).
        </p>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="rounded bg-[#009640] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A33]"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
