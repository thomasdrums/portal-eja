import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { carregarTurmaDoProfessor } from "@/lib/queries/professor-turmas";
import RelatorioTurma from "@/components/professor/RelatorioTurma";

// Turma REAL do banco (coordenação vê todas; professor só as vinculadas).
export const dynamic = "force-dynamic";

export default async function RelatorioTurmaPage({
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

  return <RelatorioTurma turma={turma} />;
}
