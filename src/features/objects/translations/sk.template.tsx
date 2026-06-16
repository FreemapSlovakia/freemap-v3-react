import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const sk: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  source: 'Zdroj',
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Otvoriť na OpenStreetMap.org"
      historyText="história"
      editInJosmText="Editovať v JOSM"
    />
  ),
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
