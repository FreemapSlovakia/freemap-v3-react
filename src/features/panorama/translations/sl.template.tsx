import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const sl: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => (
    <>Mesto opazovanja izberite z gumbom {icon} spodaj.</>
  ),
  rendering: 'Izrisovanje panorame…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Čakanje na izrisovalnik…'
      : ahead === 1
        ? 'Čakanje — pred vami je 1 panorama.'
        : ahead < 5
          ? `Čakanje — pred vami so ${ahead} panorame.`
          : `Čakanje — pred vami je ${ahead} panoram.`,
  cancel: 'Prekliči',
  update: 'Posodobi',
  outdated: 'Slika je s prejšnjega razgledišča.',
  locate: 'Pogled z mojega položaja',
  pickViewpoint: 'Izberi na zemljevidu',
  pickViewpointPrompt: 'Kliknite na zemljevid tja, od koder želite gledati',
  lookAt: 'Poglej kraj na zemljevidu',
  pickTargetPrompt: 'Kliknite na zemljevid tja, kamor želite pogledati',
  createToposcope: 'Ustvari panoramsko tablo iz tega pogleda',
  toposcopeMergeModal: {
    title: 'Zemljevid ni prazen',
    message:
      'Na zemljevidu so že narisane točke. Naj se vrhovi iz tega pogleda dodajo k njim ali naj jih zamenjajo? Središče table se tako ali tako premakne na to razgledišče.',
    append: 'Dodaj',
    replace: 'Zamenjaj',
  },
  settings: {
    title: 'Nastavitve panorame',
    tiltHint:
      'Koliko neba in tal zajame slika — kota nad obzorjem in pod njim.',
    custom: 'Natančna kota',
    depthLift: 'Razgrni daljavo',
    depthLiftOff: 'Verni pogled',
    depthLiftHint:
      'Dvigne oddaljeno površje, tako da se daljna pogorja ločijo od grebenov pred njimi — tako kot na ročno narisani panorami. S tem pridejo na sliko tudi vrhovi, ki jih od tod v resnici ne bi videli; njihova imena so označena.',
    rangeHint:
      'Površje nad 300 km sodi k premiju. Vsak dodatni kilometer se prehodi po vsakem žarku slike, zato daljši pogled izrisovalnik stane sorazmerno več.',
    look: 'Videz',
    looks: {
      natural: 'Naraven',
      relief: 'Osenčen relief',
      drawn: 'Risan',
      engraved: 'Vrezan',
      custom: 'Po meri',
    },
    ridgeStrength: 'Izrazitost grebenskih črt',
    ridgeWidth: 'Debelina grebenskih črt',
    ridgeColor: 'Barva grebenov',
    ground: 'Površje',
    groundHint:
      'Ena barva, ki jo vgrajena meglica z razdaljo spira proti barvi neba — ali preliv, ki površje pobarva glede na to, kako daleč je, in meglico povsem nadomesti.',
    groundSolid: 'Barva',
    groundGradient: 'Preliv',
    gradientFar: 'Preliv sega do',
    gradientFarAuto: 'Samodejno',
    gradientFarHint:
      'Razdalja, na kateri je dosežena zadnja barva; sredina traku leži pri njeni tretjini. Samodejno izmeri površje, ki je dejansko v sliki, tako da se vsa paleta porabi za to, kar slika kaže.',
    gradientSky: 'Zlij z nebom',
    gradientSkyHint:
      'Zadnja barva postane nebo samo, tako da se daljna pogorja razblinijo v obzorju, namesto da bi se od njega odbijala. Izklopljeno da ostro obrisano nebesno črto, kakršno hoče plakat.',
    gradientClip: 'Skrij površje onkraj',
    gradientClipHint:
      'Površje onkraj te razdalje se ne nariše, namesto da bi bilo ploskovno zapolnjeno z zadnjo barvo, tako da se ves preliv porabi za to, kar slika kaže. Vrhovi, ki stojijo na njem, niso poimenovani.',
  },
  preview: 'Predogled',
  quality: {
    label: 'Kakovost / hitrost',
    superfast: 'Najnižja / najhitrejša',
    fast: 'Nizka / hitra',
    standard: 'Standardna',
    detailed: 'Podrobna / počasna',
    finest: 'Najfinejša / najpočasnejša',
  },
  tilt: {
    label: 'Navpični obseg',
    standard: 'Standarden',
    wide: 'Visok',
    flat: 'Nizek',
  },
  labels: {
    title: 'Imena vrhov',
    density: 'Število imen',
    none: 'Brez',
    few: 'Manj',
    normal: 'Običajno',
    many: 'Več',
    weight: 'Vrhove vrednoti po',
    weightHint:
      'Po velikosti dobijo imena velike gore, naj bodo še tako daleč, po sredini to, kar zapolnjuje pogled, in po bližini to, kar je blizu, naj je videti kakor koli.',
    weights: [
      'Velikosti',
      'Bolj velikosti',
      'Velikosti in bližini',
      'Bolj bližini',
      'Bližini',
    ],
    prominence: 'Daj prednost pravim goram',
    prominenceOff: 'Izklopljeno',
    prominenceHint:
      'Vrh dobi ime zato, ker je gora sam po sebi, in ne le zato, kako izstopa od tam, kjer stojite — tako si ime zasluži tudi slaven vrh, vklenjen med višje sosede. Pri mnogih vrhovih je neznana in ti se presojajo kakor doslej.',
    haze: 'Kako daleč sežejo imena',
    hazeOff: 'Čist zrak',
    hazeHint:
      'Kako daleč mora biti vrh, da megla šteje več kakor vrh sam. Nad trikratnikom te razdalje ni poimenovano nič več.',
    showEle: 'Prikaži nadmorske višine',
    showEleHint:
      'Pod ime vsakega vrha izpiše njegovo višino. Napis je tedaj dvovrstičen, zato jih gre na sliko manj.',
    showRevealed: 'Poimenuj razkrite vrhove',
    showRevealedHint:
      'Vrhovi, ki jih je razgrnitev daljave potegnila izza bližjega grebena: narisani so, a od tod jih v resnici ni videti. Njihova imena so bledejša in kadar ni prostora za oba, ima prednost vrh, ki ga je videti.',
  },
  dominance: {
    label: 'Najmanjša dominanca',
    all: 'Poljubna',
  },
  autoPan: 'Vrti z napravo ali samodejno',
  peak: {
    title: ({ name, ele }) => (
      <>
        <b>{name}</b>
        {ele === null ? null : ` (${ele})`}
      </>
    ),
    figures: ({ distance, azimuth }) => `${distance}\xa0· ${azimuth}`,
  },
  errors: {
    offline: 'Panoramo izriše strežnik, vi pa ste brez povezave.',
    unreachable:
      'Izrisovalne storitve ni bilo mogoče doseči. Morda ne deluje ali pa nekaj med vami in njo zavrača zahtevo.',
    busy: 'Izrisovalna storitev trenutno ni na voljo. Poskusite čez trenutek.',
    tooMany:
      'V zadnjem času je bilo izrisanih preveč panoram. Poskusite pozneje ali si omislite premij.',
    noData:
      'Za to razgledišče ni podatkov o površju. Poskusite klikniti drugam.',
    failed: 'Panorame ni bilo mogoče izrisati.',
  },
  caveats: {
    title: 'Kaj slika kaže in česa ne',
    bareEarth:
      'Model površja je gola zemlja: gozdov in stavb v njem ni, zato je pogled, ki bi ga zakril gozd, narisan kot prost. To je daleč največji vir odstopanj.',
    coverage:
      'Podrobnost se razlikuje po državah. Kjer obstaja državni lasersko skenirani model, je bližnja okolica ostra; drugod odgovarja globalni 30-metrski model.',
    viewpoint:
      'Oko je postavljeno na najvišjo točko v obsegu nekaj metrov od vašega klika, da razgleda z vrha ne pokvari skala poleg vas.',
    depthLift:
      'Daljava je razgrnjena, zato je ta slika risba in ne fotografija: vrhove z bledejšim imenom v resnici zakriva greben pred njimi, razdalja, odčitana s slike, pa ne pomeni več proste vidne črte.',
  },
  terrainSource: 'Površje',
  peakSource: 'Imena vrhov',
};

export default sl;
