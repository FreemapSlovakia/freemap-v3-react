import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DocumentsMessages } from './DocumentsMessages.js';

const sl: DeepPartialWithRequiredObjects<DocumentsMessages> = {
  errorLoading: 'Napaka pri nalaganju dokumenta.',
  searchManual: 'Iskanje po priročniku',
};

export default sl;
