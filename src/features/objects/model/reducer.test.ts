import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  objectsSetFilter,
  objectsSetResult,
  setSelectedIcon,
} from './actions.js';
import { objectInitialState, objectsReducer } from './reducer.js';

/** Pure reducer tests for the objects (POI) slice. */

// mapsLoaded carries a large payload; the reducer only reads `merge` and
// `data.objectsV2`, so a minimal cast is enough.
const loaded = (merge: boolean, active?: string[]) =>
  mapsLoaded({ merge, data: { objectsV2: active && { active } } } as never);

describe('objectsReducer', () => {
  it('setFilter replaces the active set', () => {
    const next = objectsReducer(
      objectInitialState,
      objectsSetFilter(['amenity=pub', 'shop']),
    );

    expect(next.active).toEqual(['amenity=pub', 'shop']);
  });

  it('setResult replaces the objects array', () => {
    const next = objectsReducer(
      objectInitialState,
      objectsSetResult([{ id: 1 }] as never),
    );

    expect(next.objects).toEqual([{ id: 1 }]);
  });

  it('setSelectedIcon stores the marker type', () => {
    const next = objectsReducer(objectInitialState, setSelectedIcon('square'));

    expect(next.selectedIcon).toBe('square');
  });

  it('clearMapFeatures resets to initial', () => {
    const state = { ...objectInitialState, active: ['x'] };

    expect(objectsReducer(state, clearMapFeatures())).toEqual(
      objectInitialState,
    );
  });

  describe('mapsLoaded', () => {
    it('replaces the active set when not merging', () => {
      const state = { ...objectInitialState, active: ['old'] };

      const next = objectsReducer(state, loaded(false, ['a', 'b']));

      expect(next.active).toEqual(['a', 'b']);
    });

    it('unions the active set when merging, de-duplicating', () => {
      const state = { ...objectInitialState, active: ['a', 'b'] };

      const next = objectsReducer(state, loaded(true, ['b', 'c']));

      expect(next.active).toEqual(['a', 'b', 'c']);
    });

    it('keeps the active set when merging with no objectsV2 data', () => {
      const state = { ...objectInitialState, active: ['a'] };

      const next = objectsReducer(state, loaded(true));

      expect(next.active).toEqual(['a']);
    });
  });
});
