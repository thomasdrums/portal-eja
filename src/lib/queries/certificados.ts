import { prisma } from "@/lib/prisma";

// ════════════════════════════════════════════════════════════════════════════
// CERTIFICADOS (coordenação)
//
// Fluxo de documentação de cada aluno, do banco:
//   1. Histórico original ENTREGUE na escola (historicoEntregue + data).
//   2. Certificado EMITIDO — só é permitido depois do histórico entregue
//      (regra validada aqui no servidor, não só escondendo o botão na tela).
//   3. Certificado ENTREGUE ao aluno — só depois de emitido.
// ════════════════════════════════════════════════════════════════════════════

// Linha consumida pela tela de Certificados (uma por aluno não-arquivado).
export type CertificadoRow = {
  id: string;
  nome: string;
  turmaNome: string;
  poloNome: string;
  historicoEntregue: boolean;
  historicoEntregueEm: string | null;
  certificadoEmitido: boolean;
  certificadoEmitidoEm: string | null;
  certificadoRecebido: boolean;
  certificadoEntregueEm: string | null;
};

export type ResultadoCertificado = { ok: boolean; message: string };

const SEM_TURMA = "—";
const SEM_POLO = "—";

// Formata data para exibição (dd/mm/aaaa); null quando não há data.
function fmtData(d: Date | null): string | null {
  if (!d) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// Lista os ALUNOS REAIS (não-arquivados) com o estado da documentação.
export async function listarCertificados(): Promise<CertificadoRow[]> {
  const alunos = await prisma.aluno.findMany({
    where: { arquivado: false },
    orderBy: { nome: "asc" },
    include: { turma: { include: { polo: { select: { nome: true } } } } },
  });

  return alunos.map((a) => ({
    id: a.id,
    nome: a.nome,
    turmaNome: a.turma?.nome ?? SEM_TURMA,
    poloNome: a.turma?.polo?.nome ?? SEM_POLO,
    historicoEntregue: a.historicoEntregue,
    historicoEntregueEm: fmtData(a.historicoEntregueEm),
    certificadoEmitido: a.certificadoEmitido,
    certificadoEmitidoEm: fmtData(a.certificadoEmitidoEm),
    certificadoRecebido: a.certificadoRecebido,
    certificadoEntregueEm: fmtData(a.certificadoEntregueEm),
  }));
}

// Marca (ou desmarca) o histórico original como entregue.
// Desmarcar é permitido só enquanto o certificado NÃO foi emitido, para não
// deixar um certificado emitido "pendurado" sem o histórico que o autoriza.
export async function definirHistoricoEntregue(
  id: string,
  entregue: boolean,
): Promise<ResultadoCertificado> {
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    select: { certificadoEmitido: true },
  });
  if (!aluno) return { ok: false, message: "Aluno não encontrado." };

  if (entregue) {
    await prisma.aluno.update({
      where: { id },
      data: { historicoEntregue: true, historicoEntregueEm: new Date() },
    });
    return { ok: true, message: "Histórico marcado como entregue." };
  }

  if (aluno.certificadoEmitido) {
    return {
      ok: false,
      message: "Não é possível desmarcar: o certificado já foi emitido.",
    };
  }

  await prisma.aluno.update({
    where: { id },
    data: { historicoEntregue: false, historicoEntregueEm: null },
  });
  return { ok: true, message: "Entrega do histórico desmarcada." };
}

// Emite o certificado. REGRA CENTRAL: nunca sem o histórico entregue.
export async function emitirCertificado(id: string): Promise<ResultadoCertificado> {
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    select: { historicoEntregue: true, certificadoEmitido: true },
  });
  if (!aluno) return { ok: false, message: "Aluno não encontrado." };
  if (!aluno.historicoEntregue) {
    return { ok: false, message: "Aguardando entrega do histórico original." };
  }
  if (aluno.certificadoEmitido) {
    return { ok: false, message: "O certificado já foi emitido." };
  }

  await prisma.aluno.update({
    where: { id },
    data: { certificadoEmitido: true, certificadoEmitidoEm: new Date() },
  });
  return { ok: true, message: "Certificado emitido." };
}

// Para o ALERTA na área do aluno: true quando o aluno logado ainda NÃO entregou
// o histórico original. false quando entregou, quando não há aluno vinculado à
// conta, ou quando não há sessão. Lê o valor real do banco a cada chamada.
export async function historicoPendenteDoAlunoLogado(
  userId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;
  const aluno = await prisma.aluno.findUnique({
    where: { userId },
    select: { historicoEntregue: true },
  });
  return aluno ? !aluno.historicoEntregue : false;
}

// Marca o certificado como entregue ao aluno. Só depois de emitido.
export async function marcarCertificadoEntregue(
  id: string,
): Promise<ResultadoCertificado> {
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    select: { certificadoEmitido: true, certificadoRecebido: true },
  });
  if (!aluno) return { ok: false, message: "Aluno não encontrado." };
  if (!aluno.certificadoEmitido) {
    return { ok: false, message: "Emita o certificado antes de marcar a entrega." };
  }
  if (aluno.certificadoRecebido) {
    return { ok: false, message: "O certificado já foi entregue ao aluno." };
  }

  await prisma.aluno.update({
    where: { id },
    data: { certificadoRecebido: true, certificadoEntregueEm: new Date() },
  });
  return { ok: true, message: "Certificado entregue ao aluno." };
}
