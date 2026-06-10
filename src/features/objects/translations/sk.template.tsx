import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const sk: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  type: 'Typ',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Vyhľadávanie miest je možné až od priblíženia úrovne ${minZoom}.`,
    zoom: 'Priblíž',
  },
  tooManyPoints: ({ limit }) => `Výsledok bol obmedzený na ${limit} objektov.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní objektov', err),
  icon: {
    pin: 'Špendlík',
    ring: 'Okrúhla',
    square: 'Štvorcová',
  },
  convertAsPoint: 'Ako bod',
  convertWithGeometry: 'S celou geometriou',
  showAsLookup: 'Zobraziť ako Nález',
  convertAll: 'Skonvertovať všetky viditeľné objekty na kreslenie',
};

export default sk;
