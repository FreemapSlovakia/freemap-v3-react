import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const de: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  ghParams: {
    tripParameters: 'Reiseparameter',
    seed: 'Zufallswert',
    distance: 'Ungefähre Entfernung',
    isochroneParameters: 'Isochrone-Parameter',
    buckets: 'Intervalle',
    timeLimit: 'Zeitlimit',
    distanceLimit: 'Entfernungslimit',
    reverseFlow: 'Fahrt zum Punkt',
    reverseFlowHint:
      'Die Ringe zeigen dann, von wo aus dieser Punkt erreichbar ist; ohne Haken, wohin man von ihm aus kommt. Einbahnstraßen und Abbiegeverbote machen den Unterschied.',
  },
  itinerary: {
    title: 'Reiseplan',
    button: 'Routendetails',
    weather: 'Wetter',
    noDeparture:
      'Legen Sie eine Abfahrtszeit fest, um das Wetter entlang der Route zu sehen.',
  },
  turnByTurn: {
    label: 'Abbiegehinweise',
    maneuvers: {
      depart: 'Start',
      continue: 'Weiter',
      straight: 'Geradeaus',
      left: 'Links abbiegen',
      right: 'Rechts abbiegen',
      slightLeft: 'Leicht links',
      slightRight: 'Leicht rechts',
      sharpLeft: 'Scharf links',
      sharpRight: 'Scharf rechts',
      uturn: 'Wenden',
      keepLeft: 'Links halten',
      keepRight: 'Rechts halten',
      merge: 'Einfädeln',
      rampOn: 'Auffahrt nehmen',
      rampOff: 'Ausfahrt nehmen',
      roundabout: 'In den Kreisverkehr',
      exitRoundabout: 'Kreisverkehr verlassen',
    },
  },
  shaping: {
    label: 'Hilfspunkt',
    hint: 'Lenkt nur die Route: ohne Nummer, Halt und Zeit.',
    turnsBack: 'Die Route kehrt hier um.',
  },
  waypointStop: {
    label: 'Halt',
    none: 'Kein Halt',
    pause: 'Pause',
    overnight: 'Übernachtung',
    minutes: 'Min.',
    continueAt: 'Weiter um',
    nights: 'Nächte',
  },
  point: {
    pick: 'Auf der Karte auswählen',
    current: 'Ihre Position',
    fromStart: 'Startposition',
    fromFinish: 'Zielposition',
    point: 'Routenpunkt',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto (4WD)',
    carnotoll: 'Auto (mautfrei)',
    bike: 'Fahrrad',
    ebike: 'E-Bike',
    gravelbike: 'Gravelbike',
    foot: 'Zu Fuß',
    stroller: 'Kinderwagen / Rollstuhl',
    hiking: 'Wandern',
    easyhike: 'Leichtes Wandern',
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
  milestonesOff: 'Aus',
  recompute: 'Route neu berechnen',
  maxAlternatives: 'Max. Anzahl der Routenvorschläge',
  style: {
    menuItem: 'Routenstil',
    title: 'Routenstil',
    lineWidth: 'Linienbreite',
    lineOpacity: 'Deckkraft der Linie',
    markerOpacity: 'Deckkraft der Marker',
  },
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
  isochroneRing: 'Isochrone',
  distance: ({ value, diff }) => (
    <>
      Entfernung:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  tolled: ({ value }) => (
    <>
      Mautstrecken: <b>{value}</b>
    </>
  ),
  withStops: ({ duration }) => (
    <>
      Mit Halten: <b>{duration}</b>
    </>
  ),
  arrival: ({ time }) => (
    <>
      Ankunft: <b>{time}</b>
    </>
  ),
  departure: ({ time }) => (
    <>
      Abfahrt: <b>{time}</b>
    </>
  ),
  departureLabel: 'Abfahrt',
  departureOff: 'Nicht festgelegt',
  departureHint: 'Aus: ohne Uhrzeiten und ohne Wetter entlang der Route.',
  departureTime: 'Abfahrtszeit',
  duration: ({ value, diff }) => (
    <>
      Dauer:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  showMidpointHint:
    'Ziehen Sie ein Routensegment, um einen Zwischenpunkt hinzuzufügen.',
  gpsError: 'Fehler beim Ermitteln Ihrer aktuellen Position.',
  routeNotFound:
    'Keine Route gefunden. Versuchen Sie, die Parameter zu ändern oder die Punkte zu verschieben.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Finden der Route', err),
  manualTooltip: 'Folgenden Abschnitt mit einer geraden Linie verbinden',
  transportScope: {
    title: 'Anwenden auf',
    route: 'Ganze Route',
    lastSection: 'Letzter Teil',
    next: 'Neue Abschnitte',
    leg: 'Dieser Abschnitt',
    section: 'Ganzer Teil',
    sameTransport: 'Gleiches Verkehrsmittel',
  },
  leg: 'Routenabschnitt',
  stop: 'Halt',
  transportTypeLabel: 'Verkehrsmittel',
  modeLabel: 'Routing-Modus',
};

export default de;
