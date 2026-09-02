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

**Oppdatering 2026-09-01**: produkteier er med i et vurderingsnettverk og
understreker at skillet mellom **underveisvurdering** og **sluttvurdering**
er sentralt og må forstås riktig når dette bygges — dette er ikke bare en
fargekategori i kalenderen (se "Fag i kalenderen med fargenyanser" som
allerede er bygget for `undervisning`-kategorien; `vurdering` har fortsatt
ingen egen struktur utover fargen). Produkteier signaliserer at dette er
et område de har reell fagkompetanse på og ønsker involvering i når det
spesifiseres — bør trolig avklares i egen samtale før bygging, ikke bare
implementeres ut fra denne notatteksten alene.

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

## Klassekart-maler (nevnt 2026-09-01)

Idé: maler til klassekart som læreren selv kan skreddersy ut fra hvordan
elevene faktisk sitter i klasserommet. Produkteier foreslo at et bilde av
klasserommet kanskje kan brukes som utgangspunkt (f.eks. som bakgrunn å
plassere elever oppå, eller at KI tolker bildet til å foreslå et oppsett).
Ingen detaljer avklart (kobling til elevlisten? redigerbart etterpå? kun
visuelt eller også knyttet til funksjonalitet som sitteplass-basert
gruppering). Ikke bygg før det bes om.

## Digitalisering av håndskrevne elevtekster, også utenfor norsk (nevnt 2026-09-01)

Idé: håndskrevne elevtekster kan gjøres om til digital tekst (OCR/
håndskriftgjenkjenning), og at dette kan være nyttig i andre fag enn norsk
— produkteier nevnte matematikk som eksempel. Uavklart hvordan dette
knyttes til eksisterende elevtekst-innsending, og hvordan det ev. skal
håndtere fagspesifikk notasjon (f.eks. matematiske uttrykk, ikke bare
løpende tekst). Ikke bygg før det bes om.

## KI-basert avviksdeteksjon i elevtekster (nevnt 2026-09-01)

Produkteiers spørsmål: er det mulig å bygge en KI som måler sannsynligheten
for at en elevtekst er KI-skrevet, ved å bli kjent med den enkelte elevens
egne tekster over tid?

Viktig presisering fra vurderingen som ble gitt: dette bør **ikke** bygges
som en generisk "KI-detektor" (à la Turnitin/GPTZero) — de er kjent
upålitelige, med høy andel falske positiver, og rammer systematisk skjevt
(spesielt elever med norsk som andrespråk og nevrodivergente elever).

