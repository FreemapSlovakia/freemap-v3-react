import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ContactsMessages } from './ContactsMessages.js';

const fr: DeepPartialWithRequiredObjects<ContactsMessages> = {
  ngo: 'Association de bénévoles',
  registered: 'Enregistrée sous MV/VVS/1-900/90-34343 le 02/10/2009',
  bankAccount: 'Compte bancaire',
  generalContact: 'Contacts généraux',
  board: 'Conseil d’administration',
  boardMemebers: 'Membres du conseil',
  president: 'Président',
  vicepresident: 'Vice-président',
  secretary: 'Secrétaire',
};

export default fr;
