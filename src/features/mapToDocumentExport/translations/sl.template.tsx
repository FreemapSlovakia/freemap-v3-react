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
  discardExportTitle: 'Zavrzi izvoz',
  discardExportQuestion:
    'Izvožen zemljevid še ni bil shranjen. Ali ga želite zavreči?',
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
  ready: 'Zemljevid je pripravljen',
  readyCredits: 'Pri objavi ali deljenju zemljevida navedite te vire:',
  readyCreditsNone: 'Izrisovalnik ni sporočil, katere vire je uporabil.',
  readyUnknownSources: 'Viri, ki jih ni bilo mogoče poimenovati:',
  copyCredits: 'Kopiraj vire',
  openInNewTab: 'Odpri v novem zavihku',
  savedCredits: ({ credits }) =>
    `Zemljevid je shranjen. Pri objavi ali deljenju navedite: ${credits}`,
  alert: () => (
    <>
      Izvožen bo zemljevid <i>{outdoorMap}</i>. To lahko traja tudi več deset
      sekund.
    </>
  ),
};

export default sl;
