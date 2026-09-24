import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Túrázás, Kerékpár, Síelés, Lovaglás';

const hu: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép exportálásakor', err),
  cancelExportTitle: 'Exportálás megszakítása',
  labelTitle: 'Címkék',
  cancelExportQuestion: 'Biztosan megszakítja a folyamatban lévő exportálást?',
  discardExportTitle: 'Exportálás elvetése',
  discardExportQuestion:
    'Az exportált térkép még nincs elmentve. Biztosan elveti?',
  area: 'Exportálandó terület',
  format: 'Formátum',
  layersTitle: 'Választható rétegek',
  mapDataTitle: 'Térképadatok',
  mapTitle: 'Térkép',
  layers: {
    contours: 'Szintvonalak',
    shading: 'Domborzatárnyékolás',
    hikingTrails: 'Turistautak',
    bicycleTrails: 'Kerékpáros útvonalak',
    skiTrails: 'Síútvonalak',
    horseTrails: 'Lovaglóútvonalak',
    sacScale: 'Ösvények nehézsége',
    mtbScale: 'MTB nehézség',
    smoothness: 'Útburkolat minősége',
    waymarking: 'Útjelző táblák',
  },
  baseMap: 'Alaptérkép',
  noBaseMapHint: 'Csak a kijelölt rétegek rajzolódnak ki, a többi átlátszó.',
  omitTitle: 'Kihagyás',
  omit: {
    groundCover: 'Felszínborítás',
    buildings: 'Épületek',
  },
  omitHint:
    'A kihagyott helyeken átlátszó — légifelvétel fölé helyezéshez, amely ezeket jobban mutatja.',
  webpLossy: 'Veszteséges tömörítés',
  quality: 'Minőség',
  mapScale: 'Térkép felbontása',
  customLayerOrder: 'Térképadatok elhelyezése',
  orders: {
    natural: 'Természetes',
    topmost: 'Legfelül',
  },
  decorations: 'Térképdíszítések',
  scaleBar: 'Aránymérték',
  northArrow: 'Iránytű',
  attribution: 'Forrásmegjelölés',
  northArrowLetter: 'É',
  glow: 'Ragyogás',
  ready: 'A térkép elkészült',
  readyCredits:
    'A térkép közzétételekor vagy megosztásakor tüntesse fel ezeket a forrásokat:',
  readyUnknownSources: 'Nem azonosítható források:',
  readyCreditsNone: 'A renderelő nem jelezte, mely forrásokat használta.',
  copyCredits: 'Források másolása',
  openInNewTab: 'Megnyitás új lapon',
  savedCredits: ({ credits }) =>
    `A térkép el lett mentve. Közzétételkor vagy megosztáskor tüntesse fel: ${credits}`,
  alert: () => (
    <>
      A <i>{outdoorMap}</i> térkép kerül exportálásra. Ez több tucat másodpercet
      is igénybe vehet.
    </>
  ),
};

export default hu;
