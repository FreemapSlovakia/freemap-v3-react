import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const fr: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Ajouter',
  background: 'Arrière-plan',
  contour: 'Courbe de niveau',
  fogInversion: 'Brouillard / inversion',
  elevation: 'Altitude',
  elevationBandWidth: 'Largeur de la bande d’altitude',
  color: 'Couleur',
  belowColor: 'Couleur en dessous',
  aboveColor: 'Couleur au-dessus',
  exaggeration: 'Exagération',
  azimuth: 'Azimut',
  lightElevation: 'Hauteur',
  types: {
    'hillshade-igor': 'Ombrage (Igor)',
    'hillshade-classic': 'Ombrage (classique)',
    'slope-igor': 'Pente (Igor)',
    'slope-classic': 'Pente (classique)',
    'color-relief': 'Relief en couleurs',
    aspect: 'Exposition',
  },
};

export default fr;
