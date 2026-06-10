import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const it: DeepPartialWithRequiredObjects<ObjectsMessages> = {
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
};

export default it;
