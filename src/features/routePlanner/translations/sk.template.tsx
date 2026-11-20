import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const sk: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  transportScope: {
    title: 'Použiť na',
    route: 'Celú trasu',
    lastSection: 'Poslednú časť',
    next: 'Nové úseky',
    leg: 'Tento úsek',
    section: 'Celú časť',
    sameTransport: 'Rovnaký spôsob dopravy',
  },
  leg: 'Úsek trasy',
  manualTooltip: 'Prepoj nasledujúci segment priamou čiarou',
  ghParams: {
    tripParameters: 'Parametre výletu',
    seed: 'Random seed',
    distance: 'Orientačná vzdialenosť',
    isochroneParameters: 'Parametre izochrónov',
    buckets: 'Počet delení',
    timeLimit: 'Časový limit',
    distanceLimit: 'Limit vzdialenosti',
    reverseFlow: 'Cesta do bodu',
    reverseFlowHint:
      'Oblasti potom pokrývajú, odkiaľ sa dá do tohto bodu doraziť; bez zaškrtnutia to, kam sa z neho dá dostať. Rozdiel robia jednosmerky a zákazy odbočenia.',
  },
  milestones: 'Kilometrovník',
  milestonesOff: 'Vypnuté',
  recompute: 'Prepočítať trasu',
  maxAlternatives: 'Max. počet ponúkaných trás',
  style: {
    menuItem: 'Štýl trasy',
    title: 'Štýl trasy',
    lineWidth: 'Hrúbka čiary',
    lineOpacity: 'Krytie čiary',
    markerOpacity: 'Krytie značiek',
  },
  optimize: {
    label: 'Optimalizovať poradie',
    fixedStart: 'Ponechať štart',
    fixedStartEnd: 'Ponechať štart a cieľ',
    roundtrip: 'Okruh (návrat na štart)',
    free: 'Voľne (preusporiadať všetko)',
  },
  start: 'Štart',
  finish: 'Cieľ',
  stop: 'Zastávka',
  swap: 'Prehodiť štart a cieľ',
  point: {
    point: 'Bod trasy',
    pick: 'Vybrať na mape',
    current: 'Vaša poloha',
    fromStart: 'Poloha štartu',
    fromFinish: 'Poloha cieľa',
  },
  itinerary: {
    title: 'Itinerár',
    button: 'Podrobnosti trasy',
    weather: 'Počasie',
    noDeparture: 'Nastavte čas odchodu a uvidíte počasie pozdĺž trasy.',
  },
  turnByTurn: {
    label: 'Podrobné pokyny',
    maneuvers: {
      depart: 'Vyrazte',
      continue: 'Pokračujte',
      straight: 'Pokračujte rovno',
      left: 'Odbočte vľavo',
      right: 'Odbočte vpravo',
      slightLeft: 'Mierne vľavo',
      slightRight: 'Mierne vpravo',
      sharpLeft: 'Ostro vľavo',
      sharpRight: 'Ostro vpravo',
      uturn: 'Otočte sa',
      keepLeft: 'Držte sa vľavo',
      keepRight: 'Držte sa vpravo',
      merge: 'Zaraďte sa',
      rampOn: 'Vojdite na nájazd',
      rampOff: 'Zíďte výjazdom',
      roundabout: 'Vojdite do kruhového objazdu',
      exitRoundabout: 'Opustite kruhový objazd',
    },
  },
  shaping: {
    label: 'Pomocný bod',
    hint: 'Len usmerňuje trasu: bez čísla, zastávky a času.',
    turnsBack: 'Trasa sa tu otáča späť.',
  },
  waypointStop: {
    label: 'Zastávka',
    none: 'Bez zastávky',
    pause: 'Prestávka',
    overnight: 'Nocľah',
    minutes: 'min',
    continueAt: 'Pokračovať o',
    nights: 'Noci',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto 4x4',
    carnotoll: 'Auto (bez mýta)',
    bike: 'Bicykel',
    ebike: 'Elektrobicykel',
    gravelbike: 'Gravel bicykel',
    foot: 'Pešo',
    stroller: 'Kočík / vozík',
    hiking: 'Turistika',
    easyhike: 'Ľahká turistika',
    mtb: 'Horský bicykel',
    racingbike: 'Cestný bicykel',
    motorcycle: 'Motocykel',
    manual: 'Priama čiara',
  },
  transportTypeLabel: 'Spôsob dopravy',
  development: 'vo vývoji',
  mode: {
    route: 'V určenom poradí',
    trip: 'Návšteva miest',
    roundtrip: 'Návšteva miest (okruh)',
    'routndtrip-gh': 'Výlet',
    isochrone: 'Izochróny',
  },
  modeLabel: 'Režim trasovania',
  alternative: 'Alternatíva',
  isochroneRing: 'Izochróna',
  distance: ({ value, diff }) => (
    <>
      Vzdialenosť:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  tolled: ({ value }) => (
    <>
      Spoplatnené úseky: <b>{value}</b>
    </>
  ),
  withStops: ({ duration }) => (
    <>
      So zastávkami: <b>{duration}</b>
    </>
  ),
  arrival: ({ time }) => (
    <>
      Príchod: <b>{time}</b>
    </>
  ),
  departure: ({ time }) => (
    <>
      Odchod: <b>{time}</b>
    </>
  ),
  departureLabel: 'Odchod',
  departureOff: 'Nenastavený',
  departureHint: 'Vypnutý: bez časov a bez počasia pozdĺž trasy.',
  departureTime: 'Čas odchodu',
  duration: ({ value, diff }) => (
    <>
      Trvanie:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  showMidpointHint:
    'Pre pridanie prechodného bodu potiahnite úsek cesty na zvolené miesto.',
  gpsError: 'Nepodarilo sa získať aktuálnu polohu.',
  routeNotFound:
    'Cez zvolené body sa nepodarilo vyhľadať trasu. Skúste zmeniť parametre alebo posunúť body trasy.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri hľadaní trasy', err),
};

export default sk;
