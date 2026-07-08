import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ElevationChartMessages } from './ElevationChartMessages.js';

const hu: DeepPartialWithRequiredObjects<ElevationChartMessages> = {
  uphill: 'Összes emelkedés',
  downhill: 'Összes lejtés',
  downloadAsSvg: 'Letöltés SVG-ként',
};

export default hu;
