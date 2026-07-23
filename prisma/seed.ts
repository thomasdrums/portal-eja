// Seed idempotente do Portal EJA SESI.
// Roda com: npx prisma db seed  (usa upsert → pode rodar várias vezes sem duplicar).
// NÃO altera código da aplicação nem os mocks — apenas popula o banco.

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
// Fonte única dos totais de habilidades — mesma usada nas telas, para não divergir.
import { COMPETENCIAS_CONFIG, type AreaConfigId } from "../src/lib/competencias-config";

const prisma = new PrismaClient();

// ── Áreas ────────────────────────────────────────────────
// interarea → só frequência, sem competências (temNotas false).
const AREAS = [
  { slug: "matematica", nome: "Matemática", temNotas: true, ordem: 1 },
  { slug: "linguagens", nome: "Linguagens", temNotas: true, ordem: 2 },
  { slug: "ciencias-natureza", nome: "Ciências da Natureza", temNotas: true, ordem: 3 },
  { slug: "ciencias-humanas", nome: "Ciências Humanas", temNotas: true, ordem: 4 },
  { slug: "interarea", nome: "Interárea", temNotas: false, ordem: 5 },
] as const;

// Polos (upsert por nome, que é único).
const POLOS = ["Caruaru", "Recife"] as const;

// Mapeia a chave do competencias-config.ts para o slug da tabela Area.
const CONFIG_TO_SLUG: Record<AreaConfigId, string> = {
  matematica: "matematica",
  linguagens: "linguagens",
  cienciasNatureza: "ciencias-natureza",
  cienciasHumanas: "ciencias-humanas",
};

// Número de aulas PREVISTAS por competência (currículo do cliente).
// Usado no cálculo de frequência (total exigido = aulas das competências não certificadas).
const AULAS_POR_COMPETENCIA: Record<AreaConfigId, Record<string, number>> = {
  matematica:       { C1: 2, C2: 5, C3: 4, C4: 1, C5: 2 },
  linguagens:       { C1: 3, C2: 5, C3: 3, C4: 3 },
  cienciasNatureza: { C1: 2, C2: 3, C3: 4, C4: 1 },
  cienciasHumanas:  { C1: 4, C2: 2, C3: 2, C4: 2 },
};

// ── Usuários de login (mesmos e-mails/senhas dos mocks) ──
// Senhas em texto puro só para o seed de teste; hash gerado por bcryptjs (mesmo método do login).
const USERS = [
  { email: "aluno@eja.com", name: "Maria Souza", role: Role.ALUNO, senha: "aluno123" },
  { email: "professor@eja.com", name: "João Pereira", role: Role.PROFESSOR, senha: "professor123" },
  { email: "coordenacao@eja.com", name: "Ana Lima", role: Role.COORDENACAO, senha: "coord123" },
] as const;

async function main() {
  // 1) Áreas
  const areaIdBySlug: Record<string, string> = {};
  for (const a of AREAS) {
    const area = await prisma.area.upsert({
      where: { slug: a.slug },
      update: { nome: a.nome, temNotas: a.temNotas, ordem: a.ordem },
      create: { slug: a.slug, nome: a.nome, temNotas: a.temNotas, ordem: a.ordem },
    });
    areaIdBySlug[a.slug] = area.id;
  }

  // 1b) Polos (upsert por nome único).
  for (const nome of POLOS) {
    await prisma.polo.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  // 2) Competências (habilidades vindas de COMPETENCIAS_CONFIG). Interárea não tem competências.
  let competenciasCount = 0;
  for (const [configId, slug] of Object.entries(CONFIG_TO_SLUG) as [AreaConfigId, string][]) {
    const areaId = areaIdBySlug[slug];
    const comps = COMPETENCIAS_CONFIG[configId].competencias; // { C1: 4, C2: 7, ... }
    const codigos = Object.keys(comps);
    for (let i = 0; i < codigos.length; i++) {
      const codigo = codigos[i];
      const habilidades = comps[codigo];
      const aulas = AULAS_POR_COMPETENCIA[configId]?.[codigo] ?? 0;
      await prisma.competencia.upsert({
        where: { areaId_codigo: { areaId, codigo } },
        update: { habilidades, aulas, ordem: i + 1 },
        create: { areaId, codigo, habilidades, aulas, ordem: i + 1 },
      });
      competenciasCount++;
    }
  }

  // 3) Usuários de login + vínculos Aluno/Professor
  const userIdByEmail: Record<string, string> = {};
  for (const u of USERS) {
    const passwordHash = bcrypt.hashSync(u.senha, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { email: u.email, name: u.name, role: u.role, passwordHash },
    });
    userIdByEmail[u.email] = user.id;
  }

  // Aluno vinculado ao user aluno@eja.com (upsert pelo RA único).
  await prisma.aluno.upsert({
    where: { ra: "2026000001" },
    update: { nome: "Maria Souza", userId: userIdByEmail["aluno@eja.com"] },
    create: {
      nome: "Maria Souza",
      ra: "2026000001",
      cidade: "Caruaru",
      etapa: "AVA",
      situacao: "CURSANDO",
      userId: userIdByEmail["aluno@eja.com"],
    },
  });

  // Professor vinculado ao user professor@eja.com, área = matematica (upsert pelo userId único).
  await prisma.professor.upsert({
    where: { userId: userIdByEmail["professor@eja.com"] },
    update: { nome: "João Pereira", areaId: areaIdBySlug["matematica"] },
    create: {
      nome: "João Pereira",
      areaId: areaIdBySlug["matematica"],
      userId: userIdByEmail["professor@eja.com"],
    },
  });

  // 4) Resumo
  const [areas, polos, competencias, users, alunos, professores] = await Promise.all([
    prisma.area.count(),
    prisma.polo.count(),
    prisma.competencia.count(),
    prisma.user.count(),
    prisma.aluno.count(),
    prisma.professor.count(),
  ]);
  console.log("Seed concluído (idempotente).");
  console.log(`  Áreas:        ${areas}`);
  console.log(`  Polos:        ${polos}`);
  console.log(`  Competências: ${competencias} (esperado 17: 5+4+4+4)`);
  console.log(`  Usuários:     ${users}`);
  console.log(`  Alunos:       ${alunos}`);
  console.log(`  Professores:  ${professores}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
