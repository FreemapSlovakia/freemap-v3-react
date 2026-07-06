import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { MapAreaMessages } from './MapAreaMessages.js';

const sl: DeepPartialWithRequiredObjects<MapAreaMessages> = {
  visible: 'Vidno območje',
  byArea: 'Izbrano območje',
  pickHint: 'Prilagodite pravokotnik za izbiro območja',
};

export default sl;
