import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const pl: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  selection: 'Uwaga OSM',
  showOnMap: 'pokaż na mapie',
  anonymous: 'Anonim',
  actions: {
    opened: 'Utworzona',
    commented: 'Komentarz',
    closed: 'Zamknięta',
    reopened: 'Ponownie otwarta',
    hidden: 'Ukryta',
  },
  list: {
    sorts: {
      newest: 'Najnowsze najpierw',
      oldest: 'Najstarsze najpierw',
      active: 'Ostatnio aktywne najpierw',
      comments: 'Najwięcej komentarzy najpierw',
    },
    none: 'W tej części mapy nie ma otwartych uwag.',
    zoomIn: 'Uwagi pojawią się po przybliżeniu mapy.',
    failed: 'Nie udało się wczytać uwag.',
    capped: ({ count }) =>
      `Wyświetlono tylko pierwsze ${count} uwag w widoku; kolejne pojawią się po przybliżeniu mapy.`,
  },
};

export default pl;
