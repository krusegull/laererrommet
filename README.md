# Lærerrommet

Et verktøy for lærere som ønsker å gi mer presise tilbakemeldinger på elevtekster,
og ha undervisningsopplegg samlet på ett sted.

## Funksjoner

- **Elever og tilbakemeldinger** — lim inn elevtekster, marker utdrag direkte i
  teksten og gi tilbakemelding som «styrke» eller «utviklingsområde». Alle
  tilbakemeldinger lagres per elev, slik at du kan slå opp tidligere styrker og
  utviklingsområder neste gang du skal gi tilbakemelding.
- **Undervisningsopplegg** — last opp filer (PDF, Word, PowerPoint m.m.) sortert
  på fag. Kommer ferdig med Norsk, Samfunnsfag og KRLE, og du kan legge til flere
  fag selv.

## Teknologi

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://prisma.io) med PostgreSQL (f.eks. [Neon](https://neon.tech),
  som har et gratisnivå)
- Opplastede filer lagres direkte i databasen (som binærdata) — ikke på disk,
  slik at oppsettet fungerer på serverless hosting som Vercel uten eget
  objektlager

## Kom i gang

```bash
cp .env.example .env   # legg inn DATABASE_URL fra Neon (eller annen Postgres)
npm install
npm run setup   # genererer Prisma-klient, kjører migrasjoner og legger inn Norsk/Samfunnsfag/KRLE
npm run dev
```

Appen kjører på [http://localhost:3000](http://localhost:3000).

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
