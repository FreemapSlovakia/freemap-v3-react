import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const pl: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Członek od',
  email: 'E-mail',
  photos: 'Przesłane zdjęcia',
  comments: 'Komentarze użytkownika do zdjęć',
  events: 'Zorganizowane wydarzenia publiczne',
  showPhotos: 'Zdjęcia na mapie',
  edit: 'Edycja profilu',
};

export default pl;
