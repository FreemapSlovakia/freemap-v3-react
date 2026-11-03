import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = () => getMessages()?.mapLayers.letters['X'];

const cs: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) => addError(getMessages()!, 'Chyba exportu mapy', err),
  cancelExportTitle: 'Zrušit export',
  labelTitle: 'Popisky',
  cancelExportQuestion: 'Opravdu chcete zrušit probíhající export?',
  discardExportTitle: 'Zahodit export',
  discardExportQuestion:
    'Exportovaná mapa ještě nebyla uložena. Chcete ji zahodit?',
  area: 'Exportovat oblast',
  format: 'Formát',
  layersTitle: 'Volitelné vrstvy',
  mapDataTitle: 'Mapová data',
  mapTitle: 'Mapa',
  layers: {
    contours: 'Vrstevnice',
    shading: 'Stínovaný reliéf',
    hikingTrails: 'Turistické trasy',
    bicycleTrails: 'Cyklotrasy',
    skiTrails: 'Lyžařské trasy',
    horseTrails: 'Jezdecké trasy',
    sacScale: 'Náročnost stezek',
    mtbScale: 'Obtížnost MTB tras',
    smoothness: 'Kvalita povrchu cest',
    waymarking: 'Rozcestníky',
  },
  baseMap: 'Podkladová mapa',
  noBaseMapHint: 'Vykreslí se jen vybrané vrstvy, zbytek bude průhledný.',
  omitTitle: 'Vynechat',
  omit: {
    groundCover: 'Krajinný pokryv',
    buildings: 'Budovy',
  },
  omitHint:
    'Na místě vynechaného průhledná — k překrytí letecké snímky, která to ukáže lépe.',
  lossless: 'Bezztrátová',
  lossy: 'Ztrátová',
  quality: 'Kvalita',
  sizeTitle: 'Velikost a podrobnost',
  zoom: 'Úroveň přiblížení',
  printScale: 'Měřítko',
  mapScale: 'Rozlišení mapy',
  printSize: 'Velikost výtisku',
  imageSize: 'Velikost obrázku',
  lock: 'Zamknout',
  unlock: 'Odemknout',
  scaleFollowsZoom: 'Nezamčené měřítko se řídí přiblížením.',
  symbolSize: ({ percent }) =>
    `Texty a značky se vytisknou na ${percent} % běžné velikosti`,
  tooLarge: ({ zoom }) =>
    zoom === null
      ? 'Oblast je pro export příliš velká. Exportujte menší oblast.'
      : `Oblast je pro tuto úroveň přiblížení příliš velká. Snižte přiblížení na ${zoom} nebo exportujte menší oblast.`,
  customLayerOrder: 'Umístění mapových dat',
  orders: {
    natural: 'Přirozené',
    topmost: 'Navrchu',
  },
  decorations: 'Dekorace mapy',
  scaleBar: 'Měřítko',
  northArrow: 'Směrová šipka',
  attribution: 'Uvedení zdroje',
  legend: 'Legenda',
  legendWidens:
    'Legenda je vedle mapy, takže dokument bude širší než zvolený papír.',
  webpTooLarge:
    'WebP dovoluje nejvýše 16383 px na stranu, což tento export může překročit. Zvolte PNG nebo nižší DPI.',
  northArrowLetter: 'S',
  glow: 'Záře',
  ready: 'Mapa je připravena',
  readyCredits: 'Při publikování nebo sdílení mapy uveďte tyto zdroje:',
  readyCreditsNone: 'Renderer neoznámil, které zdroje použil.',
  readyUnknownSources: 'Zdroje, které se nepodařilo pojmenovat:',
  copyCredits: 'Kopírovat zdroje',
  openInNewTab: 'Otevřít na nové kartě',
  savedCredits: ({ credits }) =>
    `Mapa je uložena. Při jejím publikování nebo sdílení uveďte: ${credits}`,
  alert: () => (
    <>
      Exportuje se <i>{outdoorMap()}</i> mapa. Může to trvat i desítky sekund.
    </>
  ),
};

export default cs;
