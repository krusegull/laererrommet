# Deploy til Vercel + Neon

Appen bruker PostgreSQL (via Neon) for både data og opplastede filer — filene
lagres direkte i databasen som binærdata, så du trenger ikke noe eget
objektlager. Det holder hele oppsettet innenfor Vercel og Neons gratisnivåer
for dette bruksomfanget.

## Engangsoppsett

1. **Opprett en Neon-database:**
   - Gå til [neon.tech](https://neon.tech) → New Project
   - Kopier connection-stringen (den som starter med `postgresql://...`)

2. **Importer repoet i Vercel:**
   - Gå til [vercel.com](https://vercel.com) → Add New → Project
   - Velg `krusegull/laererrommet` fra GitHub

3. **Sett miljøvariabel:**
   - Under prosjektets Settings → Environment Variables, legg til:
     - `DATABASE_URL` = connection-stringen fra Neon

4. **Overstyr build-kommandoen:**
   - Under Settings → Build & Development Settings → Build Command, skru på
     "Override" og sett den til:
     ```
     npm run vercel-build
     ```
   - Dette kjører databasemigrasjoner og legger inn fagene Norsk, Samfunnsfag
     og KRLE automatisk før appen bygges — trygt å kjøre på hvert deploy.

5. **Deploy.** Vercel bygger og publiserer appen automatisk. Du får en URL
   på formen `https://laererrommet.vercel.app`.

## Senere deploys

Hver `git push` til `main` trigger et nytt deploy automatisk — ingenting mer
du trenger å gjøre.

## Lokal utvikling mot Neon

Du kan også peke din lokale `.env` til samme (eller en egen) Neon-database:

```bash
# .env
DATABASE_URL="postgresql://...neon.tech/..."
```

```bash
npm install
npm run setup
npm run dev
```

## Om drift

- Neons gratisnivå er godt innenfor det denne appen trenger for én lærer.
- Filene (undervisningsopplegg) lagres som binærdata i Postgres — hold et
  øye med Neons lagringsgrense hvis du laster opp svært mange eller store
  filer.
- For backup: bruk Neons innebygde "Branching"/point-in-time-restore, eller
  `pg_dump` mot connection-stringen.
