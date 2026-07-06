import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const hu: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  style: {
    button: 'Jelölő stílusa',
    title: 'Objektum jelölőjének stílusa',
  },
  source: 'Forrás',
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Megnyitás az OpenStreetMap.org oldalon"
      historyText="előzmények"
      editInJosmText="Szerkesztés JOSM-ben"
    />
  ),
  type: 'Típus',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Ahhoz, hogy az objektumok típusok szerint látsszanak, legalább a ${minZoom}. szintre kell nagyítani.`,
    zoom: 'Nagyítás',
  },
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt az objektumok (POI-k) beolvasásánál',
      err,
    ),
  icon: {
    pin: 'Tű',
    ring: 'Gyűrű',
    square: 'Négyzet',
  },
  convertAsPoint: 'Pontként',
  convertWithGeometry: 'Teljes geometriával',
  showAsLookup: 'Megjelenítés találatként',
  convertAll: 'Minden látható objektum átalakítása rajzzá',
  tooManyPoints: ({ limit }) =>
    `Az eredmény ${limit} objektumra lett korlátozva.`,
  markerShape: 'Jelölő alakja',
};

export default hu;
