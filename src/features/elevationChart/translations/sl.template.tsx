import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const sl: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Skupni vzpon',
  downhill: 'Skupni spust',
  downloadAsSvg: 'Prenesi kot SVG',
};

export default sl;
