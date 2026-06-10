import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const pl: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  what: {
    plannedRoute: 'znaleziona trasa',
    plannedRouteWithStops: 'z przystankami',
    objects: 'obiekty (POI)',
    pictures: 'zdjęcia (w widocznym obszarze mapy)',
    drawingLines: 'rysowanie – linie',
    drawingAreas: 'rysowanie – poligony',
    drawingPoints: 'rysowanie – punkty',
    tracking: 'śledzenie na żywo',
    import: 'zaimportowany plik',
    search: 'wynik',
  },
  garmin: {
    at: {
      running: 'Bieganie',
      hiking: 'Turystyka piesza',
      other: 'Inne',
      mountain_biking: 'Kolarstwo górskie',
      trailRunning: 'Bieg terenowy',
      roadCycling: 'Kolarstwo szosowe',
      gravelCycling: 'Kolarstwo żwirowe',
    },
    courseName: 'Nazwa trasy',
    description: 'Opis',
    activityType: 'Typ aktywności',
    revoked: 'Eksport trasy do Garmin został anulowany.',
    connectPrompt:
      'Twoje konto Garmin nie jest jeszcze podłączone. Chcesz je teraz połączyć?',
    authPrompt:
      'Nie jesteś jeszcze zalogowany do Garmin. Chcesz się teraz zalogować?',
  },
  download: 'Pobierz',
  format: 'Format',
  target: 'Cel',
  exportError: ({ err }) => addError(getMessages()!, 'Błąd eksportu', err),
  disabledAlert:
    'Tylko opcje, których obiekty są widoczne na mapie, są aktywne.',
  licenseAlert:
    'Do pliku mogą mieć zastosowanie różne licencje – np. OpenStreetMap. Pamiętaj o podaniu wymaganych informacji przy udostępnianiu.',
  exportedToDropbox: 'Plik został zapisany na Dropboxie.',
  exportedToGdrive: 'Plik został zapisany na Dysku Google.',
};

export default pl;
