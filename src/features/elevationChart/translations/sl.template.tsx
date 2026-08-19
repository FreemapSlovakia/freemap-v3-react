import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const sl: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Skupni vzpon',
  downhill: 'Skupni spust',
  downloadAsSvg: 'Prenesi kot SVG',
  showWaypoints: 'Prikaži točke poti',
  elevationSource: 'Podatki o višini',
  fetchError: 'Nadmorske višine ni bilo mogoče prebrati',
};

export default sl;
