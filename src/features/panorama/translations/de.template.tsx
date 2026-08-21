import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const de: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  quality: {},
  tilt: {},
  labels: {},
  dominance: {},
  peak: {},
  errors: {},
  caveats: {},
};

export default de;
