import { categoricalColorizer } from './pathDetail.js';

/**
 * How rough the going is, from GraphHopper's `smoothness` — OSM's nine-step
 * scale grouped into what it costs the traveller, since a legend telling
 * `horrible` from `very_horrible` names a distinction nobody maps consistently.
 * `other` is not here: tagged with something the router can't name is not the
 * same as known to be rough, so it falls to Unknown.
 */
export const smoothnessColorizer = categoricalColorizer({
  detail: 'smoothness',
  categories: [
    { key: 'good', values: ['excellent', 'good'], color: [46, 204, 113] },
    { key: 'intermediate', values: ['intermediate'], color: [241, 196, 15] },
    { key: 'bad', values: ['bad', 'very_bad'], color: [230, 126, 34] },
    {
      key: 'veryBad',
      values: ['horrible', 'very_horrible'],
      color: [231, 76, 60],
    },
    { key: 'impassable', values: ['impassable'], color: [142, 68, 173] },
  ],
  labels: (cm) => cm.categories.smoothness,
});
