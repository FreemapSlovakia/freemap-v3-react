import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const it: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Ascesa totale',
  downhill: 'Discesa totale',
  downloadAsSvg: 'Scarica come SVG',
};

export default it;
