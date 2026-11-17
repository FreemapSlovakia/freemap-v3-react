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
  roles: 'Szerepkörök',
  photosHeading: 'Fényképek',
  rankingHeading: 'Ranglista',
  periodPhotos: 'Feltöltve az időszakban',
  rank: 'Helyezés a fényképek száma szerint',
  periodAll: 'Összesen',
  period90: '90 nap',
  period30: '30 nap',
  podiums: 'Top 3 az országokban',
  countries: 'Fényképezett országok',
  views: 'Fényképek megtekintései',
  averageRating: 'Átlagos értékelés',
  ratingsGiven: 'A felhasználó által értékelt fényképek',
  osmMapperSince: 'Térképező ekkortól',
  osmChangesets: 'Módosításcsomagok',
  osmTraces: 'GPS-nyomvonalak',
  osmLastEdit: 'Utolsó szerkesztés',
  osmMoreStats: 'Részletes statisztikák',
};

export default hu;
