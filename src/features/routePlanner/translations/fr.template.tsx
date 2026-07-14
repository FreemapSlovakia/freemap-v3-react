import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const fr: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  selectHomeLocation: 'Sélectionner sur la carte',
  default: 'Par défaut',
  leg: 'Tronçon de l’itinéraire',
  manualTooltip: 'Relier le segment suivant par une ligne droite',
  ghParams: {
    tripParameters: 'Paramètres du trajet',
    seed: 'Graine aléatoire',
    distance: 'Distance approximative',
    isochroneParameters: 'Paramètres des isochrones',
    buckets: 'Intervalles',
    timeLimit: 'Limite de temps',
    distanceLimit: 'Limite de distance',
  },
  milestones: 'Bornes kilométriques',
  style: {
    menuItem: 'Style de l’itinéraire',
    title: 'Style de l’itinéraire',
    lineWidth: 'Épaisseur de la ligne',
    lineOpacity: 'Opacité de la ligne',
    markerOpacity: 'Opacité des marqueurs',
  },
  optimize: {
    label: 'Optimiser l’ordre',
    fixedStart: 'Conserver le départ',
    fixedStartEnd: 'Conserver le départ et l’arrivée',
    roundtrip: 'Aller-retour (retour au départ)',
    free: 'Libre (tout réorganiser)',
  },
  start: 'Départ',
  finish: 'Arrivée',
  stop: 'Arrêt',
  swap: 'Inverser le départ et l’arrivée',
  point: {
    point: 'Point de l’itinéraire',
    pick: 'Sélectionner sur la carte',
    current: 'Votre position',
    home: 'Position du domicile',
    fromStart: 'Position de départ',
    fromFinish: 'Position d’arrivée',
  },
  transportType: {
    car: 'Voiture',
    car4wd: 'Voiture (4x4)',
    bike: 'Vélo',
    foot: 'Marche',
    hiking: 'Randonnée',
    mtb: 'VTT',
    racingbike: 'Vélo de course',
    motorcycle: 'Moto',
    manual: 'Ligne droite',
  },
  transportTypeLabel: 'Mode de transport',
  development: 'en développement',
  mode: {
    route: 'Dans l’ordre indiqué',
    trip: 'Visite de lieux',
    roundtrip: 'Visite de lieux (aller-retour)',
    'routndtrip-gh': 'Aller-retour',
    isochrone: 'Isochrones',
  },
  modeLabel: 'Mode de calcul d’itinéraire',
  alternative: 'Alternative',
  distance: ({ value, diff }) => (
    <>
      Distance :{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  duration: ({ h, m, diff }) => (
    <>
      Durée :{' '}
      <b>
        {h} h {m} m{diff && ` (+ ${diff.h} h ${diff.m} m)`}
      </b>
    </>
  ),
  summary: ({ distance, h, m }) => (
    <>
      Distance : <b>{distance}</b> | Durée :{' '}
      <b>
        {h} h {m} m
      </b>
    </>
  ),
  noHomeAlert: {
    msg: 'Vous devez d’abord définir la position de votre domicile dans les paramètres.',
    setHome: 'Définir',
  },
  showMidpointHint:
    'Pour ajouter un point intermédiaire, faites glisser un segment de l’itinéraire.',
  gpsError: 'Erreur lors de l’obtention de votre position actuelle.',
  routeNotFound:
    'Aucun itinéraire trouvé. Essayez de modifier les paramètres ou de déplacer les points de l’itinéraire.',
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la recherche de l’itinéraire',
      err,
    ),
};

export default fr;
