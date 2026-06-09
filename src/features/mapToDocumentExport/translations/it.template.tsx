import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Escursionismo, Ciclismo, Sci, Cavallo';

const it: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Error exporting map:', err),
  cancelExportTitle: 'Annulla esportazione',
  cancelExportQuestion: "Vuoi davvero annullare l'esportazione in corso?",
  area: 'Esporta area',
  format: 'Formato',
  layersTitle: 'Livelli opzionali',
  mapDataTitle: 'Dati mappa',
  layers: {
    contours: 'Curve di livello',
    shading: 'Rilievi ombreggiati',
    hikingTrails: 'Percorsi escursionistici',
    bicycleTrails: 'Percorsi ciclistici',
    skiTrails: 'Percorsi sciistici',
    horseTrails: 'Percorsi a cavallo',
  },
  mapScale: 'Risoluzione mappa',
  customLayerOrder: 'Posizionamento dei dati mappa',
  orders: {
    natural: 'Naturale',
    topmost: 'In primo piano',
  },
  decorations: 'Decorazioni mappa',
  scaleBar: 'Barra della scala',
  northArrow: 'Freccia del nord',
  attribution: 'Attribuzione',
  northArrowLetter: 'N',
  glow: 'Alone',
  alert: (licence) => (
    <>
      Note:
      <ul>
        <li>
          Sarà esportata la mappa <i>{outdoorMap}</i> .
        </li>
        <li>L\'esportazione della mappa potrebbe durare diversi secondi.</li>
        <li>
          Prima di condividere la mappa esportata, aggiungi la seguente
          attribuzione:
          <br />
          <em>{licence}</em>
        </li>
      </ul>{' '}
    </>
  ),
};

export default it;
