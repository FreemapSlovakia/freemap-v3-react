import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const sk: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => <>Miesto pohľadu zvoľte tlačidlom {icon} nižšie.</>,
  rendering: 'Vykresľujem panorámu…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Čaká sa na vykresľovaciu službu…'
      : ahead === 1
        ? 'Čaká sa — pred vami je 1 panoráma.'
        : ahead < 5
          ? `Čaká sa — pred vami sú ${ahead} panorámy.`
          : `Čaká sa — pred vami je ${ahead} panorám.`,
  cancel: 'Zrušiť',
  update: 'Aktualizovať',
  outdated: 'Obrázok je z predchádzajúceho stanoviska.',
  locate: 'Pohľad z mojej polohy',
  pickViewpoint: 'Vybrať v mape',
  pickViewpointPrompt: 'Kliknite do mapy tam, odkiaľ sa chcete pozerať',
  createToposcope: 'Vytvoriť orientačnú ružicu z tohto výhľadu',
  toposcopeMergeModal: {
    title: 'Mapa nie je prázdna',
    message:
      'V mape sú už nakreslené body. Pridať k nim vrcholy z tohto výhľadu, alebo ich nahradiť? Stred ružice sa tak či tak presunie na toto stanovisko.',
    append: 'Pridať',
    replace: 'Nahradiť',
  },
  settings: {
    title: 'Nastavenia panorámy',
    eye: 'Výška očí',
    eyeHint:
      'Ako vysoko nad zemou stojíte — rozhľadňa či dron, nie nadmorská výška.',
    tiltHint:
      'Koľko oblohy a zeme obrázok zachytí — uhly nad obzorom a pod ním.',
    custom: 'Presné uhly',
    depthLift: 'Rozvinúť diaľku',
    depthLiftOff: 'Verný pohľad',
    depthLiftHint:
      'Nadvihne vzdialený terén, takže sa ďaleké pohoria oddelia od hrebeňov pred nimi — tak, ako to robia ručne kreslené panorámy. Zároveň tým do obrázka pribudnú vrchy, ktoré by ste odtiaľto v skutočnosti nevideli; ich názvy sú odlíšené.',
    range: 'Maximálna viditeľná vzdialenosť',
    rangeHint:
      'Terén nad 300 km patrí prémiu. Každý kilometer navyše sa prejde po každom lúči obrázka, takže vzdialenejší výhľad stojí vykresľovanie úmerne viac.',
    look: 'Vzhľad',
    looks: {
      natural: 'Prirodzený',
      relief: 'Tieňovaný reliéf',
      drawn: 'Kreslený',
      engraved: 'Rytina',
      custom: 'Vlastný',
    },
    ridgeStrength: 'Výraznosť hrebeňových línií',
    ridgeWidth: 'Hrúbka hrebeňových línií',
    ridgeColor: 'Farba hrebeňov',
    groundColor: 'Farba terénu',
  },
  preview: 'Náhľad',
  eyeElevation: 'Stanovisko',
  quality: {
    label: 'Kvalita / rýchlosť',
    superfast: 'Najnižšia / najrýchlejšia',
    fast: 'Nízka / rýchla',
    standard: 'Štandardná',
    detailed: 'Detailná / pomalá',
    finest: 'Najjemnejšia / najpomalšia',
    premiumHint:
      'Jemnejšia panoráma sa vykresľuje až v šesťnásobnom rozlíšení a s deväťnásobným prevzorkovaním, takže hrebene vidno také, aké sú, a nie ako schody. Na serveri, ktorý vykresľuje jednu panorámu naraz, stojí každý stupeň úmerne viac, preto jemnejšie stupne patria k prémiu.',
  },
  tilt: {
    label: 'Zvislý rozsah',
    standard: 'Štandardný',
    wide: 'Vysoký',
    flat: 'Nízky',
  },
  labels: {
    title: 'Názvy vrchov',
    density: 'Počet názvov',
    none: 'Žiadne',
    few: 'Menej',
    normal: 'Normálne',
    many: 'Viac',
    weight: 'Hodnotiť vrchy podľa',
    weightHint:
      'Podľa veľkosti sa pomenujú veľhory nech sú akokoľvek ďaleko, podľa stredu to, čo vypĺňa pohľad, a podľa blízkosti to, čo je blízko, nech to vyzerá akokoľvek.',
    weights: [
      'Veľkosti',
      'Skôr veľkosti',
      'Veľkosti aj blízkosti',
      'Skôr blízkosti',
      'Blízkosti',
    ],
    haze: 'Dokiaľ siahajú názvy',
    hazeOff: 'Čistý vzduch',
    hazeHint:
      'Ako ďaleko musí vrch byť, aby opar znamenal viac ako samotný vrch. Nad trojnásobkom tejto vzdialenosti sa už nepomenuje nič.',
    showRevealed: 'Pomenovať odhalené vrchy',
    showRevealedHint:
      'Vrchy, ktoré rozvinutie diaľky vytiahlo spoza bližšieho hrebeňa: sú nakreslené, no odtiaľto ich v skutočnosti nevidno. Ich názvy sú svetlejšie a keď nie je miesto pre oba, prednosť dostane vrch, ktorý vidno.',
  },
  dominance: {
    label: 'Minimálna dominancia',
    all: 'Ľubovoľná',
  },
  autoPan: 'Otáčať so zariadením alebo samo',
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
    offline: 'Panorámu vykresľuje server a vy ste offline.',
    unreachable:
      'Vykresľovaciu službu sa nepodarilo kontaktovať. Môže byť mimo prevádzky, alebo niečo medzi vami a ňou blokuje požiadavku.',
    busy: 'Vykresľovacia služba je momentálne nedostupná. Skúste to o chvíľu.',
    tooMany:
      'V poslednom čase bolo vykreslených priveľa panorám. Skúste to neskôr alebo si zaobstarajte prémium.',
    noData: 'Pre toto stanovisko nie sú údaje o teréne. Skúste kliknúť inde.',
    failed: 'Panorámu sa nepodarilo vykresliť.',
  },
  caveats: {
    title: 'Čo obrázok ukazuje a čo nie',
    bareEarth:
      'Model terénu je holá zem: lesy ani budovy v ňom nie sú, takže výhľad, ktorý by les zakryl, je nakreslený ako voľný. Toto je zďaleka najväčší zdroj odchýlok.',
    coverage:
      'Podrobnosť sa líši podľa krajiny. Kde existuje národný laserový model, je blízke okolie ostré; inde odpovedá globálny 30 m model.',
    viewpoint:
      'Oko je umiestnené na najvyšší bod v okruhu niekoľkých metrov od miesta kliknutia, aby výhľad z vrcholu nekazila skala vedľa vás.',
    depthLift:
      'Diaľka je rozvinutá, takže tento obrázok je kresba, nie fotografia: vrchy so svetlejším názvom zakrýva v skutočnosti hrebeň pred nimi a vzdialenosť odčítaná z obrázka už neznamená priamy výhľad.',
  },
  terrainSource: 'Terén',
};

export default sk;
