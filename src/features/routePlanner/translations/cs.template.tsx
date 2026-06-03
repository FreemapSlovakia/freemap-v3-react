import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { RoutePlannerMessages } from './RoutePlannerMessages.js';

const cs: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  ghParams: {
    tripParameters: 'Parametry výletu',
    seed: 'Random seed',
    distance: 'Orientační vzdálenost',
    isochroneParameters: 'Parametry izochronů',
    buckets: 'Počet dělení',
    timeLimit: 'Časový limit',
    distanceLimit: 'Limit vzdálenosti',
  },
  milestones: 'Kilometrovník',
  start: 'Start',
  finish: 'Cíl',
  swap: 'Prohodit start a cíl',
  point: {
    pick: 'Vybrat na mapě',
    current: 'Tvá poloha',
    home: 'Domů',
    point: 'Bod trasy',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto 4x4',
    bike: 'Kolo',
    foot: 'Pěšky',
    hiking: 'Turistika',
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
  distance: ({ value, diff }) => (
    <>
      Vzdálenost:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
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
    addError(window.translations!, 'Nastala chyba při hledání trasy', err),
  manualTooltip: 'Propojit následující segment přímou čarou',
  default: 'Výchozí',
  leg: 'Úsek trasy',
  stop: 'Zastávka',
};

export default cs;
