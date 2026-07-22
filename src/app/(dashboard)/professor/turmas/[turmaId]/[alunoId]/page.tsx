import Link from "next/link";
import { auth } from "@/lib/auth";
import { carregarAlunoDoProfessor, type AcessoTurma } from "@/lib/queries/professor-turmas";
import AlunoDetalheClient from "./aluno-client";

export const dynamic = "force-dynamic";

// Aviso amigável quando o aluno não existe (nessa turma) ou o professor não está vinculado.
function AvisoAcesso({ tipo, turmaId }: { tipo: AcessoTurma; turmaId: string }) {
  const msg =
    tipo === "inexistente"
      ? "Aluno não encontrado nesta turma."
      : "Você não está vinculado a esta turma. Fale com a coordenação.";
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href={`/professor/turmas/${turmaId}`}
        className="mb-5 flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para a turma
      </Link>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        {msg}
      </div>
    </div>
  );
}

export default async function AlunoPage({
  params,
}: {
  params: Promise<{ turmaId: string; alunoId: string }>;
}) {
  const { turmaId, alunoId } = await params;
  const session = await auth();
  const isCoordenacao = session?.user?.role === "COORDENACAO";

  const { acesso, aluno } = await carregarAlunoDoProfessor(
    turmaId,
    alunoId,
    session?.user?.id,
    isCoordenacao,
  );

  if (acesso !== "ok" || !aluno) {
    return <AvisoAcesso tipo={acesso} turmaId={turmaId} />;
  }

  return <AlunoDetalheClient aluno={aluno} turmaId={turmaId} />;
}
