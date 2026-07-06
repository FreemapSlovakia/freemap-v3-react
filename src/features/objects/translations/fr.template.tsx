import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectDetails } from '../components/ObjectDetails.js';
import type { ObjectsMessages } from './ObjectsMessages.js';

const fr: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  detail: ({ result }) => (
    <ObjectDetails
      result={result}
      openText="Ouvrir sur OpenStreetMap.org"
      historyText="historique"
      editInJosmText="Modifier dans JOSM"
    />
  ),
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
  type: 'Type',
  markerShape: 'Forme du marqueur',
  convertAsPoint: 'En point',
  convertWithGeometry: 'Avec la géométrie complète',
  showAsLookup: 'Afficher comme Résultat',
  convertAll: 'Convertir tous les objets visibles en dessin',
};

export default fr;
