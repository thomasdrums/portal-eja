import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { carregarTurmaDoProfessor } from "@/lib/queries/professor-turmas";
import { carregarNotasGradeTurma } from "@/lib/queries/notas";
import { carregarFrequenciaGradeTurma } from "@/lib/queries/frequencia";
import AcompanhamentoTurmaClient from "./turma-detalhe-client";

// Turma REAL do banco (coordenação enxerga todas). Notas/frequência reais.
export const dynamic = "force-dynamic";

export default async function AcompanhamentoTurmaPage({
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
  if (acesso !== "ok" || !turma) notFound();

  // Notas REAIS do banco (estado inicial da grade) + frequência CALCULADA por aluno.
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

  return (
    <AcompanhamentoTurmaClient
      turma={turmaComNotas}
      totais={totais}
      frequencias={frequencias}
    />
  );
}
