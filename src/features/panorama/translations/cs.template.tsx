import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const cs: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: 'Klikněte do mapy a uvidíte výhled z toho místa.',
  rendering: 'Vykresluji panorama…',
  slow: 'Trvá to déle než obvykle.',
  busy: 'Vykreslovací služba je vytížená, může to chvíli trvat.',
  cancel: 'Zrušit',
  update: 'Aktualizovat',
  outdated: 'Obrázek je z předchozího stanoviště.',
  preview: 'Náhled',
  eyeElevation: 'Stanoviště',
  quality: {
    label: 'Kvalita / rychlost',
    superfast: 'Nejnižší / nejrychlejší',
    fast: 'Nízká / rychlá',
    standard: 'Standardní',
    detailed: 'Detailní / pomalá',
    finest: 'Nejjemnější / nejpomalejší',
    premiumHint:
      'Jemnější panorama se vykresluje až v šestinásobném rozlišení a s devítinásobným převzorkováním, takže hřebeny jsou vidět takové, jaké jsou, a ne jako schody. Na serveru, který vykresluje jedno panorama naráz, stojí každý stupeň úměrně více, proto jemnější stupně patří k prémiu.',
  },
  tilt: {
    label: 'Svislý rozsah',
    standard: 'Standardní',
    wide: 'Vysoký',
    flat: 'Nízký',
  },
  labels: {
    title: 'Názvy vrcholů',
    density: 'Počet názvů',
    none: 'Žádné',
    few: 'Méně',
    normal: 'Normálně',
    many: 'Více',
  },
  dominance: {
    label: 'Minimální dominance',
    all: 'Libovolná',
  },
  autoPan: 'Otáčet se zařízením nebo samo',
  fullscreen: 'Na celou obrazovku',
  peak: {
    elevation: 'Nadmořská výška',
    distance: 'Vzdálenost',
    azimuth: 'Azimut',
    showOnMap: 'Zobrazit v mapě',
  },
  errors: {
    offline: 'Panorama vykresluje server a vy jste offline.',
    unreachable:
      'Vykreslovací službu se nepodařilo kontaktovat. Může být mimo provoz, nebo něco mezi vámi a jí blokuje požadavek.',
    busy: 'Vykreslovací služba je momentálně nedostupná. Zkuste to za chvíli.',
    tooMany:
      'V poslední době bylo vykresleno příliš mnoho panoramat. Zkuste to později, nebo si pořiďte prémium.',
    noData: 'Pro toto stanoviště nejsou data o terénu. Zkuste kliknout jinde.',
    failed: 'Panorama se nepodařilo vykreslit.',
  },
  caveats: {
    title: 'Co obrázek ukazuje a co ne',
    bareEarth:
      'Model terénu je holá zem: lesy ani budovy v něm nejsou, takže výhled, který by les zakryl, je nakreslen jako volný. To je zdaleka největší zdroj odchylek.',
    coverage:
      'Podrobnost se liší podle země. Kde existuje národní laserový model, je blízké okolí ostré; jinde odpovídá globální 30m model.',
    viewpoint:
      'Oko je umístěno na nejvyšší bod v okruhu několika metrů od místa kliknutí, aby výhled z vrcholu nekazila skála vedle vás.',
  },
  terrainSource: 'Terén',
};

export default cs;
