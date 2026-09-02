# Idébank — ikke bygget ennå

Ideer produkteier (krusegulliksen@gmail.com) har nevnt underveis, men som
eksplisitt **ikke** skal bygges før det er tatt en egen avgjørelse om det.
Oppdateres etter hvert som flere ideer kommer opp eller blir avklart.

## Vurdering (nevnt 2026-08-25 — "HUSK dette")

Vurdering må inn som en egen kategori i appen. Kjerneprinsipp produkteier
understreket eksplisitt: **eleven skal vite på forhånd når den skal bli
vurdert** — ikke overraskes av vurdering i etterkant.

Rammen produkteier ga: **vurdering av læring, for læring, som læring**
(dette er en kjent pedagogisk tredeling — sammenfaller med Udirs eget
rammeverk "Vurdering for læring", som trolig bør sjekkes opp mot når
funksjonen skal spesifiseres nærmere):
- **Vurdering AV læring** — oppsummerende (f.eks. karakter, standpunkt)
- **Vurdering FOR læring** — underveis, med mål om å forbedre videre læring
- **Vurdering SOM læring** — eleven er selv aktiv i egen vurdering (egenvurdering, refleksjon)

Uavklart: nøyaktig hvordan dette skal manifestere seg i appen (egen
seksjon under Tilbakemeldingslogg? En helt egen "Vurdering"-fane? Kobling
til KI-veilederens eksisterende kunnskap om Osloskolens retningslinjer?).

## Kategori: Struktur i hverdagen (nevnt 2026-08-25)

Samlekategori for lærerens daglige/ukentlige struktur. Avklart med
produkteier: **Vikarplanleggeren og Timeplan er to separate idéer**, ikke
én — men hører sammen under denne kategorien. Tenkt å vises på forsiden
under en egen fane/seksjon kalt "Struktur i hverdagen".

### Vikarplanleggeren

Kun nevnt som overskrift, ingen detaljer avklart ennå. Mulig sammenheng
med "Abonnement" — uklart om det betyr en betalt tilleggsfunksjon for
Vikarplanleggeren spesifikt, eller en egen idé om betalingsmodell for
appen generelt.

### Timeplan

"Vi trenger en egen timeplan." Ingen detaljer avklart. Kan overlappe med
den allerede eksisterende "Kalender"-plassholderen på dashbordet
("Kommer snart") — bør avklares om det er samme idé eller noe annet.

## Lydopptak + transkribering (nevnt 2026-08-25)

Ta opp lyd og få det transkribert. Ingen detaljer om bruksområde ennå
(møtenotater? undervisningsøkter? elevsamtaler?). Merk: hvis dette
gjelder opptak som involverer elever, reiser det et eget, betydelig
GDPR-spørsmål utover det appen allerede håndterer (samtykke, lagring,
sletting av lydfiler er en annen risikoklasse enn tekstnotater).

## KI-samskriving av undervisningsopplegg (nevnt 2026-08-25)

"Læreren kan selv lage undervisningsopplegg sammen med KI." Bevisst
sekvensert til *etter* den manuelle Undervisningsbanken (bygget, ikke
ferdig QA-testet/merget per 2026-08-25), for å unngå å bygge to store
ting samtidig.

## Klikkbar kildevisning i KI-veilederen, à la NotebookLM (nevnt 2026-08-25)

I stedet for kun lenker til hele kildesider (nåværende løsning, PR #9):
del kildene opp i nummererte, lagrede tekstbiter (f.eks. `oslo-3`,
`pfdk-4-2`), la KI-en sitere med bit-ID, og vis den eksakte lagrede
teksten ved klikk — ikke noe KI-en gjenskaper der og da. Venter på
avklaring om denne skal bygges før eller etter Undervisningsbanken er
ferdigstilt.

## Eksterne læringsressurser, f.eks. NDLA (nevnt 2026-08-25)

Mulighet for å legge inn lenker til eksterne læringsressurser (NDLA
nevnt som eksempel) — trolig som en egen kategori/ressurstype, adskilt
fra opplastede filer/tekst. Uavklart om dette bør være en egen seksjon,
eller en tredje ressurstype inni Undervisningsbanken (tekst / fil /
ekstern lenke) i tillegg til de to som allerede er bygget.

## Neste-generasjons samskriving i Lærerrommet (nevnt 2026-09-01)

Problem med dagens løsninger (Google Docs m.fl.): frittflytende dokumenter
uten struktur, svak håndtering av eierskap/roller, kommentarer som blir
borte i støyen, og ingen kontekstbevisst AI-støtte i selve skriveflyten.

Konsept — særlig relevant for Undervisningsbanken og Felleskalender:

1. **Blokk-basert struktur i stedet for flatt dokument** — undervisningsopplegg
   bygges av gjenbrukbare blokker (mål, aktivitet, vurderingskriterier,
   ressurser) i stedet for løs tekst. Gjør det lettere å remixe andre
   læreres opplegg uten å starte fra scratch.
2. **Lokal-first / CRDT-basert redigering** — lærere kan redigere offline
   (f.eks. på skolen med dårlig nett) og synke sømløst senere, uten
   "noen andre redigerer akkurat nå, vent litt"-friksjon.
3. **Rolle- og eierskapsbevisst samarbeid** — tydelig hvem som er
   opphavsperson til et opplegg, hvem som har bidratt med endringer, og
   hvem som må godkjenne før det publiseres i banken — mer strukturert
   enn anonyme forslag.
4. **Strukturerte kommentarer/tilbakemeldinger** — kommentarer knyttes til
   spesifikke blokker og kan filtreres/spores over tid, f.eks. "alle
   kommentarer om vurderingskriterier på tvers av mine opplegg."
5. **KI-veilederen inn i selve skriveflyten** — ikke bare en chatbot ved
   siden av, men KI som foreslår forbedringer direkte i opplegget mens man
   skriver, basert på PfDK-rammeverket og Oslo kommunes KI-retningslinjer
   som allerede er kunnskapsbasen.

Foreslått plassering i roadmapen: naturlig utvidelse av Undervisningsbanken.
Kan starte enkelt med blokkstruktur + strukturerte kommentarer, og bygge på
CRDT/offline-støtte og dypere KI-integrasjon som en senere iterasjon når
kjernen er validert.

## Konkurrentlandskap: laererro.no (notert 2026-09-01)

Produkteier viste til https://laererro.no/ som en "konkurrent" på
undervisningsopplegg. Kunne ikke selv besøke siden (udir.no/laererro.no
er blokkert av nettverksfilteret i Claude Code-miljøet, bekreftet flere
ganger). Ifølge produkteiers egen beskrivelse: KI-generert
undervisningsopplegg med kun LK20 lagt inn, ellers ingenting utover det.

Vurdering gitt: lav trussel isolert sett — en ren "generer fra LK20"-wrapper
har lite beskyttelse siden hvem som helst kan spørre en KI-assistent om det
samme. Undervisningsbanken vår er en annen kategori (deling/vurdering av
faktisk brukte opplegg blant kolleger, ikke en generator), så ikke direkte
overlapp per nå. Relevant fremover: når "KI-samskriving av
undervisningsopplegg" (se eget punkt over) eventuelt bygges, bør den
differensiere seg fra en LK20-only-wrapper via (a) Oslo kommune/PfDK-
forankringen med kildehenvisninger KI-veilederen allerede har (sterkere enn
generisk LK20), og (b) tilgang til data fra resten av appen (elevhistorikk,
tilbakemeldingslogg) som en frittstående konkurrent ikke har.

## "LK20-GPT" — full RAG-løsning på hele Læreplanverket (nevnt 2026-09-01)

Produkteier spurte om jeg kunne "lære meg" alt på
https://www.udir.no/laring-og-trivsel/lareplanverket/ (blokkert for meg å
besøke direkte). Foreslo en RAG-arkitektur (delt av produkteier, hentet fra
en annen KI-samtale) fremfor å fine-tune en modell, siden læreplaner endres
over tid og RAG holder kunnskapen fersk uten omtrening. **Eksplisitt
instruks: ikke bygg dette før det bes om.**

