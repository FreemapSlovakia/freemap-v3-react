import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ContactsMessages } from './ContactsMessages.js';

const it: DeepPartialWithRequiredObjects<ContactsMessages> = {
  ngo: 'Associazione di volontari',
  registered: 'Registrata a MV/VVS/1-900/90-34343 on 2009-10-02',
  bankAccount: 'Conto bancario',
  generalContact: 'Contatti generali',
  board: 'Consiglio direttivo',
  boardMemebers: 'Membri del consiglio',
  president: 'Presidente',
  vicepresident: 'Vice Presidente',
  secretary: 'Segretario',
};

export default it;
