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
      galleryAddTag('forest'),
    );

    expect(next.recentTags).toEqual(['forest']);
  });

  it('moves an existing tag back to the front without duplicating', () => {
    const state = {
      ...gallerySettingsInitialState,
      recentTags: ['a', 'b', 'c'],
    };

    const next = gallerySettingsReducer(state, galleryAddTag('c'));

    expect(next.recentTags).toEqual(['c', 'a', 'b']);
  });

  it('caps the list at 8 entries', () => {
    const state = {
      ...gallerySettingsInitialState,
      recentTags: ['1', '2', '3', '4', '5', '6', '7', '8'],
    };

    const next = gallerySettingsReducer(state, galleryAddTag('9'));

    expect(next.recentTags).toHaveLength(8);
    expect(next.recentTags[0]).toBe('9');
    expect(next.recentTags).not.toContain('8');
  });
});
