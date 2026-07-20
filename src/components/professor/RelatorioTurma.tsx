"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, FileDown } from "lucide-react";
import {
  SITUACAO_CFG,
  type Turma,
  type Aluno,
  type SituacaoAluno,
} from "@/lib/mock-data/professor";

// ── Helpers ──────────────────────────────────────────────
function freqGeral(aluno: Aluno): number {
  const areas = Object.values(aluno.frequencia);
  const totalAulas = areas.reduce((s, a) => s + a.totalAulas, 0);
  const totalPresenca = areas.reduce((s, a) => s + a.presencas, 0);
  if (totalAulas === 0) return 0;
  return Math.round((totalPresenca / totalAulas) * 100);
}

function freqColor(p: number) {
  if (p >= 75) return "text-green-700";
  if (p >= 50) return "text-amber-600";
  return "text-red-500";
}

// Cores semânticas suaves por situação (sem azul institucional — Cursando em
// azul-esverdeado/teal). SITUACAO_CFG é reutilizado só para rótulo/descrição.
const SIT_COLORS: Record<SituacaoAluno, { card: string; selo: string }> = {
  APROVADO:    { card: "bg-green-50 ring-green-100 text-green-700",   selo: "bg-green-50 text-green-700"   },
  CURSANDO:    { card: "bg-teal-50 ring-teal-100 text-teal-700",      selo: "bg-teal-50 text-teal-700"     },
  EM_PROCESSO: { card: "bg-amber-50 ring-amber-100 text-amber-700",   selo: "bg-amber-50 text-amber-700"   },
  RDS:         { card: "bg-purple-50 ring-purple-100 text-purple-700",selo: "bg-purple-50 text-purple-700" },
  EVADIDO:     { card: "bg-orange-50 ring-orange-100 text-orange-700",selo: "bg-orange-50 text-orange-700" },
  DESISTENTE:  { card: "bg-red-50 ring-red-100 text-red-600",         selo: "bg-red-50 text-red-600"       },
};

const seloClasses = (s: SituacaoAluno) =>
  `inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${SIT_COLORS[s].selo}`;

