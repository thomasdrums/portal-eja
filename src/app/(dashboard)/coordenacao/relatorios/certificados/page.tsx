import { listarCertificados } from "@/lib/queries/certificados";
import CertificadosClient from "./certificados-client";

// Lê o estado atual da documentação do banco a cada carga (revalidado pelas actions).
export const dynamic = "force-dynamic";

export default async function RelatorioCertificadosPage() {
  const rows = await listarCertificados();
  return <CertificadosClient rows={rows} />;
}
