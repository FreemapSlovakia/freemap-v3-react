import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ContactsMessages } from './ContactsMessages.js';

const sl: DeepPartialWithRequiredObjects<ContactsMessages> = {
  ngo: 'Prostovoljno združenje',
  registered: 'Registrirano pri MV/VVS/1-900/90-34343 dne 2. 10. 2009',
  bankAccount: 'Bančni račun',
  generalContact: 'Splošni kontakti',
  board: 'Upravni odbor',
  boardMemebers: 'Člani upravnega odbora',
  president: 'Predsednik',
  vicepresident: 'Podpredsednik',
  secretary: 'Tajnik',
};

export default sl;
