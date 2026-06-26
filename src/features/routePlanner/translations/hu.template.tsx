import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { RoutePlannerMessages } from './RoutePlannerMessages.js';

const hu: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  selectHomeLocation: 'Kijelölés a térképen',
  ghParams: {
    tripParameters: 'Út paraméterei',
    seed: 'Véletlenszám mag',
    distance: 'Közelítő távolság',
    isochroneParameters: 'Izokron paraméterek',
    buckets: 'Vödrök',
    timeLimit: 'Időkorlát',
    distanceLimit: 'Távolságkorlát',
  },
  milestones: 'Távolságszelvények',
  start: 'Kiindulás',
  finish: 'Úti cél',
  swap: 'Kiindulási pont és cél felcserélése',
  point: {
    pick: 'Kijelölés a térképen',
    current: 'Az Ön pozíciója',
    home: 'Lakhely',
    point: 'Útpont',
  },
  transportType: {
    car: 'Gépkocsi',
    car4wd: 'Gépkocsi 4x4',
    bike: 'Kerékpár',
    foot: 'Gyaloglás',
    hiking: 'Túrázás',
    mtb: 'Hegyikerékpár',
    racingbike: 'Versenykerékpár',
    motorcycle: 'Motorkerékpár',
    manual: 'Egyenes vonal',
  },
  development: 'fejlesztés alatt',
  mode: {
    route: 'Megadott sorrendben',
    trip: 'Legrövidebb úton',
    roundtrip: 'Legrövidebb úton (körutazás)',
    'routndtrip-gh': 'Körút',
    isochrone: 'Izokron',
  },
  alternative: 'Alternatíva',
  distance: ({ value, diff }) => (
    <>
      Távolság:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  duration: ({ h, m, diff }) => (
    <>
      Időtartam:{' '}
      <b>
        {h} óra {m} perc{diff && ` (+ ${diff.h} óra ${diff.m} perc)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Távolság: <b>{distance}</b> | Időtartam:{' '}
      <b>
        {h} óra {m} perc
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'Először meg kell adnia a lakóhelyét a beállításoknál.',
    setHome: 'Megadás',
  },
  showMidpointHint: 'Köztes pont megadásához húzzon el egy útszakaszt.',
  gpsError: 'Hiba történt jelenlegi pozíciójának meghatározásakor.',
  routeNotFound:
    'Nem sikerült útvonalat találni. Próbálja meg módosítani a paramétereket vagy áthelyezni az út pontjait.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt az útvonaltervezésnél', err),
  manualTooltip: 'A következő szakasz összekötése egyenes vonallal',
  default: 'Alapértelmezett',
  leg: 'Útvonal szakasz',
  stop: 'Megálló',
  transportTypeLabel: 'Közlekedési mód',
  modeLabel: 'Útvonaltervezési mód',
};

export default hu;