Teknisk vurdering tilpasset vår stack (ikke bare det generiske forslaget):
- **Vektordatabase**: bruk `pgvector` på Neon Postgres (allerede i bruk,
  ingen ny tjeneste/kostnad) i stedet for Pinecone/Qdrant/Chroma.
- **Embeddings**: Voyage AI (Anthropics anbefalte partner) i stedet for
  OpenAI sin embeddings-API, siden KI-veilederen allerede bruker Anthropic.
- **Crawler**: kan ikke kjøres fra Claude Code-sandboxen (ingen
  nettverkstilgang til udir.no herfra). Må kjøres enten som et
  engangs-script produkteier kjører selv, eller som en Vercel-funksjon/
  cron-jobb (produksjonsmiljøet har vanlig internettilgang).
- **Oppfriskning**: periodisk re-crawl (f.eks. ukentlig) med innholds-hash
  for å bare re-embedde endret innhold — samme mønster som det
  eksisterende kalender-påminnelse-cron-jobbet.
- **Robots.txt / rate-limiting**: bør sjekkes og respekteres før bygging,
  ikke antas.
- **Omfang**: dette er vesentlig større enn funksjonene bygget i denne
  økten — et eget delsystem (crawler + chunking + vektorsøk +
  retrieval-logikk). Bør planlegges som et eget, avgrenset prosjekt, ikke
  en rask utvidelse av eksisterende KI-veilederen.
- Ville i praksis erstatte/utvide dagens håndkuraterte kildeliste i
  KI-veilederens systemprompt med en fullautomatisk, komplett og
  selvoppdaterende kunnskapsbase for hele Læreplanverket.

**Kostnad (produkteier spurte om gratis er mulig):** stort sett ja.
`pgvector` på Neon og crawleren er gratis (bare kompute). Selve
KI-svaret bruker samme Anthropic API-kall appen allerede har for
KI-veilederen — ingen ny kostnadstype, bare noe høyere input-tokens per
spørring pga. injisert kontekst. Eneste reelle valg er embeddings: en
betalt modell (Voyage/OpenAI) gir bedre søketreffkvalitet, men en gratis
åpen flerspråklig embeddings-modell kjørt lokalt (f.eks. en e5-variant)
gjør hele løsningen $0 mot noe svakere presisjon — trolig godt nok for
relativt strukturert læreplantekst.

## KI-generert podkast om valgfritt emne (nevnt 2026-09-01)

Idé: la KI-en generere en podkast (lyd) om et emne brukeren velger — f.eks.
til bruk i undervisning eller som egen faglig oppdatering. Ingen detaljer
avklart ennå (varighet, stemme(r)/TTS-leverandør, om det skal være
knyttet til Læreplanverket/fag, om lærer eller elev er tiltenkt lytter,
lagring/deling av genererte episoder). Ikke bygg før det bes om.

## Allerede plassholdere på dashbordet ("Kommer snart"), ikke fra denne samtalen

Del av opprinnelig spesifikasjon, aldri bygget ut:
- **Klasseprofil** — samlet oversikt og notater for klassene dine
- **Kalender** — planlegge undervisning, holde styr på datoer (se ev. overlapp med Timeplan over)
- **Faglig feed** — nyheter/innsikt relevant for undervisningen
- **Forskning** — forskningsbasert kunnskap oversatt til klasserommet
