import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const fr: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Inscrit le',
  email: 'E-mail',
  photos: 'Photos publiées',
  comments: "Commentaires de l'utilisateur sur des photos",
  events: 'Événements publics organisés',
  showPhotos: 'Photos sur la carte',
  edit: 'Modifier le profil',
};

export default fr;
