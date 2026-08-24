# Lærerrommet

Den digitale kollegaen for norske lærere — trygg KI-veiledning, tilbakemeldingslogg
for elever, og et privat rom for faglig refleksjon.

## Funksjoner

- **KI-veilederen** — chat med praktisk, trygg veiledning om KI-bruk i skolen,
  basert på Oslo kommunes retningslinjer.
- **Tilbakemeldingslogg** — hold styr på styrker og utviklingsområder for
  elevene dine over tid, med KI-genererte forslag til øvingsoppdrag,
  IOP-punkter og semesteroppsummeringer. Elever registreres kun med en
  anonymisert merkelapp — elevnavn og elevtekster sendes aldri til KI.
- **Meg (Lærerplanleggeren)** — et privat rom for kollegatips, periodisk
  refleksjon og egenvurdering, der KI hjelper deg se mønstre over tid. Kun
  synlig for deg selv.
- Brukerkontoer med innlogging, onboarding-flyt og mørk modus.

## Teknologi

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://prisma.io) med PostgreSQL (f.eks. [Neon](https://neon.tech),
  som har et gratisnivå)
- [NextAuth.js](https://next-auth.js.org) med e-post/passord-innlogging
  (bcryptjs for hashing)
- [Anthropic API](https://www.anthropic.com) for KI-funksjonene
- Opplastede filer og all appdata lagres i databasen — ikke på disk, slik at
  oppsettet fungerer på serverless hosting som Vercel

## Kom i gang

```bash
cp .env.example .env   # se under for hvilke variabler som må settes
npm install
npm run setup   # genererer Prisma-klient og kjører migrasjoner
npm run dev
```

Appen kjører på [http://localhost:3000](http://localhost:3000).

### Miljøvariabler

| Variabel | Beskrivelse |
|---|---|
| `DATABASE_URL` | Postgres-connection-string, f.eks. fra Neon |
| `NEXTAUTH_SECRET` | Tilfeldig streng som signerer økter — generer med `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL-en appen kjører på (`http://localhost:3000` lokalt) |
| `ANTHROPIC_API_KEY` | API-nøkkel fra [console.anthropic.com](https://console.anthropic.com) — kreves for KI-veilederen og de andre KI-funksjonene |

Uten `ANTHROPIC_API_KEY` fungerer resten av appen normalt, men KI-funksjonene
viser en vennlig feilmelding i stedet for å svare.

Kjører du dette i Claude Code on the web, gjør `.claude/hooks/session-start.sh`
`npm install` og `npm run setup` automatisk ved hver ny økt, slik at databasen
alltid er klar (forutsatt at `DATABASE_URL` er satt).

## Produksjon

```bash
npm run build
npm run start
```

## Deploy (hosting)

Se [DEPLOY.md](./DEPLOY.md) for steg-for-steg oppskrift på å deploye appen til
Vercel med Neon som database — begge har gratisnivåer som dekker dette
bruksomfanget.
