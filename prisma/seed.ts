import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IDEAS: { title: string; category: string }[] = [
  { title: "Klasseprofil-chatbot som lærer hva som fungerer i din klasse", category: "Pedagogikk" },
  { title: "Kompetansemål fra LK20 strukturert og søkbart", category: "Pedagogikk" },
  { title: "Kjerneelementer per fag", category: "Pedagogikk" },
  { title: "Tverrfaglig undervisningsplanlegging med KI", category: "Pedagogikk" },
  { title: "Undervisningsbanken med rating og erfaringsdeling", category: "Fellesskap" },
  { title: "Felleskalender med fargekodede anbefalinger", category: "Fellesskap" },
  { title: "Lærerprofil med styrker og svakheter (privat)", category: "Fellesskap" },
  { title: "Faglige statusoppdateringer — erstatter Facebook-grupper", category: "Fellesskap" },
  { title: "Forskningsdelen — kuraterte teoretikere og nyere forskning", category: "Pedagogikk" },
  { title: "Semesteroppsummering basert på tilbakemeldingslogg", category: "KI-verktøy" },
  { title: "Forum for KI-diskusjoner blant lærere", category: "Fellesskap" },
  { title: "Min faglige utvikling — portefølje over kurs og bidrag", category: "Fellesskap" },
  { title: "Ønsker til appen — brukerne stemmer på forbedringer", category: "Teknisk" },
  { title: "Skoleledelse — rektorer får oversikt over skolen", category: "Teknisk" },
  { title: "KI-analyse av klassens utvikling over tid (GDPR-trygt)", category: "KI-verktøy" },
  { title: "Hurtigsøk med / som snarvei på tvers av alt", category: "Teknisk" },
  { title: "Ukentlig KI-sammendrag på e-post hver mandag", category: "KI-verktøy" },
  { title: "Push-varsling via PWA på mobil", category: "Teknisk" },
  { title: "Privat meldingschat mellom lærere", category: "Fellesskap" },
  { title: "Automatisk feilhåndtering med retry og rapportering", category: "Teknisk" },
];

async function main() {
  const existingCount = await prisma.idea.count();
  if (existingCount === 0) {
    await prisma.idea.createMany({ data: IDEAS });
    console.log(`Seedet ${IDEAS.length} ideer.`);
  } else {
    console.log("Idea-tabellen har allerede data — hopper over seed.");
  }
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
