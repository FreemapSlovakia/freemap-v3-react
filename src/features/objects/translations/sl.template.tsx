import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const sl: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  source: 'Vir',
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Odpri na OpenStreetMap.org"
      historyText="zgodovina"
      editInJosmText="Uredi v JOSM"
    />
  ),
  type: 'Tip',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Za prikaz objektov po njihovem tipu morate povečati vsaj na raven ${minZoom}.`,
    zoom: 'Približaj',
  },
  tooManyPoints: ({ limit }) => `Rezultat je bil omejen na ${limit} objektov.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pridobivanju objektov', err),
  markerShape: 'Oblika oznake',
  icon: {
    pin: 'Bucika',
    ring: 'Obroč',
    square: 'Kvadrat',
  },
  convertAsPoint: 'Kot točka',
  convertWithGeometry: 'S celotno geometrijo',
  showAsLookup: 'Prikaži kot Najdba',
  convertAll: 'Pretvori vse vidne objekte v risbo',
  style: {
    button: 'Slog oznake',
    title: 'Slog oznake objekta',
  },
};

export default sl;
