import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const fr: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Propriétés',
  edit: {
    title: 'Propriétés',
    color: 'Couleur',
    fillColor: 'Couleur de remplissage',
    label: 'Étiquette',
    width: 'Largeur',
    hint: 'Pour supprimer l’étiquette, laissez ce champ vide.',
    shape: 'Forme',
    icon: 'Icône',
    iconChoose: 'Choisir une icône…',
    iconNone: 'Aucune icône',
    iconSearch: 'Rechercher des icônes',
    text: 'Texte',
    textHint: 'Icône ou 2 caractères au maximum affichés dans le marqueur.',
    type: 'Type de géométrie',
    dashArray: 'Style de pointillés',
    lineCap: 'Extrémité de ligne',
    lineCapRound: 'Arrondie',
    lineCapButt: 'Plate',
    lineCapSquare: 'Carrée',
    lineJoin: 'Jointure de lignes',
    lineJoinRound: 'Arrondie',
    lineJoinMiter: 'En pointe',
    lineJoinBevel: 'Biseautée',
  },
  continue: 'Continuer',
  join: 'Joindre',
  split: 'Diviser',
  stopDrawing: 'Arrêter le dessin',
  selectPointToJoin: 'Sélectionnez un point pour joindre les lignes',
  defProps: {
    menuItem: 'Réglages de style',
    title: 'Réglages de style de dessin par défaut',
    applyToAll: 'Enregistrer et appliquer à tout',
  },
  projection: {
    projectPoint: 'Projeter un point',
    azimuth: 'Azimut',
    distance: 'Distance',
  },
  reverse: 'Inverser le sens',
  simplify: 'Simplifier',
};

export default fr;
