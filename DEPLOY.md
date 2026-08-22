# Deploy til Fly.io

Appen bruker SQLite og lagrer opplastede filer på disk, så vi trenger en
plattform med **vedvarende lagring** (persistent volum) — ikke en ren
serverless-plattform som Vercel, hvor disken forsvinner mellom hver
forespørsel. Fly.io er valgt fordi det er enkelt, billig for dette
bruksomfanget, og støtter persistent volum uten kodeendringer.

Alt oppsett (Dockerfile, `fly.toml`, migrasjons-/seed-script som kjører ved
oppstart) ligger allerede i repoet. Du trenger bare å opprette en Fly.io-konto
og kjøre noen kommandoer selv — jeg har ikke tilgang til kontoen din.

## Engangsoppsett

1. **Installer flyctl** (Fly.io sitt kommandolinjeverktøy):

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Logg inn:**

   ```bash
   fly auth login
   ```

3. **Sjekk at appnavnet i `fly.toml` er ledig.** Appnavn må være globalt
   unike på Fly.io. Hvis `laererrommet` er opptatt, endre `app = "..."` i
   `fly.toml` til noe unikt, f.eks. `laererrommet-ditt-navn`.

4. **Opprett appen** (uten å deploye ennå):

   ```bash
   fly apps create laererrommet   # bruk samme navn som i fly.toml
   ```

5. **Opprett et persistent volum** for database og opplastede filer.
   Bruk samme region som `primary_region` i `fly.toml` (standard: `arn`,
   Stockholm):

   ```bash
   fly volumes create laererrommet_data --region arn --size 1 -a laererrommet
   ```

   1 GB er rikelig for tekst + noen hundre undervisningsopplegg. Du kan
   utvide senere med `fly volumes extend`.

6. **Deploy:**

   ```bash
   fly deploy
   ```

   Fly bygger Docker-imaget på sine egne servere (du trenger ikke Docker
   installert lokalt) og starter appen. Ved hver oppstart kjører
   `docker-entrypoint.sh` migrasjoner og legger inn fagene Norsk,
   Samfunnsfag og KRLE automatisk hvis de ikke finnes fra før — trygt å
   kjøre på nytt.

7. Appen er nå tilgjengelig på `https://laererrommet.fly.dev` (eller
   `https://<ditt-appnavn>.fly.dev`).

## Senere deploys

Etter engangsoppsettet er alt du trenger for å publisere nye endringer:

```bash
fly deploy
```

## Om drift

- `fly.toml` er satt opp med `min_machines_running = 0`, som betyr at appen
  kan "sove" når ingen bruker den, og våkner automatisk (noen få sekunders
  oppstartstid) ved neste besøk. Dette holder kostnaden lav for en app med
  moderat bruk. Sett `min_machines_running = 1` i `fly.toml` hvis du heller
  vil ha den alltid varm (koster litt mer).
- Databasen og opplastede filer ligger på volumet montert på `/data` —
  dette overlever restarter og nye deploys.
- For å ta backup av data: `fly ssh console -a laererrommet` og kopier ut
  `/data/prod.db` og `/data/uploads/`, eller bruk `fly volumes snapshots`.
