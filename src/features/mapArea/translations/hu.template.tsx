import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { MapAreaMessages } from './MapAreaMessages.js';

const hu: DeepPartialWithRequiredObjects<MapAreaMessages> = {
  visible: 'Látható terület',
  byArea: 'Kijelölt terület',
  pickHint: 'Igazítsa a téglalapot a terület kijelöléséhez',
};

export default hu;
