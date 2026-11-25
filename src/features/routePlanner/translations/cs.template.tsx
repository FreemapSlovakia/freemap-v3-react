import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const cs: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  ghParams: {
    tripParameters: 'Parametry výletu',
    seed: 'Random seed',
    distance: 'Orientační vzdálenost',
    isochroneParameters: 'Parametry izochronů',
    buckets: 'Počet dělení',
    timeLimit: 'Časový limit',
    distanceLimit: 'Limit vzdálenosti',
    reverseFlow: 'Cesta do bodu',
    reverseFlowHint:
      'Oblasti pak pokrývají, odkud se dá do tohoto bodu dojet; bez zaškrtnutí to, kam se z něj dá dostat. Rozdíl dělají jednosměrky a zákazy odbočení.',
  },
  milestones: 'Kilometrovník',
  milestonesOff: 'Vypnuto',
  recompute: 'Přepočítat trasu',
  maxAlternatives: 'Max. počet nabízených tras',
  style: {
    menuItem: 'Styl trasy',
    title: 'Styl trasy',
    lineWidth: 'Tloušťka čáry',
    lineOpacity: 'Krytí čáry',
    markerOpacity: 'Krytí značek',
  },
  optimize: {
    label: 'Optimalizovat pořadí',
    fixedStart: 'Ponechat start',
    fixedStartEnd: 'Ponechat start a cíl',
    roundtrip: 'Okruh (návrat na start)',
    free: 'Volně (přeuspořádat vše)',
  },
  start: 'Start',
  finish: 'Cíl',
  swap: 'Prohodit start a cíl',
  itinerary: {
    title: 'Itinerář',
    button: 'Podrobnosti trasy',
    weather: 'Počasí',
    noDeparture: 'Nastavte čas odchodu a uvidíte počasí podél trasy.',
  },
  turnByTurn: {
    label: 'Podrobné pokyny',
    maneuvers: {
      depart: 'Vyrazte',
      continue: 'Pokračujte',
      straight: 'Pokračujte rovně',
      left: 'Odbočte vlevo',
      right: 'Odbočte vpravo',
      slightLeft: 'Mírně vlevo',
      slightRight: 'Mírně vpravo',
      sharpLeft: 'Ostře vlevo',
      sharpRight: 'Ostře vpravo',
      uturn: 'Otočte se',
      keepLeft: 'Držte se vlevo',
      keepRight: 'Držte se vpravo',
      merge: 'Zařaďte se',
      rampOn: 'Najeďte na nájezd',
      rampOff: 'Sjeďte výjezdem',
      roundabout: 'Vjeďte na kruhový objezd',
      exitRoundabout: 'Opusťte kruhový objezd',
    },
  },
  shaping: {
    label: 'Pomocný bod',
    hint: 'Jen usměrňuje trasu: bez čísla, zastávky a času.',
    turnsBack: 'Trasa se tu otáčí zpět.',
  },
  waypointStop: {
    label: 'Zastávka',
    none: 'Bez zastávky',
    pause: 'Přestávka',
    overnight: 'Nocleh',
    minutes: 'min',
    continueAt: 'Pokračovat v',
    nights: 'Noci',
  },
  point: {
    pick: 'Vybrat na mapě',
    current: 'Tvá poloha',
    fromStart: 'Poloha startu',
    fromFinish: 'Poloha cíle',
    point: 'Bod trasy',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto 4x4',
    carnotoll: 'Auto (bez mýtného)',
    bike: 'Kolo',
    ebike: 'Elektrokolo',
    gravelbike: 'Gravel kolo',
    foot: 'Pěšky',
    stroller: 'Kočárek / vozík',
    hiking: 'Turistika',
    easyhike: 'Lehká turistika',
    mtb: 'Horské kolo',
    racingbike: 'Silniční kolo',
    motorcycle: 'Motocykl',
    manual: 'Přímá čára',
  },
  development: 've vývoji',
  mode: {
    route: 'Po pořadí',
    trip: 'Návštěva míst',
    roundtrip: 'Návštěva míst (okruh)',
    'routndtrip-gh': 'Výlet',
    isochrone: 'Izochróny',
  },
  alternative: 'Alternativa',
  isochroneRing: 'Izochrona',
  distance: ({ value, diff }) => (
    <>
      Vzdálenost:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  tolled: ({ value }) => (
    <>
      Zpoplatněné úseky: <b>{value}</b>
    </>
  ),
  withStops: ({ duration }) => (
    <>
      Se zastávkami: <b>{duration}</b>
    </>
  ),
  arrival: ({ time }) => (
    <>
      Příchod: <b>{time}</b>
    </>
  ),
  departure: ({ time }) => (
    <>
      Odchod: <b>{time}</b>
    </>
  ),
  departureLabel: 'Odchod',
  departureOff: 'Nenastaven',
  departureHint: 'Vypnutý: bez časů a bez počasí podél trasy.',
  departureTime: 'Čas odchodu',
  duration: ({ value, diff }) => (
    <>
      Trvání:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  showMidpointHint:
    'Pro přidání průchozího bodu přetáhněte úsek silnice na zvolené místo.',
  gpsError: 'Nelze získat aktuální polohu.',
  routeNotFound:
    'Přes zvolené body se nepodařilo vyhledat trasu. Zkuste změnit parametry nebo posunout body trasy. ',
  routeOutOfArea: 'Bod trasy leží mimo oblast, kterou pokrývá vyhledávač tras.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při hledání trasy', err),
  manualTooltip: 'Propojit následující segment přímou čarou',
  transportScope: {
    title: 'Použít na',
    route: 'Celou trasu',
    lastSection: 'Poslední část',
    next: 'Nové úseky',
    leg: 'Tento úsek',
    section: 'Celou část',
    sameTransport: 'Stejný druh dopravy',
  },
  leg: 'Úsek trasy',
  stop: 'Zastávka',
  transportTypeLabel: 'Druh dopravy',
  modeLabel: 'Režim trasování',
};

export default cs;
