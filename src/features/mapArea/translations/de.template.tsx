import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { MapAreaMessages } from './MapAreaMessages.js';

const de: DeepPartialWithRequiredObjects<MapAreaMessages> = {
  visible: 'Sichtbarer Bereich',
  byArea: 'Ausgewählter Bereich',
  pickHint: 'Passen Sie das Rechteck an, um den Bereich festzulegen',
};

export default de;
