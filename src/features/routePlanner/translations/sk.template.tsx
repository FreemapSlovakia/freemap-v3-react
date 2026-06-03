import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { RoutePlannerMessages } from './RoutePlannerMessages.js';

const sk: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  default: 'Predvolený',
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
  },
  milestones: 'Kilometrovník',
  start: 'Štart',
  finish: 'Cieľ',
  stop: 'Zasávka',
  swap: 'Prehodiť štart a cieľ',
  point: {
    point: 'Bod trasy',
    pick: 'Vybrať na mape',
    current: 'Tvoja poloha',
    home: 'Domov',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto 4x4',
    bike: 'Bicykel',
    foot: 'Pešo',
    hiking: 'Turistika',
    mtb: 'Horský bicykel',
    racingbike: 'Cestný bicykel',
    motorcycle: 'Motocykel',
    manual: 'Priama čiara',
  },
  development: 'vo vývoji',
  mode: {
    route: 'V určenom poradí',
    trip: 'Návšteva miest',
    roundtrip: 'Návšteva miest (okruh)',
    'routndtrip-gh': 'Výlet',
    isochrone: 'Izochróny',
  },
  alternative: 'Alternatíva',
  distance: ({ value, diff }) => (
    <>
      Vzdialenosť:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  duration: ({ h, m, diff }) => (
    <>
      Trvanie:{' '}
      <b>
        {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Vzdialenosť: <b>{distance}</b> | Trvanie:{' '}
      <b>
        {h} h {m} m
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'Najprv si musíte nastaviť domovskú polohu.',
    setHome: 'Nastaviť',
  },
  showMidpointHint:
    'Pre pridanie prechodného bodu potiahnite úsek cesty na zvolené miesto.',
  gpsError: 'Nepodarilo sa získať aktuálnu polohu.',
  routeNotFound:
    'Cez zvolené body sa nepodarilo vyhľadať trasu. Skúste zmeniť parametre alebo posunúť body trasy.',
  fetchingError: ({ err }) =>
    addError(window.translations!, 'Nastala chyba pri hľadaní trasy', err),
};

export default sk;
