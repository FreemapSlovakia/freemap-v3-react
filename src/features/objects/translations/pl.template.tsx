import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const pl: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  style: {
    button: 'Styl znacznika',
    title: 'Styl znacznika obiektu',
  },
  source: 'Źródło',
  detail: (props) => (
    <ObjectDetails
      {...props}
      openText="Otwórz na OpenStreetMap.org"
      historyText="historia"
      editInJosmText="Edytuj w JOSM"
    />
  ),
  elevation: 'Wysokość n.p.m.',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Aby zobaczyć obiekty według ich typu, powiększ co najmniej do poziomu ${minZoom}.`,
    zoom: 'Powiększ',
  },
  icon: {
    pin: 'Pinezka',
    ring: 'Pierścień',
    square: 'Kwadrat',
  },
  showDetails: 'Szczegóły',
  type: 'Typ',
  tooManyPoints: ({ limit }) =>
    `Wynik został ograniczony do ${limit} obiektów.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania obiektów (POI)', err),
  convertWithGeometry: 'Z pełną geometrią',
  tooManyForLookup: ({ count, limit }) =>
    `Zbyt wiele obiektów, aby pokazać je jako wyniki (${count}, najwyżej ${limit}). Przybliż mapę lub zawęź filtr.`,
  showAsLookup: 'Pokaż jako Wynik',
  allVisible: 'Wszystkie widoczne',
  thisObject: 'Ten obiekt',
  markerShape: 'Kształt znacznika',
};

export default pl;
