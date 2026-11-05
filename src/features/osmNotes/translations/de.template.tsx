import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const de: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  selection: 'OSM-Hinweis',
  showOnMap: 'auf der Karte zeigen',
  anonymous: 'Anonym',
  actions: {
    opened: 'Erstellt',
    commented: 'Kommentar',
    closed: 'Geschlossen',
    reopened: 'Wieder geöffnet',
    hidden: 'Ausgeblendet',
  },
};

export default de;
