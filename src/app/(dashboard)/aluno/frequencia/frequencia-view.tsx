import type { AreaFrequencia, FrequenciaAluno } from "@/lib/queries/frequencia";

// Componente só de apresentação (sem estado e sem acesso ao banco): serve tanto
// à página /aluno/frequencia quanto ao accordion do painel /aluno.

function Selo({ area }: { area: AreaFrequencia }) {
  if (area.semExigencia) {
    return (
      <span className="rounded bg-[#EAF6EE] px-2.5 py-0.5 text-[11px] font-bold text-[#007A33]">
        Dispensado
      </span>
    );
  }
  return (
    <span
      className={`rounded px-2.5 py-0.5 text-[11px] font-bold ${
        area.atingiuMinimo ? "bg-[#EAF6EE] text-[#007A33]" : "bg-red-50 text-red-500"
      }`}
    >
      {area.percentual}%
    </span>
  );
}

export default function FrequenciaAlunoView({
  frequencia,
}: {
  frequencia: FrequenciaAluno;
}) {
  const { geral, areas, temTurma, interareaValidadas } = frequencia;

  if (!temTurma) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Você ainda não está em uma turma, por isso não há aulas para contar frequência. Fale com a
        coordenação.
      </div>
    );
  }

  const dispensadas = areas.flatMap((a) =>
    a.competencias.filter((c) => c.dispensada).map((c) => ({ area: a.nome, codigo: c.codigo })),
  );

  return (
    <div className="space-y-4">
      {/* Resumo geral */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
          Frequência Geral
        </p>

        {geral.semExigencia ? (
          <p className="text-sm text-[#4B5563]">
            <span className="text-2xl font-bold text-[#007A33]">100%</span>
            <span className="ml-2">
              Todas as suas competências estão certificadas — não há aulas pendentes.
            </span>
          </p>
        ) : (
          <>
            <div className="mb-3 flex items-end gap-3">
              <span className="text-4xl font-bold text-gray-900">{geral.percentual}%</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#009640] transition-all"
                style={{ width: `${geral.percentual}%` }}
              />
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] text-center">
              <div className="px-4">
                <p className="text-xs text-[#4B5563]">Presenças</p>
                <p className="text-2xl font-bold text-[#009640]">{geral.presencas}</p>
              </div>
              <div className="px-4">
                <p className="text-xs text-[#4B5563]">Faltam</p>
                <p className="text-2xl font-bold text-red-500">
                  {Math.max(0, geral.totalExigido - geral.presencas)}
                </p>
              </div>
              <div className="px-4">
                <p className="text-xs text-[#4B5563]">Exigidas</p>
                <p className="text-2xl font-bold text-gray-700">{geral.totalExigido}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabela por área */}
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#009640]">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white">Área</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Presenças</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Faltam</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Exigidas</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-white">Frequência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {areas.map((area) => (
                <tr key={area.slug} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3.5 font-medium text-gray-800">
                    {area.nome}
                    {area.competencias.some((c) => c.dispensada) && (
                      <span className="mt-0.5 block text-[11px] font-normal text-[#9CA3AF]">
                        Dispensado em{" "}
                        {area.competencias
                          .filter((c) => c.dispensada)
                          .map((c) => c.codigo)
                          .join(", ")}{" "}
                        (certificada)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-[#009640]">
                    {area.presencas}
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-red-500">
                    {area.semExigencia ? "—" : area.faltam}
                  </td>
                  <td className="px-5 py-3.5 text-center text-[#4B5563]">
                    {area.semExigencia ? "—" : area.totalExigido}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Selo area={area} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1 border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-2.5">
          <p className="text-xs text-[#4B5563]">
            As aulas <strong>Interárea</strong> contam presença nas quatro áreas ao mesmo tempo.
            {interareaValidadas > 0
              ? ` Você tem ${interareaValidadas} resposta${
                  interareaValidadas > 1 ? "s" : ""
                } interárea validada${interareaValidadas > 1 ? "s" : ""}.`
              : ""}
          </p>
          {dispensadas.length > 0 && (
            <p className="text-xs text-[#4B5563]">
              Competências certificadas não exigem mais aulas:{" "}
              {dispensadas.map((d) => `${d.area} ${d.codigo}`).join(" · ")}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
