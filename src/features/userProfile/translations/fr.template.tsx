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
  roles: 'Rôles',
  photosHeading: 'Photos',
  rankingHeading: 'Classement',
  periodPhotos: 'Envoyées sur la période',
  rank: 'Classement par nombre de photos',
  periodAll: 'Toujours',
  period90: '90 jours',
  period30: '30 jours',
  podiums: 'Top 3 dans les pays',
  countries: 'Pays photographiés',
  views: 'Vues des photos',
  averageRating: 'Note moyenne',
  ratingsGiven: "Photos notées par l'utilisateur",
  osmMapperSince: 'Contributeur depuis',
  osmChangesets: 'Groupes de modifications',
  osmTraces: 'Traces GPS',
  osmLastEdit: 'Dernière modification',
  osmMoreStats: 'Statistiques détaillées',
};

export default fr;
