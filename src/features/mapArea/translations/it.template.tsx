import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { MapAreaMessages } from './MapAreaMessages.js';

const it: DeepPartialWithRequiredObjects<MapAreaMessages> = {
  visible: 'Area visibile',
  byArea: 'Area selezionata',
  pickHint: "Regoli il rettangolo per selezionare l'area",
};

export default it;
