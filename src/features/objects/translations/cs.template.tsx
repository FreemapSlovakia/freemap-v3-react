import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const cs: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  style: {
    button: 'Styl značky',
    title: 'Styl značky objektu',
  },
  source: 'Zdroj',
  detail: (props) => (
    <ObjectDetails
      {...props}
      openText="Otevřít na OpenStreetMap.org"
      historyText="historie"
      editInJosmText="Editovat v JOSM"
    />
  ),
  elevation: 'Nadmořská výška',
  showDetails: 'Podrobnosti',
  type: 'Typ',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Vyhledávání míst je možné až od přiblížení úrovně ${minZoom}.`,
    zoom: 'Přiblíž',
  },
  tooManyPoints: ({ limit }) => `Výsledek byl omezen na ${limit} objektů.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání objektů', err),
  icon: {
    pin: 'Špendlík',
    ring: 'Kruhová',
    square: 'Čtvercová',
  },
  convertWithGeometry: 'S celou geometrií',
  tooManyForLookup: ({ count, limit }) =>
    `Příliš mnoho objektů pro zobrazení jako nálezy (${count}, nejvýše ${limit}). Přibližte mapu nebo zužte filtr.`,
  showAsLookup: 'Zobrazit jako Nález',
  markerShape: 'Tvar značky',
};

export default cs;
