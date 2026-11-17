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
  roles: 'Role',
  photosHeading: 'Zdjęcia',
  rankingHeading: 'Ranking',
  periodPhotos: 'Przesłane w okresie',
  rank: 'Miejsce według liczby zdjęć',
  periodAll: 'Łącznie',
  period90: '90 dni',
  period30: '30 dni',
  podiums: 'Top 3 w krajach',
  countries: 'Kraje ze zdjęciami',
  views: 'Wyświetlenia zdjęć',
  averageRating: 'Średnia ocena',
  ratingsGiven: 'Zdjęcia ocenione przez użytkownika',
  osmMapperSince: 'Maper od',
  osmChangesets: 'Zestawy zmian',
  osmTraces: 'Ślady GPS',
  osmLastEdit: 'Ostatnia edycja',
  osmMoreStats: 'Szczegółowe statystyki',
};

export default pl;