// ── Cartão institucional base ────────────────────────────
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#007A33]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function RelatorioTurma({ turma }: { turma: Turma }) {
  const alunos = turma.alunos;

  // ── Contagens por situação ─────────────────────────────
  const total       = alunos.length;
  const aprovados   = alunos.filter((a) => a.situacao === "APROVADO").length;
  const cursando    = alunos.filter((a) => a.situacao === "CURSANDO").length;
  const emProcesso  = alunos.filter((a) => a.situacao === "EM_PROCESSO").length;
  const rds         = alunos.filter((a) => a.situacao === "RDS").length;
  const evadidos    = alunos.filter((a) => a.situacao === "EVADIDO").length;
  const desistentes = alunos.filter((a) => a.situacao === "DESISTENTE").length;
  const conclusao   = total > 0 ? Math.round((aprovados / total) * 100) : 0;

  const contagens: { label: string; value: number; classes: string }[] = [
    { label: "Total",       value: total,       classes: "bg-[#EAF6EE] ring-[#CDEBD7] text-[#007A33]" },
    { label: SITUACAO_CFG.APROVADO.label,    value: aprovados,   classes: SIT_COLORS.APROVADO.card    },
    { label: SITUACAO_CFG.CURSANDO.label,    value: cursando,    classes: SIT_COLORS.CURSANDO.card    },
    { label: SITUACAO_CFG.EM_PROCESSO.label, value: emProcesso,  classes: SIT_COLORS.EM_PROCESSO.card },
    { label: SITUACAO_CFG.RDS.label,         value: rds,         classes: SIT_COLORS.RDS.card         },
    { label: SITUACAO_CFG.EVADIDO.label,     value: evadidos,    classes: SIT_COLORS.EVADIDO.card     },
    { label: SITUACAO_CFG.DESISTENTE.label,  value: desistentes, classes: SIT_COLORS.DESISTENTE.card  },
  ];

  // ── Estado editável (local — // TODO: persistir no banco) ─────
  const [desempenhoGeral, setDesempenhoGeral] = useState(
    `A Turma ${turma.nome} encerra o período letivo ${turma.periodoLetivo} com ${total} aluno(s) matriculado(s), ` +
      `dos quais ${aprovados} foram aprovado(s), ${desistentes} desistente(s) e ${evadidos} evadido(s). ` +
      `A taxa de conclusão da turma é de ${conclusao}%. ` +
      `De modo geral, a turma apresentou bom engajamento nas atividades presenciais e no AVA, ` +
      `com acompanhamento individualizado dos alunos em situação de risco de evasão.`,
  );

  // Observações por aluno (id → texto). Pré-preenchidas a partir do mock.
  const [observacoes, setObservacoes] = useState<Record<string, string>>(() =>
    Object.fromEntries(alunos.map((a) => [a.id, a.observacao ?? ""])),
  );
  // TODO: persistir observacoes no banco

  // Bloco "Desafios enfrentados" (estado local — // TODO: persistir no banco).
  const [problemas, setProblemas] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState("");
  const [medidas, setMedidas] = useState("");
  const [planilhaUrl, setPlanilhaUrl] = useState("");

  // ── Busca por RA ou nome ───────────────────────────────
  const [busca, setBusca] = useState("");
  const alunosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return alunos;
    return alunos.filter(
      (a) => a.nome.toLowerCase().includes(q) || a.ra.toLowerCase().includes(q),
    );
  }, [alunos, busca]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Voltar */}
      <Link
        href="/professor/relatorios"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#009640] transition hover:text-[#007A33]"
      >
        <ChevronLeft size={16} />
        Relatórios
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-900">{turma.nome}</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Relatório da turma</p>
      </div>

      {/* ── 1. Identificação da turma ─────────────────────── */}
      <Card title="Identificação da Turma">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {[
            { label: "Nome da Turma",          value: turma.nome },
            { label: "Etapa de Ensino",        value: turma.etapaEnsino },
            { label: "Período Letivo",         value: turma.periodoLetivo },
            { label: "Professor Responsável",  value: turma.professorResponsavel },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* ── 2. Desempenho acadêmico ───────────────────────── */}
      <Card title="Desempenho Acadêmico">
        {/* a) Contagem por situação */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {contagens.map((c) => (
            <div
              key={c.label}
              className={`rounded-lg p-3 text-center ring-1 ${c.classes}`}
            >
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="mt-0.5 text-[11px] font-semibold leading-tight">{c.label}</p>
            </div>
          ))}
        </div>

        {/* b) Desempenho geral da turma (textarea editável) */}
        <div className="mt-6">
          <label
            htmlFor="desempenho-geral"
            className="mb-1.5 block text-sm font-semibold text-gray-800"
          >
            Desempenho Geral da Turma
          </label>
          <textarea
            id="desempenho-geral"
            value={desempenhoGeral}
            onChange={(e) => setDesempenhoGeral(e.target.value)}
            rows={5}
            className="w-full resize-y rounded-lg border border-[#E5E7EB] p-3 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
          />
          {/* TODO: persistir desempenhoGeral no banco */}
        </div>
      </Card>

      {/* ── 3. Desempenho individual — observações ────────── */}
      <Card title="Desempenho Individual — Observações">
        {/* Busca */}
        <div className="relative mb-4 max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por RA ou nome…"
            className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-[#009640]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-white">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white">Cidade</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white">Freq. Geral</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white">Situação</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {alunosFiltrados.map((aluno) => {
                const freq = freqGeral(aluno);
                return (
                  <tr key={aluno.id} className="align-top hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">{aluno.nome}</span>
                      <span className="block text-xs text-[#9CA3AF]">RA {aluno.ra}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{aluno.cidade}</td>
                    <td className={`px-4 py-3 text-center font-bold ${freqColor(freq)}`}>
                      {freq}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={seloClasses(aluno.situacao)}>
                        {SITUACAO_CFG[aluno.situacao].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        value={observacoes[aluno.id] ?? ""}
                        onChange={(e) =>
                          setObservacoes((prev) => ({ ...prev, [aluno.id]: e.target.value }))
                        }
                        rows={2}
                        placeholder="Adicionar observação pedagógica…"
                        className="w-full min-w-[220px] resize-y rounded-lg border border-[#E5E7EB] p-2 text-xs text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
                      />
                      {/* TODO: persistir observação do aluno no banco */}
                    </td>
                  </tr>
                );
              })}
              {alunosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
                    Nenhum aluno encontrado para “{busca}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 4. Desafios enfrentados ───────────────────────── */}
      <Card title="Desafios Enfrentados">
        <div className="space-y-6">
          {/* Problemas identificados */}
          <div>
            <label
              htmlFor="problemas"
              className="mb-1.5 block text-sm font-semibold text-gray-800"
            >
              Problemas identificados
            </label>
            <textarea
              id="problemas"
              value={problemas}
              onChange={(e) => setProblemas(e.target.value)}
              rows={3}
              placeholder="Ex.: instabilidade de acesso ao AVA na primeira semana e dificuldade de alguns alunos com a plataforma; baixa frequência pontual em Ciências da Natureza."
              className="w-full resize-y rounded-lg border border-[#E5E7EB] p-3 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
            />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ticket-id"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
                >
                  Ticket ID
                </label>
                <input
                  id="ticket-id"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Ex.: SUP-1042"
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
                />
              </div>
              <div>
                <label
                  htmlFor="ticket-data"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
                >
                  Data
                </label>
                <input
                  id="ticket-data"
                  type="date"
                  value={ticketData}
                  onChange={(e) => setTicketData(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
                />
              </div>
            </div>
          </div>

          {/* Medidas paliativas */}
          <div>
            <label
              htmlFor="medidas"
              className="mb-1.5 block text-sm font-semibold text-gray-800"
            >
              Medidas Paliativas
            </label>
            <textarea
              id="medidas"
              value={medidas}
              onChange={(e) => setMedidas(e.target.value)}
              rows={3}
              placeholder="Ex.: reforço presencial nos encontros de quarta-feira, disponibilização de material offline e contato individual com alunos de frequência baixa."
              className="w-full resize-y rounded-lg border border-[#E5E7EB] p-3 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
            />
          </div>

          {/* Planilha de desempenho (link) */}
          <div>
            <label
              htmlFor="planilha"
              className="mb-1.5 block text-sm font-semibold text-gray-800"
            >
              Planilha de desempenho (link)
            </label>
            <input
              id="planilha"
              type="url"
              value={planilhaUrl}
              onChange={(e) => setPlanilhaUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#009640] focus:ring-2 focus:ring-[#EAF6EE]"
            />
            {planilhaUrl.trim() && (
              <a
                href={planilhaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#009640] underline transition hover:text-[#007A33]"
              >
                Abrir planilha de desempenho
              </a>
            )}
          </div>
          {/* TODO: persistir bloco "Desafios enfrentados" no banco */}
        </div>
      </Card>

      {/* ── Rodapé: geração de relatório (fase posterior) ──── */}
      <div className="flex flex-col items-end gap-1 border-t border-[#E5E7EB] pt-5">
        <button
          type="button"
          disabled
          title="Disponível em breve"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#9CA3AF]"
        >
          <FileDown size={16} />
          Gerar relatório (Word/PDF)
        </button>
        <span className="text-xs text-[#9CA3AF]">Disponível em breve</span>
        {/* TODO: Fase posterior — geração de Word/PDF */}
      </div>
    </div>
  );
}
