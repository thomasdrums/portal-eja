import { prisma } from "@/lib/prisma";
import type { StatusSolicitacao, TipoDocumento } from "@prisma/client";
import { TIPO_LABEL } from "@/lib/solicitacoes-labels";

export type ResultadoAcao = { ok: boolean; message: string };

// Linha da tela da coordenação.
export type SolicitacaoCoordRow = {
  id: string;
  nomeAluno: string;
  ra: string;
  tipoLabel: string;
  polo: string;
  turmaNome: string;
  dataSolicitacao: string;
  status: StatusSolicitacao;
};

// Linha da tela do aluno ("minhas solicitações").
export type SolicitacaoAlunoRow = {
  id: string;
  tipoLabel: string;
  dataHora: string;
  status: StatusSolicitacao;
};

function fmtData(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function fmtDataHora(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${fmtData(d)} ${hh}:${min}`;
}

// Rótulo do tipo: para OUTROS com descrição livre, mostra a descrição.
function rotuloTipo(tipo: TipoDocumento, tipoOutros: string | null): string {
  return tipo === "OUTROS" && tipoOutros ? tipoOutros : TIPO_LABEL[tipo];
}

export async function listarSolicitacoes(): Promise<SolicitacaoCoordRow[]> {
  const sols = await prisma.solicitacao.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      aluno: {
        select: {
          nome: true,
          ra: true,
          turma: { select: { nome: true, polo: { select: { nome: true } } } },
        },
      },
    },
  });

  return sols.map((s) => ({
    id: s.id,
    nomeAluno: s.aluno.nome,
    ra: s.aluno.ra ?? "",
    tipoLabel: rotuloTipo(s.tipo, s.tipoOutros),
    polo: s.aluno.turma?.polo?.nome ?? "—",
    turmaNome: s.aluno.turma?.nome ?? "—",
    dataSolicitacao: fmtData(s.createdAt),
    status: s.status,
  }));
}

export async function listarSolicitacoesDoAluno(alunoId: string): Promise<SolicitacaoAlunoRow[]> {
  const sols = await prisma.solicitacao.findMany({
    where: { alunoId },
    orderBy: { createdAt: "desc" },
  });

  return sols.map((s) => ({
    id: s.id,
    tipoLabel: rotuloTipo(s.tipo, s.tipoOutros),
    dataHora: fmtDataHora(s.createdAt),
    status: s.status,
  }));
}

export async function criarSolicitacao(
  alunoId: string,
  tipo: TipoDocumento,
  tipoOutros?: string,
): Promise<ResultadoAcao> {
  await prisma.solicitacao.create({
    data: {
      alunoId,
      tipo,
      tipoOutros: tipo === "OUTROS" ? tipoOutros?.trim() || null : null,
      status: "RECEBIDA",
    },
  });
  return { ok: true, message: "Solicitação enviada com sucesso." };
}

export async function atualizarStatusSolicitacao(
  id: string,
  status: StatusSolicitacao,
): Promise<ResultadoAcao> {
  await prisma.solicitacao.update({ where: { id }, data: { status } });
  return { ok: true, message: "Status atualizado" };
}

// Resolve o Aluno vinculado ao usuário logado (via userId). Retorna null se não houver.
export async function alunoIdDoUsuario(userId: string): Promise<string | null> {
  const aluno = await prisma.aluno.findUnique({ where: { userId }, select: { id: true } });
  return aluno?.id ?? null;
}
