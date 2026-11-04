import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const de: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Mitglied seit',
  roles: 'Rollen',
  email: 'E-Mail',
  photos: 'Hochgeladene Fotos',
  comments: 'Kommentare des Benutzers zu Fotos',
  events: 'Organisierte öffentliche Veranstaltungen',
  showPhotos: 'Fotos auf der Karte',
  edit: 'Profil bearbeiten',
};

export default de;
