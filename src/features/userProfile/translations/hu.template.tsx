import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const hu: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Regisztráció dátuma',
  email: 'E-mail',
  photos: 'Feltöltött fényképek',
  comments: 'A felhasználó hozzászólásai fényképekhez',
  events: 'Szervezett nyilvános események',
  showPhotos: 'Fényképek a térképen',
  edit: 'Profil szerkesztése',
};

export default hu;
