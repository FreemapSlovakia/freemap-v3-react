import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const it: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  ghParams: {
    tripParameters: 'Parametri del viaggio',
    seed: 'Casuale',
    distance: 'Distanza approssimativa',
    isochroneParameters: 'Parametri isocroni',
    buckets: 'Buckets',
    timeLimit: 'Limite tempo',
    distanceLimit: 'Limite distanza',
    reverseFlow: 'Viaggio verso il punto',
    reverseFlowHint:
      'Le aree mostrano allora da dove si può raggiungere questo punto; senza spunta, dove si può arrivare partendo da esso. La differenza la fanno sensi unici e divieti di svolta.',
  },
  milestones: 'Marcatori',
  milestonesOff: 'Spenti',
  recompute: 'Ricalcola il percorso',
  maxAlternatives: 'Numero massimo di percorsi proposti',
  style: {
    menuItem: 'Stile del percorso',
    title: 'Stile del percorso',
    lineWidth: 'Spessore della linea',
    lineOpacity: 'Opacità della linea',
    markerOpacity: 'Opacità dei marcatori',
  },
  optimize: {
    label: "Ottimizza l'ordine",
    fixedStart: 'Mantieni la partenza',
    fixedStartEnd: 'Mantieni partenza e arrivo',
    roundtrip: 'Anello (ritorno alla partenza)',
    free: 'Libero (riordina tutto)',
  },
  start: 'Inizio',
  finish: 'Fine',
  swap: 'Inverti inizio e fine',
  itinerary: {
    title: 'Itinerario',
    button: 'Dettagli del percorso',
    weather: 'Meteo',
    noDeparture:
      'Imposti l’orario di partenza per vedere il meteo lungo il percorso.',
  },
  turnByTurn: {
    label: 'Indicazioni passo passo',
    maneuvers: {
      depart: 'Parta',
      continue: 'Prosegua',
      straight: 'Prosegua dritto',
      left: 'Giri a sinistra',
      right: 'Giri a destra',
      slightLeft: 'Leggermente a sinistra',
      slightRight: 'Leggermente a destra',
      sharpLeft: 'Svolti decisamente a sinistra',
      sharpRight: 'Svolti decisamente a destra',
      uturn: 'Faccia inversione',
      keepLeft: 'Tenga la sinistra',
      keepRight: 'Tenga la destra',
      merge: 'Si immetta',
      rampOn: 'Prenda la rampa',
      rampOff: 'Prenda l’uscita',
      roundabout: 'Entri nella rotonda',
      exitRoundabout: 'Esca dalla rotonda',
    },
  },
  shaping: {
    label: 'Punto ausiliario',
    hint: 'Orienta solo il percorso: senza numero, sosta né orario.',
    turnsBack: 'Il percorso torna indietro qui.',
  },
  waypointStop: {
    label: 'Sosta',
    none: 'Nessuna sosta',
    pause: 'Pausa',
    overnight: 'Pernottamento',
    minutes: 'min',
    continueAt: 'Ripartenza alle',
    nights: 'Notti',
  },
  point: {
    pick: 'Seleziona sulla mappa',
    current: 'La sua posizione',
    fromStart: 'Posizione di partenza',
    fromFinish: 'Posizione di arrivo',
    point: 'Punto del percorso',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto 4x4',
    carnotoll: 'Auto (evita i pedaggi)',
    bike: 'Bici',
    ebike: 'Bici elettrica',
    gravelbike: 'Bici gravel',
    foot: 'Camminata',
    stroller: 'Passeggino / sedia a rotelle',
    hiking: 'Escursione',
    easyhike: 'Escursione facile',
    mtb: 'Mountain bike',
    racingbike: 'Bici da corsa',
    motorcycle: 'Moto',
    manual: 'Linea retta',
  },
  development: 'in sviluppo',
  mode: {
    route: 'Ordinato',
    trip: 'Luoghi da visitare',
    roundtrip: 'Luoghi da visitare (Andata e ritorno)',
    'routndtrip-gh': 'Andata e ritorno',
    isochrone: 'Isocrono',
  },
  alternative: 'Alternativo',
  isochroneRing: 'Isocrona',
  distance: ({ value, diff }) => (
    <>
      Distance:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  tolled: ({ value }) => (
    <>
      Tratti a pedaggio: <b>{value}</b>
    </>
  ),
  withStops: ({ duration }) => (
    <>
      Con le soste: <b>{duration}</b>
    </>
  ),
  arrival: ({ time }) => (
    <>
      Arrivo: <b>{time}</b>
    </>
  ),
  departure: ({ time }) => (
    <>
      Partenza: <b>{time}</b>
    </>
  ),
  departureLabel: 'Partenza',
  departureOff: 'Non impostata',
  departureHint: 'Disattivata: senza orari e senza meteo lungo il percorso.',
  departureTime: 'Orario di partenza',
  duration: ({ value, diff }) => (
    <>
      Durata:{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  showMidpointHint:
    'Per aggiungere un punto intermedio, trascini un punto della linea.',
  gpsError: 'Errore nel determinare la sua posizione corrente.',
  routeNotFound:
    'Nessun percorso trovato. Provi a cambiare i parametri o sposti i punti della rotta.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error finding the route:', err),
  manualTooltip: 'Collega il segmento successivo con una linea retta',
  transportScope: {
    title: 'Applica a',
    route: 'Intero percorso',
    lastSection: 'Ultima parte',
    next: 'Nuovi tratti',
    leg: 'Questo tratto',
    section: 'Intera parte',
    sameTransport: 'Stesso tipo di trasporto',
  },
  leg: 'Tratto del percorso',
  stop: 'Fermata',
  transportTypeLabel: 'Tipo di trasporto',
  modeLabel: 'Modalità di instradamento',
};

export default it;
