import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const pl: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  selectHomeLocation: 'Wybierz na mapie',
  ghParams: {
    tripParameters: 'Parametry wycieczki',
    seed: 'Ziarno losowości',
    distance: 'Przybliżony dystans',
    isochroneParameters: 'Parametry izochron',
    buckets: 'Segmenty',
    timeLimit: 'Limit czasu',
    distanceLimit: 'Limit dystansu',
  },
  point: {
    pick: 'Wybierz na mapie',
    current: 'Twoja pozycja',
    home: 'Pozycja domowa',
    point: 'Punkt trasy',
  },
  transportType: {
    car: 'Samochód',
    car4wd: 'Samochód (4x4)',
    bike: 'Rower',
    foot: 'Pieszo',
    hiking: 'Turystyka piesza',
    mtb: 'Rower górski',
    racingbike: 'Rower szosowy',
    motorcycle: 'Motocykl',
    manual: 'Linia prosta',
  },
  mode: {
    route: 'W ustalonej kolejności',
    trip: 'Odwiedzanie miejsc',
    roundtrip: 'Odwiedzanie miejsc (pętla)',
    'routndtrip-gh': 'Wycieczka (pętla)',
    isochrone: 'Izoliny czasu',
  },
  noHomeAlert: {
    msg: 'Najpierw musisz ustawić pozycję domową w ustawieniach.',
    setHome: 'Ustaw',
  },
  milestones: 'Słupki kilometrowe',
  optimize: {
    label: 'Optymalizuj kolejność',
    fixedStart: 'Zachowaj start',
    fixedStartEnd: 'Zachowaj start i metę',
    roundtrip: 'Pętla (powrót do startu)',
    free: 'Dowolnie (zmień całą kolejność)',
  },
  start: 'Start',
  finish: 'Meta',
  swap: 'Zamień start i metę',
  development: 'w przygotowaniu',
  alternative: 'Alternatywa',
  distance: ({ value, diff }) => (
    <>
      Dystans:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  duration: ({ h, m, diff }) => (
    <>
      Czas:{' '}
      <b>
        {h}h {m}m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Dystans: <b>{distance}</b>| Czas:{' '}
      <b>
        {h}h {m}m
      </b>
    </>
  ),
  showMidpointHint: 'Aby dodać punkt pośredni, przeciągnij odcinek trasy.',
  gpsError: 'Błąd podczas pobierania bieżącej lokalizacji.',
  routeNotFound:
    'Nie znaleziono trasy. Spróbuj zmienić parametry lub przesunąć punkty.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Błąd podczas wyszukiwania trasy', err),
  manualTooltip: 'Połącz następny odcinek prostą linią',
  default: 'Domyślna',
  leg: 'Odcinek trasy',
  stop: 'Postój',
  transportTypeLabel: 'Środek transportu',
  modeLabel: 'Tryb trasowania',
};

export default pl;
