import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Turistika, Cyklo, Bežky, Jazdenie';

const sk: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Chyba exportovania mapy', err),
  cancelExportTitle: 'Zrušiť export',
  labelTitle: 'Popisy',
  cancelExportQuestion: 'Naozaj chcete zrušiť prebiehajúci export?',
  discardExportTitle: 'Zahodiť export',
  discardExportQuestion:
    'Exportovaná mapa ešte nebola uložená. Chcete ju zahodiť?',
  area: 'Exportovať oblasť',
  format: 'Formát',
  layersTitle: 'Voliteľné vrstvy',
  mapDataTitle: 'Mapové dáta',
  layers: {
    contours: 'Vrstevnice',
    shading: 'Tieňovaný reliéf',
    hikingTrails: 'Turistické trasy',
    bicycleTrails: 'Cyklotrasy',
    skiTrails: 'Lyžiarske trasy',
    horseTrails: 'Jazdecké trasy',
  },
  mapScale: 'Rozlíšenie mapy',
  customLayerOrder: 'Umiestnenie mapových dát',
  orders: {
    natural: 'Prirodzené',
    topmost: 'Na vrchu',
  },
  decorations: 'Dekorácie mapy',
  scaleBar: 'Mierka',
  northArrow: 'Smerová šípka',
  attribution: 'Uvedenie zdroja',
  northArrowLetter: 'S',
  glow: 'Žiara',
  ready: 'Mapa je pripravená',
  readyCredits: 'Pri publikovaní alebo zdieľaní mapy uveďte tieto zdroje:',
  readyCreditsNone: 'Renderer neoznámil, ktoré zdroje použil.',
  readyUnknownSources: 'Zdroje, ktoré sa nepodarilo pomenovať:',
  copyCredits: 'Kopírovať zdroje',
  openInNewTab: 'Otvoriť na novej karte',
  savedCredits: ({ credits }) =>
    `Mapa je uložená. Pri jej publikovaní alebo zdieľaní uveďte: ${credits}`,
  alert: () => (
    <>
      Exportuje sa mapa <i>{outdoorMap}</i>. Môže to trvať aj desiatky sekúnd.
    </>
  ),
};

export default sk;
