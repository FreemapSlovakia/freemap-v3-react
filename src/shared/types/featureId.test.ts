import { describe, expect, it } from 'vitest';
import { featureIdsEqual, syntheticFeatureId } from './featureId.js';

describe('syntheticFeatureId', () => {
  it('answers a different id every call', () => {
    expect(featureIdsEqual(syntheticFeatureId(), syntheticFeatureId())).toBe(
      false,
    );
  });

  // A saved map carries the pins the URL can't name, ids and all. A counter that
  // restarts at 1 every page load would hand the first result minted here the id
  // of a restored pin — and results sharing an id are the same result, so the
  // new one would take the stored one's place and go with it.
  it('cannot collide with an id a saved map carries from another session', () => {
    for (const stored of [1, 2, 3]) {
      expect(
        featureIdsEqual(syntheticFeatureId(), { type: 'other', id: stored }),
      ).toBe(false);
    }
  });
});
