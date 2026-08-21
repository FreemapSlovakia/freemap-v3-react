import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const fr: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint:
    'Placez le centre de la table avec le bouton ◎ de la barre d’outils.',
  addCenter: 'Placer le centre',
  moveCenter: 'Déplacer le centre',
  pickCenterPrompt: 'Cliquez sur la carte à l’endroit où se dresse la table',
  addPointsHint:
    "Ajoutez des points dessinés ; chacun devient un rayon de la table. Le centre est lui aussi un point dessiné : étiquetez-le et déplacez-le dans l'outil de dessin.",
  downloadAsSvg: 'Télécharger en SVG',
  osmAttribution: '© les contributeurs OpenStreetMap',
  credit: ({ site }) => `Table d'orientation par ${site}`,
  settings: {
    title: "Table d'orientation",
    inscriptions: 'Inscriptions',
    innerCircleRadius: 'Rayon du cercle intérieur',
    outerCircleRadius: 'Rayon du cercle extérieur',
    scale: 'Échelle',
    scaleHint:
      "Taille du texte par rapport à la table. Redimensionner le panneau met tout le dessin à l'échelle.",
    preventUpturnedText: 'Empêcher le texte à l’envers',
    line1: 'Première ligne',
    line2: 'Deuxième ligne',
    lineHint:
      "Disponibles : {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} et {p:nom} pour n'importe quelle propriété du point. Une partie entre [crochets] n’est écrite que si tout ce qu’elle contient a une valeur, comme [{elevation} · ]{distance}.",
    placeholders:
      'Une inscription peut contenir {attribution} pour le crédit de la carte et {credit} pour ce portail.',
  },
};

export default fr;
