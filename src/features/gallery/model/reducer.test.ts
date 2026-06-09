import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  type GalleryItem,
  galleryAddItem,
  galleryAddTag,
  galleryColorizeBy,
  galleryMergeItem,
  galleryRemoveItem,
  galleryRequestImage,
  gallerySetItemError,
  galleryToggleDirection,
  galleryToggleLegend,
  galleryTogglePremium,
  galleryUpload,
} from './actions.js';
import { galleryInitialState, galleryReducer } from './reducer.js';

/**
 * Pure reducer tests for the gallery slice — focused on the branchy logic:
 * image navigation, premium recomputation on merge, upload error gating, and
 * the recent-tags MRU list.
 */

// GalleryItem requires a `File`; tests only touch id/premium/errors/position,
// so a minimal cast keeps them readable.
const item = (props: Partial<GalleryItem> & { id: number }): GalleryItem =>
  ({
    title: '',
    description: '',
    tags: [],
    takenAt: null,
    azimuth: null,
    dirtyPosition: '48.5 17.5', // a parseable position → no error by default
    premium: false,
    errors: [],
    ...props,
  }) as GalleryItem;

describe('galleryReducer — galleryRequestImage navigation', () => {
  const base = {
    ...galleryInitialState,
    imageIds: [10, 20, 30],
    activeImageId: 20,
  };

  it('next advances to the following id', () => {
    const next = galleryReducer(base, galleryRequestImage('next'));

    expect(next.activeImageId).toBe(30);
  });

  it('prev moves to the preceding id', () => {
    const next = galleryReducer(base, galleryRequestImage('prev'));

    expect(next.activeImageId).toBe(10);
  });

  it('next at the end is a no-op', () => {
    const state = { ...base, activeImageId: 30 };

    expect(
      galleryReducer(state, galleryRequestImage('next')).activeImageId,
    ).toBe(30);
  });

  it('prev at the start is a no-op', () => {
    const state = { ...base, activeImageId: 10 };

    expect(
      galleryReducer(state, galleryRequestImage('prev')).activeImageId,
    ).toBe(10);
  });

  it('a numeric payload selects that id directly and clears comment/editModel', () => {
    const state = { ...base, comment: 'hi' };

    const next = galleryReducer(state, galleryRequestImage(99));

    expect(next.activeImageId).toBe(99);
    expect(next.comment).toBe('');
    expect(next.editModel).toBeNull();
  });
});

describe('galleryReducer — items CRUD', () => {
  it('addItem pushes onto the items array', () => {
    const next = galleryReducer(
      galleryInitialState,
      galleryAddItem(item({ id: 1 })),
    );

    expect(next.items.map((i) => i.id)).toEqual([1]);
  });

  it('removeItem drops the matching item', () => {
    const state = {
      ...galleryInitialState,
      items: [item({ id: 1 }), item({ id: 2 })],
    };

    const next = galleryReducer(state, galleryRemoveItem(1));

    expect(next.items.map((i) => i.id)).toEqual([2]);
  });

  it('setItemError attaches the error to the matching item', () => {
    const state = { ...galleryInitialState, items: [item({ id: 1 })] };

    const next = galleryReducer(
      state,
      gallerySetItemError({ id: 1, error: 'boom' }),
    );

    expect(next.items[0].errors).toEqual(['boom']);
  });
});

describe('galleryReducer — mergeItem premium recomputation', () => {
  it('sets premium false when no item is premium', () => {
    const state = {
      ...galleryInitialState,
      premium: true,
      items: [item({ id: 1, premium: false }), item({ id: 2, premium: false })],
    };

    const next = galleryReducer(state, galleryMergeItem({ id: 1 }));

    expect(next.premium).toBe(false);
  });

  it('sets premium true when every item is premium', () => {
    const state = {
      ...galleryInitialState,
      premium: false,
      items: [item({ id: 1, premium: true }), item({ id: 2, premium: true })],
    };

    const next = galleryReducer(state, galleryMergeItem({ id: 1 }));

    expect(next.premium).toBe(true);
  });

  it('keeps the current premium flag on a mixed set', () => {
    const state = {
      ...galleryInitialState,
      premium: true,
      items: [item({ id: 1, premium: true }), item({ id: 2, premium: false })],
    };

    const next = galleryReducer(state, galleryMergeItem({ id: 1 }));

    expect(next.premium).toBe(true);
  });

  it('merges the payload into the matching item', () => {
    const state = {
      ...galleryInitialState,
      items: [item({ id: 1, title: 'a' })],
    };

    const next = galleryReducer(state, galleryMergeItem({ id: 1, title: 'b' }));

    expect(next.items[0].title).toBe('b');
  });
});

