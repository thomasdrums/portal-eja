import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { carregarTurmaDoProfessor, type AcessoTurma } from "@/lib/queries/professor-turmas";
import { carregarNotasGradeTurma } from "@/lib/queries/notas";
import { carregarFrequenciaGradeTurma } from "@/lib/queries/frequencia";
import TurmaClient from "./turma-client";

export const dynamic = "force-dynamic";

// Aviso amigável quando a turma não existe ou o professor não está vinculado.
function AvisoAcesso({ tipo }: { tipo: AcessoTurma }) {
  const msg =
    tipo === "inexistente"
      ? "Turma não encontrada."
      : "Você não está vinculado a esta turma. Fale com a coordenação.";
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/professor/turmas"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Turmas
        </Link>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        {msg}
      </div>
    </div>
  );
}

export default async function TurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";

  const { acesso, turma } = await carregarTurmaDoProfessor(
    turmaId,
    session?.user?.id,
    isCoordenacao,
  );

  if (acesso !== "ok" || !turma) {
    return <AvisoAcesso tipo={acesso} />;
  }

  // Notas REAIS do banco (estado inicial da grade) + frequência CALCULADA
  // (respostas validadas ÷ aulas exigidas) de cada aluno da turma.
  const [{ notasPorAluno, totais }, frequencias] = await Promise.all([
    carregarNotasGradeTurma(turma.id),
    carregarFrequenciaGradeTurma(turma.id),
  ]);
  const turmaComNotas = {
    ...turma,
    alunos: turma.alunos.map((a) => ({
      ...a,
      notasGrade: notasPorAluno[a.id] ?? a.notasGrade,
    })),
  };

  return <TurmaClient turma={turmaComNotas} totais={totais} frequencias={frequencias} />;
}
