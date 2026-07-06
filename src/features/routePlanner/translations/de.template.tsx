import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const de: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  selectHomeLocation: 'Auf der Karte auswählen',
  ghParams: {
    tripParameters: 'Reiseparameter',
    seed: 'Zufallswert',
    distance: 'Ungefähre Entfernung',
    isochroneParameters: 'Isochrone-Parameter',
    buckets: 'Intervalle',
    timeLimit: 'Zeitlimit',
    distanceLimit: 'Entfernungslimit',
  },
  point: {
    pick: 'Auf der Karte auswählen',
    current: 'Deine Position',
    home: 'Startposition',
    point: 'Routenpunkt',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto (4WD)',
    bike: 'Fahrrad',
    foot: 'Zu Fuß',
    hiking: 'Wandern',
    mtb: 'Mountainbike',
    racingbike: 'Rennrad',
    motorcycle: 'Motorrad',
    manual: 'Luftlinie',
  },
  mode: {
    route: 'In Reihenfolge',
    trip: 'Besuchte Orte',
    roundtrip: 'Besuchte Orte (Rundreise)',
    'routndtrip-gh': 'Rundreise',
    isochrone: 'Isochronen',
  },
  milestones: 'Kilometermarkierungen',
  optimize: {
    label: 'Reihenfolge optimieren',
    fixedStart: 'Start beibehalten',
    fixedStartEnd: 'Start und Ziel beibehalten',
    roundtrip: 'Rundreise (zurück zum Start)',
    free: 'Frei (alles neu ordnen)',
  },
  start: 'Start',
  finish: 'Ziel',
  swap: 'Start und Ziel tauschen',
  development: 'in Entwicklung',
  alternative: 'Alternative',
  distance: ({ value, diff }) => (
    <>
      Entfernung:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  duration: ({ h, m, diff }) => (
    <>
      Dauer:{' '}
      <b>
        {h}h {m}m{diff && ` (+ ${diff.h}h ${diff.m}m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Entfernung: <b>{distance}</b> | Dauer:{' '}
      <b>
        {h}h {m}m
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'Du musst zuerst deine Startposition in den Einstellungen setzen.',
    setHome: 'Setzen',
  },
  showMidpointHint:
    'Ziehe ein Routensegment, um einen Zwischenpunkt hinzuzufügen.',
  gpsError: 'Fehler beim Ermitteln deiner aktuellen Position.',
  routeNotFound:
    'Keine Route gefunden. Versuche, die Parameter zu ändern oder die Punkte zu verschieben.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Finden der Route', err),
  manualTooltip: 'Folgenden Abschnitt mit einer geraden Linie verbinden',
  default: 'Standard',
  leg: 'Routenabschnitt',
  stop: 'Halt',
  transportTypeLabel: 'Verkehrsmittel',
  modeLabel: 'Routing-Modus',
};

export default de;
