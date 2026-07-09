import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ContactsMessages } from './ContactsMessages.js';

const pl: DeepPartialWithRequiredObjects<ContactsMessages> = {
  ngo: 'Stowarzyszenie ochotnicze',
  registered: 'Zarejestrowane w MV/VVS/1-900/90-34343 dnia 2009-10-02',
  bankAccount: 'Konto bankowe',
  generalContact: 'Kontakty ogólne',
  board: 'Zarząd',
  boardMemebers: 'Członkowie zarządu',
  president: 'Prezes',
  vicepresident: 'Wiceprezes',
  secretary: 'Sekretarz',
};

export default pl;
