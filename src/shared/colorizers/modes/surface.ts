import { categoricalColorizer } from './pathDetail.js';

/**
 * What the route is paved with, from GraphHopper's `surface`. Its values are
 * grouped into what a rider or walker actually feels underfoot — a legend
 * naming all sixteen would be a wall of near-synonyms.
 */
export const surfaceColorizer = categoricalColorizer({
  detail: 'surface',
  categories: [
    {
      key: 'paved',
      values: ['paved', 'asphalt', 'concrete'],
      color: [59, 125, 216],
    },
    {
      key: 'cobbles',
      values: ['paving_stones', 'cobblestone'],
      color: [155, 89, 182],
    },
    {
      key: 'compacted',
      values: ['compacted', 'fine_gravel'],
      color: [39, 174, 96],
    },
    { key: 'gravel', values: ['gravel'], color: [230, 126, 34] },
    // `other` is not here — tagged with something the router can't name is not
    // the same as known to be bare ground, so it falls to Unknown.
    {
      key: 'ground',
      values: ['unpaved', 'ground', 'dirt', 'grass', 'sand', 'wood'],
      color: [139, 90, 43],
    },
  ],
  labels: (cm) => cm.categories.surface,
});
