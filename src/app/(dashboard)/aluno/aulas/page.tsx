import Link from "next/link";
import { ChevronLeft, PlayCircle, CheckCircle2 } from "lucide-react";
import { alunoAulas } from "@/lib/mock-data/aluno";

const areaOrder = [
  "Matemática",
  "Linguagens",
  "Ciências da Natureza",
  "Ciências Humanas",
  "Interárea",
];

export default function AulasPage() {
  const byArea = areaOrder
    .map((area) => ({
      area,
      aulas: alunoAulas
        .filter((a) => a.area === area)
        .sort((a, b) => {
          const parse = (d: string) => {
            const [day, month, year] = d.split("/").map(Number);
            return new Date(year!, month! - 1, day!).getTime();
          };
          return parse(a.data) - parse(b.data);
        }),
    }))
    .filter((g) => g.aulas.length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/aluno"
          className="flex items-center gap-1 text-sm font-medium text-[#009640] hover:underline"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Aulas Gravadas</h1>
        <p className="mt-0.5 text-sm text-[#4B5563]">Acesse as aulas gravadas e registre sua presença</p>
      </div>

      <div className="space-y-4">
        {byArea.map(({ area, aulas }) => (
          <div
            key={area}
            className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
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
                  <th className="hidden px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563] sm:table-cell">Professor</th>
                  <th className="hidden px-5 py-2.5 text-left text-xs font-semibold text-[#4B5563] md:table-cell">Data</th>
                  <th className="px-5 py-2.5 text-center text-xs font-semibold text-[#4B5563]">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {aulas.map((aula) => (
                  <tr key={aula.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{aula.titulo}</p>
                      <p className="text-[11px] text-[#4B5563] sm:hidden">{aula.professor}</p>
                    </td>
                    <td className="hidden px-5 py-3 text-[#4B5563] sm:table-cell">{aula.professor}</td>
                    <td className="hidden px-5 py-3 text-[#4B5563] md:table-cell">{aula.data}</td>
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
    </div>
  );
}
