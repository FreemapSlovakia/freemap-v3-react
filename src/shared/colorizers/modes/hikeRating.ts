import { categoricalColorizer } from './pathDetail.js';

/**
 * How demanding the walking is, from GraphHopper's `hike_rating` — the SAC
 * scale, where 1 is `hiking` and 6 `difficult_alpine_hiking`. 0 stands for "not
 * rated", which the router reports on every unmarked way, so it falls to
 * Unknown rather than claiming the way is easy.
 */
export const hikeRatingColorizer = categoricalColorizer({
  detail: 'hike_rating',
  categories: [
    { key: 't1', values: ['1'], color: [46, 204, 113] },
    { key: 't2', values: ['2'], color: [163, 212, 58] },
    { key: 't3', values: ['3'], color: [241, 196, 15] },
    { key: 't4', values: ['4'], color: [230, 126, 34] },
    { key: 't5', values: ['5'], color: [231, 76, 60] },
    { key: 't6', values: ['6'], color: [142, 68, 173] },
  ],
  labels: (cm) => cm.categories.hikeRating,
});
