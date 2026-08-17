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
  detail: (props) => (
    <ObjectDetails
      {...props}
      openText="Apri su OpenStreetMap.org"
      historyText="storia"
      editInJosmText="Modifica su JOSM"
    />
  ),
  elevation: 'Elevazione',
  showDetails: 'Dettagli',
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
  convertWithGeometry: 'Con la geometria completa',
  tooManyForLookup: ({ count, limit }) =>
    `Troppi oggetti da mostrare come risultati (${count}, al massimo ${limit}). Ingrandisci o restringi il filtro.`,
  showAsLookup: 'Mostra come Risultato',
  markerShape: 'Forma del marcatore',
};

export default it;
