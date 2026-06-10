import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const hu: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  download: 'Letöltés',
  exportError: ({ err }) =>
    addError(getMessages()!, 'Hiba a exportálásakor', err),
  what: {
    plannedRoute: 'útvonal',
    plannedRouteWithStops: 'megállásokkal',
    objects: 'érdekes pontok (POI-k)',
    pictures: 'fényképek (a látható térképterületen)',
    drawingLines: 'rajzolás - vonalak',
    drawingAreas: 'rajzolás - sokszögek',
    drawingPoints: 'rajzolás - pontok',
    tracking: 'élő nyomkövetés',
    import: 'importált fájl',
    search: 'találat',
  },
  disabledAlert:
    'Csak azok az elemek aktívak, amelyekhez a térképen exportálható tartalom tartozik.',
  licenseAlert:
    'Különféle licencek vonatkozhatnak - például az OpenStreetMap. Kérjük, adja hozzá a hiányzó forrásokat az exportált fájl megosztásakor.',
  exportedToDropbox: 'Fájl elmentve a Dropboxba.',
  exportedToGdrive: 'Fájl elmentve a Google Drive-ra.',
  garmin: {
    courseName: 'Tanfolyam neve',
    description: 'Leírás',
    activityType: 'Tevékenység típusa',
    at: {
      running: 'Futás',
      hiking: 'Túrázás',
      other: 'Egyéb',
      mountain_biking: 'Hegyi kerékpározás',
      trailRunning: 'Terepfutás',
      roadCycling: 'Országúti kerékpározás',
      gravelCycling: 'Murvás kerékpározás',
    },
    revoked: 'A kurzus Garmin-ba való exportálása vissza lett vonva.',
    connectPrompt:
      'Még nincs csatlakoztatva Garmin fiókod. Szeretné most csatlakoztatni?',
    authPrompt:
      'Még nem vagy bejelentkezve a Garminonba. Szeretnél ez alkalommal bejelentkezni?',
  },
  format: 'Formátum',
  target: 'Cél',
};

export default hu;
