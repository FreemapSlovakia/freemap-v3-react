import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const it: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: (date) => `Membro dal ${date}`,
  photos: 'Foto caricate',
  comments: "Commenti dell'utente alle foto",
  events: 'Eventi pubblici organizzati',
  showPhotos: 'Foto sulla mappa',
  edit: 'Modifica profilo',
};

export default it;
