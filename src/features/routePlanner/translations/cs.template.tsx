import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const cs: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  selectHomeLocation: 'Vybrat na mapě',
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
  point: {
    pick: 'Vybrat na mapě',
    current: 'Tvá poloha',
    home: 'Domů',
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
  duration: ({ h, m, diff }) => (
    <>
      Trvání:{' '}
      <b>
        {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Vzdálenost: <b>{distance}</b> | Trvání:{' '}
      <b>
        {h} h {m} m
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'Nejprve si musíte nastavit výchozí polohu.',
    setHome: 'Nastavit',
  },
  showMidpointHint:
    'Pro přidání průchozího bodu přetáhněte úsek silnice na zvolené místo.',
  gpsError: 'Nelze získat aktuální polohu.',
  routeNotFound:
    'Přes zvolené body se nepodařilo vyhledat trasu. Zkuste změnit parametry nebo posunout body trasy. ',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při hledání trasy', err),
  manualTooltip: 'Propojit následující segment přímou čarou',
  default: 'Výchozí',
  leg: 'Úsek trasy',
  stop: 'Zastávka',
  transportTypeLabel: 'Druh dopravy',
  modeLabel: 'Režim trasování',
};

export default cs;
