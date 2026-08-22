import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const cs: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => <>Místo pohledu zvolte tlačítkem {icon} níže.</>,
  rendering: 'Vykresluji panorama…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Čeká se na vykreslovací službu…'
      : ahead === 1
        ? 'Čeká se — před vámi je 1 panorama.'
        : ahead < 5
          ? `Čeká se — před vámi jsou ${ahead} panoramata.`
          : `Čeká se — před vámi je ${ahead} panoramat.`,
  cancel: 'Zrušit',
  update: 'Aktualizovat',
  outdated: 'Obrázek je z předchozího stanoviště.',
  locate: 'Pohled z mé polohy',
  pickViewpoint: 'Vybrat v mapě',
  pickViewpointPrompt: 'Klikněte do mapy tam, odkud se chcete dívat',
  settings: {
    title: 'Nastavení panoramatu',
    eye: 'Výška očí',
    eyeHint:
      'Jak vysoko nad zemí stojíte — rozhledna či dron, ne nadmořská výška.',
    tiltHint:
      'Kolik oblohy a země obrázek zachytí — úhly nad obzorem a pod ním.',
    custom: 'Přesné úhly',
    look: 'Vzhled',
    looks: {
      natural: 'Přirozený',
      relief: 'Stínovaný reliéf',
      drawn: 'Kreslený',
      engraved: 'Rytina',
      custom: 'Vlastní',
    },
    ridgeStrength: 'Výraznost hřebenových linií',
    ridgeWidth: 'Tloušťka hřebenových linií',
    ridgeColor: 'Barva hřebenů',
    groundColor: 'Barva terénu',
  },
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
