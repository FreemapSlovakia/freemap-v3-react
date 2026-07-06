import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const it: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  style: {
    button: 'Stile marcatore',
    title: 'Stile marcatore oggetto',
  },
  source: 'Fonte',
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Apri su OpenStreetMap.org"
      historyText="storia"
      editInJosmText="Modifica su JOSM"
    />
  ),
  type: 'Tipo',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Per vedere gli oggetti in base al loro tipo, devi ingrandire almeno al livello ${minZoom}.`,
    zoom: 'Zoom-in',
  },
  tooManyPoints: ({ limit }) => `Risultato limitato a ${limit} oggetti.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Errore nel recupero degli oggetti (POI):', err),
  icon: {
    pin: 'Segnaposto',
    ring: "Dell'anello",
    square: 'Quadrata',
  },
  convertAsPoint: 'Come punto',
  convertWithGeometry: 'Con la geometria completa',
  showAsLookup: 'Mostra come Risultato',
  convertAll: 'Converti tutti gli oggetti visibili in disegno',
  markerShape: 'Forma del marcatore',
};

export default it;
