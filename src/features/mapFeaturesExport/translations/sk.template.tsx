import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const sk: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  download: 'Stiahnuť',
  format: 'Formát',
  target: 'Cieľ',
  elevation: {
    label: 'Nadmorská výška',
    none: 'Ponechať',
    missing: 'Doplniť chýbajúcu',
    all: 'Prepísať všetku',
  },
  exportError: ({ err }) => addError(getMessages()!, 'Chyba exportovania', err),
  what: {
    plannedRoute: 'vyhľadanú trasu',
    plannedRouteWithStops: 'so zastávkami',
    objects: 'objekty (POI)',
    pictures: 'fotografie (vo viditeľnej časti mapy)',
    drawingLines: 'kreslenie - čiary',
    drawingAreas: 'kreslenie - polygóny',
    drawingPoints: 'kreslenie - body',
    tracking: 'sledovanie',
    import: 'importovaný súbor',
    search: 'nález',
  },
  onlySelected: 'Iba vybraný prvok',
  disabledAlert: 'Aktívne sú iba voľby, ktorých objekty sa nachádzajú na mape.',
  licenseAlert:
    'Exportovaný súbor môže podliehať rôznym licenciám, ako napríklad licencii OpenStreetMap. Prosím dodržte podmienky týchto licencií pri zdieľaní vyexportovaného súboru.',
  exportedToDropbox: 'Súbor bol uložený do Dropboxu.',
  exportedToGdrive: 'Súbor bol uložený do Google Drive.',
  garmin: {
    courseName: 'Názov kurzu',
    description: 'Popis',
    activityType: 'Typ aktivity',
    at: {
      running: 'Beh',
      hiking: 'Turistika',
      other: 'Iné',
      mountain_biking: 'Horská cyklistika',
      trailRunning: 'Trailový beh',
      roadCycling: 'Cestná cyklistika',
      gravelCycling: 'Štrková cyklistika',
    },
    revoked: 'Exportovanie kurzu do Garminu bolo zrušené.',
    exportError: 'Chyba pri exporte do Garminu.',
    multipleLineStrings: 'Výber obsahuje viac než jednu súvislú čiaru.',
    noLineString: 'Výber neobsahuje žiadnu súvislú čiaru.',
    multipleTracks: 'Viacero trás nie je podporovaných. Vyberte jednu.',
    multipleLines: 'Viacero čiar nie je podporovaných. Vyberte jednu.',
    connectPrompt:
      'Garmin účet ešte nemáte pripojený. Chcete ho pripojiť teraz?',
    authPrompt: 'Nie ste ešte prihlásený Garminon. Prajete sa prihlásiť tetaz?',
  },
};

export default sk;
