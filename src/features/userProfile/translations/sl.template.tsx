import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const sl: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Član od',
  email: 'E-pošta',
  photos: 'Naložene fotografije',
  comments: 'Uporabnikovi komentarji k fotografijam',
  events: 'Organizirani javni dogodki',
  showPhotos: 'Fotografije na zemljevidu',
  edit: 'Uredi profil',
  roles: 'Vloge',
  photosHeading: 'Fotografije',
  rankingHeading: 'Lestvica',
  periodPhotos: 'Naložene v obdobju',
  rank: 'Uvrstitev po številu fotografij',
  periodAll: 'Skupaj',
  period90: '90 dni',
  period30: '30 dni',
  podiums: 'Top 3 v državah',
  countries: 'Države s fotografijami',
  views: 'Ogledi fotografij',
  averageRating: 'Povprečna ocena',
  ratingsGiven: 'Fotografije, ki jih je ocenil uporabnik',
  osmMapperSince: 'Kartograf od',
  osmChangesets: 'Nabori sprememb',
  osmTraces: 'Sledi GPS',
  osmLastEdit: 'Zadnje urejanje',
  osmMoreStats: 'Podrobna statistika',
};

export default sl;
