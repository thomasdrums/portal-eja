import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { carregarFrequenciaDoAlunoLogado } from "@/lib/queries/frequencia";
import { FREQUENCIA_MINIMA_APROVACAO } from "@/lib/regras-notas";
import FrequenciaAlunoView from "./frequencia-view";

// Calculada na hora a partir das respostas validadas — nunca vem gravada.
export const dynamic = "force-dynamic";

export default async function FrequenciaPage() {
  const session = await auth();
  const dados = await carregarFrequenciaDoAlunoLogado(session?.user?.id);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/aluno"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Frequência</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">
          Sua presença por área do conhecimento, contada a partir das respostas às aulas que o
          professor já validou.
        </p>
      </div>

      {!dados.temAluno ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Sua conta ainda não está vinculada a um cadastro de aluno. Procure a coordenação.
        </div>
      ) : (
        <>
          <FrequenciaAlunoView frequencia={dados.frequencia} />
          <p className="text-xs text-[#9CA3AF]">
            Frequência mínima exigida para aprovação: {FREQUENCIA_MINIMA_APROVACAO}%. Uma aula só
            conta como presença depois que o professor valida sua resposta.
          </p>
        </>
      )}
    </div>
  );
}
