import Link from "next/link";
import { Settings2, BookOpen, BarChart2, FileText, Award, GraduationCap } from "lucide-react";

const MODULOS = [
  {
    href: "/coordenacao/gestao",
    Icon: Settings2,
    title: "Gestão",
    desc: "Professores e turmas",
  },
  {
    href: "/coordenacao/acompanhamento",
    Icon: BookOpen,
    title: "Acompanhamento",
    desc: "Situação das turmas e alunos",
  },
  {
    href: "/coordenacao/relatorios",
    Icon: BarChart2,
    title: "Relatórios",
    desc: "Relatório por turma completo",
  },
  {
    href: "/coordenacao/relatorios/solicitacoes",
    Icon: FileText,
    title: "Documentos",
    desc: "Solicitações de documentos",
  },
  {
    href: "/coordenacao/relatorios/certificados",
    Icon: Award,
    title: "Certificados",
    desc: "Emissão e entrega",
  },
  {
    href: "/coordenacao/relatorios/concluintes",
    Icon: GraduationCap,
    title: "Concluintes",
    desc: "Alunos que concluíram",
  },
] as const;

export default function CoordenacaoDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Portal EJA SESI</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Coordenação — Acesso aos módulos</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-[#009640] hover:shadow-[0_1px_6px_rgba(0,150,64,0.12)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#EAF6EE]">
              <m.Icon size={20} className="text-[#009640]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#009640]">
                {m.title}
              </p>
              <p className="mt-0.5 text-xs text-[#4B5563]">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
