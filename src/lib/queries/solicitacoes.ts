import { prisma } from "@/lib/prisma";
import { Prisma, type StatusSolicitacao, type TipoDocumento } from "@prisma/client";
import { TIPO_LABEL } from "@/lib/solicitacoes-labels";

export type ResultadoAcao = { ok: boolean; message: string };

// Status em que o aluno ainda pode cancelar a própria solicitação.
const CANCELAVEIS: StatusSolicitacao[] = ["RECEBIDA", "EM_ANALISE"];

// Linha da tela da coordenação.
export type SolicitacaoCoordRow = {
  id: string;
  protocolo: string;
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
  protocolo: string;
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

// ── Protocolo "ANO-NNNNNN" (sequencial por ano, 6 dígitos) ──
function formatProtocolo(ano: number, n: number): string {
  return `${ano}-${String(n).padStart(6, "0")}`;
}

// Próximo número sequencial do ano: baseado no maior protocolo já usado naquele ano.
// Como o número é zero-preenchido (largura fixa), a ordem lexicográfica = ordem numérica.
async function proximoNumero(ano: number): Promise<number> {
  const ultimo = await prisma.solicitacao.findFirst({
    where: { protocolo: { startsWith: `${ano}-` } },
    orderBy: { protocolo: "desc" },
    select: { protocolo: true },
  });
  if (!ultimo?.protocolo) return 1;
  const n = parseInt(ultimo.protocolo.split("-")[1] ?? "", 10);
  return (Number.isFinite(n) ? n : 0) + 1;
}

// Detecta conflito de unicidade do protocolo (P2002), para tentar o próximo número.
function isProtocoloDuplicado(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return false;
  const target = e.meta?.target;
  const alvo = Array.isArray(target) ? target.join(",") : String(target ?? "");
  return alvo.includes("protocolo");
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
    protocolo: s.protocolo ?? "",
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
    protocolo: s.protocolo ?? "",
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
  const ano = new Date().getFullYear();
  let n = await proximoNumero(ano);

  // Gera o protocolo garantindo unicidade: se o @unique conflitar (concorrência),
  // tenta o próximo número. Nunca dois pedidos recebem o mesmo protocolo.
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const protocolo = formatProtocolo(ano, n);
    try {
      await prisma.solicitacao.create({
        data: {
          alunoId,
          protocolo,
          tipo,
          tipoOutros: tipo === "OUTROS" ? tipoOutros?.trim() || null : null,
          status: "RECEBIDA",
        },
      });
      return { ok: true, message: `Solicitação enviada. Protocolo ${protocolo}.` };
    } catch (e) {
      if (isProtocoloDuplicado(e)) {
        n += 1; // protocolo já usado por outro pedido — tenta o próximo número
        continue;
      }
      throw e;
    }
  }
  return { ok: false, message: "Não foi possível gerar o protocolo. Tente novamente." };
}

// Cancela a solicitação do aluno (soft): valida dono + status atual atomicamente.
// Só cancela se estiver RECEBIDA ou EM_ANALISE (nunca em processamento/concluída/cancelada).
export async function cancelarSolicitacao(id: string, alunoId: string): Promise<ResultadoAcao> {
  const r = await prisma.solicitacao.updateMany({
    where: { id, alunoId, status: { in: CANCELAVEIS } },
    data: { status: "CANCELADA" },
  });
  if (r.count === 0) {
    return {
      ok: false,
      message: "Não é possível cancelar: a solicitação já está em processamento, concluída ou cancelada.",
    };
  }
  return { ok: true, message: "Solicitação cancelada." };
}

// Backfill: gera protocolo para solicitações antigas (sem protocolo), por ordem de criação,
// reiniciando a numeração a cada ano. Rotina única — idempotente (só toca em protocolo=null).
export async function backfillProtocolos(): Promise<{ atualizados: number }> {
  const semProtocolo = await prisma.solicitacao.findMany({
    where: { protocolo: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true },
  });

  const contadorPorAno = new Map<number, number>();
  let atualizados = 0;

  for (const s of semProtocolo) {
    const ano = s.createdAt.getFullYear();
    let n = contadorPorAno.get(ano) ?? (await proximoNumero(ano));

    for (let tentativa = 0; tentativa < 20; tentativa++) {
      const protocolo = formatProtocolo(ano, n);
      try {
        await prisma.solicitacao.update({ where: { id: s.id }, data: { protocolo } });
        n += 1;
        atualizados++;
        break;
      } catch (e) {
        if (isProtocoloDuplicado(e)) {
          n += 1;
          continue;
        }
        throw e;
      }
    }
    contadorPorAno.set(ano, n);
  }
  return { atualizados };
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
