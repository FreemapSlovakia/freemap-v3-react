import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Turistika, Cyklo, Bežky, Jazdenie';

const sk: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Chyba exportovania mapy', err),
  cancelExportTitle: 'Zrušiť export',
  cancelExportQuestion: 'Naozaj chcete zrušiť prebiehajúci export?',
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
  alert: (licence) => (
    <>
      Upozornenia:
      <ul>
        <li>
          Exportuje sa mapa <i>{outdoorMap}</i>.
        </li>
        <li>Export mapy môže trvať aj desiatky sekúnd.</li>
        <li>
          Pri publikovaní mapy je nutné uviesť jej licenciu:
          <br />
          <em>{licence}</em>
        </li>
      </ul>
    </>
  ),
};

export default sk;
