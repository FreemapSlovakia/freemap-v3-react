import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { MapAreaMessages } from './MapAreaMessages.js';

const it: DeepPartialWithRequiredObjects<MapAreaMessages> = {
  visible: 'Area visibile',
  byArea: 'Area selezionata',
  pickHint: "Regola il rettangolo per selezionare l'area",
};

export default it;
