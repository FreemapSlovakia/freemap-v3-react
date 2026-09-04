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
  lookAt: 'Podívat se na místo v mapě',
  pickTargetPrompt: 'Klikněte do mapy tam, kam se chcete podívat',
  createToposcope: 'Vytvořit orientační růžici z tohoto výhledu',
  toposcopeMergeModal: {
    title: 'Mapa není prázdná',
    message:
      'V mapě jsou už nakreslené body. Přidat k nim vrcholy z tohoto výhledu, nebo je nahradit? Střed růžice se tak či tak přesune na toto stanoviště.',
    append: 'Přidat',
    replace: 'Nahradit',
  },
  settings: {
    title: 'Nastavení panoramatu',
    tiltHint:
      'Kolik oblohy a země obrázek zachytí — úhly nad obzorem a pod ním.',
    custom: 'Přesné úhly',
    depthLift: 'Rozvinout dálku',
    depthLiftOff: 'Věrný pohled',
    depthLiftHint:
      'Nadzvedne vzdálený terén, takže se daleká pohoří oddělí od hřebenů před nimi — tak, jak to dělají ručně kreslená panoramata. Zároveň se tím do obrázku dostanou vrcholy, které byste odtud ve skutečnosti neviděli; jejich názvy jsou odlišené.',
    rangeHint:
      'Terén nad 300 km patří prémiu. Každý kilometr navíc se projde po každém paprsku obrázku, takže vzdálenější výhled stojí vykreslování úměrně víc.',
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
    ground: 'Terén',
    groundHint:
      'Jedna barva, kterou vestavěný opar s rostoucí vzdáleností splachuje do barvy oblohy — nebo přechod, který terén obarví podle toho, jak je daleko, a opar zcela nahradí.',
    groundSolid: 'Barva',
    groundGradient: 'Přechod',
    gradientFar: 'Přechod sahá do',
    gradientFarAuto: 'Automaticky',
    gradientFarHint:
      'Vzdálenost, v níž je dosažena poslední barva; střed pruhu leží v její třetině. Automaticky ji změří z terénu, který je právě v záběru, takže se celá paleta spotřebuje na to, co je na obrázku.',
    gradientSky: 'Splynout s oblohou',
    gradientSkyHint:
      'Poslední barvou se stane samotná obloha, takže se vzdálená pohoří rozplynou v horizontu, místo aby se o něj opírala. Vypnuté dá tvrdý obrys, jaký chce plakát.',
    gradientClip: 'Skrýt terén za tím',
    gradientClipHint:
      'Terén za touto vzdáleností se nevykreslí, místo aby byl vyplněn poslední barvou, takže se celý přechod spotřebuje na to, co je na obrázku. Vrcholy, které na něm stojí, se nepojmenují.',
  },
  preview: 'Náhled',
  quality: {
    label: 'Kvalita / rychlost',
    superfast: 'Nejnižší / nejrychlejší',
    fast: 'Nízká / rychlá',
    standard: 'Standardní',
    detailed: 'Detailní / pomalá',
    finest: 'Nejjemnější / nejpomalejší',
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
    weight: 'Hodnotit vrcholy podle',
    weightHint:
      'Podle velikosti se pojmenují velehory ať jsou jakkoli daleko, podle středu to, co vyplňuje pohled, a podle blízkosti to, co je blízko, ať to vypadá jakkoli.',
    weights: [
      'Velikosti',
      'Spíše velikosti',
      'Velikosti i blízkosti',
      'Spíše blízkosti',
      'Blízkosti',
    ],
    prominence: 'Upřednostnit skutečné hory',
    prominenceOff: 'Vypnuto',
    prominenceHint:
      'Vrchol dostane jméno za to, že je horou sám o sobě, nejen za to, jak vyčnívá odtud, kde právě stojíte — takže i slavný štít vklíněný mezi vyššími sousedy si jméno zaslouží. U mnoha vrcholů je neznámá a ty se posuzují jako dosud.',
    haze: 'Kam až dosáhnou názvy',
    hazeOff: 'Čistý vzduch',
    hazeHint:
      'Jak daleko musí vrchol být, aby opar znamenal víc než samotný vrchol. Nad trojnásobkem této vzdálenosti se už nic nepojmenuje.',
    showEle: 'Zobrazit nadmořské výšky',
    showEleHint:
      'Pod jméno každého vrcholu napíše jeho výšku. Popisek je pak dvouřádkový, takže se jich do obrázku vejde méně.',
    showRevealed: 'Pojmenovat odhalené vrcholy',
    showRevealedHint:
      'Vrcholy, které rozvinutí dálky vytáhlo zpoza bližšího hřebene: jsou nakreslené, ale odtud je ve skutečnosti není vidět. Jejich názvy jsou světlejší a když není místo pro oba, přednost dostane vrchol, který je vidět.',
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
    depthLift:
      'Dálka je rozvinutá, takže tento obrázek je kresba, ne fotografie: vrcholy se světlejším názvem ve skutečnosti zakrývá hřeben před nimi a vzdálenost odečtená z obrázku už neznamená přímý výhled.',
  },
  terrainSource: 'Terén',
  peakSource: 'Názvy vrcholů',
};

export default cs;
