import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { RoutePlannerMessages } from './RoutePlannerMessages.js';

const it: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  selectHomeLocation: 'Seleziona sulla mappa',
  ghParams: {
    tripParameters: 'Parametri del viaggio',
    seed: 'Casuale',
    distance: 'Distanza approssimativa',
    isochroneParameters: 'Parametri isocroni',
    buckets: 'Buckets',
    timeLimit: 'Limite tempo',
    distanceLimit: 'Limite distanza',
  },
  milestones: 'Marcatori',
  start: 'Inizio',
  finish: 'Fine',
  swap: 'Inverti inizio e fine',
  point: {
    pick: 'Seleziona sulla mappa',
    current: 'La tua posizione',
    home: 'Posizione casa',
    point: 'Punto del percorso',
  },
  transportType: {
    car: 'Auto',
    car4wd: 'Auto 4x4',
    bike: 'Bici',
    foot: 'Camminata',
    hiking: 'Escursione',
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
      Durata:{' '}
      <b>
        {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Distanza: <b>{distance}</b> | Durata:{' '}
      <b>
        {h} h {m} m
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'Devi prima impostare la tua posizione di casa nelle Opzioni.',
    setHome: 'Imposta',
  },
  showMidpointHint:
    'Per aggiungere un punto intermedio, trascina un punto della linea.',
  gpsError: 'Errore nel determinare la tua posizione corrente.',
  routeNotFound:
    'Nessun percorso trovato. Prova a cambiare i parametri o sposta i punti della rotta.',
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Error finding the route:', err),
  manualTooltip: 'Collega il segmento successivo con una linea retta',
  default: 'Predefinito',
  leg: 'Tratto del percorso',
  stop: 'Fermata',
  transportTypeLabel: 'Tipo di trasporto',
  modeLabel: 'Modalità di instradamento',
};

export default it;
