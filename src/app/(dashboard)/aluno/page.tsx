"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Calendar,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  alunoResumo,
  alunoAreas,
  alunoFrequencia,
  alunoAulas,
} from "@/lib/mock-data/aluno";

// Módulos que abrem em accordion na própria página (ainda usam dados mock).
// "Solicitações" NÃO está aqui: virou uma página própria (/aluno/solicitacoes), ligada ao banco.
type Module = "notas" | "frequencia" | "aulas";

const modules: { id: Module; label: string; Icon: React.ElementType }[] = [
  { id: "notas",        label: "Notas",          Icon: Star },
  { id: "frequencia",   label: "Frequência",      Icon: Calendar },
  { id: "aulas",        label: "Aulas Gravadas",  Icon: PlayCircle },
];

// Estilo compartilhado dos cards de módulo (accordion e link usam a mesma base).
const tileBase =
  "flex flex-col items-center gap-2.5 rounded-lg border p-4 text-sm font-medium transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.06)]";
const tileInactive =
  "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#009640] hover:text-[#009640]";
const tileActive = "border-[#009640] bg-[#009640] text-white";

/* ---------- sub-content components ---------- */

function NotasContent() {
  return (
    <div className="space-y-3">
      {alunoAreas.map((area) => {
        const aprovada = area.frequencia === 100 && area.competencias.every((c) => c.nota >= 60);
        return (
          <div key={area.id} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between bg-[#009640] px-5 py-3">
              <h3 className="text-sm font-semibold text-white">{area.nome}</h3>
              <span className="flex items-center gap-1.5 rounded bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {aprovada ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {aprovada ? "APROVADO" : "EM ANDAMENTO"}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Competência</th>
                  <th className="px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Nota</th>
                  <th className="hidden px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563] sm:table-cell">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {area.competencias.map((c) => {
                  const ok = c.nota >= 60;
                  return (
                    <tr key={c.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.id}</td>
                      <td className={`px-5 py-3 text-center text-sm font-bold ${ok ? "text-[#009640]" : "text-red-500"}`}>
                        {c.nota}
                      </td>
                      <td className="hidden px-5 py-3 text-center sm:table-cell">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${ok ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-600"}`}>
                          {ok ? "Aprovado" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
                  <td className="px-5 py-2.5 text-xs text-[#4B5563]">Frequência</td>
                  <td colSpan={2} className="px-5 py-2.5 text-right">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${area.frequencia === 100 ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-600"}`}>
                      {area.frequencia}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
            {aprovada && (
              <div className="border-t border-[#E5E7EB] bg-[#EAF6EE] px-5 py-3">
                <a
                  href={area.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#007A33] hover:underline"
                >
                  <ExternalLink size={14} />
                  Entrar no grupo da próxima etapa
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FrequenciaContent() {
  const totalPresencas = alunoFrequencia.reduce((s, a) => s + a.presencas, 0);
  const totalAulas = alunoFrequencia.reduce((s, a) => s + a.totalAulas, 0);
  const totalFaltas = totalAulas - totalPresencas;
  const pctGeral = Math.round((totalPresencas / totalAulas) * 100);

  return (
    <div className="space-y-4">
      {/* Resumo geral */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">Frequência Geral</p>
        <div className="mb-3 flex items-end gap-3">
          <span className="text-4xl font-bold text-gray-900">{pctGeral}%</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div className="h-full rounded-full bg-[#009640]" style={{ width: `${pctGeral}%` }} />
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] text-center text-sm">
          <div className="px-3">
            <p className="text-xs text-[#4B5563]">Presenças</p>
            <p className="text-xl font-bold text-[#009640]">{totalPresencas}</p>
          </div>
          <div className="px-3">
            <p className="text-xs text-[#4B5563]">Faltas</p>
            <p className="text-xl font-bold text-red-500">{totalFaltas}</p>
          </div>
          <div className="px-3">
            <p className="text-xs text-[#4B5563]">Total</p>
            <p className="text-xl font-bold text-gray-700">{totalAulas}</p>
          </div>
        </div>
      </div>

      {/* Tabela por área */}
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#009640]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-white">Área</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white">Presenças</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white">Faltas</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white">Total</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {alunoFrequencia.map((item) => {
              const faltas = item.totalAulas - item.presencas;
              const pct = Math.round((item.presencas / item.totalAulas) * 100);
              const ok = pct === 100;
              return (
                <tr key={item.area} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-medium text-gray-800">{item.area}</td>
                  <td className="px-5 py-3 text-center text-[#009640] font-semibold">{item.presencas}</td>
                  <td className="px-5 py-3 text-center text-red-500 font-semibold">{faltas}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{item.totalAulas}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${ok ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-500"}`}>
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AulasContent() {
  const areaOrder = ["Matemática", "Linguagens", "Ciências da Natureza", "Ciências Humanas", "Interárea"];
  const byArea = areaOrder
    .map((area) => ({
      area,
      aulas: alunoAulas.filter((a) => a.area === area),
    }))
    .filter((g) => g.aulas.length > 0);

  return (
    <div className="space-y-4">
      {byArea.map(({ area, aulas }) => (
        <div key={area} className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#009640] px-5 py-3">
            <span className="text-sm font-semibold text-white">{area}</span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
              {aulas.length} aula{aulas.length !== 1 ? "s" : ""}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563]">Título</th>
                <th className="hidden px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563] sm:table-cell">Data</th>
                <th className="px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {aulas.map((aula) => (
                <tr key={aula.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{aula.titulo}</p>
                    <p className="text-[11px] text-[#4B5563] sm:hidden">{aula.data}</p>
                  </td>
                  <td className="hidden px-5 py-3 text-[#4B5563] sm:table-cell">{aula.data}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={aula.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded bg-[#009640] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#007A33]"
                      >
                        <PlayCircle size={12} />
                        Aula
                      </a>
                      <a
                        href={aula.formularioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded border border-[#D9D9D9] px-2.5 py-1.5 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F5F5F5]"
                      >
                        <CheckCircle2 size={12} />
                        Presença
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

/* ---------- main page ---------- */

export default function AlunoDashboardPage() {
  const [active, setActive] = useState<Module | null>(null);

  const firstName = alunoResumo.nome.split(" ")[0];

  const contentMap: Record<Module, React.ReactNode> = {
    notas:        <NotasContent />,
    frequencia:   <FrequenciaContent />,
    aulas:        <AulasContent />,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Bem-vindo, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">{alunoResumo.turma}</p>
      </div>

      {/* Módulos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {modules.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(isActive ? null : id)}
              className={`${tileBase} ${isActive ? tileActive : tileInactive}`}
            >
              <Icon size={22} />
              <span>{label}</span>
              {isActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          );
        })}

        {/* Solicitações é uma página própria, ligada ao banco (grava de verdade). */}
        <Link href="/aluno/solicitacoes" className={`${tileBase} ${tileInactive}`}>
          <FileText size={22} />
          <span>Solicitações</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Conteúdo do módulo ativo */}
      {active && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            {modules.find((m) => m.id === active)?.label}
          </h2>
          {contentMap[active]}
        </section>
      )}
    </div>
  );
}
