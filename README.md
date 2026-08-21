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
npm install
npx prisma migrate deploy   # oppretter dev.db og kjører migrasjoner
npm run db:seed             # legger inn fagene Norsk, Samfunnsfag og KRLE
npm run dev
```

Appen kjører på [http://localhost:3000](http://localhost:3000).

## Produksjon

```bash
npm run build
npm run start
```

Databasen (`dev.db`) og opplastede filer (`data/uploads/`) er ikke sjekket inn
i git — sørg for at disse blir liggende på et vedvarende volum ved
selvhosting, slik at data ikke går tapt ved omstart.
