import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const fr: DeepPartialWithRequiredObjects<RoutePlannerMessages> = {
  transportScope: {
    title: 'Appliquer à',
    route: 'Tout l’itinéraire',
    lastSection: 'Dernière partie',
    next: 'Nouveaux tronçons',
    leg: 'Ce tronçon',
    section: 'Toute la partie',
    sameTransport: 'Même mode de transport',
  },
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
    reverseFlow: 'Trajet vers le point',
    reverseFlowHint:
      'Les zones indiquent alors d’où l’on peut atteindre ce point ; sans la case cochée, jusqu’où l’on peut aller depuis celui-ci. Les sens uniques et les interdictions de tourner font la différence.',
  },
  milestones: 'Bornes kilométriques',
  milestonesOff: 'Aucune',
  recompute: 'Recalculer l’itinéraire',
  maxAlternatives: 'Nombre max. d’itinéraires proposés',
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
  itinerary: {
    title: 'Itinéraire',
    button: 'Détails de l’itinéraire',
    weather: 'Météo',
    noDeparture:
      'Définissez l’heure de départ pour voir la météo le long de l’itinéraire.',
  },
  turnByTurn: {
    label: 'Instructions détaillées',
    maneuvers: {
      depart: 'Partez',
      continue: 'Continuez',
      straight: 'Continuez tout droit',
      left: 'Tournez à gauche',
      right: 'Tournez à droite',
      slightLeft: 'Légèrement à gauche',
      slightRight: 'Légèrement à droite',
      sharpLeft: 'Fortement à gauche',
      sharpRight: 'Fortement à droite',
      uturn: 'Faites demi-tour',
      keepLeft: 'Serrez à gauche',
      keepRight: 'Serrez à droite',
      merge: 'Insérez-vous',
      rampOn: 'Prenez la bretelle',
      rampOff: 'Prenez la sortie',
      roundabout: 'Entrez dans le giratoire',
      exitRoundabout: 'Sortez du giratoire',
    },
  },
  shaping: {
    label: 'Point auxiliaire',
    hint: 'Oriente seulement l’itinéraire : sans numéro, arrêt ni horaire.',
    turnsBack: 'L’itinéraire fait demi-tour ici.',
  },
  waypointStop: {
    label: 'Arrêt',
    none: 'Sans arrêt',
    pause: 'Pause',
    overnight: 'Nuitée',
    minutes: 'min',
    continueAt: 'Reprise à',
    nights: 'Nuits',
  },
  point: {
    point: 'Point de l’itinéraire',
    pick: 'Sélectionner sur la carte',
    current: 'Votre position',
    fromStart: 'Position de départ',
    fromFinish: 'Position d’arrivée',
  },
  transportType: {
    car: 'Voiture',
    car4wd: 'Voiture (4x4)',
    carnotoll: 'Voiture (sans péage)',
    bike: 'Vélo',
    ebike: 'Vélo électrique',
    gravelbike: 'Vélo gravel',
    foot: 'Marche',
    stroller: 'Poussette / fauteuil roulant',
    hiking: 'Randonnée',
    easyhike: 'Randonnée facile',
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
  isochroneRing: 'Isochrone',
  distance: ({ value, diff }) => (
    <>
      Distance :{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  tolled: ({ value }) => (
    <>
      Sections à péage: <b>{value}</b>
    </>
  ),
  withStops: ({ duration }) => (
    <>
      Avec les arrêts : <b>{duration}</b>
    </>
  ),
  arrival: ({ time }) => (
    <>
      Arrivée : <b>{time}</b>
    </>
  ),
  departure: ({ time }) => (
    <>
      Départ : <b>{time}</b>
    </>
  ),
  departureLabel: 'Départ',
  departureOff: 'Non défini',
  departureHint: 'Désactivé : sans horaires ni météo le long de l’itinéraire.',
  departureTime: 'Heure de départ',
  duration: ({ value, diff }) => (
    <>
      Durée :{' '}
      <b>
        {value}
        {diff ? ` (+ ${diff})` : ''}
      </b>
    </>
  ),
  showMidpointHint:
    'Pour ajouter un point intermédiaire, faites glisser un segment de l’itinéraire.',
  gpsError: 'Erreur lors de l’obtention de votre position actuelle.',
  routeNotFound:
    'Aucun itinéraire trouvé. Essayez de modifier les paramètres ou de déplacer les points de l’itinéraire.',
  routeOutOfArea:
    'Un point de l’itinéraire se trouve hors de la zone couverte par le calcul d’itinéraires.',
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la recherche de l’itinéraire',
      err,
    ),
};

export default fr;
