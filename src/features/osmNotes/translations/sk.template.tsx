import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const sk: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  selection: 'Poznámka OSM',
  showOnMap: 'zobraziť na mape',
  anonymous: 'Anonym',
  actions: {
    opened: 'Vytvorená',
    commented: 'Komentár',
    closed: 'Zatvorená',
    reopened: 'Znovu otvorená',
    hidden: 'Skrytá',
  },
  list: {
    sorts: {
      newest: 'Najnovšie prvé',
      oldest: 'Najstaršie prvé',
      active: 'Naposledy aktívne prvé',
      comments: 'Najviac komentárov prvé',
    },
    none: 'V tejto časti mapy nie sú žiadne otvorené poznámky.',
    zoomIn: 'Poznámky sa zobrazia po priblížení mapy.',
    failed: 'Poznámky sa nepodarilo načítať.',
    capped: ({ count }) =>
      `Zobrazených je len prvých ${count} poznámok vo výreze; ďalšie sa zobrazia po priblížení mapy.`,
  },
};

export default sk;
