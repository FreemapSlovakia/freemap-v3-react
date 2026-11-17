import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const cs: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Členem od',
  email: 'E-mail',
  photos: 'Nahrané fotografie',
  comments: 'Komentáře uživatele k fotografiím',
  events: 'Pořádané veřejné akce',
  showPhotos: 'Fotografie na mapě',
  edit: 'Upravit profil',
  roles: 'Role',
  photosHeading: 'Fotografie',
  rankingHeading: 'Žebříček',
  periodPhotos: 'Nahrané za období',
  rank: 'Pořadí podle počtu fotografií',
  periodAll: 'Celkově',
  period90: '90 dní',
  period30: '30 dní',
  podiums: 'Top 3 v zemích',
  countries: 'Země s fotografiemi',
  views: 'Zobrazení fotografií',
  averageRating: 'Průměrné hodnocení',
  ratingsGiven: 'Fotografie ohodnocené uživatelem',
  osmMapperSince: 'Mapovatelem od',
  osmChangesets: 'Sady změn',
  osmTraces: 'GPS stopy',
  osmLastEdit: 'Poslední úprava',
  osmMoreStats: 'Podrobné statistiky',
};

export default cs;
