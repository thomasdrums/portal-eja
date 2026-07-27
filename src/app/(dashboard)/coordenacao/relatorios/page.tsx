import Link from "next/link";
import {
  ChevronLeft,
  Users,
  GraduationCap,
  BookOpen,
  BarChart2,
  CalendarCheck,
  Award,
} from "lucide-react";

// Índice dos relatórios da coordenação. Cada card leva a um relatório ligado ao banco.
const RELATORIOS = [
  {
    href: "/coordenacao/relatorios/alunos",
    Icon: GraduationCap,
    title: "Alunos",
    desc: "Lista de alunos com polo, turma, cidade e situação",
  },
  {
    href: "/coordenacao/relatorios/professores",
    Icon: Users,
    title: "Professores",
    desc: "Professores por polo, com turmas, alunos e aulas",
  },
  {
    href: "/coordenacao/relatorios/turmas",
    Icon: BookOpen,
    title: "Turmas",
    desc: "Turmas por polo, situação dos alunos e frequência",
  },
  {
    href: "/coordenacao/relatorios/por-turma",
    Icon: BarChart2,
    title: "Relatório por Turma",
    desc: "Selecione uma turma para o resumo analítico completo",
  },
  {
    href: "/coordenacao/relatorios/frequencia",
    Icon: CalendarCheck,
    title: "Frequência",
    desc: "Frequência calculada por aluno e área",
  },
  {
    href: "/coordenacao/relatorios/certificados",
    Icon: Award,
    title: "Certificados",
    desc: "Histórico entregue, emissão e entrega",
  },
] as const;

export default function RelatoriosPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/coordenacao"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline"
      >
        <ChevronLeft size={15} />
        Visão Geral
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Selecione um relatório</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RELATORIOS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-[#009640] hover:shadow-[0_1px_6px_rgba(0,150,64,0.12)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#EAF6EE]">
              <r.Icon size={20} className="text-[#009640]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#009640]">
                {r.title}
              </p>
              <p className="mt-0.5 text-xs text-[#4B5563]">{r.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
