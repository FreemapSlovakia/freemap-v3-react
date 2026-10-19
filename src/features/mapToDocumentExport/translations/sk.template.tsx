import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = () => getMessages()?.mapLayers.letters['X'];

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
  mapTitle: 'Mapa',
  layers: {
    contours: 'Vrstevnice',
    shading: 'Tieňovaný reliéf',
    hikingTrails: 'Turistické trasy',
    bicycleTrails: 'Cyklotrasy',
    skiTrails: 'Lyžiarske trasy',
    horseTrails: 'Jazdecké trasy',
    sacScale: 'Náročnosť chodníkov',
    mtbScale: 'Náročnosť MTB trás',
    smoothness: 'Kvalita povrchu ciest',
    waymarking: 'Smerovníky',
  },
  baseMap: 'Podkladová mapa',
  noBaseMapHint: 'Vykreslia sa len vybrané vrstvy, zvyšok bude priehľadný.',
  omitTitle: 'Vynechať',
  omit: {
    groundCover: 'Krajinná pokrývka',
    buildings: 'Budovy',
  },
  omitHint:
    'Na mieste vynechaného priehľadná — na prekrytie leteckej snímky, ktorá to ukáže lepšie.',
  lossless: 'Bezstratová',
  lossy: 'Stratová',
  quality: 'Kvalita',
  sizeTitle: 'Veľkosť a podrobnosť',
  zoom: 'Úroveň priblíženia',
  printScale: 'Mierka',
  mapScale: 'Rozlíšenie mapy',
  printSize: 'Veľkosť výtlačku',
  imageSize: 'Veľkosť obrázka',
  lock: 'Zamknúť',
  unlock: 'Odomknúť',
  scaleFollowsZoom: 'Nezamknutá mierka sa riadi priblížením.',
  symbolSize: ({ percent }) =>
    `Texty a značky sa vytlačia na ${percent} % bežnej veľkosti`,
  tooLarge: ({ zoom }) =>
    zoom === null
      ? 'Oblasť je na export príliš veľká. Exportujte menšiu oblasť.'
      : `Oblasť je pre túto úroveň priblíženia príliš veľká. Znížte priblíženie na ${zoom} alebo exportujte menšiu oblasť.`,
  customLayerOrder: 'Umiestnenie mapových dát',
  orders: {
    natural: 'Prirodzené',
    topmost: 'Na vrchu',
  },
  decorations: 'Dekorácie mapy',
  scaleBar: 'Mierka',
  northArrow: 'Smerová šípka',
  attribution: 'Uvedenie zdroja',
  legend: 'Legenda',
  legendWidens:
    'Legenda je vedľa mapy, takže dokument bude širší ako zvolený papier.',
  webpTooLarge:
    'WebP dovoľuje najviac 16383 px na stranu, čo tento export môže prekročiť. Zvoľte PNG alebo nižšie DPI.',
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
      Exportuje sa <i>{outdoorMap()}</i> mapa. Môže to trvať aj desiatky sekúnd.
    </>
  ),
};

export default sk;
