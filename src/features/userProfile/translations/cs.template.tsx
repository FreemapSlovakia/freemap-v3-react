import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const cs: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: (date) => `Členem od ${date}`,
  photos: 'Nahrané fotografie',
  comments: 'Komentáře uživatele k fotografiím',
  events: 'Pořádané veřejné akce',
  showPhotos: 'Fotografie na mapě',
  edit: 'Upravit profil',
};

export default cs;
