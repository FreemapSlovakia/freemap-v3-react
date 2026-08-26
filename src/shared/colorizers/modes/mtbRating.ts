import { categoricalColorizer } from './pathDetail.js';

/**
 * How technical the riding is, from GraphHopper's `mtb_rating`: the `mtb:scale`
 * shifted by one, so 1 is S0 and 7 is S6. 0 means the way carries no rating and
 * falls to Unknown. The labels are the scale's own, so they need no translating.
 */
export const mtbRatingColorizer = categoricalColorizer({
  detail: 'mtb_rating',
  categories: [
    { key: 's0', values: ['1'], color: [46, 204, 113] },
    { key: 's1', values: ['2'], color: [163, 212, 58] },
    { key: 's2', values: ['3'], color: [241, 196, 15] },
    { key: 's3', values: ['4'], color: [230, 126, 34] },
    { key: 's4', values: ['5'], color: [231, 76, 60] },
    { key: 's5', values: ['6'], color: [192, 57, 43] },
    { key: 's6', values: ['7'], color: [142, 68, 173] },
  ],
  labels: () => ({
    s0: 'S0',
    s1: 'S1',
    s2: 'S2',
    s3: 'S3',
    s4: 'S4',
    s5: 'S5',
    s6: 'S6',
  }),
});
