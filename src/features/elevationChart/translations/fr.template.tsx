import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const fr: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Dénivelé positif total',
  downhill: 'Dénivelé négatif total',
  downloadAsSvg: 'Télécharger en SVG',
  showWaypoints: 'Afficher les points de cheminement',
  settings: 'Paramètres du profil altimétrique',
  elevationSource: 'Données altimétriques',
  fetchError: "L'altitude n'a pas pu être lue",
};

export default fr;
