# Kilder for KI-veilederen

Dette dokumentet er kildegrunnlaget for systemprompten til KI-veilederen
(`src/app/api/chat/route.ts`). Innholdet under er levert av produkteier
(krusegulliksen@gmail.com) 2026-08-24, hentet via et nettleseraktivert
KI-verktøy (ikke Claude Code selv — denne økten har ikke utgående
nettilgang til udir.no eller oslo.kommune.no, se `docs/kilder/README.md`).
Det er **ikke** verifisert ord-for-ord mot kildesidene av Claude Code.
Ved fremtidige oppdateringer av retningslinjene: oppdater dette dokumentet
først, deretter `SYSTEM_PROMPT` i `route.ts`.

Kildehenvisninger i systemprompten bruker forkortelsene:
- `[Oslo]` — Oslo kommunes retningslinjer
- `[Osloskolen]` — Osloskolens egne retningslinjer for ansatte og elever
- `[PfDK]` — Udirs rammeverk for lærerens profesjonsfaglige digitale kompetanse (2024)
- `[Udir-KI]` — Udirs veiledning om kunstig intelligens i skolen

## Primærkilder (lenker)

- Oslo kommunes retningslinjer:
  https://www.oslo.kommune.no/skole-og-utdanning/digitale-verktoy-osloskolen/kunstig-intelligens-ki-i-osloskolen/
- Osloskolens retningslinjer (intern, for ansatte og elever):
  https://aktuelt.osloskolen.no/larerik-bruk-av-laringsteknologi/digital-skolehverdag/kunstig-intelligens-ki-i-osloskolen/
- Udir — PfDK-rammeverket:
  https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/rammeverk-larerens-profesjonsfaglige-digitale-komp/
- Udir — PfDK-rammeverket, PDF (2024):
  https://www.udir.no/contentassets/25dc2555d1be45bd8ed6d1adb00b094f/24-06-03-pfdk-rammeverk-2.0.pdf
- Udir — Kunstig intelligens i skolen:
  https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/kunstig-intelligens-i-skolen/
- Osloskolens KI-chatbot (trygt alternativ, lagrer ikke personopplysninger):
  https://ki.osloskolen.no
- Kursmateriell (Canvas, krever pålogging):
  https://bibsys.instructure.com/courses/637

## Del 1 — Oslo kommunes retningslinjer for ansatte

**Hva lærere skal gjøre:**
- Vær kritisk til KI-generert innhold — sjekk alltid fakta
- Du er alltid ansvarlig for KI-generert tekst du sender ut
- Oppgi kilde når du bruker KI-generert tekst, bilde, kode eller annet
- Gi tydelig veiledning til elevene ved bruk av KI
- Ha et klart og definert mål med KI-bruken
- Test ut KI-støttet undervisning og lær av erfaringene
- Diskuter etiske, sosiale og juridiske spørsmål rundt KI med elevene
- Bidra til at lærere deler beste praksis for KI i undervisningen
- Undersøk om KI kan brukes til å gi tilbakemeldinger på elevarbeid
- Utforsk hvordan elever kan nyttiggjøre seg KI-genererte tilbakemeldinger
- Lag opplæringsmateriell som støtter skolens fagnettverk

**Hva lærere ikke må gjøre:**
- Del aldri personopplysninger om elever, kolleger eller foresatte
- Del ikke sensitiv eller virksomhetskritisk informasjon
- Del ikke påloggingsinformasjon eller passord
- Stol aldri blindt på KI — sjekk alltid fakta
- KI kan aldri erstatte lærerens profesjonelle skjønn
- Bruk ikke KI som erstatning for eget vurderingsarbeid

Osloskolen har en egen chatbot (ki.osloskolen.no) som ikke lagrer
personopplysninger, tilgjengelig for ansatte og elever på ungdomsskole og
videregående.

## Del 2 — Osloskolens retningslinjer for elever

**Muntlig arbeid**
- Kan: forslag til disposisjon og formidlingsmåter; sparringspartner og hjelp til å besvare spørsmål
- Kan ikke: erstatte menneskelige samtalepartnere med KI; repetere KI-svar uten å forstå eller reflektere selv

**Finn og søk**
- Kan: finne flere kilder og ressurser; hjelp til å tolke og forstå tekster; være åpen om bruk av KI i besvarelsen
- Kan ikke: bruke KI som eneste kilde; bruke KI i besvarelse uten å oppgi hvordan

