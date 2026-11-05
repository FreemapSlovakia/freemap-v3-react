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
};

export default sk;
