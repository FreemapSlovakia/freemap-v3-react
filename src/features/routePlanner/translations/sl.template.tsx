import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const sl: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  selectHomeLocation: 'Izberi na zemljevidu',
  default: 'Privzeta',
  leg: 'Odsek poti',
  manualTooltip: 'Poveži naslednji segment z ravno črto',
  ghParams: {
    tripParameters: 'Parametri poti',
    seed: 'Naključno seme',
    distance: 'Približna razdalja',
    isochroneParameters: 'Parametri izokron',
    buckets: 'Število razdelkov',
    timeLimit: 'Časovna omejitev',
    distanceLimit: 'Omejitev razdalje',
  },
  milestones: 'Kilometrski kažipoti',
  style: {
    menuItem: 'Slog poti',
    title: 'Slog poti',
    lineWidth: 'Debelina črte',
    lineOpacity: 'Prekrivnost črte',
    markerOpacity: 'Prekrivnost oznak',
  },
  optimize: {
    label: 'Optimiziraj vrstni red',
    fixedStart: 'Ohrani začetek',
    fixedStartEnd: 'Ohrani začetek in cilj',
    roundtrip: 'Krožna pot (vrnitev na začetek)',
    free: 'Prosto (preuredi vse)',
  },
  start: 'Začetek',
  finish: 'Cilj',
  stop: 'Postanek',
  swap: 'Zamenjaj začetek in cilj',
  point: {
    point: 'Točka poti',
    pick: 'Izberi na zemljevidu',
    current: 'Tvoj položaj',
    home: 'Domači položaj',
    fromStart: 'Začetni položaj',
    fromFinish: 'Ciljni položaj',
  },
  transportType: {
    car: 'Avto',
    car4wd: 'Avto (4WD)',
    bike: 'Kolo',
    foot: 'Peš',
    hiking: 'Pohodništvo',
    mtb: 'Gorsko kolo',
    racingbike: 'Cestno kolo',
    motorcycle: 'Motocikel',
    manual: 'Ravna črta',
  },
  transportTypeLabel: 'Način prevoza',
  development: 'v razvoju',
  mode: {
    route: 'V določenem vrstnem redu',
    trip: 'Obisk krajev',
    roundtrip: 'Obisk krajev (krožna pot)',
    'routndtrip-gh': 'Krožna pot',
    isochrone: 'Izokrone',
  },
  modeLabel: 'Način načrtovanja poti',
  alternative: 'Alternativa',
  distance: ({ value, diff }) => (
    <>
      Razdalja:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  duration: ({ h, m, diff }) => (
    <>
      Trajanje:{' '}
      <b>
        {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Razdalja: <b>{distance}</b> | Trajanje:{' '}
      <b>
        {h} h {m} m
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'Najprej morate v nastavitvah nastaviti svoj domači položaj.',
    setHome: 'Nastavi',
  },
  showMidpointHint: 'Za dodajanje vmesne točke povlecite odsek poti.',
  gpsError: 'Napaka pri pridobivanju trenutnega položaja.',
  routeNotFound:
    'Poti ni bilo mogoče najti. Poskusite spremeniti parametre ali premakniti točke poti.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri iskanju poti', err),
};

export default sl;
