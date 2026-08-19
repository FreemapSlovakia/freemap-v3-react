import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const fr: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Propriétés',
  edit: {
    pointKeys:
      'Écrivez {clé} pour une propriété et {location} pour la position.',
    lineKeys:
      'Écrivez {clé} pour une propriété, {length} pour la longueur ({length_m}, {length_km}, {length_mi}) et {azimuth} pour une ligne droite de deux points.',
    polygonKeys:
      'Écrivez {clé} pour une propriété, {area} pour la surface ({area_m2}, {area_a}, {area_ha}, {area_km2}) et {perimeter} pour le périmètre ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    properties: 'Propriétés',
    propertyKey: 'Nom',
    propertyValue: 'Valeur',
    addProperty: 'Ajouter une propriété',
    removeProperty: 'Supprimer la propriété',
    insertIntoLabel: "Insérer dans l'étiquette",
    title: 'Propriétés',
    color: 'Couleur',
    fillColor: 'Couleur de remplissage',
    label: 'Étiquette',
    width: 'Largeur',
    hint: 'Entrée passe à la ligne. Pour supprimer l’étiquette, laissez ce champ vide.',
    shape: 'Forme',
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
  cutHole: 'Découper un trou',
  cutHoleHint: 'Dessinez le trou à l’intérieur de ce polygone.',
  makeHole: 'Transformer en trou du polygone englobant',
  detachHole: 'Détacher le trou',
};

export default fr;
