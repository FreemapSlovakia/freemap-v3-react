import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const it: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Membro dal',
  email: 'Email',
  photos: 'Foto caricate',
  comments: "Commenti dell'utente alle foto",
  events: 'Eventi pubblici organizzati',
  showPhotos: 'Foto sulla mappa',
  edit: 'Modifica profilo',
  roles: 'Ruoli',
  photosHeading: 'Foto',
  rankingHeading: 'Classifica',
  periodPhotos: 'Caricate nel periodo',
  rank: 'Posizione per numero di foto',
  periodAll: 'Sempre',
  period90: '90 giorni',
  period30: '30 giorni',
  podiums: 'Top 3 nei paesi',
  countries: 'Paesi fotografati',
  views: 'Visualizzazioni delle foto',
  averageRating: 'Valutazione media',
  ratingsGiven: "Foto valutate dall'utente",
  osmMapperSince: 'Mappatore dal',
  osmChangesets: 'Changeset',
  osmTraces: 'Tracce GPS',
  osmLastEdit: 'Ultima modifica',
  osmMoreStats: 'Statistiche dettagliate',
};

export default it;
