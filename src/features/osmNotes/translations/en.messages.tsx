import type { OsmNotesMessages } from './OsmNotesMessages.js';

const en: OsmNotesMessages = {
  selection: 'OSM note',
  showOnMap: 'show on map',
  anonymous: 'Anonymous',
  actions: {
    opened: 'Opened',
    commented: 'Comment',
    closed: 'Closed',
    reopened: 'Reopened',
    hidden: 'Hidden',
  },
  list: {
    sorts: {
      newest: 'Newest first',
      oldest: 'Oldest first',
      active: 'Recently active first',
      comments: 'Most comments first',
    },
    none: 'No open notes in this part of the map.',
    zoomIn: 'Zoom in to see the notes.',
    failed: 'The notes could not be loaded.',
    capped: ({ count }) =>
      `Only the first ${count} notes in view are listed; zoom in for the rest.`,
  },
};

export default en;
