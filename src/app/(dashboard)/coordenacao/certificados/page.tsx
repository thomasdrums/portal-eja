// Rota top-level de Certificados — reaproveita o conteúdo do relatório de certificados.
export { default } from "../relatorios/certificados/page";

// Mesma configuração de renderização dinâmica da rota reaproveitada (lê o banco a cada carga).
export const dynamic = "force-dynamic";
