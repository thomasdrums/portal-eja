import {
  listarProfessores,
  listarProfessoresArquivados,
  listarAreas,
  listarPolos,
  listarTurmasOpcoes,
} from "@/lib/queries/professores";
import GestaoProfessoresClient from "./gestao-professores-client";

export const dynamic = "force-dynamic";

export default async function GestaoProfessoresPage() {
  const [professores, arquivados, areas, polos, turmas] = await Promise.all([
    listarProfessores(),
    listarProfessoresArquivados(),
    listarAreas(),
    listarPolos(),
    listarTurmasOpcoes(),
  ]);
  return (
    <GestaoProfessoresClient
      professoresIniciais={professores}
      arquivadosIniciais={arquivados}
      areas={areas}
      polos={polos}
      turmas={turmas}
    />
  );
}