**Lesing og tekstarbeid**
- Kan: forklare og forenkle begreper; hjelpe med å forstå en tekst; lage sammendrag, gloselister og oppgaver
- Kan ikke: overlate lesearbeidet til KI; stole blindt på KI uten kritisk analyse

**Vurdering**
- Kan: lage øvingsoppgaver og forberedelse; be KI stille spørsmål og gi studietips
- Kan ikke: bruke KI som erstatning for egen innsats; jukse ved å bruke KI i vurderingssituasjoner

**Skriftlig arbeid**
- Kan: inspirasjon og idéer; korrekturlesing og forbedring av struktur og grammatikk; hjelp til disposisjon og kildehenvisning
- Kan ikke: levere KI-generert innhold som eget arbeid; erstatte lærerens tilbakemelding med KI-tilbakemelding

## Del 3 — PfDK-rammeverket (7 kompetanseområder)

1. **Fag og grunnleggende ferdigheter** (s.7) — forstå hvordan KI endrer
   og utvider faget, og hvordan digitale ressurser hjelper elever å nå
   kompetansemålene. Forstå hvordan KI kan endre fagkunnskap; anvende
   digitale ressurser for kompetansemål og faglig progresjon; legge til
   rette for dybdelæring i digitale omgivelser.
2. **Skolen i samfunnet** (s.8) — bidra til elevenes digitale dannelse og
   kritiske medborgerskap. Forstå digital utviklings påvirkning på skole
   og barn og unges oppvekst; veilede elever i kritisk bruk av digitale
   medier; bidra til algoritmisk tenkning og forståelse av demokratiske
   utfordringer.
3. **Etikk** (s.9) — kjenne til personvern og kunne reflektere over
   etiske og juridiske problemstillinger ved bruk av KI og
   læringsanalyse. Kjenne retningslinjer om personvern og
   informasjonssikkerhet; undervise i personvern, opphavsrett og
   kildekritikk; bidra til elevenes digitale dømmekraft.
4. **Pedagogikk og fagdidaktikk** (s.10) — kritisk vurdere, velge og
   integrere digitale ressurser i planlegging, gjennomføring og
   evaluering av undervisning. Kritisk vurdere og velge digitale
   ressurser; designe egne digitale læremidler og nettbaserte
   undervisningsopplegg; kritisk vurdere og dra nytte av KI og adaptive
   læremidler.
5. **Ledelse av læringsprosesser** (s.11) — forstå hvordan KI skaper nye
   muligheter for tilpasset opplæring. Vurdere individuelle læringsbehov
   og utnytte digitale ressurser; benytte varierte tilbakemeldingsformer
   i digitale omgivelser; tilpasse lærerrollen til ulike digitale
   læringsaktiviteter.
6. **Samhandling og kommunikasjon** (s.12) — bruke digital teknologi til
   kommunikasjon og samarbeid. Kjenne til hvordan barn og unge bruker
   digitale arenaer; veilede elever i rettigheter på digitale arenaer;
   samarbeide profesjonelt på digitale arenaer.
7. **Endring og utvikling** (s.13) — digital kompetanse er en livslang
   prosess, dynamisk og situert. Kjenne relevant forskning om digitale
   ressurser i undervisning; forstå hvordan KI utfordrer lærerens og
   skolens rolle; selvstendig videreutvikle egen profesjonsfaglig digital
   kompetanse.

## Del 4 — Udirs råd om KI i skolen

- KI er allerede en del av elevenes hverdag — skolen må møte dem der de er
- Lærere og skoleledere må vite hva KI er og hvordan det brukes
- KI gir muligheter for mer variert, motiverende og målrettet læring
- Personvern og etikk må alltid håndteres nøye
- KI-verktøy skal brukes rettferdig og inkluderende
- Alderstilpasset bruk er avgjørende
- KI skal ses i sammenheng med læreplaner og pedagogisk praksis
- Læreres KI-kompetanse må utvikles kontinuerlig

## Del 5 — Erfaringer fra norske lærere

**Hva fungerer bra:**
- KI frigjør tid til relasjonsarbeid og personlig oppfølging av elever
- Støtter planlegging, vurdering og differensiering
- Særlig nyttig i språkopplæring
- Styrker profesjonskulturen gjennom erfaringsdeling
- Kvaliteten på KI-resultatet avhenger av kvaliteten på forespørselen

**Reelle utfordringer:**
- Grensen mellom støtte og snarvei for elevene
- Sikre elevens egen læringsprosess
- Tid, opplæring og tilgang til ressurser
- Frykt for å miste faglig autoritet
- KI gir utfordringer i vurderingsarbeid og standpunktvurderinger
