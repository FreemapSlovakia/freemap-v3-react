import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const pl: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  ghParams: {
    tripParameters: 'Parametry wycieczki',
    seed: 'Ziarno losowości',
    distance: 'Przybliżony dystans',
    isochroneParameters: 'Parametry izochron',
    buckets: 'Segmenty',
    timeLimit: 'Limit czasu',
    distanceLimit: 'Limit dystansu',
    reverseFlow: 'Podróż do punktu',
    reverseFlowHint:
      'Obszary pokazują wtedy, skąd można dotrzeć do tego punktu; bez zaznaczenia — dokąd można z niego dojechać. Różnicę robią jednokierunkowe ulice i zakazy skrętu.',
  },
  itinerary: {
    title: 'Plan podróży',
    weather: 'Pogoda',
    noDeparture: 'Pogoda na trasie jest dostępna po włączeniu godziny wyjścia.',
  },
  turnByTurn: {
    label: 'Wskazówki dojazdu',
    maneuvers: {
      depart: 'Start',
      continue: 'Dalej',
      straight: 'Prosto',
      left: 'W lewo',
      right: 'W prawo',
      slightLeft: 'Lekko w lewo',
      slightRight: 'Lekko w prawo',
      sharpLeft: 'Ostro w lewo',
      sharpRight: 'Ostro w prawo',
      uturn: 'Zawracanie',
      keepLeft: 'Na rozwidleniu w lewo',
      keepRight: 'Na rozwidleniu w prawo',
      merge: 'Włączenie do ruchu',
      rampOn: 'Wjazd na łącznicę',
      rampOff: 'Zjazd',
      roundabout: 'Wjazd na rondo',
      exitRoundabout: 'Zjazd z ronda',
    },
  },
  shaping: {
    label: 'Punkt pomocniczy',
    hint: 'Tylko kieruje trasą: bez numeru, postoju i czasu.',
    turnsBack: 'Trasa zawraca w tym miejscu.',
  },
  waypointStop: {
    label: 'Postój',
    none: 'Bez postoju',
    pause: 'Przerwa',
    overnight: 'Nocleg',
    minutes: 'min',
    continueAt: 'Wymarsz o',
    nights: 'Noce',
  },
  point: {
    pick: 'Wybierz na mapie',
    current: 'Moja pozycja',
    fromStart: 'Pozycja startu',
    fromFinish: 'Pozycja mety',
    point: 'Punkt trasy',
  },
  transportType: {
    car: 'Samochód',
    car4wd: 'Samochód (4x4)',
    carnotoll: 'Samochód (bez opłat drogowych)',
    bike: 'Rower',
    ebike: 'Rower elektryczny',
    gravelbike: 'Gravel',
    foot: 'Pieszo',
    stroller: 'Wózek dziecięcy / inwalidzki',
    hiking: 'Turystyka piesza',
    easyhike: 'Łatwa turystyka piesza',
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
  milestones: 'Słupki kilometrowe',
  milestonesOff: 'Wyłączone',
  recompute: 'Przelicz trasę ponownie',
  maxAlternatives: 'Maks. liczba proponowanych tras',
  style: {
    menuItem: 'Styl trasy',
    title: 'Styl trasy',
    lineWidth: 'Grubość linii',
    lineOpacity: 'Krycie linii',
    markerOpacity: 'Krycie znaczników',
  },
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
  isochroneRing: 'Izolinia czasu',
  distance: ({ value, diff }) => (
    <>
      Dystans:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  tolled: ({ value }) => (
    <>
      Odcinki płatne: <b>{value}</b>
    </>
  ),
  withStops: ({ duration }) => (
    <>
      Z postojami: <b>{duration}</b>
    </>
  ),
  arrival: ({ time }) => (
    <>
      Przybycie: <b>{time}</b>
    </>
  ),
  departure: ({ time }) => (
    <>
      Wyjście: <b>{time}</b>
    </>
  ),
  departureLabel: 'Wyjście',
  departureOff: 'Nie ustawiono',
  departureHint: 'Wyłączone: bez godzin i bez pogody na trasie.',
  departureTime: 'Godzina wyjścia',
  duration: ({ value, diff }) => (
    <>
      Czas:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
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
  transportScope: {
    title: 'Zastosuj do',
    route: 'Cała trasa',
    lastSection: 'Ostatnia część',
    next: 'Nowe odcinki',
    leg: 'Ten odcinek',
    section: 'Cała część',
    sameTransport: 'Ten sam środek transportu',
  },
  leg: 'Odcinek trasy',
  stop: 'Postój',
  transportTypeLabel: 'Środek transportu',
  modeLabel: 'Tryb trasowania',
};

export default pl;
