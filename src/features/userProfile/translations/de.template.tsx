import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const de: DeepPartialWithRequiredObjects<UserProfileMessages> = {
  memberSince: 'Mitglied seit',
  email: 'E-Mail',
  photos: 'Hochgeladene Fotos',
  comments: 'Kommentare des Benutzers zu Fotos',
  events: 'Organisierte öffentliche Veranstaltungen',
  showPhotos: 'Fotos auf der Karte',
  edit: 'Profil bearbeiten',
  roles: 'Rollen',
  photosHeading: 'Fotos',
  rankingHeading: 'Bestenliste',
  periodPhotos: 'Im Zeitraum hochgeladen',
  rank: 'Rang nach Anzahl der Fotos',
  periodAll: 'Gesamt',
  period90: '90 Tage',
  period30: '30 Tage',
  podiums: 'Top 3 in Ländern',
  countries: 'Fotografierte Länder',
  views: 'Aufrufe der Fotos',
  averageRating: 'Durchschnittliche Bewertung',
  ratingsGiven: 'Vom Benutzer bewertete Fotos',
  osmMapperSince: 'Mapper seit',
  osmChangesets: 'Änderungssätze',
  osmTraces: 'GPS-Tracks',
  osmLastEdit: 'Letzte Bearbeitung',
  osmMoreStats: 'Detaillierte Statistiken',
};

export default de;
