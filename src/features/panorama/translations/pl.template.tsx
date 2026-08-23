import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const pl: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  toposcopeMergeModal: {},
  quality: {},
  tilt: {},
  labels: {},
  dominance: {},
  peak: {},
  settings: { looks: {} },
  errors: {},
  caveats: {},
};

export default pl;
