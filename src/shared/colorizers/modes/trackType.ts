import { categoricalColorizer } from './pathDetail.js';

/**
 * How firm a forest or field road is, from GraphHopper's `track_type` — OSM's
 * `tracktype`, grade1 solid to grade5 soft. It says what Surface can't: a
 * gravel track may be either, and that is the difference between rolling and
 * pushing. Only `highway=track` carries it, so a route that is mostly road
 * reads as mostly Unknown, and the mode offers itself only where something is
 * graded.
 */
export const trackTypeColorizer = categoricalColorizer({
  detail: 'track_type',
  categories: [
    { key: 'grade1', values: ['grade1'], color: [46, 204, 113] },
    { key: 'grade2', values: ['grade2'], color: [163, 212, 58] },
    { key: 'grade3', values: ['grade3'], color: [241, 196, 15] },
    { key: 'grade4', values: ['grade4'], color: [230, 126, 34] },
    { key: 'grade5', values: ['grade5'], color: [231, 76, 60] },
  ],
  labels: (cm) => cm.categories.trackType,
});
