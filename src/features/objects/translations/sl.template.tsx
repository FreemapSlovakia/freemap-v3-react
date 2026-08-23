import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const sl: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  source: 'Vir',
  detail: (props) => <ObjectDetails {...props} />,
  elevation: 'Nadmorska višina',
  showDetails: 'Podrobnosti',
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (zgodovina)',
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
  convertWithGeometry: 'S celotno geometrijo',
  convertWithGeometryTo: ({ tool }) => <>S celotno geometrijo v {tool}</>,
  tooManyForLookup: ({ count, limit }) =>
    `Preveč objektov za prikaz kot najdbe (${count}, največ ${limit}). Približajte ali zožite filter.`,
  showAsLookup: 'Prikaži kot Najdba',
  style: {
    button: 'Slog oznake',
    title: 'Slog oznake objekta',
  },
};

export default sl;
