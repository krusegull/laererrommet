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

**Oppdatering 2026-09-03 — konkretisert teknisk løsning (produkteier)**:
"Lokal KI-deteksjon via stilometri." Kjerneprinsipp: **ingen elevtekst skal
sendes til noen ekstern tjeneste/selskap** — samme personvernprinsipp som
resten av Lærerrommet. To mulige nivåer:

1. **Ren stilometri (ingen KI/LLM i det hele tatt)**: statistiske mål —
   setningslengde, ordvariasjon, tegnsetting, "burstiness" (variasjon i
   setningsrytme) — regnet ut lokalt med Python (spaCy/nltk). Ingen data
   forlater serveren, og ingen ekstern API-kostnad. Dette er trolig
   riktig startpunkt.
2. **Lokal LLM**: en åpen modell kjørt via Ollama på egen
   infrastruktur, for en mer helhetlig sammenligning av gammel vs. ny
   tekst. Fortsatt 100 % lokalt, men krever egen modell-drift/kompute —
   en vesentlig større driftskostnad og -kompleksitet enn nivå 1, og
   sannsynligvis unødvendig for en første versjon.

Merk: nivå 2 (lokal LLM via Ollama) er en annen kjøremodell enn resten av
appen, som ellers utelukkende bruker Anthropics API uten egen
modell-hosting — verdt å vurdere om driftskostnaden/kompleksiteten er
verdt det før nivå 1 er prøvd og funnet utilstrekkelig.

**Vurdering av forslaget**: retningen (avvik mot egen historikk, ikke en
generisk detektor) og "ingen data ut av huset"-prinsippet er solide og
henger godt sammen med appens øvrige personvernlinje. Én svakhet som ikke
er nevnt i forbeholdene: pålitelighet ved lite datagrunnlag — en elev har
kanskje bare 5–20 innleverte tekster i løpet av et halvår, og stilometri
fungerer normalt best med et betydelig større tekstgrunnlag per forfatter.
Feilmarginen som allerede er nevnt som "betydelig" er trolig enda større
i praksis med så lite data — bør holdes i bakhodet ved spesifisering.

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

**Skrivemaler for elever** (lagt til 2026-09-03): maler til noveller, taler,
CV-er osv. — tenkt som tips/hjelp til elevene, med CV nevnt spesifikt i
forbindelse med sommerjobb-søking før sommeren. Litt annen målgruppe enn
resten av Maler-kategorien (elev-rettet, ikke lærer-administrativt som
foreldremøter/prøver/rapporter/vikaropplegg) — bør avklares om dette hører
hjemme i samme kategori, eller om det er en egen ressurstype (evt. knyttet
til Undervisningsbanken siden det er undervisningsrelevant innhold delt
mellom lærere, ikke direkte til elever).

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

## Personvern ved opplasting av elevtekster (nevnt 2026-09-01)

Produkteier reiste et krav: det må finnes en personvern-sperre når lærere
laster opp elevtekster — bør læreren måtte aktivt trykke "aksepter" på et
personvernvilkår per opplasting? Foreslo også at KI-en kunne analysere
teksten på forhånd og varsle læreren dersom innholdet virker identifiserbart
(f.eks. fullt navn, adresse, andre direkte personopplysninger i selve
teksten).

**Status i dag**: ingen samtykke-steg finnes ved elevtekst-innsending.
Personvern er kun håndtert andre steder i appen (GDPR-sikker
prompting i KI-veilederen via `formatLogsForAI`, og en generell
personverninnstilling i Innstillinger — ingen av delene dekker selve
elevtekst-opplastingen).

**Vurdering**:
- **Samtykke-steg** er relativt greit å bygge (en obligatorisk avkrysning
  før opplasting fullføres), men reiser spørsmål om *hvem* som egentlig kan
  samtykke på vegne av eleven — det er trolig skolen/kommunen (via
  databehandleravtale) som må ha gitt det formelle grunnlaget, ikke den
  enkelte lærer i appens grensesnitt. En avkrysning i appen bør derfor
  formuleres som en bekreftelse på at læreren *har* et gyldig grunnlag
  (f.eks. gjennom skolens rutiner), ikke som selve det juridiske
  samtykket.
- **KI-basert identifiserbarhets-varsling** er en god idé og teknisk
  realistisk (én ekstra KI-kall før lagring, se etter navn/adresse/andre
  direkte identifikatorer i teksten), men bør ses i sammenheng med at
  elever i denne appen allerede identifiseres via anonyme "merkelapper"
  (`Student.label`), ikke fullt navn — risikoen er dermed mest knyttet til
  identifiserbare opplysninger *inni* selve teksten eleven har skrevet
  (f.eks. hvis eleven skriver om egen adresse, familiesituasjon e.l.), ikke
  metadata om hvem eleven er.
- Henger sammen med "KI-basert avviksdeteksjon i elevtekster"-idéen over —
  begge krever at appen behandler elevtekster med et enda strengere
  personvernblikk enn det som allerede er lagt inn for KI-veilederen.

Ikke bygg før det bes om.

