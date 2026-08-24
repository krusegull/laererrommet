import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Ingen fast oppstartsdata er nødvendig for dette schemaet ennå.
  // Denne filen kjøres automatisk av `npm run setup` / `npm run vercel-build`
  // og holdes idempotent i tilfelle vi legger til seed-data senere.
  await prisma.$queryRaw`SELECT 1`;
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
