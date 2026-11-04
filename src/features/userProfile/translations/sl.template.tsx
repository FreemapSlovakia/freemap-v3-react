import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const sl: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: (date) => `Član od ${date}`,
  photos: 'Naložene fotografije',
  comments: 'Uporabnikovi komentarji k fotografijam',
  events: 'Organizirani javni dogodki',
  showPhotos: 'Fotografije na zemljevidu',
  edit: 'Uredi profil',
};

export default sl;
