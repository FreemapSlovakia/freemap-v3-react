import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Hiking, Bicycle, Ski, Riding';

const en: MapToDocumentExportMessages = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Error exporting map', err),
  cancelExportTitle: 'Cancel export',
  cancelExportQuestion: 'Do you really want to cancel the running export?',
  area: 'Export area',
  format: 'Format',
  layersTitle: 'Optional layers',
  mapDataTitle: 'Map data',
  layers: {
    contours: 'Contours',
    shading: 'Shaded relief',
    hikingTrails: 'Hiking trails',
    bicycleTrails: 'Bicycle trails',
    skiTrails: 'Ski trails',
    horseTrails: 'Horse trails',
  },
  mapScale: 'Map resolution',
  customLayerOrder: 'Map data placement',
  orders: {
    natural: 'Natural',
    topmost: 'Topmost',
  },
  decorations: 'Map decorations',
  scaleBar: 'Scale bar',
  northArrow: 'North arrow',
  attribution: 'Attribution',
  northArrowLetter: 'N',
  glow: 'Glow',
  labelTitle: 'Labels',
  alert: (licence) => (
    <>
      Notes:
      <ul>
        <li>
          Exported will be <i>{outdoorMap}</i> map.
        </li>
        <li>Export of the map may last tens of seconds.</li>
        <li>
          Before sharing exported map accompain it with the following
          attribution:
          <br />
          <em>{licence}</em>
        </li>
      </ul>{' '}
    </>
  ),
};

export default en;
