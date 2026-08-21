import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const sk: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: 'Kliknite do mapy a uvidíte výhľad z toho miesta.',
  rendering: 'Vykresľujem panorámu…',
  slow: 'Trvá to dlhšie ako zvyčajne.',
  busy: 'Vykresľovacia služba je vyťažená, môže to chvíľu trvať.',
  cancel: 'Zrušiť',
  update: 'Aktualizovať',
  outdated: 'Obrázok je z predchádzajúceho stanoviska.',
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
  },
  dominance: {
    label: 'Minimálna dominancia',
    all: 'Ľubovoľná',
  },
  autoPan: 'Otáčať samo',
  fullscreen: 'Na celú obrazovku',
  peak: {
    elevation: 'Nadmorská výška',
    distance: 'Vzdialenosť',
    azimuth: 'Azimut',
    showOnMap: 'Zobraziť v mape',
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
  },
  terrainSource: 'Terén',
};

export default sk;
