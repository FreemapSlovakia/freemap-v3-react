import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const fr: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  detail: (props) => <ObjectDetails {...props} />,
  elevation: 'Altitude',
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
  openInOsm: 'OpenStreetMap.org',
  osmHistory: 'OpenStreetMap.org (historique)',
  type: 'Type',
  markerShape: 'Forme du marqueur',
  convertWithGeometry: 'Avec la géométrie complète',
  convertWithGeometryTo: ({ tool }) => (
    <>Avec la géométrie complète vers {tool}</>
  ),
  tooManyForLookup: ({ count, limit }) =>
    `Trop d'objets à afficher comme résultats (${count}, au maximum ${limit}). Zoomez ou restreignez le filtre.`,
  showAsLookup: 'Afficher comme Résultat',
};

export default fr;
