import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const pl: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  source: 'Źródło',
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Otwórz na OpenStreetMap.org"
      historyText="historia"
      editInJosmText="Edytuj w JOSM"
    />
  ),
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
  type: 'Typ',
  tooManyPoints: ({ limit }) =>
    `Wynik został ograniczony do ${limit} obiektów.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas pobierania obiektów (POI)', err),
  convertAsPoint: 'Jako punkt',
  convertWithGeometry: 'Z pełną geometrią',
  showAsLookup: 'Pokaż jako Wynik',
  convertAll: 'Przekształć wszystkie widoczne obiekty na rysunek',
};

export default pl;
