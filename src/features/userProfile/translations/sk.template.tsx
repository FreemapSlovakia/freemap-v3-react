import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const sk: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Členom od',
  roles: 'Role',
  email: 'E-mail',
  photos: 'Nahraté fotografie',
  comments: 'Komentáre používateľa k fotografiám',
  events: 'Organizované verejné podujatia',
  showPhotos: 'Fotografie na mape',
  edit: 'Upraviť profil',
};

export default sk;
