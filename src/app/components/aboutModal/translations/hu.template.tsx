import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ContactsMessages } from './ContactsMessages.js';

const hu: DeepPartialWithRequiredObjects<ContactsMessages> = {
  ngo: 'Önkéntes egyesület',
  registered:
    'Nyilvántartásba véve 2009. október 2-án, MV/VVS/1-900/90-34343 számmal',
  bankAccount: 'Bankszámlaszám',
  generalContact: 'Általános elérhetőség',
  board: 'Elnökség',
  boardMemebers: 'Elnökségi tagok',
  president: 'Elnök',
  vicepresident: 'Alelnök',
  secretary: 'Titkár',
};

export default hu;
