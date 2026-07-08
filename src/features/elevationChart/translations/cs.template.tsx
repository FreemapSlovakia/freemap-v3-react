import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const cs: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Celkové stoupání',
  downhill: 'Celkové klesání',
  downloadAsSvg: 'Stáhnout jako SVG',
};

export default cs;
