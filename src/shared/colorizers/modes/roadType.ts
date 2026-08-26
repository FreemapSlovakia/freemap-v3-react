import { categoricalColorizer } from './pathDetail.js';

/**
 * What kind of way the route follows, from GraphHopper's `road_class`, grouped
 * by what it means on the ground rather than by the OSM highway value.
 */
export const roadTypeColorizer = categoricalColorizer({
  detail: 'road_class',
  categories: [
    {
      key: 'major',
      values: ['motorway', 'trunk', 'primary', 'secondary'],
      color: [231, 76, 60],
    },
    {
      key: 'minor',
      values: [
        'tertiary',
        'unclassified',
        'residential',
        'living_street',
        'service',
        'road',
        'busway',
      ],
      color: [230, 126, 34],
    },
    { key: 'track', values: ['track'], color: [139, 90, 43] },
    { key: 'path', values: ['path', 'bridleway'], color: [39, 174, 96] },
    {
      key: 'footway',
      values: ['footway', 'pedestrian', 'corridor'],
      color: [22, 160, 133],
    },
    { key: 'cycleway', values: ['cycleway'], color: [59, 125, 216] },
    { key: 'steps', values: ['steps'], color: [155, 89, 182] },
  ],
  labels: (cm) => cm.categories.roadType,
});