Riktig tilnærming er i stedet **avviksdeteksjon mot elevens egen
skrivehistorikk**: sammenlign en ny tekst mot samme elevs tidligere tekster
(ordforråd, setningskompleksitet, feilmønstre, stil) og flagg *avvik* — ikke
påstå at teksten er KI-generert. Løser det løsbare problemet ("skriver
denne eleven annerledes enn vanlig") i stedet for det bevist uløselige
("er denne teksten KI-generert").

Begrensninger som må med i spesifiseringen:
- **Krever nok data per elev** — få innleverte tekster gir for spinkelt
  grunnlag.
- **Avvik har mange uskyldige forklaringer** (økt skriveferdighet over et
  skoleår, ny sjangertype, hjelp fra foreldre/leksehjelp, Grammarly, en
  dårlig dag) — må presenteres som et signal til læreren, aldri et
  ja/nei-svar eller en anklage.
- **Etisk/GDPR-tyngde**: algoritmisk vurdering av barn med potensielt
  alvorlige konsekvenser (fusk-mistanke) krever en enda strengere linje enn
  det som allerede er lagt inn i appens GDPR-sikre KI-prompting
  (`formatLogsForAI`). Elever/foresatte bør trolig informeres om at
  funksjonen finnes, og læreren må alltid ha siste ord.

Ikke bygg før det bes om.

## Prøve-/vurderingsbank (nevnt 2026-09-01)

Samme konsept som Undervisningsbanken, men for prøver/vurderingsoppgaver,
tagget på fag/trinn/kompetansemål. Naturlig par med "Vurdering"-idéen over
(se oppdateringen om underveis- vs. sluttvurdering). Ikke bygg før det bes
om.

## Maler-kategori, inkl. KI-generert statistikk fra tilbakemeldinger (nevnt 2026-09-01)

Idé om en ny kategori "Maler" i appen — maler til foreldremøter, prøver,
rapporter osv., som kan gjenbrukes og evt. deles (samme mønster som
fil-/tekstdeling i Undervisningsbanken).

**Vikaropplegg-mal** (lagt til 2026-09-01): en egen malkategori for
opplegg beregnet på vikartimer — ferdig strukturert slik en vikar uten
forkunnskap om klassen kan følge det direkte. Henger naturlig sammen med
"Vikarplanleggeren" (se "Struktur i hverdagen"-kategorien over) — uavklart
om vikaropplegg-malen er en del av Maler-kategorien, en del av
Vikarplanleggeren, eller begge (f.eks. at Vikarplanleggeren bruker
vikaropplegg-maler som byggekloss).

I tillegg, koblet til dette: KI-generert statistikk/grafer basert på data
som allerede finnes i Tilbakemeldingslogg — vise hva den enkelte elev (eller
klassen samlet) må jobbe videre med, og hva de allerede mestrer.
**Produkteier fremhevet spesielt dette med statistikk/forskning på egen
klasse som spesielt interessant** — dette overlapper med og utvider
"Personlig praksis-statistikk"-forslaget nevnt tidligere i samtalen (ikke
tidligere lagret i idébanken), og bør ses i sammenheng med det når det
spesifiseres nærmere. Ingen detaljer avklart om skalering
(individnivå/klassenivå/trinnivå), visualisering, eller om dette hører
hjemme i Maler-kategorien eller et eget analytics-område. Ikke bygg før det
bes om.

## Allerede plassholdere på dashbordet ("Kommer snart"), ikke fra denne samtalen

Del av opprinnelig spesifikasjon, aldri bygget ut:
- **Klasseprofil** — samlet oversikt og notater for klassene dine
- **Kalender** — planlegge undervisning, holde styr på datoer (se ev. overlapp med Timeplan over)
- **Faglig feed** — nyheter/innsikt relevant for undervisningen
- **Forskning** — forskningsbasert kunnskap oversatt til klasserommet

# Utfordringer og hensyn (administrativt/strategisk, ikke funksjonsidéer)

Denne kategorien er for ting produkteier og administratorer må ta stilling
til — ikke funksjoner å bygge, men beslutninger, risikoer eller eksterne
avhengigheter som påvirker produktet.

## Feide-innlogging (nevnt 2026-09-01)

Produkteier spurte om Feide (som lærere allerede bruker til å logge inn i
Osloskolen) kan brukes som innloggingsmetode i appen.

**Status i dag**: kun e-post + passord (`CredentialsProvider` i NextAuth,
bcrypt-hashet passord i egen database). Ingen ekstern innlogging.

**Vurdering**:
- **Teknisk** uproblematisk — Feide støtter standard OIDC, og NextAuth kan
  få Feide som en ekstra leverandør ved siden av dagens e-post/passord (ikke
  nødvendigvis erstatte den).
- **Registrering** hos Feide/Sikt (reg.feide.no) kreves, med klient-ID og
  spesifiserte scopes (navn, e-post, evt. skoletilhørighet).
- **Den reelle hindringen er administrativ, ikke teknisk**: Oslo
  kommune/Osloskolen styrer selv hvilke tjenester som er godkjent for deres
  Feide-brukere. Selv med ferdig integrasjon må Osloskolen aktivt godkjenne/
  hviteliste appen — egen prosess, trolig med krav til
  personvernerklæring/databehandleravtale siden dette er en ekstern,
  ikke-kommunal tjeneste.
- **Feide-tilgang er IKKE det samme som et salg til Oslo kommune** — se eget
  punkt under om salgsstrategi.

## Forretningsmodell / hvem betaler? (nevnt 2026-09-01)

Produkteier spurte: er det realistisk å selge til Oslo kommune? Selger vi
automatisk til Oslo kommune ved å bruke Feide? Eller er privat salg til
skoler/enkeltlærere rundt om i Norge bedre? Er det etterspørsel?

**Viktig forbehold**: dette er min vurdering basert på generell kunnskap om
det norske skole-IT-landskapet, ikke ferske markedsdata — jeg har ikke
nettverkstilgang til å research konkurrenter/priser i denne økten.

- **Feide ≠ salg**: Feide-godkjenning fra Sikt er separat fra Oslo kommunes
  egen anskaffelsesprosess (personvernombud-vurdering, sikkerhetsgjennomgang,
  formell anskaffelse/anbud for noe i denne skalaen) — ofte en prosess på
  mange måneder til år for en kommune. Feide er en nødvendig, men langt fra
  tilstrekkelig, forutsetning for et reelt kommune-salg.
- **Salg til enkeltlærere (B2C) er den svakeste veien**, av to grunner:
  (1) norske lærere er ikke vant til å betale privat for arbeidsverktøy —
  skolen/kommunen leverer normalt det de trenger; (2) **Tilbakemeldingslogg
  inneholder opplysninger om enkeltelever**. En lærer som betaler privat og
  legger inn elevopplysninger uten at kommunen har en databehandleravtale
  med oss, tar en reell personlig risiko overfor arbeidsgiver — dette er
  ikke bare et salgsproblem, men et compliance-hensyn som bør veie tungt.
- **Oslo kommune spesifikt**: KI-veilederens kunnskapsbase er allerede bygget
  rundt Oslo kommunes egne retningslinjer — sterk product-market-fit for
  akkurat Oslo, men samme grunn til at det ikke uten videre generaliserer
  til andre kommuner (som har egne KI-retningslinjer). Nasjonalt salg vil
  kreve enten en generisk/Udir-basert kunnskapsbase eller kommune-spesifikke
  innholdspakker — en reell produktkostnad, ikke bare en salgsoppgave.
- **Anbefaling**: friskoler/private skoler er trolig det mest realistiske
  nærtidsmålet — færre beslutningstakere og raskere prosess enn en hel
  kommune, samtidig som det unngår B2C-personvernrisikoen siden skolen (ikke
  enkeltläreren) blir avtalepart og kan inngå databehandleravtale. Fullt
  kommune-salg (Oslo eller andre) er det største, men tregeste og
  vanskeligste, sporet.
- **Etterspørsel**: finnes trolig i bred forstand (Oslo kommune publiserer
  selv aktiv KI-veiledning for skolen, og konkurrenten laererro.no
  eksisterer), men det meste av dagens bruk er trolig via gratis
  forbruker-chatboter direkte, ikke betalte spesialiserte verktøy. Den
  betalbare verdien må derfor ligge i arbeidsflyt-integrasjonen (delt
  Undervisningsbank, Tilbakemeldingslogg, Kalender, Oslo-forankrede
  kildehenvisninger) — ikke i "KI-prat" alene, som er gratis tilgjengelig
  andre steder.
