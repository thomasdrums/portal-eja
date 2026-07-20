import Link from "next/link";
import { ChevronLeft, Users, BookOpen, GraduationCap } from "lucide-react";

const ITENS = [
  { href: "/coordenacao/professores",   Icon: Users,         title: "Gestão de Professores", desc: "Cadastrar, editar e inativar professores" },
  { href: "/coordenacao/gestao-turmas", Icon: BookOpen,      title: "Gestão de Turmas",       desc: "Criar, editar e encerrar turmas" },
  { href: "/coordenacao/gestao-alunos", Icon: GraduationCap, title: "Gestão de Alunos",       desc: "Editar dados, redefinir senha e ativar/inativar alunos" },
] as const;

export default function GestaoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/coordenacao" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:underline">
        <ChevronLeft size={15} />
        Visão Geral
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">Gestão</h1>

      <div className="space-y-3">
        {ITENS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-[#009640] hover:shadow-[0_1px_6px_rgba(0,150,64,0.12)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#EAF6EE]">
              <item.Icon size={20} className="text-[#009640]" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 group-hover:text-[#009640]">{item.title}</p>
              <p className="mt-0.5 text-xs text-[#4B5563]">{item.desc}</p>
            </div>
            <ChevronLeft size={16} className="ml-auto shrink-0 rotate-180 text-gray-300 group-hover:text-[#009640]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
