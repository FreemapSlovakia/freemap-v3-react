import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const sk: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  source: 'Zdroj',
  detail: (props) => (
    <ObjectDetails
      {...props}
      openText="Otvoriť na OpenStreetMap.org"
      historyText="história"
      editInJosmText="Editovať v JOSM"
    />
  ),
  elevation: 'Nadmorská výška',
  showDetails: 'Podrobnosti',
  type: 'Typ',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Vyhľadávanie miest je možné až od priblíženia úrovne ${minZoom}.`,
    zoom: 'Priblíž',
  },
  tooManyPoints: ({ limit }) => `Výsledok bol obmedzený na ${limit} objektov.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní objektov', err),
  markerShape: 'Tvar značky',
  icon: {
    pin: 'Špendlík',
    ring: 'Okrúhla',
    square: 'Štvorcová',
  },
  convertWithGeometry: 'S celou geometriou',
  tooManyForLookup: ({ count, limit }) =>
    `Priveľa objektov na zobrazenie ako nálezy (${count}, najviac ${limit}). Priblížte mapu alebo zúžte filter.`,
  showAsLookup: 'Zobraziť ako Nález',
  style: {
    button: 'Štýl značky',
    title: 'Štýl značky objektu',
  },
};

export default sk;
