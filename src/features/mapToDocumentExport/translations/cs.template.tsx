import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Turistika, Cyklo, Běžky, Jízda';

const cs: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) => addError(getMessages()!, 'Chyba exportu mapy', err),
  cancelExportTitle: 'Zrušit export',
  cancelExportQuestion: 'Opravdu chcete zrušit probíhající export?',
  area: 'Exportovat oblast',
  format: 'Formát',
  layersTitle: 'Volitelné vrstvy',
  mapDataTitle: 'Mapová data',
  layers: {
    contours: 'Vrstevnice',
    shading: 'Stínovaný reliéf',
    hikingTrails: 'Turistické trasy',
    bicycleTrails: 'Cyklotrasy',
    skiTrails: 'Lyžařské trasy',
    horseTrails: 'Jezdecké trasy',
  },
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
  alert: (licence) => (
    <>
      Upozornění:
      <ul>
        <li>
          Exportuje se mapa <i>{outdoorMap}</i>.
        </li>
        <li>Export mapy může trvat i desítky sekund.</li>
        <li>
          Při publikované mapy je do ní nutno uvést její licenci:
          <br />
          <em>{licence}</em>
        </li>
      </ul>{' '}
    </>
  ),
};

export default cs;
