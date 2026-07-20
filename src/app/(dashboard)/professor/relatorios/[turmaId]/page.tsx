import { notFound } from "next/navigation";
import { professorTurmas } from "@/lib/mock-data/professor";
import RelatorioTurma from "@/components/professor/RelatorioTurma";

export default async function RelatorioTurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const turma = professorTurmas.find((t) => t.id === turmaId);
  if (!turma) notFound();

  return <RelatorioTurma turma={turma} />;
}
