import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const fr: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Ajouter',
  apply: 'Appliquer',
  inBrowser: 'Dans le navigateur',
  onServer: 'Sur le serveur',
  revert: 'Annuler les modifications',
  background: 'Arrière-plan',
  contour: 'Courbe de niveau',
  fogInversion: 'Brouillard / inversion',
  elevation: 'Altitude',
  elevationBandWidth: 'Largeur de la bande d’altitude',
  color: 'Couleur',
  belowColor: 'Couleur en dessous',
  aboveColor: 'Couleur au-dessus',
  exaggeration: 'Exagération',
  exaggerationHint:
    'Les altitudes sont multipliées par cette valeur avant l’ombrage : au-dessus de 1 le relief paraît plus raide, en dessous plus plat.',
  azimuth: 'Azimut',
  lightElevation: 'Hauteur',
  parameters: 'Paramètres',
  contrast: 'Contraste',
  brightness: 'Luminosité',
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
