# Kilder for KI-veilederen

Dette dokumentet er kildegrunnlaget for systemprompten til KI-veilederen
(`src/app/api/chat/route.ts`). Innholdet under er levert av produkteier
(krusegulliksen@gmail.com) 2026-08-24, hentet via et nettleseraktivert
KI-verktøy (ikke Claude Code selv — denne økten har ikke utgående
nettilgang til udir.no, se `docs/kilder/README.md`). Det er **ikke**
verifisert ord-for-ord mot kildesidene av Claude Code. Ved fremtidige
oppdateringer av retningslinjene: oppdater dette dokumentet først, deretter
`SYSTEM_PROMPT` i `route.ts`.

## Primærkilder (lenker)

- Utdanningsdirektoratet — Rammeverk for lærerens profesjonsfaglige
  digitale kompetanse (PfDK), 2024:
  https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/rammeverk-larerens-profesjonsfaglige-digitale-komp/
- Utdanningsdirektoratet — Kunstig intelligens i skolen:
  https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/kunstig-intelligens-i-skolen/
- Kursmateriell (Canvas, krever pålogging):
  https://bibsys.instructure.com/courses/637

Oslo kommunes interne retningslinjer for KI-bruk har ingen offentlig
lenke oppgitt ennå — innholdet under er slik det ble limt inn av
produkteier.

## Oslo kommunes retningslinjer for ansatte

**Du kan:**
- Lage undervisningsopplegg, årsplaner, prøver og vurderingskriterier
- Skrive tilbakemeldingsformuleringer og IOP-tekst (uten elevnavn)
- Skrive foreldrebrev, informasjonsskriv og møtereferat
- Bruke KI til idémyldring, kreative ideer og faglige forklaringer
- Planlegge tverrfaglig undervisning
- Oversette tekster til andre språk

**Du kan ikke:**
- Dele personopplysninger om elever, kolleger eller foresatte
- Lime inn elevtekster med navn i kommersielle KI-verktøy
- Bruke KI som erstatning for eget faglig og profesjonelt skjønn
- Bruke KI til å sette karakterer
- Dele sensitiv eller virksomhetskritisk informasjon

Viktig: Osloskolen har sin egen chatbot som ikke lagrer personopplysninger.
Dette er det tryggeste alternativet for elevrelatert arbeid.

## PfDK-rammeverket — 7 kompetanseområder

1. **Fag og grunnleggende ferdigheter** — Læreren skal forstå hvordan KI
   endrer og utvider faget, og hvordan digitale ressurser hjelper elever å
   nå kompetansemålene. KI påvirker måten vi forholder oss til
   fagkunnskap — lærere må forstå dette og integrere det bevisst i
   undervisningen.
2. **Skolen i samfunnet** — Læreren skal bidra til elevenes digitale
   dannelse og kritiske medborgerskap. Dette innebærer å forstå
   algoritmers rolle i samfunnet, digitalt utenforskap, og hvordan KI
   påvirker demokratiske prosesser. Lærere skal veilede elever til å være
   kritiske konsumenter av digitalt innhold.
3. **Etikk** — Læreren skal kjenne til retningslinjer om personvern og
   informasjonssikkerhet, og kunne reflektere over etiske og juridiske
   problemstillinger ved bruk av KI og læringsanalyse. Dette inkluderer
   opphavsrett, kildekritikk og digital dømmekraft. Lærere har plikt til å
   handle i tråd med etiske normer i digitale omgivelser.
4. **Pedagogikk og fagdidaktikk** — Læreren skal kritisk vurdere, velge og
   integrere digitale ressurser i undervisningen. Dette inkluderer å
   planlegge, gjennomføre og reflektere over undervisning i digitale
   omgivelser, og å dra nytte av KI, læringsanalyse og adaptive læremidler
   på en kritisk og bevisst måte.
5. **Ledelse av læringsprosesser** — Læreren skal forstå hvordan KI skaper
   nye muligheter for tilpasset opplæring og spesialundervisning. Dette
   inkluderer å vurdere individuelle læringsbehov og benytte varierte
   tilbakemeldingsformer i digitale omgivelser. KI utfordrer og fornyer
   lærerrollen.
6. **Samhandling og kommunikasjon** — Læreren skal bruke digitale verktøy
   til profesjonell kommunikasjon med elever, foresatte, kolleger og
   ledelse. Dette inkluderer å støtte elevers utvikling av digital
   kommunikasjon og samarbeide i profesjonsfellesskapet på digitale
   arenaer.
7. **Endring og utvikling** — Læreren skal forstå at digital kompetanse er
   en livslang prosess. Dette innebærer å holde seg orientert i nasjonale
   styringsdokumenter, reflektere over digitale ressursers betydning for
   egen profesjonsutøvelse, og bidra til lokalt utviklingsarbeid. Lærere
   skal kunne overføre eksisterende kompetanser til nye digitale
   omgivelser.

## Udirs råd om KI i skolen

- KI i skolen handler om trygg, hensiktsmessig, pedagogisk og
  alderstilpasset bruk
- Lærere må utvikle KI-kompetanse kontinuerlig gjennom hele karrieren
- KI skal ses i sammenheng med læreplaner og pedagogisk praksis
- Personvern og etiske spørsmål må alltid håndteres nøye
- Elevenes data skal beskyttes — KI-verktøy skal brukes rettferdig og
  inkluderende
- Skoleledere er optimistiske til KI, men kompetanseheving er avgjørende

## Refleksjon fra norske lærere om KI i praksis

Lærere opplever at KI kan:
- Frigjøre tid til relasjonsarbeid og personlig oppfølging av elever
- Støtte planlegging, vurdering og differensiering
- Styrke profesjonskulturen gjennom deling av erfaringer

Lærere opplever at KI utfordrer:
- Grensen mellom støtte og snarvei for elevene
- Sikring av elevens egen læringsprosess
- Frykt for å miste faglig autoritet
- Manglende tid og opplæring
