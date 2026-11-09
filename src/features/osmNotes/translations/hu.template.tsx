import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const hu: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  selection: 'OSM-jegyzet',
  showOnMap: 'megjelenítés a térképen',
  anonymous: 'Névtelen',
  actions: {
    opened: 'Létrehozva',
    commented: 'Hozzászólás',
    closed: 'Lezárva',
    reopened: 'Újranyitva',
    hidden: 'Elrejtve',
  },
  list: {
    sorts: {
      newest: 'Legújabbak elöl',
      oldest: 'Legrégebbiek elöl',
      active: 'Legutóbb aktívak elöl',
      comments: 'Legtöbb hozzászólás elöl',
    },
    none: 'A térkép ezen részén nincs nyitott jegyzet.',
    zoomIn: 'A jegyzetek a térkép nagyításával jelennek meg.',
    failed: 'A jegyzeteket nem sikerült betölteni.',
    capped: ({ count }) =>
      `Csak a nézet első ${count} jegyzete szerepel a listában; a többi nagyítással jelenik meg.`,
  },
};

export default hu;
