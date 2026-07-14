import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const sl: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  download: 'Prenesi',
  format: 'Format',
  target: 'Cilj',
  elevation: {
    label: 'Nadmorska višina',
    none: 'Ohrani nespremenjeno',
    missing: 'Dopolni manjkajočo',
    all: 'Prepiši vso',
  },
  exportError: ({ err }) => addError(getMessages()!, 'Napaka pri izvozu', err),
  what: {
    plannedRoute: 'najdeno pot',
    plannedRouteWithStops: 's postanki',
    objects: 'objekti (POI)',
    pictures: 'fotografije (v vidnem delu zemljevida)',
    drawingLines: 'risanje - črte',
    drawingAreas: 'risanje - poligoni',
    drawingPoints: 'risanje - točke',
    tracking: 'sledenje v živo',
    import: 'uvožena datoteka',
    search: 'najdba',
  },
  onlySelected: 'Samo izbrani element',
  disabledAlert:
    'Aktivne so samo možnosti, katerih objekti se nahajajo na zemljevidu.',
  licenseAlert:
    'Izvožena datoteka lahko podleže različnim licencam, kot je na primer licenca OpenStreetMap. Prosimo, da pri deljenju izvožene datoteke dodate manjkajoče navedbe avtorstva.',
  exportedToDropbox: 'Datoteka je bila shranjena v Dropbox.',
  exportedToGdrive: 'Datoteka je bila shranjena v Google Drive.',
  garmin: {
    courseName: 'Ime proge',
    description: 'Opis',
    activityType: 'Vrsta aktivnosti',
    at: {
      running: 'Tek',
      hiking: 'Pohodništvo',
      other: 'Drugo',
      mountain_biking: 'Gorsko kolesarjenje',
      trailRunning: 'Trail tek',
      roadCycling: 'Cestno kolesarjenje',
      gravelCycling: 'Gravel kolesarjenje',
    },
    revoked: 'Izvoz proge v Garmin je bil preklican.',
    exportError: 'Napaka pri izvozu v Garmin.',
    multipleLineStrings: 'Izbor vsebuje več kot eno neprekinjeno črto.',
    noLineString: 'Izbor ne vsebuje nobene neprekinjene črte.',
    multipleTracks: 'Več sledi ni podprtih. Izberite eno.',
    multipleLines: 'Več črt ni podprtih. Izberite eno.',
    connectPrompt:
      'Vašega računa Garmin še nimate povezanega. Ga želite povezati zdaj?',
    authPrompt:
      'Pri storitvi Garmin še niste prijavljeni. Se želite prijaviti zdaj?',
  },
};

export default sl;
