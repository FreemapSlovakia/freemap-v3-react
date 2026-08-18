import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const it: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Ascesa totale',
  downhill: 'Discesa totale',
  downloadAsSvg: 'Scarica come SVG',
  showWaypoints: 'Mostra i waypoint',
  settings: 'Impostazioni del profilo altimetrico',
  elevationSource: 'Dati altimetrici',
  fetchError: "Non è stato possibile leggere l'altitudine",
};

export default it;