describe('galleryReducer — upload error gating', () => {
  it('computes errors then targets the first error-free item', () => {
    const state = {
      ...galleryInitialState,
      uploadingId: null,
      items: [
        item({ id: 1, dirtyPosition: '' }), // missing position → error
        item({ id: 2, dirtyPosition: '48.5 17.5' }), // valid
      ],
    };

    const next = galleryReducer(state, galleryUpload());

    expect(next.items[0].errors).toEqual(['gallery.missingPositionError']);
    expect(next.uploadingId).toBe(2); // first item without errors
  });

  it('sets uploadingId null when every item has an error', () => {
    const state = {
      ...galleryInitialState,
      uploadingId: null,
      items: [item({ id: 1, dirtyPosition: '' })],
    };

    const next = galleryReducer(state, galleryUpload());

    expect(next.uploadingId).toBeNull();
  });
});

describe('galleryReducer — togglePremium propagates to items', () => {
  it('flips premium and applies it to every item', () => {
    const state = {
      ...galleryInitialState,
      premium: false,
      items: [item({ id: 1, premium: false }), item({ id: 2, premium: false })],
    };

    const next = galleryReducer(state, galleryTogglePremium());

    expect(next.premium).toBe(true);
    expect(next.items.every((i) => i.premium)).toBe(true);
  });
});

describe('galleryReducer — recent tags (MRU, capped at 8)', () => {
  it('unshifts a new tag to the front', () => {
    const next = galleryReducer(galleryInitialState, galleryAddTag('forest'));

    expect(next.recentTags).toEqual(['forest']);
  });

  it('moves an existing tag back to the front without duplicating', () => {
    const state = { ...galleryInitialState, recentTags: ['a', 'b', 'c'] };

    const next = galleryReducer(state, galleryAddTag('c'));

    expect(next.recentTags).toEqual(['c', 'a', 'b']);
  });

  it('caps the list at 8 entries', () => {
    const state = {
      ...galleryInitialState,
      recentTags: ['1', '2', '3', '4', '5', '6', '7', '8'],
    };

    const next = galleryReducer(state, galleryAddTag('9'));

    expect(next.recentTags).toHaveLength(8);
    expect(next.recentTags[0]).toBe('9');
    expect(next.recentTags).not.toContain('8');
  });
});

describe('galleryReducer — toggles & resets', () => {
  it('toggleDirection flips with no payload, honors an explicit value', () => {
    const flipped = galleryReducer(
      galleryInitialState,
      galleryToggleDirection(undefined),
    );
    expect(flipped.showDirection).toBe(!galleryInitialState.showDirection);

    const explicit = galleryReducer(
      galleryInitialState,
      galleryToggleDirection(false),
    );
    expect(explicit.showDirection).toBe(false);
  });

  it('toggleLegend honors an explicit value', () => {
    const next = galleryReducer(
      galleryInitialState,
      galleryToggleLegend(false),
    );

    expect(next.showLegend).toBe(false);
  });

  it('colorizeBy stores the mode', () => {
    const next = galleryReducer(
      galleryInitialState,
      galleryColorizeBy('rating'),
    );

    expect(next.colorizeBy).toBe('rating');
  });

  it('mapRefocus to layers without the gallery overlay resets the filter', () => {
    const state = {
      ...galleryInitialState,
      filter: { ...galleryInitialState.filter, tag: 'x' },
    };

    const next = galleryReducer(state, mapRefocus({ layers: ['X'] }));

    expect(next.filter).toEqual(galleryInitialState.filter);
  });

  it('mapRefocus keeping the gallery overlay leaves the filter intact', () => {
    const state = {
      ...galleryInitialState,
      filter: { ...galleryInitialState.filter, tag: 'x' },
    };

    const next = galleryReducer(state, mapRefocus({ layers: ['X', 'I'] }));

    expect(next.filter.tag).toBe('x');
  });

  it('clearMapFeatures resets items but preserves display prefs', () => {
    const state = {
      ...galleryInitialState,
      items: [item({ id: 1 })],
      showDirection: false,
      showLegend: false,
      premium: false,
      dirtySeq: 7,
      colorizeBy: 'rating' as const,
    };

    const next = galleryReducer(state, clearMapFeatures());

    expect(next.items).toEqual([]);
    expect(next.showDirection).toBe(false);
    expect(next.showLegend).toBe(false);
    expect(next.premium).toBe(false);
    expect(next.dirtySeq).toBe(7);
    expect(next.colorizeBy).toBe('rating');
  });

  it('setActiveModal(null) clears items and the picking target', () => {
    const state = {
      ...galleryInitialState,
      items: [item({ id: 1 })],
      pickingPositionForId: 5,
    };

    const next = galleryReducer(state, setActiveModal(null));

    expect(next.items).toEqual([]);
    expect(next.pickingPositionForId).toBeNull();
  });
});
