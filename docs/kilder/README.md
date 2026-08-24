# Kildedokumentasjon for KI-veilederen

Denne mappen inneholder kildegrunnlaget bak KI-veilederens systemprompt
(`src/app/api/chat/route.ts`).

`ki-veilederen-kilder.md` er den nåværende kilden. Claude Code sin
byggemiljø-økt har ikke utgående nettilgang til udir.no (organisasjonens
nettverkspolicy blokkerer det med en eksplisitt 403), så innholdet er
hentet av produkteier via et nettleseraktivert KI-verktøy og limt inn i
samtalen. Det er ikke verifisert ord-for-ord mot primærkildene av Claude
Code selv.

## Slik oppdaterer du kildene

1. Hent oppdatert tekst fra primærkildene (lenker i
   `ki-veilederen-kilder.md`), f.eks. via claude.ai, ChatGPT eller
   Perplexity med nettsøk aktivert.
2. Oppdater `ki-veilederen-kilder.md` med den nye teksten.
3. Be Claude Code oppdatere `SYSTEM_PROMPT` i
   `src/app/api/chat/route.ts` tilsvarende.
4. Test i KI-veilederen at svarene reflekterer endringen, og at kildene
   som oppgis i svarene fortsatt stemmer.
