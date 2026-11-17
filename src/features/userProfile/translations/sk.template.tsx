import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const sk: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Členom od',
  email: 'E-mail',
  photos: 'Nahraté fotografie',
  comments: 'Komentáre používateľa k fotografiám',
  events: 'Organizované verejné podujatia',
  showPhotos: 'Fotografie na mape',
  edit: 'Upraviť profil',
  roles: 'Roly',
  photosHeading: 'Fotografie',
  rankingHeading: 'Rebríček',
  periodPhotos: 'Nahraté za obdobie',
  rank: 'Poradie podľa počtu fotografií',
  periodAll: 'Celkovo',
  period90: '90 dní',
  period30: '30 dní',
  podiums: 'Top 3 v krajinách',
  countries: 'Krajiny s fotografiami',
  views: 'Zobrazenia fotografií',
  averageRating: 'Priemerné hodnotenie',
  ratingsGiven: 'Fotografie ohodnotené používateľom',
  osmMapperSince: 'Mapovateľom od',
  osmChangesets: 'Sady zmien',
  osmTraces: 'GPS stopy',
  osmLastEdit: 'Posledná úprava',
  osmMoreStats: 'Podrobné štatistiky',
};

export default sk;
