import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { MapAreaMessages } from './MapAreaMessages.js';

const cs: DeepPartialWithRequiredObjects<MapAreaMessages> = {
  visible: 'Viditelná oblast',
  byArea: 'Vybraná oblast',
  pickHint: 'Upravte obdélník pro výběr oblasti',
};

export default cs;
