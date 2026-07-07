import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const cs: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  download: 'Stáhnout',
  format: 'Formát',
  target: 'Cíl',
  elevation: {
    label: 'Nadmořská výška',
    none: 'Ponechat',
    missing: 'Doplnit chybějící',
    all: 'Přepsat vše',
  },
  exportError: ({ err }) => addError(getMessages()!, 'Chyba exportu', err),
  what: {
    plannedRoute: 'vyhledanou trasu',
    plannedRouteWithStops: 'se zastávkami',
    objects: 'objekty (POI)',
    pictures: 'fotografie (ve viditelné části mapy)',
    drawingLines: 'kreslení - čáry',
    drawingAreas: 'kreslení - polygony',
    drawingPoints: 'kreslení - body',
    tracking: 'sledování',
    import: 'importovaný soubor',
    search: 'nález',
  },
  onlySelected: 'Pouze vybraný prvek',
  disabledAlert:
    'Aktivní jsou pouze volby jejichž objekty se nacházejí na mapě.',
  licenseAlert:
    'Exportovaný soubor může podléhat různým licencím, například licenci OpenStreetMap. Prosím dodržte podmínky těchto licencí při sdílení vyexportovaného souboru.',
  exportedToDropbox: 'Soubor byl uložen do Dropboxu.',
  exportedToGdrive: 'Soubor byl uložen do Google Drive.',
  garmin: {
    exportError: 'Chyba při exportu do Garminu.',
    multipleLineStrings: 'Výběr obsahuje více než jednu souvislou čáru.',
    noLineString: 'Výběr neobsahuje žádnou souvislou čáru.',
    multipleTracks: 'Více tras není podporováno. Vyberte jednu.',
    multipleLines: 'Více čar není podporováno. Vyberte jednu.',
    courseName: 'Název kurzu',
    description: 'Popis',
    activityType: 'Typ aktivity',
    at: {
      running: 'Běh',
      hiking: 'Turistika',
      other: 'Jiné',
      mountain_biking: 'Horská cyklistika',
      trailRunning: 'Trailový běh',
      roadCycling: 'Silniční cyklistika',
      gravelCycling: 'Štěrková cyklistika',
    },
    revoked: 'Export kurzu do Garminu byl zrušen.',
    connectPrompt:
      'Garmin účet ještě nemáte připojen. Chcete jej připojit nyní?',
    authPrompt: 'Nejste ještě přihlášen Garminon. Přejete se přihlásit tetaz?',
  },
};

export default cs;
