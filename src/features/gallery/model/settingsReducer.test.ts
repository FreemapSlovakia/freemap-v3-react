import { describe, expect, it } from 'vitest';
import {
  galleryAddTag,
  galleryColorizeBy,
  galleryToggleDirection,
  galleryToggleLegend,
  galleryTogglePremium,
} from './actions.js';
import {
  gallerySettingsInitialState,
  gallerySettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted gallery settings slice. */

describe('gallerySettingsReducer — toggles & colorize', () => {
  it('colorizeBy stores the mode', () => {
    const next = gallerySettingsReducer(
      gallerySettingsInitialState,
      galleryColorizeBy('rating'),
    );

    expect(next.colorizeBy).toBe('rating');
  });

  it('toggleDirection flips with no payload, honors an explicit value', () => {
    const flipped = gallerySettingsReducer(
      gallerySettingsInitialState,
      galleryToggleDirection(undefined),
    );
    expect(flipped.showDirection).toBe(
      !gallerySettingsInitialState.showDirection,
    );

    const explicit = gallerySettingsReducer(
      gallerySettingsInitialState,
      galleryToggleDirection(false),
    );
    expect(explicit.showDirection).toBe(false);
  });

  it('toggleLegend honors an explicit value', () => {
    const next = gallerySettingsReducer(
      gallerySettingsInitialState,
      galleryToggleLegend(false),
    );

    expect(next.showLegend).toBe(false);
  });

  it('togglePremium stores the explicit default', () => {
    const next = gallerySettingsReducer(
      gallerySettingsInitialState,
      galleryTogglePremium(false),
    );

    expect(next.premium).toBe(false);
  });
});

describe('gallerySettingsReducer — recent tags (MRU, capped at 8)', () => {
  it('unshifts a new tag to the front', () => {
    const next = gallerySettingsReducer(
      gallerySettingsInitialState,
      galleryAddTag({ id: 1, name: 'forest' }),
    );

    expect(next.recentTags).toEqual([{ id: 1, name: 'forest' }]);
  });

  it('moves an existing tag back to the front without duplicating', () => {
    const state = {
      ...gallerySettingsInitialState,
      recentTags: [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 3, name: 'c' },
      ],
    };

    const next = gallerySettingsReducer(
      state,
      galleryAddTag({ id: 3, name: 'c' }),
    );

    expect(next.recentTags.map(({ id }) => id)).toEqual([3, 1, 2]);
  });

  it('replaces a tag remembered by name with the same tag by id', () => {
    const state = {
      ...gallerySettingsInitialState,
      recentTags: [{ name: 'a' }, { name: 'b' }],
    };

    const next = gallerySettingsReducer(
      state,
      galleryAddTag({ id: 2, name: 'b' }),
    );

    expect(next.recentTags).toEqual([{ id: 2, name: 'b' }, { name: 'a' }]);
  });

  it('caps the list at 8 entries', () => {
    const state = {
      ...gallerySettingsInitialState,
      recentTags: [1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({
        id,
        name: String(id),
      })),
    };

    const next = gallerySettingsReducer(
      state,
      galleryAddTag({ id: 9, name: '9' }),
    );

    expect(next.recentTags).toHaveLength(8);
    expect(next.recentTags[0]?.id).toBe(9);
    expect(next.recentTags.map(({ id }) => id)).not.toContain(8);
  });
});
