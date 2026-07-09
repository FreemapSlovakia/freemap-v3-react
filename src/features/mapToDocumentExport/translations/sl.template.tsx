import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Pohodništvo, Kolesarjenje, Smučanje, Jahanje';

const sl: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri izvozu zemljevida', err),
  cancelExportTitle: 'Prekliči izvoz',
  labelTitle: 'Oznake',
  cancelExportQuestion: 'Ali res želite preklicati potekajoči izvoz?',
  area: 'Izvozi območje',
  format: 'Format',
  layersTitle: 'Izbirni sloji',
  mapDataTitle: 'Podatki zemljevida',
  layers: {
    contours: 'Plastnice',
    shading: 'Senčen relief',
    hikingTrails: 'Pohodniške poti',
    bicycleTrails: 'Kolesarske poti',
    skiTrails: 'Smučarske proge',
    horseTrails: 'Konjeniške poti',
  },
  mapScale: 'Ločljivost zemljevida',
  customLayerOrder: 'Postavitev podatkov zemljevida',
  orders: {
    natural: 'Naravno',
    topmost: 'Na vrhu',
  },
  decorations: 'Okraski zemljevida',
  scaleBar: 'Merilo',
  northArrow: 'Smerna puščica',
  attribution: 'Navedba vira',
  northArrowLetter: 'S',
  glow: 'Sij',
  alert: (licence) => (
    <>
      Opombe:
      <ul>
        <li>
          Izvožen bo zemljevid <i>{outdoorMap}</i>.
        </li>
        <li>Izvoz zemljevida lahko traja tudi več deset sekund.</li>
        <li>
          Pri objavi zemljevida je treba navesti njegovo licenco:
          <br />
          <em>{licence}</em>
        </li>
      </ul>
    </>
  ),
};

export default sl;
