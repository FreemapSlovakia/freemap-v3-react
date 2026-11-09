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
  list: {
    sorts: {
      newest: 'Neueste zuerst',
      oldest: 'Älteste zuerst',
      active: 'Zuletzt aktive zuerst',
      comments: 'Meiste Kommentare zuerst',
    },
    none: 'In diesem Kartenausschnitt gibt es keine offenen Hinweise.',
    zoomIn: 'Zoomen Sie hinein, um die Hinweise zu sehen.',
    failed: 'Die Hinweise konnten nicht geladen werden.',
    capped: ({ count }) =>
      `Nur die ersten ${count} Hinweise im Ausschnitt sind aufgelistet; zoomen Sie für die übrigen hinein.`,
  },
};

export default de;