## Hvem selger vi til? (nevnt 2026-09-01)

Kandidater produkteier vil holde oversikt over, med fordeler/ulemper for
hver. Legg til flere kandidater her etter hvert som de dukker opp — be meg
utvide listen når det trengs.

### Oslo kommune
- **Pro**: sterk product-market-fit allerede — KI-veilederens kunnskapsbase
  er bygget rundt Oslo kommunes egne KI-retningslinjer. Én stor avtale kan
  gi mye volum/inntekt på én gang. Høy troverdighet hvis landet.
- **Con**: tregest og vanskeligst prosess (formell anskaffelse,
  personvernombud-vurdering, sikkerhetsgjennomgang — ofte måneder til år).
  Mange beslutningstakere. Risikabelt å bygge hele forretningen rundt én
  potensiell kunde med lang og usikker prosess.

### Lærere (enkeltpersoner, privat kjøp)
- **Pro**: ingen anskaffelsesprosess — kan begynne å selge umiddelbart. Rask
  tilbakemelding fra ekte brukere.
- **Con**: lav betalingsvilje for arbeidsverktøy blant norske lærere
  generelt. **Personvernrisiko**: elevdata (Tilbakemeldingslogg m.m.) lagt
  inn uten databehandleravtale mellom skole/kommune og oss — læreren tar da
  personlig risiko overfor egen arbeidsgiver. Vanskelig å skalere inntekt
  (typisk lav pris × høy churn i B2C EdTech).

### Privatskoler / friskoler
- **Pro**: færre beslutningstakere enn en hel kommune, raskere prosess enn
  Oslo kommune. Skolen (ikke enkeltläreren) blir avtalepart, som løser
  personvern-/DPA-problemet nevnt over. Kan fungere som referansekunde for
  et senere kommune-salg.
- **Con**: Norge har relativt få friskoler sammenlignet med offentlig
  skole — begrenset totalmarked på egen hånd. Krever fortsatt egen
  personvernvurdering per skole.

### Andre skoler/kommuner i Norge (utenfor Oslo)
- **Pro**: stort totalmarked (mange kommuner utenfor Oslo). Samme
  salgsmodell/prosess som for Oslo kommune kan gjenbrukes når den først er
  bygget.
- **Con**: KI-veilederens innhold er spesifikt bygget på Oslo kommunes
  retningslinjer — må generaliseres eller tilpasses per kommune (en reell
  produktkostnad, ikke bare salgsarbeid). Hver kommune har sin egen
  anskaffelsesprosess, så det skalerer ikke automatisk selv om Oslo landes.

### Utlandet
- **Pro**: mye større totalmarked i teorien.
- **Con**: hele kunnskapsgrunnlaget (LK20, Osloskolen-retningslinjer, norsk
  personvernkontekst/GDPR-tolkning) er Norge-spesifikt — i praksis en ny
  produktbygging for et annet land (nytt læreplanverk, nytt språk, ny
  personvernkontekst). Urealistisk som noe annet enn en svært langsiktig
  mulighet.

## Timeplan/periodeplan med tilbakeblikk (nevnt 2026-09-03)

Idé: læreren legger inn en plan for timen/uka/måneden på forhånd, slik at
man senere kan se tilbake på hva som faktisk ble gjort i en gitt time, uke
eller måned — en slags loggført undervisningsplan, ikke bare en fremover-
skuende kalenderhendelse.

Overlapper med flere eksisterende punkter og bør ses i sammenheng med dem
når den spesifiseres:
- **Kalender** (allerede bygget) har allerede `undervisning`-kategorien
  med tittel/beskrivelse/fag på hver hendelse — kan periodeplanen bygges
  som en utvidelse av dette (mer strukturert planinnhold per hendelse), i
  stedet for en helt ny funksjon?
- **"Timeplan"**-idéen under "Struktur i hverdagen" (nevnt 2026-08-25) —
  uavklart den gang om det var samme idé som Kalender-plassholderen; dette
  nye punktet konkretiserer trolig nettopp den uklarheten, med
  tilbakeblikk-vinkelen som ny detalj.
- **"Personlig praksis-statistikk"**-forslaget (foreslått av meg
  2026-09-01, ikke tidligere lagret separat) — en oversikt over egen
  aktivitet over tid ligger nær opp til "se tilbake på hva som ble gjort".

Ikke bygg før det bes om.

## Undervisningsopplegg: lag en sang med klassen (nevnt 2026-09-03)

Idé til et konkret undervisningsopplegg for Undervisningsbanken — bygger
klassemiljø, men er også faglig: klassen lager en sang sammen, der alle
elevene leser inn noen fraser hver i en mikrofon (som så settes sammen,
trolig med KI-verktøy for lyd/musikk).

Henger sammen med "Lydopptak + transkribering"-idéen over — dette er et
konkret bruksområde for lydopptak av/med elever, og det samme
GDPR-forbeholdet gjelder her: opptak av elevstemmer er en egen
personvern-risikoklasse (samtykke, lagring, sletting) utover det appen
allerede håndterer for tekst.

Ikke bygg før det bes om.
