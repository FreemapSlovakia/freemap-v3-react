import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const de: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Gesamtanstieg',
  downhill: 'Gesamtabstieg',
  downloadAsSvg: 'Als SVG herunterladen',
};

export default de;
