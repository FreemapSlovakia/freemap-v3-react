import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = () => getMessages()?.mapLayers.letters['X'];

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
  lossless: 'Veszteségmentes',
  lossy: 'Veszteséges',
  quality: 'Minőség',
  sizeTitle: 'Méret és részletesség',
  zoom: 'Nagyítási szint',
  printScale: 'Méretarány',
  mapScale: 'Térkép felbontása',
  printSize: 'Nyomtatási méret',
  imageSize: 'Képméret',
  lock: 'Zárolás',
  unlock: 'Feloldás',
  scaleFollowsZoom: 'Zárolás nélkül a méretarány a nagyítást követi.',
  symbolSize: ({ percent }) =>
    `A szövegek és jelek a szokásos méretük ${percent} %-ában nyomtatódnak`,
  tooLarge: ({ zoom }) =>
    zoom === null
      ? 'A terület túl nagy az exportáláshoz. Exportáljon kisebb területet.'
      : `A terület túl nagy ehhez a nagyítási szinthez. Csökkentse a nagyítást ${zoom}. szintre, vagy exportáljon kisebb területet.`,
  customLayerOrder: 'Térképadatok elhelyezése',
  orders: {
    natural: 'Természetes',
    topmost: 'Legfelül',
  },
  decorations: 'Térképdíszítések',
  scaleBar: 'Aránymérték',
  northArrow: 'Iránytű',
  attribution: 'Forrásmegjelölés',
  legend: 'Jelmagyarázat',
  legendWidens:
    'A jelmagyarázat a térkép mellé kerül, ezért a dokumentum szélesebb lesz a választott papírnál.',
  webpTooLarge:
    'A WebP oldalanként legfeljebb 16383 px-t enged, amit ez az exportálás túlléphet. Válasszon PNG-t vagy kisebb DPI-t.',
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
      Az <i>{outdoorMap()}</i>-térkép kerül exportálásra. Ez több tucat
      másodpercet is igénybe vehet.
    </>
  ),
};

export default hu;
