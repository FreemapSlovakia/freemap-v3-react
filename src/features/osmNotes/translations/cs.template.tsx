import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const cs: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  selection: 'Poznámka OSM',
  showOnMap: 'zobrazit na mapě',
  anonymous: 'Anonym',
  actions: {
    opened: 'Vytvořena',
    commented: 'Komentář',
    closed: 'Uzavřena',
    reopened: 'Znovu otevřena',
    hidden: 'Skryta',
  },
  list: {
    sorts: {
      newest: 'Nejnovější první',
      oldest: 'Nejstarší první',
      active: 'Naposledy aktivní první',
      comments: 'Nejvíce komentářů první',
    },
    none: 'V této části mapy nejsou žádné otevřené poznámky.',
    zoomIn: 'Poznámky se zobrazí po přiblížení mapy.',
    failed: 'Poznámky se nepodařilo načíst.',
    capped: ({ count }) =>
      `Zobrazeno je jen prvních ${count} poznámek ve výřezu; další se zobrazí po přiblížení mapy.`,
  },
};

export default cs;
