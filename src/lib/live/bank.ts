/**
 * KRUTTØNNA – spørsmålsbank (første verdenskrig).
 * Hentet fra standardsettene SKYTTERGRAVEN og FRONTLINJEN i Læringsportalen
 * (Arena 9 kap. 5 + trinnets begreper). n = nivå 1–5, r = riktig svar, f = feil svar.
 */
export type BankSporsmal = { n: number; q: string; r: string; f: string[]; w: string };

export const KRUTTONNA_BANK: BankSporsmal[] = [
 {
  "n": 1,
  "q": "Hva betyr nasjonalisme?",
  "r": "Tanken om at nasjonen og folket er det viktigste",
  "f": [
   "Tanken om at alle land bør samarbeide",
   "Tanken om at kongen skal ha all makt",
   "Tanken om at staten skal eie fabrikkene"
  ],
  "w": "Nasjonalisme var en av de grunnleggende årsakene til krigen. Den skapte spenninger mellom landene i Europa."
 },
 {
  "n": 2,
  "q": "Hva betyr imperialisme?",
  "r": "At mektige land skaffer seg makt over andre land og områder, for eksempel kolonier",
  "f": [
   "At et land holder seg utenfor kriger",
   "At folket velger lederne sine",
   "At land handler fritt med hverandre"
  ],
  "w": "Stormaktene konkurrerte om kolonier og makt. Det skapte spenninger og var en grunnleggende årsak til krigen."
 },
 {
  "n": 3,
  "q": "Hva betyr militær opprustning?",
  "r": "At land bygger opp hæren og skaffer seg flere og bedre våpen",
  "f": [
   "At land legger ned hæren sin",
   "At soldater får mer utdanning",
   "At land deler våpen med hverandre"
  ],
  "w": "Spenningene mellom statene førte til opprustning – og opprustningen gjorde spenningene enda større."
 },
 {
  "n": 4,
  "q": "Hva er forskjellen på en grunnleggende og en utløsende årsak?",
  "r": "Grunnleggende årsaker bygger seg opp over lang tid. En utløsende årsak setter konflikten i gang",
  "f": [
   "Grunnleggende årsaker skjer sist, utløsende årsaker skjer først",
   "Det er to ord for det samme",
   "Utløsende årsaker er viktigst, grunnleggende årsaker betyr lite"
  ],
  "w": "Boka bruker bildet av et bål og en fyrstikk: Bålet er de grunnleggende årsakene, fyrstikken er den utløsende."
 },
 {
  "n": 5,
  "q": "Hva var blankofullmakten?",
  "r": "Tysklands løfte om full støtte til Østerrike-Ungarn før angrepet på Serbia",
  "f": [
   "Serbias svar til Østerrike-Ungarn",
   "En fredsavtale mellom Russland og Tyskland",
   "Storbritannias løfte om å beskytte Belgia",
   "Avtalen som opprettet Folkeforbundet"
  ],
  "w": "Blankofullmakten bidro til at Tyskland senere fikk skylden for at krigen brøt ut."
 },
 {
  "n": 1,
  "q": "Hva er en allianse?",
  "r": "Et samarbeid mellom land, ofte om forsvar",
  "f": [
   "En krig mellom to land",
   "En fredsavtale etter en krig",
   "Et nytt politisk parti"
  ],
  "w": "Før krigen var Europa delt i to militære allianser."
 },
 {
  "n": 2,
  "q": "Hvilke land dannet trippelententen?",
  "r": "Storbritannia, Frankrike og Russland",
  "f": [
   "Tyskland, Østerrike-Ungarn og Italia",
   "Storbritannia, USA og Norge",
   "Frankrike, Belgia og Serbia"
  ],
  "w": "Tyskland, Østerrike-Ungarn og Italia dannet trippelalliansen."
 },
 {
  "n": 3,
  "q": "Hvilke land dannet trippelalliansen?",
  "r": "Tyskland, Østerrike-Ungarn og Italia",
  "f": [
   "Storbritannia, Frankrike og Russland",
   "Tyskland, Russland og Det osmanske riket",
   "Østerrike-Ungarn, Serbia og Italia"
  ],
  "w": "Italia skiftet side under krigen og gikk over til trippelententen."
 },
 {
  "n": 4,
  "q": "Hvorfor gikk Storbritannia inn i krigen?",
  "r": "Tyskland angrep Frankrike gjennom Belgia, og Storbritannia hadde lovet å beskytte Belgia",
  "f": [
   "Storbritannia ble angrepet av Russland",
   "Storbritannia ville ha kolonier i Serbia",
   "Storbritannia var med i trippelalliansen"
  ],
  "w": "Alliansesystemene trakk land etter land inn i krigen."
 },
 {
  "n": 5,
  "q": "Hvilket land skiftet side under krigen og gikk over til trippelententen?",
  "r": "Italia",
  "f": [
   "Russland",
   "Det osmanske riket",
   "Belgia",
   "Serbia"
  ],
  "w": "Italia hadde vært med i trippelalliansen. Etter krigen var mange italienere misfornøyde fordi de ikke fikk landområdene de mente de var lovet."
 },
 {
  "n": 1,
  "q": "Hvilket år brøt krigen ut, og hvilket år sluttet den?",
  "r": "1914 og 1918",
  "f": [
   "1912 og 1916",
   "1914 og 1919",
   "1918 og 1922"
  ],
  "w": "Krigen varte i fire år."
 },
 {
  "n": 2,
  "q": "Hva er en skyttergrav?",
  "r": "En grøft der soldatene søkte dekning og kjempet fra",
  "f": [
   "Et sted der falne soldater ble begravet",
   "En militær flyplass",
   "Et lager for våpen"
  ],
  "w": "På vestfronten gravde hærene seg ned i skyttergraver fra Den engelske kanal til Sveits."
 },
 {
  "n": 3,
  "q": "Hva var vestfronten?",
  "r": "Frontlinjen i vest der hærene kjempet fra skyttergraver i fire år uten å komme framover",
  "f": [
   "Frontlinjen mellom Tyskland og Russland",
   "Kampene ved kysten av Norge",
   "Frontlinjen i Øst-Afrika"
  ],
  "w": "Langs østfronten, der Tyskland kjempet mot Russland, var det mer bevegelse."
 },
 {
  "n": 4,
  "q": "Hvorfor kalles første verdenskrig ofte «den første moderne krigen»?",
  "r": "Ny teknologi ga nye våpen som ble brukt i krig for første gang, som giftgass",
  "f": [
   "Det var den første krigen i Europa",
   "Det var første gang soldater brukte uniform",
   "Det var den korteste krigen i historien"
  ],
  "w": "Den teknologiske utviklingen ga nye, dødelige våpen. Nesten 18 millioner mennesker ble drept."
 },
 {
  "n": 5,
  "q": "Hvilket argument er best for at første verdenskrig var en VERDENSkrig?",
  "r": "Det var kamper i Afrika, Asia og Midtøsten, soldater fra koloniene kjempet i Europa, og USA gikk med",
  "f": [
   "De fleste kampene var i Europa",
   "Krigen varte i fire år",
   "Den startet i Sarajevo",
   "Alle land i verden var med"
  ],
  "w": "Ikke alle land var med – Norge var for eksempel nøytralt. Men krigen spredte seg langt utenfor Europa."
 },
 {
  "n": 1,
  "q": "Hva betyr nøytralitet?",
  "r": "Å ikke ta side i en krig",
  "f": [
   "Å angripe først",
   "Å være med i en allianse",
   "Å være okkupert av et annet land"
  ],
  "w": "Da krigen brøt ut, erklærte Norge seg nøytralt."
 },
 {
  "n": 2,
  "q": "Hva betyr rasjonering?",
  "r": "At varer det er lite av, blir fordelt slik at hver person bare får kjøpe en bestemt mengde",
  "f": [
   "At prisene går ned",
   "At staten eier butikkene",
   "At varer blir solgt til utlandet"
  ],
  "w": "Under krigen måtte mat og drivstoff rasjoneres. Folk fikk for eksempel brødkort."
 },
 {
  "n": 3,
  "q": "Hva menes med dyrtid?",
  "r": "Perioden da prisene steg mer enn lønningene",
  "f": [
   "Perioden da mange tjente mye på skipsaksjer",
   "Perioden da Norge var i krig",
   "Perioden da det var mangel på arbeid"
  ],
  "w": "Dyrtiden gjorde forskjellen mellom rike og fattige tydeligere."
 },
 {
  "n": 4,
  "q": "Hvorfor knyttet Norge seg etter hvert sterkere til Storbritannia?",
  "r": "Norge var avhengig av kull og andre varer fra Storbritannia",
  "f": [
   "Norge var med i trippelententen",
   "Storbritannia okkuperte Norge",
   "Kongen var britisk"
  ],
  "w": "Over 800 norske skip ble senket av tyske ubåter. Det skapte også en antitysk stemning i Norge."
 },
 {
  "n": 5,
  "q": "Hvilken følge av krigen kan forklare at Arbeiderpartiet ble Norges største parti i mellomkrigstiden?",
  "r": "Forskjellen mellom rike og fattige ble større og mer synlig under dyrtiden",
  "f": [
   "Norge fikk kolonier etter krigen",
   "Kvinnene mistet stemmeretten",
   "Norge ble med i trippelententen",
   "Den russiske tsaren støttet partiet"
  ],
  "w": "Arbeiderklassen reagerte på forskjellene, og Arbeiderpartiet ville bedre levekårene for arbeiderne."
 },
 {
  "n": 1,
  "q": "Hva er en våpenhvile?",
  "r": "En avtale om å stoppe kampene",
  "f": [
   "En fredsavtale som deler et land",
   "Et lager for våpen",
   "En pause for å bygge flere våpen"
  ],
  "w": "Våpenhvilen ble undertegnet 11. november 1918 klokka 11.00."
 },
 {
  "n": 2,
  "q": "Hva var Folkeforbundet?",
  "r": "En verdensomspennende organisasjon som skulle løse konflikter uten krig",
  "f": [
   "En allianse mellom Tyskland og Østerrike-Ungarn",
   "Et kommunistisk parti",
   "Navnet på fredsavtalen etter krigen"
  ],
  "w": "Folkeforbundet regnes som forløperen til FN."
 },
 {
  "n": 3,
  "q": "Hva er krigsskadeerstatninger?",
  "r": "Penger et land må betale for skadene etter en krig",
  "f": [
   "Penger soldatene fikk i lønn",
   "Lån som USA ga til Europa",
   "Penger til å bygge nye våpen"
  ],
  "w": "I Versaillestraktaten måtte Tyskland betale store krigsskadeerstatninger."
 },
 {
  "n": 4,
  "q": "Hvilket krav måtte Tyskland IKKE godta i Versaillestraktaten?",
  "r": "Å melde seg inn i Folkeforbundet med en gang",
  "f": [
   "Å ta på seg skylden for krigen",
   "Å gi fra seg landområder og kolonier",
   "Å bare ha en liten hær uten flyvåpen"
  ],
  "w": "Tyskland måtte ta skylden, betale erstatninger, gi fra seg land og kolonier og bare ha en liten hær."
 },
 {
  "n": 5,
  "q": "Hvilke nye stater ble opprettet etter første verdenskrig?",
  "r": "Polen, Tsjekkoslovakia, Finland, Estland, Latvia, Litauen og Jugoslavia",
  "f": [
   "Polen, Norge, Sverige og Danmark",
   "Tyskland, Italia og Belgia",
   "Serbia, Russland og Det osmanske riket",
   "Sovjetunionen, USA og Storbritannia"
  ],
  "w": "I tillegg ble Østerrike-Ungarn delt i Østerrike og Ungarn. Mange grenser vi har i dag, er et resultat av krigen."
 },
 {
  "n": 1,
  "q": "Hva var en tsar?",
  "r": "Keiseren i Russland",
  "f": [
   "En russisk soldat",
   "Lederen for bolsjevikene",
   "Et russisk parlament"
  ],
  "w": "Tsaren styrte eneveldig og nektet å innføre demokrati."
 },
 {
  "n": 2,
  "q": "Hva betyr eneveldig?",
  "r": "At én person har all makt",
  "f": [
   "At folket bestemmer gjennom valg",
   "At flere partier deler makten",
   "At landet ikke har noen leder"
  ],
  "w": "Den eneveldige tsaren var upopulær i store deler av befolkningen."
 },
 {
  "n": 3,
  "q": "Hvem var bolsjevikene?",
  "r": "Lenins parti, som tok makten i Russland i 1917",
  "f": [
   "Tsarens soldater",
   "Mussolinis parti i Italia",
   "Et parti som ville innføre demokrati i Russland"
  ],
  "w": "Bolsjevikene kalte seg senere kommunister."
 },
 {
  "n": 4,
  "q": "Hva er et statskupp?",
  "r": "Når en gruppe tar makten i et land med makt, ikke gjennom valg",
  "f": [
   "Når et land vinner en krig",
   "Når folket velger en ny regjering",
   "Når en konge arver tronen"
  ],
  "w": "Høsten 1917 tok Lenin og bolsjevikene makten ved et statskupp."
 },
 {
  "n": 5,
  "q": "Hva er planøkonomi?",
  "r": "Staten eier fabrikkene og bestemmer hva som skal produseres og hva det skal koste",
  "f": [
   "Bedrifter konkurrerer fritt om kundene",
   "Hver familie produserer det den trenger selv",
   "Prisene bestemmes av tilbud og etterspørsel",
   "Landet handler bare med allierte"
  ],
  "w": "Planøkonomien skulle skape et klasseløst samfunn uten forskjeller og arbeidsledighet."
 },
 {
  "n": 1,
  "q": "Hvem startet fascismen i Italia?",
  "r": "Benito Mussolini",
  "f": [
   "Vladimir Lenin",
   "Adolf Hitler",
   "Woodrow Wilson"
  ],
  "w": "Mussolini startet partiet i 1921."
 },
 {
  "n": 2,
  "q": "Hva er en diktator?",
  "r": "En leder med all makt som ikke er valgt av folket",
  "f": [
   "En leder som blir valgt hvert fjerde år",
   "En dommer i en domstol",
   "En leder for en fagforening"
  ],
  "w": "Fascistene ville ha én sterk leder, en fører, i stedet for demokrati."
 },
 {
  "n": 3,
  "q": "Hva var marsjen mot Roma?",
  "r": "Fascistenes væpnede marsj i 1922 som ga Mussolini makten",
  "f": [
   "En fredsmarsj etter krigen",
   "En protest mot tsaren",
   "Et slag mellom Italia og Østerrike-Ungarn"
  ],
  "w": "Etter marsjen ble Mussolini utnevnt til statsminister, og snart hadde fascistene all makt."
 },
 {
  "n": 4,
  "q": "Hva betyr sensur?",
  "r": "At myndighetene kontrollerer hva mediene får skrive og si",
  "f": [
   "At folket får si hva de vil",
   "At aviser blir solgt billig",
   "At alle partier får like mye plass i mediene"
  ],
  "w": "I Italia ble alle andre partier enn fascistpartiet forbudt, og mediene ble sensurert."
 },
 {
  "n": 5,
  "q": "Hvilken forklaring passer best på at fascismen fikk fotfeste i Italia?",
  "r": "Politisk uro, frykt for en revolusjon som i Russland og misnøye med fredsoppgjøret",
  "f": [
   "Italia hadde vunnet alle landområdene de ønsket",
   "Folket var fornøyd med demokratiet",
   "Kongen var kommunist",
   "Italia var nøytralt i krigen"
  ],
  "w": "Mange mente at en sterk leder ville gi mindre kaos."
 },
 {
  "n": 1,
  "q": "Hvem ble skutt i Sarajevo i juni 1914?",
  "r": "Franz Ferdinand, tronarvingen i Østerrike-Ungarn, og kona Sophie",
  "f": [
   "Den russiske tsaren",
   "Keiseren av Tyskland",
   "Kongen av Serbia"
  ],
  "w": "Attentatet kalles skuddene i Sarajevo."
 },
 {
  "n": 1,
  "q": "Hvilket land ble angrepet av Østerrike-Ungarn en måned etter skuddene i Sarajevo?",
  "r": "Serbia",
  "f": [
   "Belgia",
   "Russland",
   "Frankrike"
  ],
  "w": "Østerrike-Ungarn ga Serbia ansvaret for drapet."
 },
 {
  "n": 1,
  "q": "Hvem tok makten i Russland høsten 1917?",
  "r": "Lenin og bolsjevikene",
  "f": [
   "Tsaren",
   "Mussolini",
   "Stalin"
  ],
  "w": "Slagordet var «Fred, jord, brød»."
 },
 {
  "n": 1,
  "q": "Hvilket land var nøytralt under første verdenskrig?",
  "r": "Norge",
  "f": [
   "Frankrike",
   "Belgia",
   "Italia"
  ],
  "w": "Selv om Norge var nøytralt, mistet rundt 2000 norske sjømenn livet."
 },
 {
  "n": 1,
  "q": "Hva er en ideologi?",
  "r": "Ideer om hvordan samfunnet bør være organisert",
  "f": [
   "En type våpen",
   "Et land i Øst-Europa",
   "En fredsavtale"
  ],
  "w": "Kommunisme og fascisme er eksempler på ideologier."
 },
 {
  "n": 2,
  "q": "Hvilket land fikk skylden for krigen i fredsavtalen?",
  "r": "Tyskland",
  "f": [
   "Serbia",
   "Russland",
   "Italia"
  ],
  "w": "I dag mener de fleste historikere at flere land hadde ansvar."
 },
 {
  "n": 2,
  "q": "Hvilket år gikk USA inn i krigen?",
  "r": "1917",
  "f": [
   "1914",
   "1916",
   "1918"
  ],
  "w": "Tyske ubåter senket også amerikanske skip."
 },
 {
  "n": 2,
  "q": "Hvilket land allierte seg med Tyskland og trakk Midtøsten inn i krigen?",
  "r": "Det osmanske riket",
  "f": [
   "Italia",
   "Belgia",
   "Serbia"
  ],
  "w": "Det osmanske riket gikk inn på Tysklands og Østerrike-Ungarns side."
 },
 {
  "n": 2,
  "q": "Hvilket land måtte Tyskland gjennom for å angripe Frankrike?",
  "r": "Belgia",
  "f": [
   "Sveits",
   "Nederland",
   "Italia"
  ],
  "w": "Angrepet på Belgia trakk Storbritannia inn i krigen."
 },
 {
  "n": 2,
  "q": "Hvilken amerikansk president foreslo Folkeforbundet?",
  "r": "Woodrow Wilson",
  "f": [
   "Abraham Lincoln",
   "Franklin D. Roosevelt",
   "George Washington"
  ],
  "w": "Wilson var den mest forsonlige av seierherrene."
 },
 {
  "n": 3,
  "q": "Hva var østfronten?",
  "r": "Frontlinjen der Tyskland kjempet mot Russland",
  "f": [
   "Frontlinjen mellom Frankrike og Tyskland",
   "Kampene i Øst-Afrika",
   "Kampene på havet"
  ],
  "w": "Her var det mer bevegelse enn på vestfronten."
 },
 {
  "n": 3,
  "q": "Hva betyr mellomkrigstiden?",
  "r": "Perioden mellom første og andre verdenskrig (1918–1939)",
  "f": [
   "De fire årene første verdenskrig varte",
   "Tiden før 1914",
   "Perioden etter andre verdenskrig"
  ],
  "w": "Mellomkrigstiden var preget av politisk uro."
 },
 {
  "n": 3,
  "q": "Hva er en borgerkrig?",
  "r": "En krig mellom grupper i samme land",
  "f": [
   "En krig mellom to naboland",
   "En krig om kolonier",
   "En krig som foregår på havet"
  ],
  "w": "Etter revolusjonen ble det en brutal borgerkrig i Russland i tre år."
 },
 {
  "n": 3,
  "q": "Hvilket navn fikk Russland i 1922?",
  "r": "Sovjetunionen",
  "f": [
   "Jugoslavia",
   "Det russiske riket",
   "Øst-Europa"
  ],
  "w": "Landet fikk et rødt flagg med hammer, sigd og stjerne."
 },
 {
  "n": 3,
  "q": "Hvilken ny stat oppfylte serbernes ønske om en større stat på Balkan?",
  "r": "Jugoslavia",
  "f": [
   "Tsjekkoslovakia",
   "Albania",
   "Bulgaria"
  ],
  "w": "Jugoslavia ble opprettet etter krigen."
 },
 {
  "n": 3,
  "q": "Hvilket land ble delt i to mindre stater etter krigen?",
  "r": "Østerrike-Ungarn",
  "f": [
   "Tyskland",
   "Russland",
   "Italia"
  ],
  "w": "Østerrike-Ungarn ble delt i Østerrike og Ungarn."
 },
 {
  "n": 4,
  "q": "Hva betyr kommunisme?",
  "r": "En ideologi med mål om et klasseløst samfunn der verdiene eies i fellesskap",
  "f": [
   "En ideologi med én sterk fører og nasjonalisme",
   "Et styresett med konge og parlament",
   "Et system der bedrifter konkurrerer fritt"
  ],
  "w": "Ordet kommer av latin communis, «felles»."
 },
 {
  "n": 4,
  "q": "Hva var verdensrevolusjonen?",
  "r": "Lenins mål om at revolusjonen skulle spre seg til hele verden",
  "f": [
   "Revolusjonen i alle koloniene etter krigen",
   "Navnet på marsjen mot Roma",
   "Revolusjonen i Tyskland i 1918"
  ],
  "w": "Ideen fikk begrenset oppslutning, men frykten for kommunismen var stor."
 },
 {
  "n": 4,
  "q": "Hva var børskrakket i 1929?",
  "r": "Et kraftig fall i aksjekursene i USA som førte til økonomisk krise",
  "f": [
   "En bank som gikk konkurs i Norge",
   "En krig om handel mellom USA og Europa",
   "Et streik i Italia"
  ],
  "w": "Krisen ga grobunn for fascistiske bevegelser i flere land, særlig i Tyskland."
 },
 {
  "n": 4,
  "q": "Hva er bildemanipulering?",
  "r": "Å endre et bilde for å gi et falskt inntrykk",
  "f": [
   "Å ta bilder i krig",
   "Å lage kopier av gamle bilder",
   "Å fargelegge svart-hvitt-bilder"
  ],
  "w": "Stalin fikk fjernet Trotskij fra fotografier for å «fjerne» ham fra historien."
 },
 {
  "n": 4,
  "q": "Hvordan endret kvinnenes rolle seg under krigen?",
  "r": "Mange kvinner fikk jobb utenfor hjemmet og egne penger for første gang",
  "f": [
   "Kvinnene dro i krigen som soldater",
   "Kvinnene mistet stemmeretten",
   "Ingenting endret seg"
  ],
  "w": "Etter krigen innførte flere land stemmerett for kvinner."
 },
 {
  "n": 5,
  "q": "Hvorfor ble skuddene i Sarajevo bare en UTLØSENDE årsak til krigen?",
  "r": "Det ville ikke blitt krig uten spenningene som allerede fantes, som nasjonalisme, imperialisme og allianser",
  "f": [
   "Fordi skuddene skjedde i juni",
   "Fordi Franz Ferdinand ikke var viktig",
   "Fordi Serbia vant krigen",
   "Fordi Tyskland ikke brydde seg"
  ],
  "w": "Skuddene var fyrstikken – men bålet var bygget opp over lang tid."
 },
 {
  "n": 5,
  "q": "Hvorfor sluttet soldatene å støtte tsaren i mars 1917?",
  "r": "De nektet å skyte på sultne demonstranter, fordi krigen og matmangelen rammet alle",
  "f": [
   "Lenin betalte dem",
   "Tyskland beordret dem",
   "De ville ha Mussolini som leder",
   "Tsaren hadde allerede gått av"
  ],
  "w": "Uten støtte fra hæren måtte tsaren gå av."
 },
 {
  "n": 5,
  "q": "Hvorfor var mange tyskere bitre etter Versaillestraktaten?",
  "r": "De følte seg ydmyket fordi de måtte ta hele skylden og betale store erstatninger",
  "f": [
   "De fikk flere kolonier enn Frankrike",
   "De ble medlem av Folkeforbundet",
   "De fikk beholde en stor hær",
   "Keiseren ble gjeninnsatt"
  ],
  "w": "Bitterheten bidro til nye konflikter – og ble senere brukt av Hitler."
 },
 {
  "n": 5,
  "q": "Hvorfor fikk fascister og nazister støtte fra mange som var redde for kommunismen?",
  "r": "De så på sosialister og kommunister som hovedfiender og lovet orden",
  "f": [
   "De ville også ha planøkonomi",
   "De støttet verdensrevolusjonen",
   "De ville innføre mer demokrati",
   "De samarbeidet med Lenin"
  ],
  "w": "Frykten for kommunismen kan forklare hvorfor mange sluttet opp om andre ikke-demokratiske ideologier."
 },
 {
  "n": 5,
  "q": "Hvilken konsekvens av første verdenskrig ser vi tydeligst i Europa i dag?",
  "r": "Mange av grensene og statene, og FN som bygger videre på Folkeforbundet",
  "f": [
   "At Østerrike-Ungarn fortsatt finnes",
   "At Norge har kolonier",
   "At Russland styres av en tsar",
   "At alle land har vernepliktige hærer"
  ],
  "w": "Krigen endret Europakartet, og Folkeforbundet var en forløper til FN."
 },
 {
  "n": 1,
  "q": "Hva kalles sterk stolthet over egen nasjon, og troen på at et folk bør ha sin egen stat?",
  "r": "Nasjonalisme",
  "f": [
   "Imperialisme",
   "Nøytralitet",
   "Militarisme"
  ],
  "w": "Nasjonalisme var en av de grunnleggende årsakene til krigen – spesielt på Balkan."
 },
 {
  "n": 2,
  "q": "Hva kalles det når stormakter konkurrerer om kolonier og makt over andre områder?",
  "r": "Imperialisme",
  "f": [
   "Pasifisme",
   "Revolusjon",
   "Nøytralitet"
  ],
  "w": "Imperialisme skapte misunnelse og mistillit mellom stormaktene, særlig Tyskland som følte seg forbigått."
 },
 {
  "n": 3,
  "q": "Hvilke to allianser sto mot hverandre da krigen brøt ut?",
  "r": "Trippelalliansen og Trippelententen",
  "f": [
   "Folkeforbundet og FN",
   "NATO og Warszawapakten",
   "Sentralmaktene og Nordmaktene"
  ],
  "w": "Trippelalliansen (Tyskland, Østerrike-Ungarn, Italia) mot Trippelententen (Frankrike, Storbritannia, Russland)."
 },
 {
  "n": 4,
  "q": "Hva var den utløsende årsaken til at første verdenskrig brøt ut?",
  "r": "Skuddene i Sarajevo drepte Franz Ferdinand",
  "f": [
   "Den tyske keiseren erklærte krig mot Frankrike",
   "Russland angrep Østerrike-Ungarn",
   "Storbritannia invaderte Belgia"
  ],
  "w": "19 år gamle Gavrilo Princip skjøt og drepte tronarvingen Franz Ferdinand og kona Sophie 28. juni 1914."
 },
 {
  "n": 5,
  "q": "Hvorfor endte attentatet på to mennesker i Sarajevo med at store deler av Europa gikk til krig?",
  "r": "Fordi alle landene hadde lovet hverandre støtte gjennom alliansesystemet",
  "f": [
   "Fordi FN krevde det",
   "Fordi Norge ba om det",
   "Fordi Italia angrep Russland med en gang"
  ],
  "w": "Østerrike-Ungarn erklærte krig mot Serbia → Russland (alliert med Serbia) ble trukket inn → Tyskland (alliert med Østerrike-Ungarn) erklærte krig mot Russland → Frankrike og Storbritannia fulgte etter."
 },
 {
  "n": 1,
  "q": "Hva kalles de lange grøftene soldatene gravde seg ned i for å beskytte seg?",
  "r": "Skyttergraver",
  "f": [
   "Ingenmannsland",
   "Festningsverk",
   "Brohoder"
  ],
  "w": "Skyttergravene strakte seg fra Nordsjøen i nord til Sveits i sør på vestfronten."
 },
 {
  "n": 2,
  "q": "Hva kalte man det farlige, øde området mellom fiendens skyttergraver?",
  "r": "Ingenmannsland",
  "f": [
   "Frontlinjen",
   "Festningsbyen",
   "Sentralsonen"
  ],
  "w": "Ingenmannsland var dekket av piggtråd og granathull – svært farlig å krysse."
 },
 {
  "n": 3,
  "q": "Hvilket nytt våpen ble for første gang brukt i stort omfang under slaget ved Somme i 1916?",
  "r": "Stridsvogner (tanks)",
  "f": [
   "Giftgass",
   "Ubåter",
   "Maskingevær"
  ],
  "w": "Britene satte inn stridsvogner for første gang i september 1916, men teknologien var fortsatt umoden."
 },
 {
  "n": 4,
  "q": "Hvorfor klarte ingen av sidene å bryte gjennom på vestfronten i lange perioder?",
  "r": "Fordi maskingevær, piggtråd og artilleri gjorde angrep enormt kostbare",
  "f": [
   "Fordi det var fredsforhandlinger hele tiden",
   "Fordi soldatene nektet å kjempe",
   "Fordi det var vinter hele året"
  ],
  "w": "Ny våpenteknologi hadde utviklet seg raskere enn taktikkene – forsvar var mye sterkere enn angrep."
 },
 {
  "n": 5,
  "q": "Hva var hovedforskjellen på vestfronten og østfronten?",
  "r": "Vestfronten var preget av stillingskrig, østfronten av mer bevegelige kamper",
  "f": [
   "Det var ingen kamper på østfronten",
   "Østfronten lå i Frankrike",
   "Vestfronten ble aldri angrepet"
  ],
  "w": "På vestfronten sto frontene nesten stille i fire år. På østfronten beveget kampene seg over store områder."
 },
 {
  "n": 1,
  "q": "Var Norge med i første verdenskrig?",
  "r": "Nei, Norge var nøytralt",
  "f": [
   "Ja, på ententens side",
   "Ja, på sentralmaktenes side",
   "Ja, men bare til sjøs"
  ],
  "w": "Norge erklærte seg nøytralt, slik som de andre nordiske landene."
 },
 {
  "n": 2,
  "q": "Hva kalles en periode der prisene på varer stiger mye mer enn lønningene?",
  "r": "Dyrtid",
  "f": [
   "Rasjonering",
   "Nøytralitet",
   "Blokade"
  ],
  "w": "Dyrtiden rammet vanlige folk i Norge hardt under krigen, selv om landet ikke var med i krigen."
 },
 {
  "n": 3,
  "q": "Hva kalles det når myndighetene bestemmer hvor mye hver person får kjøpe av en vare det er mangel på?",
  "r": "Rasjonering",
  "f": [
   "Dyrtid",
   "Nøytralitet",
   "Opprustning"
  ],
  "w": "Rasjoneringskort ble innført for varer som det ble mangel på, som mel."
 },
 {
  "n": 4,
  "q": "Hvorfor ble Norge rammet av vareknapphet og dyrtid, selv om landet var nøytralt?",
  "r": "Fordi handelen og skipsfarten ble rammet av krigen, blant annet ubåtkrig",
  "f": [
   "Fordi Norge sluttet å fiske",
   "Fordi kongen innførte forbud mot import",
   "Fordi Sverige stengte grensen"
  ],
  "w": "Varer som kom med skip risikerte å bli senket, og mye av det Norge produserte gikk til eksport i stedet for hjemmemarkedet."
 },
 {
  "n": 5,
  "q": "Hvorfor skapte norsk handel med Storbritannia problemer med Tyskland?",
  "r": "Fordi tyske ubåter senket skip som handlet med britene, også norske",
  "f": [
   "Fordi Norge solgte våpen til britene",
   "Fordi Norge nektet å handle med Tyskland i det hele tatt",
   "Fordi Norge ble med i Trippelententen"
  ],
  "w": "Tyskland erklærte uinnskrenket ubåtkrig og senket skip – også nøytrale norske skip – som handlet med Storbritannia."
 },
 {
  "n": 1,
  "q": "Hva het tsaren som styrte Russland fram til revolusjonen i 1917?",
  "r": "Nikolaj II",
  "f": [
   "Lenin",
   "Alexander III",
   "Peter den store"
  ],
  "w": "Nikolaj II abdiserte etter marsrevolusjonen i 1917."
 },
 {
  "n": 2,
  "q": "Hva lovet bolsjevikene det russiske folket i 1917?",
  "r": "Fred, jord, brød",
  "f": [
   "Frihet, likhet, brorskap",
   "Ett folk, én stat",
   "Arbeid, orden, framtid"
  ],
  "w": "Parolen lovet slutt på krigen, jord til bøndene og mat til alle."
 },
 {
  "n": 3,
  "q": "Hvem ledet bolsjevikene da de tok makten i november 1917?",
  "r": "Vladimir Lenin",
  "f": [
   "Nikolaj II",
   "Leo Trotskij alene",
   "Josef Stalin"
  ],
  "w": "Lenin ledet statskuppet i november 1917 og ble den nye lederen."
 },
 {
  "n": 4,
  "q": "Hva skjedde med Russland kort tid etter at bolsjevikene tok makten?",
  "r": "Russland trakk seg ut av krigen og gikk inn i en borgerkrig",
  "f": [
   "Russland ble med i Trippelententen for fullt",
   "Russland erklærte krig mot Tyskland på nytt",
   "Tsaren tok makten tilbake"
  ],
  "w": "Russland gikk ut av første verdenskrig, men landet gikk inn i en blodig borgerkrig som varte til 1922."
 },
 {
  "n": 5,
  "q": "Omtrent hvor mange mennesker døde i den russiske borgerkrigen, og hva var en viktig årsak til de mange dødsfallene?",
  "r": "12 millioner, mange av dem av sult",
  "f": [
   "100 000, mest i kamp",
   "2 millioner, mest av sykdom",
   "Ingen døde – det var en fredelig maktovertakelse"
  ],
  "w": "Rundt 12 millioner mennesker mistet livet i borgerkrigen, halvparten av dem fordi de sultet i hjel."
 },
 {
  "n": 1,
  "q": "Hva het fredsavtalen som Tyskland måtte signere etter krigen?",
  "r": "Versaillestraktaten",
  "f": [
   "Folkeforbundspakten",
   "Svalbardtraktaten",
   "Wien-kongressen"
  ],
  "w": "Versaillestraktaten (1919) påla Tyskland krigsskyld og store erstatninger."
 },
 {
  "n": 2,
  "q": "Hva het den nye internasjonale organisasjonen som skulle forebygge nye kriger?",
  "r": "Folkeforbundet",
  "f": [
   "FN",
   "Røde Kors",
   "NATO"
  ],
  "w": "Folkeforbundet regnes som forløperen til FN."
 },
 {
  "n": 3,
  "q": "Hvilket rike gikk i oppløsning og ble delt opp i flere nye, selvstendige stater etter krigen?",
  "r": "Østerrike-Ungarn",
  "f": [
   "Storbritannia",
   "Frankrike",
   "Sveits"
  ],
  "w": "Østerrike-Ungarn ble oppløst; blant de nye statene var Polen, Tsjekkoslovakia og Jugoslavia."
 },
 {
  "n": 4,
  "q": "Hvorfor opplevde mange tyskere Versaillestraktaten som ydmykende?",
  "r": "Tyskland måtte ta skylden for krigen og betale enorme erstatninger",
  "f": [
   "Tyskland fikk beholde alle koloniene sine",
   "Tyskland fikk lov til å ha en stor hær",
   "Tyskland ble den eneste stormakten i Folkeforbundet"
  ],
  "w": "Krigsskyldparagrafen og erstatningskravene ble oppfattet som svært urettferdige av mange tyskere."
 },
 {
  "n": 5,
  "q": "Hvilken ideologi tok makten i Italia i 1922, og hva kjennetegnet den?",
  "r": "Fascisme – én sterk leder i stedet for demokrati",
  "f": [
   "Kommunisme – et klasseløst samfunn uten privat eiendom",
   "Liberalisme – fritt marked og flerpartidemokrati",
   "Pasifisme – fullstendig avvæpning"
  ],
  "w": "Benito Mussolini og fascistene tok makten etter «marsjen mot Roma» og innførte diktatur med én leder."
 },
 {
  "n": 1,
  "q": "Hvilket år startet første verdenskrig?",
  "r": "1914",
  "f": [
   "1916",
   "1918",
   "1912"
  ],
  "w": "Krigen startet i 1914, etter attentatet i Sarajevo i juni."
 },
 {
  "n": 1,
  "q": "Hvilket år sluttet første verdenskrig?",
  "r": "1918",
  "f": [
   "1917",
   "1919",
   "1920"
  ],
  "w": "Våpenhvilen ble signert 11. november 1918."
 },
 {
  "n": 1,
  "q": "På hvilket kontinent startet første verdenskrig?",
  "r": "Europa",
  "f": [
   "Afrika",
   "Asia",
   "Nord-Amerika"
  ],
  "w": "Krigen startet på Balkan i Sørøst-Europa, men spredte seg til store deler av verden."
 },
 {
  "n": 1,
  "q": "Hva kalles et land som ikke tar side i en krig?",
  "r": "Nøytralt",
  "f": [
   "Alliert",
   "Okkupert",
   "Nasjonalistisk"
  ],
  "w": "Norge, Sverige, Danmark, Nederland og Sveits var blant de nøytrale landene i Europa."
 },
 {
  "n": 1,
  "q": "Hvilket av disse landene var IKKE med i Trippelententen?",
  "r": "USA",
  "f": [
   "Frankrike",
   "Storbritannia",
   "Russland"
  ],
  "w": "USA gikk først inn i krigen i 1917."
 },
 {
  "n": 2,
  "q": "I hvilken by ble Franz Ferdinand skutt og drept?",
  "r": "Sarajevo",
  "f": [
   "Beograd",
   "Wien",
   "Berlin"
  ],
  "w": "Attentatet skjedde i Sarajevo 28. juni 1914."
 },
 {
  "n": 2,
  "q": "Franz Ferdinand var tronarving i hvilket land?",
  "r": "Østerrike-Ungarn",
  "f": [
   "Serbia",
   "Tyskland",
   "Russland"
  ],
  "w": "Han var tronarving i keiserdømmet Østerrike-Ungarn."
 },
 {
  "n": 2,
  "q": "Hva kalles en avtale mellom land om å støtte hverandre militært?",
  "r": "Allianse",
  "f": [
   "Blokade",
   "Revolusjon",
   "Rasjonering"
  ],
  "w": "Alliansesystemet var en viktig grunn til at krigen spredte seg så raskt i 1914."
 },
 {
  "n": 2,
  "q": "Hvilket land byttet side og sluttet seg til ententen i 1915?",
  "r": "Italia",
  "f": [
   "Bulgaria",
   "Spania",
   "Hellas"
  ],
  "w": "Italia hadde vært med i Trippelalliansen, men erklærte krig mot Østerrike-Ungarn i mai 1915."
 },
 {
  "n": 2,
  "q": "Hvilket land kjempet Tyskland og Østerrike-Ungarn mot på østfronten?",
  "r": "Russland",
  "f": [
   "Frankrike",
   "Storbritannia",
   "Belgia"
  ],
  "w": "Østfronten gikk mellom sentralmaktene og Russland, med mer bevegelige kamper enn i vest."
 },
 {
  "n": 3,
  "q": "Hva kalles militær opprustning og våpenkappløp mellom land, en av årsakene til krigen?",
  "r": "Militarisme",
  "f": [
   "Imperialisme",
   "Pasifisme",
   "Diplomati"
  ],
  "w": "Tyskland og Storbritannia konkurrerte blant annet om å ha størst marine før krigen."
 },
 {
  "n": 3,
  "q": "Hvilket land erklærte USA krig mot i 1917?",
  "r": "Tyskland",
  "f": [
   "Russland",
   "Italia",
   "Serbia"
  ],
  "w": "USA gikk med i krigen mot Tyskland i 1917, blant annet på grunn av tysk ubåtkrig."
 },
 {
  "n": 3,
  "q": "Hva kalte man det da Tyskland forsøkte å stanse all skipstrafikk til Storbritannia med ubåter?",
  "r": "Uinnskrenket ubåtkrig",
  "f": [
   "Rasjonering",
   "Dyrtid",
   "Mobilisering"
  ],
  "w": "Dette rammet også nøytrale skip og bidro til at USA gikk med i krigen."
 },
 {
  "n": 3,
  "q": "Hvilken festningsby i Frankrike ble rammet av et av krigens blodigste slag i 1916?",
  "r": "Verdun",
  "f": [
   "Lyon",
   "Calais",
   "Reims"
  ],
  "w": "Slaget ved Verdun varte fra februar til desember 1916. Rundt 700 000 soldater ble drept eller såret."
 },
 {
  "n": 3,
  "q": "I hvilket slag i 1916 ble stridsvogner brukt for første gang?",
  "r": "Somme",
  "f": [
   "Verdun",
   "Marne",
   "Ypres"
  ],
  "w": "Slaget ved Somme varte fra juli til november 1916. Over en million soldater ble drept eller såret."
 },
 {
  "n": 4,
  "q": "Hva het den regjeringen som styrte Russland i en kort periode mellom tsarens fall og bolsjevikenes maktovertakelse?",
  "r": "Den provisoriske (midlertidige) regjering",
  "f": [
   "Sovjetunionens regjering",
   "Det russiske Folkeforbundet",
   "Tsarens krigskabinett"
  ],
  "w": "Den midlertidige regjeringen ønsket å demokratisere Russland, men fortsatte krigen, noe som var upopulært."
 },
 {
  "n": 4,
  "q": "Hvorfor var mange italienske ledere misfornøyde etter krigen, selv om Italia var på vinnersiden?",
  "r": "De følte seg lurt fordi de ikke fikk landområdene de var lovet",
  "f": [
   "Italia hadde ikke mistet noen soldater",
   "Italia måtte betale krigserstatning",
   "Italia mistet retten til å ha hær"
  ],
  "w": "Skuffelsen over fredsoppgjøret var en av grunnene til politisk uro og fascismens framvekst i Italia."
 },
 {
  "n": 4,
  "q": "Hva betyr «planøkonomi», slik det ble praktisert i Sovjetunionen?",
  "r": "Staten bestemmer hva som skal produseres og hva varene skal koste",
  "f": [
   "Hver bedrift planlegger sin egen produksjon fritt",
   "Prisene bestemmes av tilbud og etterspørsel",
   "Alle varer deles likt uansett hvor mye som produseres"
  ],
  "w": "Målet var et klasseløst samfunn, med staten – ikke private eiere – i kontroll over økonomien."
 },
 {
  "n": 4,
  "q": "Når brøt den russiske borgerkrigen ut, og når tok den slutt?",
  "r": "1917–1922",
  "f": [
   "1917–1918",
   "1914–1918",
   "1918–1920"
  ],
  "w": "Borgerkrigen startet rett etter maktovertakelsen i november 1917 og varte til 1922."
 },
 {
  "n": 4,
  "q": "Hvorfor valgte bolsjevikene å gå ut av første verdenskrig i 1918?",
  "r": "De ville konsentrere seg om borgerkrigen hjemme og innfri løftet om fred",
  "f": [
   "De hadde vunnet krigen",
   "Tyskland ba dem om det uten motkrav",
   "Folkeforbundet krevde det"
  ],
  "w": "Bolsjevikene hadde lovet folket fred, og måtte også håndtere motstand hjemme i Russland."
 },
 {
  "n": 5,
  "q": "Hva var «blankofullmakten» Tyskland ga Østerrike-Ungarn i 1914?",
  "r": "Et løfte om ubetinget støtte før angrepet på Serbia",
  "f": [
   "En fredsavtale mellom Tyskland og Russland",
   "Et handelsforbud mot Frankrike",
   "Et løfte om nøytralitet"
  ],
  "w": "Blankofullmakten ga Østerrike-Ungarn Tysklands fulle støtte uten noen klare grenser for hvor langt det kunne gå."
 },
 {
  "n": 5,
  "q": "Hva var «marsjen mot Roma» i 1922?",
  "r": "En væpnet marsj som fascistene arrangerte for å ta makten i Italia",
  "f": [
   "En fredsmarkering mot krigen",
   "En religiøs vandring til Vatikanet",
   "Kongens flukt fra Italia"
  ],
  "w": "Marsjen endte med at Benito Mussolini ble utnevnt til statsminister, og fascistene fikk snart all makt."
 },
 {
  "n": 5,
  "q": "Hvorfor var Russlands uttreden av krigen i 1918 til fordel for Tyskland på kort sikt?",
  "r": "Tyskland fikk flyttet soldater fra østfronten til vestfronten",
  "f": [
   "Russland begynte å kjempe på Tysklands side",
   "Tyskland overtok hele den russiske hæren",
   "Det hadde ingen betydning for Tyskland"
  ],
  "w": "Tyskland forsøkte å utnytte de frigjorte styrkene i en siste storoffensiv i vest i 1918, men det var for sent."
 },
 {
  "n": 5,
  "q": "Hvilke fire riker gikk i oppløsning som følge av første verdenskrig?",
  "r": "Østerrike-Ungarn, Det tyske keiserriket, Det russiske tsarriket og Det osmanske riket",
  "f": [
   "Storbritannia, Frankrike, USA og Italia",
   "Sverige, Norge, Danmark og Finland",
   "Spania, Portugal, Nederland og Belgia"
  ],
  "w": "Alle disse fire gamle keiserdømmene ble borte eller fundamentalt endret etter krigen."
 },
 {
  "n": 5,
  "q": "Hvorfor regnes Folkeforbundet som relativt mislykket med å forhindre en ny verdenskrig?",
  "r": "Det manglet makt til å håndheve egne vedtak, og store land som USA var ikke medlem",
  "f": [
   "Det ble oppløst allerede i 1920",
   "Det hadde ingen medlemsland i det hele tatt",
   "Det tok aldri stilling til noen konflikter"
  ],
  "w": "Uten egen hær og uten alle stormaktene som medlemmer kunne Folkeforbundet vanskelig stanse aggressive stater på 1930-tallet."
 }
];
