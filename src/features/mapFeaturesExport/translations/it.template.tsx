import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const it: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  download: 'Download',
  format: 'Formato',
  exportError: ({ err }) => addError(getMessages()!, 'Error exporting:', err),
  what: {
    plannedRoute: 'trova percorso',
    plannedRouteWithStops: 'incluse fermate',
    objects: 'oggetti (POI)',
    pictures: 'foto (area di mappa visibile)',
    drawingLines: 'disegno - linee',
    drawingAreas: 'disegno - poligoni',
    drawingPoints: 'disegno - punti',
    tracking: 'tracciamento in tempo reale',
    import: 'file importato',
    search: 'risultato',
  },
  disabledAlert:
    'Sono abilitate solo le opzioni che hanno qualcosa da esportare nella mappa.',
  licenseAlert:
    'Possono essere applicate varie licenze, come OpenStreetMap. Aggiungi le attribuzioni mancanti durante la condivisione del file esportato.',
  exportedToDropbox: 'Il file è stato salvato su Dropbox.',
  exportedToGdrive: 'Il file è stato salvato su Google Drive.',
  garmin: {
    courseName: 'Nome del corso',
    description: 'Descrizione',
    activityType: 'Tipo di attività',
    at: {
      running: 'Corsa',
      hiking: 'Escursionismo',
      other: 'Altro',
      mountain_biking: 'Mountain bike',
      trailRunning: 'Corsa su sentiero',
      roadCycling: 'Ciclismo su strada',
      gravelCycling: 'Ciclismo su ghiaia',
    },
    revoked: "L'esportazione del corso su Garmin è stata revocata.",
    connectPrompt:
      'Non hai ancora collegato il tuo account Garmin. Vuoi collegarlo ora?',
    authPrompt:
      "Non hai ancora effettuato l'accesso a Garminon. Vuoi accedere questa volta?",
  },
  target: 'Destinazione',
};

export default it;
