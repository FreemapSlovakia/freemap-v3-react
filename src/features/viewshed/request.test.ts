import { describe, expect, it } from 'vitest';
import { grantedDetail, viewshedDetailTiers } from './request.js';

/**
 * The free budget is in pixels, so what a tier costs depends on the reach. A
 * short viewshed is cheap and buys detail with the same allowance; a long one
 * pays for the reach instead.
 */
describe('viewshedDetailTiers', () => {
  it('grants the coarsest tier at the free reach, as it always did', () => {
    expect(viewshedDetailTiers(20, false)).toEqual(['superfast']);
  });

  it('buys finer tiers as the reach shortens', () => {
    expect(viewshedDetailTiers(10, false)).toEqual(['superfast', 'fast']);

    expect(viewshedDetailTiers(5, false)).toEqual([
      'superfast',
      'fast',
      'standard',
      'detailed',
    ]);
  });

  it('holds premium to nothing', () => {
    expect(viewshedDetailTiers(300, true)).toHaveLength(5);
  });
});

describe('grantedDetail', () => {
  it('snaps an unaffordable ask down to what the reach pays for', () => {
    expect(grantedDetail('finest', false, 20)).toBe('superfast');

    expect(grantedDetail('finest', false, 5)).toBe('detailed');
  });

  it('leaves an ask the budget covers alone', () => {
    expect(grantedDetail('fast', false, 10)).toBe('fast');
  });

  // Asking for less is nobody's business to prevent.
  it('never raises an ask', () => {
    expect(grantedDetail('superfast', false, 5)).toBe('superfast');

    expect(grantedDetail('standard', true, 300)).toBe('standard');
  });
});
