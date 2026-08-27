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

## Allerede plassholdere på dashbordet ("Kommer snart"), ikke fra denne samtalen

Del av opprinnelig spesifikasjon, aldri bygget ut:
- **Klasseprofil** — samlet oversikt og notater for klassene dine
- **Kalender** — planlegge undervisning, holde styr på datoer (se ev. overlapp med Timeplan over)
- **Faglig feed** — nyheter/innsikt relevant for undervisningen
- **Forskning** — forskningsbasert kunnskap oversatt til klasserommet
