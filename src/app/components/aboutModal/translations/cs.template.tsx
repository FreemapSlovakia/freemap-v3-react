import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ContactsMessages } from './ContactsMessages.js';

const cs: DeepPartialWithRequiredObjects<ContactsMessages> = {
  ngo: 'Spolek',
  registered: 'Registrované na MV/VVS/1-900/90-34343 dne 2.10.2009',
  bankAccount: 'Bankovní spojení',
  generalContact: 'Všeobecné kontakty',
  board: 'Představenstvo',
  boardMemebers: 'Členové představenstva',
  president: 'Předseda',
  vicepresident: 'Místopředseda',
  secretary: 'Tajemník',
};

export default cs;
