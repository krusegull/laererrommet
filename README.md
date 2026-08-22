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
- [Prisma](https://prisma.io) med SQLite som database (ingen ekstern database
  nødvendig, alt kjører lokalt i én fil)
- Opplastede filer lagres på disk under `data/uploads/`

## Kom i gang

```bash
cp .env.example .env
npm install
npm run setup   # genererer Prisma-klient, kjører migrasjoner og legger inn Norsk/Samfunnsfag/KRLE
npm run dev
```

Appen kjører på [http://localhost:3000](http://localhost:3000).

Kjører du dette i Claude Code on the web, gjør `.claude/hooks/session-start.sh`
`npm install` og `npm run setup` automatisk ved hver ny økt, slik at databasen
alltid er klar.

## Produksjon

```bash
npm run build
npm run start
```

Databasen (`dev.db`) og opplastede filer (`data/uploads/`) er ikke sjekket inn
i git — sørg for at disse blir liggende på et vedvarende volum ved
selvhosting, slik at data ikke går tapt ved omstart.

## Deploy (hosting)

Se [DEPLOY.md](./DEPLOY.md) for steg-for-steg oppskrift på å deploye appen til
Fly.io, med vedvarende lagring for database og opplastede filer.
