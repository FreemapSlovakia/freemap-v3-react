import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Turistika, Cyklo, Běžky, Jízda';

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
  mapScale: 'Rozlišení mapy',
  customLayerOrder: 'Umístění mapových dat',
  orders: {
    natural: 'Přirozené',
    topmost: 'Navrchu',
  },
  decorations: 'Dekorace mapy',
  scaleBar: 'Měřítko',
  northArrow: 'Směrová šipka',
  attribution: 'Uvedení zdroje',
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
      Exportuje se mapa <i>{outdoorMap}</i>. Může to trvat i desítky sekund.
    </>
  ),
};

export default cs;
