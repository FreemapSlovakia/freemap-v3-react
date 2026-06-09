import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { MapAreaMessages } from './MapAreaMessages.js';

const cs: DeepPartialWithRequiredObjects<MapAreaMessages> = {
  visible: 'Viditelná oblast',
  byArea: 'Vybraná oblast',
  pickHint: 'Upravte obdélník pro výběr oblasti',
};

export default cs;
