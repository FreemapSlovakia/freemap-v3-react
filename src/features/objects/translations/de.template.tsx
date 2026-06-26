import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const de: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  source: 'Quelle',
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Öffnen auf OpenStreetMap.org"
      historyText="Verlauf"
      editInJosmText="Bearbeiten in JOSM"
    />
  ),
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Um Objekte nach Typ anzuzeigen, müssen Sie mindestens auf Zoomstufe ${minZoom} heranzoomen.`,
    zoom: 'Heranzoomen',
  },
  icon: {
    pin: 'Stecknadel',
    ring: 'Ring',
    square: 'Quadrat',
  },
  convertAsPoint: 'Als Punkt',
  convertWithGeometry: 'Mit voller Geometrie',
  showAsLookup: 'Als Fund anzeigen',
  convertAll: 'Alle sichtbaren Objekte in Zeichnung umwandeln',
  type: 'Typ',
  tooManyPoints: ({ limit }) =>
    `Das Ergebnis wurde auf ${limit} Objekte begrenzt.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Objekte (POIs)', err),
  markerShape: 'Markerform',
};

export default de;
