import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const fr: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  detail: (props) => <ObjectDetails {...props} />,
  elevation: 'Altitude',
  terrain: {
    prominence: 'Proéminence',
    keyCol: 'Col clé',
    isolation: 'Isolement',
    showRoute: 'Afficher le chemin vers un terrain plus haut',
    hideRoute: 'Masquer le chemin',
    depth: 'Profondeur du col',
    keyColOf: 'Col clé de',
    showOnMap: 'Afficher sur la carte',
    route: 'Chemin vers un terrain plus haut',
    summitElevation: 'Altitude du sommet',
    saddleElevation: 'Altitude du col',
    fromMarker: ({ distance }) => `à ${distance} du marqueur`,
  },
  routeFetchError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du chargement du chemin', err),
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Pour voir les objets par type, vous devez zoomer jusqu’au niveau ${minZoom} au moins.`,
    zoom: 'Zoomer',
  },
  tooManyPoints: ({ limit }) => `Le résultat a été limité à ${limit} objets.`,
  fetchingError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la récupération des objets (POI)',
      err,
    ),
  icon: {
    pin: 'Épingle',
    ring: 'Anneau',
    square: 'Carré',
  },
  style: {
    button: 'Style de marqueur',
    title: 'Style de marqueur des objets',
  },
  source: 'Source',
  showDetails: 'Détails',
  moreGeneralTypes: 'Types plus généraux',
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (historique)',
  history: 'Historique',
  markerShape: 'Forme du marqueur',
  tooManyForLookup: ({ count, limit }) =>
    `Trop d'objets à afficher comme résultats (${count}, au maximum ${limit}). Zoomez ou restreignez le filtre.`,
  showAsLookup: 'Afficher comme Résultat',
  showAllAsLookup: 'Afficher tout comme Résultat',
};

export default fr;
