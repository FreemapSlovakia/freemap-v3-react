import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ContactsMessages } from './ContactsMessages.js';

const de: DeepPartialWithRequiredObjects<ContactsMessages> = {
  ngo: 'Eingetragener Verein',
  registered: 'Registriert bei MV/VVS/1-900/90-34343 am 02.10.2009',
  bankAccount: 'Bankverbindung',
  generalContact: 'Allgemeine Kontakte',
  board: 'Vorstand',
  boardMemebers: 'Vorstandsmitglieder',
  president: 'Vorsitzender',
  vicepresident: 'Stellvertretender Vorsitzender',
  secretary: 'Schriftführer',
};

export default de;
