import {
  listarProfessores,
  listarAreas,
  listarPolos,
  listarTurmasOpcoes,
} from "@/lib/queries/professores";
import GestaoProfessoresClient from "./gestao-professores-client";

export const dynamic = "force-dynamic";

export default async function GestaoProfessoresPage() {
  const [professores, areas, polos, turmas] = await Promise.all([
    listarProfessores(),
    listarAreas(),
    listarPolos(),
    listarTurmasOpcoes(),
  ]);
  return (
    <GestaoProfessoresClient
      professoresIniciais={professores}
      areas={areas}
      polos={polos}
      turmas={turmas}
    />
  );
}
