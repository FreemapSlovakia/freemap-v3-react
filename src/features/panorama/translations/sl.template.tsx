import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const sl: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => (
    <>Mesto opazovanja izberite z gumbom {icon} spodaj.</>
  ),
  preparing: 'Panorama se pripravlja…',
  rendering: 'Izračun panorame…',
  encoding: 'Stiskanje slike…',
  decoding: 'Razpakiranje slike…',
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
    depthLift: 'Razgrni daljavo',
    depthLiftOff: 'Verni pogled',
    depthLiftHint:
      'Dvigne oddaljeno površje, tako da se daljna pogorja ločijo od grebenov pred njimi — tako kot na ročno narisani panorami. S tem pridejo na sliko tudi vrhovi, ki jih od tod v resnici ne bi videli; njihova imena so označena. Poti sonca in lune se nanjo ne rišejo.',
    rangeHint:
      'Površje nad 300 km je funkcija premija. Vsak dodatni kilometer se prehodi po vsakem žarku slike, zato daljši pogled izrisovalnik stane sorazmerno več.',
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
  quality: {
    detail: 'Podrobnost',
  },
  frame: 'Izrez in podrobnost',
  tilt: {
    label: 'Navpični obseg',
    standard: 'Standarden',
    wide: 'Visok',
    flat: 'Nizek',
    below: 'Pod obzorjem',
    above: 'Nad obzorjem',
  },
  fov: {
    label: 'Vodoravni obseg',
    full: 'Naokoli',
  },
  sky: {
    title: 'Sonce in luna',
    sun: 'Pot sonca',
    moon: 'Pot lune',
    date: 'Dan',
    dateHint:
      'Časi so v časovem pasu te naprave in označujejo, kdaj za terenom izgine zadnji delček diska ali se prikaže prvi. Teren je gola zemlja, zato ga drevesa in stavbe lahko zakrijejo prej.',
    today: 'Danes',
    lit: (percent) => `osvetljena ${percent}`,
    unfolded: (
      <>
        Ne na razgrnjeni sliki: njeno oddaljeno površje je narisano višje, kot
        stoji, zato bi poti sekale obzorje na napačnih mestih. V nastavitvah
        panorame nastavite <i>Razgrni daljavo</i> na <i>Verni pogled</i> in
        posodobite.
      </>
    ),
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
    subLine: 'Pod imenom',
    subLineHint:
      'Kaj pove druga vrstica napisa vsakega vrha. Če je vklopljeno karkoli od tega, je vsak napis dvovrstičen, zato jih gre na sliko manj. Prominenca (P) je, koliko se vrh dviga nad najnižjim sedlom na poti do višjega površja; izolacija (I) je, kako daleč je to višje površje.',
    subLineParts: {
      ele: 'Višina',
      distance: 'Razdalja',
      prominence: 'Prominenca',
      isolation: 'Izolacija',
    },
    subLineAbbr: { prominence: 'P', isolation: 'I' },
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
    viewpoint:
      'Oko je postavljeno na najvišjo točko v obsegu nekaj metrov od vašega klika, da razgleda z vrha ne pokvari skala poleg vas.',
    depthLift:
      'Daljava je razgrnjena, zato je ta slika risba in ne fotografija: vrhove z bledejšim imenom v resnici zakriva greben pred njimi, razdalja, odčitana s slike, pa ne pomeni več proste vidne črte.',
  },
  terrainSource: 'Površje',
  peakSource: 'Imena vrhov',
};

export default sl;
