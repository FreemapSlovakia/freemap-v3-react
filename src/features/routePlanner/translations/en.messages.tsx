import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { RoutePlannerMessages } from './RoutePlannerMessages.js';

const en: RoutePlannerMessages = {
  selectHomeLocation: 'Select on the map',
  default: 'Route default',
  leg: 'Route leg',
  manualTooltip: 'Connect following segment with direct line',
  ghParams: {
    tripParameters: 'Trip parameters',
    seed: 'Random seed',
    distance: 'Approximate distance',
    isochroneParameters: 'Isochrone parameters',
    buckets: 'Buckets',
    timeLimit: 'Time limit',
    distanceLimit: 'Distance limit',
  },
  milestones: 'Milestones',
  start: 'Start',
  finish: 'Finish',
  stop: 'Stop',
  swap: 'Swap start and finish',
  point: {
    point: 'Route point',
    pick: 'Select on the map',
    current: 'Your position',
    home: 'Home position',
  },
  transportType: {
    car: 'Car',
    car4wd: 'Car (4WD)',
    bike: 'Bicycle',
    foot: 'Walking',
    hiking: 'Hiking',
    mtb: 'Mountain bike',
    racingbike: 'Racing bike',
    motorcycle: 'Motorcycle',
    manual: 'Straight line',
  },
  development: 'in development',
  mode: {
    route: 'Ordered',
    trip: 'Visiting places',
    roundtrip: 'Visiting places (roundtrip)',
    'routndtrip-gh': 'Roundtrip',
    isochrone: 'Isochrones',
  },
  alternative: 'Alternative',
  distance: ({ value, diff }) => (
    <>
      Distance:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  duration: ({ h, m, diff }) => (
    <>
      Duration:{' '}
      <b>
        {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Distance: <b>{distance}</b> | Duration:{' '}
      <b>
        {h} h {m} m
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'You need to set your home position in settings first.',
    setHome: 'Set',
  },
  showMidpointHint: 'To add a midpoint, drag a route segment.',
  gpsError: 'Error getting your current location.',
  routeNotFound:
    'No route found. Try to change parameters or move the route points.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error finding the route', err),
};

export default en;
