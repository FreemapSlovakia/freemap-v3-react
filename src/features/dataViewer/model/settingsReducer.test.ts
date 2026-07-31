import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  trackViewerColorizeTrackBy,
  trackViewerSetColorizeLegend,
  trackViewerSetData,
} from './actions.js';
import {
  trackViewerSettingsInitialState,
  trackViewerSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted track-viewer settings slice. */

const emptyFc: FeatureCollection = { type: 'FeatureCollection', features: [] };

describe('trackViewerSettingsReducer — colorize', () => {
  it('colorizeTrackBy stores the mode', () => {
    const next = trackViewerSettingsReducer(
      trackViewerSettingsInitialState,
      trackViewerColorizeTrackBy('elevation'),
    );

    expect(next.colorizeTrackBy).toBe('elevation');
  });

  it('setColorizeLegend flips with no payload, honors an explicit value', () => {
    const flipped = trackViewerSettingsReducer(
      trackViewerSettingsInitialState,
      trackViewerSetColorizeLegend(undefined),
    );
    expect(flipped.colorizeLegend).toBe(
      !trackViewerSettingsInitialState.colorizeLegend,
    );

    const explicit = trackViewerSettingsReducer(
      trackViewerSettingsInitialState,
      trackViewerSetColorizeLegend(false),
    );
    expect(explicit.colorizeLegend).toBe(false);
  });
});

describe('trackViewerSettingsReducer — new-track elevation guard', () => {
  it('drops an elevation-derived mode when the new track lacks full elevation', () => {
    const state = {
      ...trackViewerSettingsInitialState,
      colorizeTrackBy: 'elevation' as const,
    };

    const next = trackViewerSettingsReducer(
      state,
      trackViewerSetData({ trackGeojson: emptyFc }),
    );

    expect(next.colorizeTrackBy).toBeNull();
  });

  it('leaves the mode untouched when the payload omits the track', () => {
    const state = {
      ...trackViewerSettingsInitialState,
      colorizeTrackBy: 'elevation' as const,
    };

    const next = trackViewerSettingsReducer(
      state,
      trackViewerSetData({ focus: true }),
    );

    expect(next.colorizeTrackBy).toBe('elevation');
  });
});
