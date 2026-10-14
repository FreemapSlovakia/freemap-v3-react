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
  detail: (props) => <ObjectDetails {...props} />,
  elevation: 'Wysokość n.p.m.',
  terrain: {
    prominence: 'Wybitność',
    keyCol: 'Przełęcz kluczowa',
    isolation: 'Izolacja',
    showRoute: 'Pokaż drogę do wyższego terenu',
    hideRoute: 'Ukryj drogę',
    depth: 'Głębokość przełęczy',
    keyColOf: 'Przełęcz kluczowa szczytu',
    showOnMap: 'Pokaż na mapie',
    route: 'Droga do wyższego terenu',
    summitElevation: 'Wysokość szczytu',
    saddleElevation: 'Wysokość przełęczy',
    fromMarker: ({ distance }) => `${distance} od znacznika`,
  },
  routeFetchError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania drogi', err),
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
  moreGeneralTypes: 'Bardziej ogólne typy',
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (historia)',
  tooManyPoints: ({ limit }) =>
    `Wynik został ograniczony do ${limit} obiektów.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania obiektów (POI)', err),
  tooManyForLookup: ({ count, limit }) =>
    `Zbyt wiele obiektów, aby pokazać je jako wyniki (${count}, najwyżej ${limit}). Przybliż mapę lub zawęź filtr.`,
  showAsLookup: 'Pokaż jako Wynik',
  markerShape: 'Kształt znacznika',
  showAllAsLookup: 'Pokaż wszystko jako Wynik',
};

export default pl;
