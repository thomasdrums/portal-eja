import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { carregarPerfilAluno } from "@/lib/queries/perfil";
import { SITUACAO_CFG, ETAPA_CFG } from "@/lib/mock-data/professor";
import type { SituacaoAluno } from "@prisma/client";

// Dados reais do aluno logado (somente leitura). Depende da sessão.
export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

// Rótulo da situação, com fallback para valores fora da lista (ex.: INATIVO).
function situacaoLabel(s: SituacaoAluno): string {
  return SITUACAO_CFG[s as keyof typeof SITUACAO_CFG]?.label ?? s;
}

function ReadField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#4B5563]">{label}</label>
      <p className="rounded border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm text-gray-800">
        {value || <span className="text-[#D9D9D9]">—</span>}
      </p>
    </div>
  );
}

export default async function AlunoPerfilPage() {
  const session = await auth();
  const perfil = await carregarPerfilAluno(session?.user?.id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/aluno" className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline">
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-gray-900">Meu Perfil</h1>

      {!perfil ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta ainda não está vinculada a um cadastro de aluno. Procure a coordenação.
        </div>
      ) : (
        <>
          {/* Avatar */}
          <div className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6EE] ring-2 ring-[#009640]/20">
              <span className="text-xl font-bold text-[#009640]">{getInitials(perfil.nome)}</span>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{perfil.nome}</p>
              <p className="text-sm text-[#4B5563]">Aluno · EJA SESI</p>
            </div>
            <div className="ml-auto">
              <User size={22} className="text-[#D9D9D9]" />
            </div>
          </div>

          {/* Informações (somente leitura) */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">Informações pessoais</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <ReadField label="Nome completo" value={perfil.nome} />
              </div>
              <ReadField label="RA" value={perfil.ra} />
              <ReadField label="E-mail" value={perfil.email} />
              <ReadField label="Cidade" value={perfil.cidade} />
              <ReadField label="Telefone" value={perfil.telefone} />
              <ReadField label="CEP" value={perfil.cep} />
              <ReadField label="Nome do Pai" value={perfil.nomePai} />
              <ReadField label="Nome da Mãe" value={perfil.nomeMae} />
              <ReadField label="Turma" value={perfil.turmaNome} />
              <ReadField label="Polo" value={perfil.poloNome} />
              <ReadField label="Etapa" value={ETAPA_CFG[perfil.etapa].label} />
              <ReadField label="Situação" value={situacaoLabel(perfil.situacao)} />
            </div>
            <p className="mt-4 text-xs text-[#9CA3AF]">
              Para corrigir qualquer dado, procure a coordenação.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
