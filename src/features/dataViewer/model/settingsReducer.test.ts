import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  dataViewerColorizeTrackBy,
  dataViewerSetColorizeLegend,
  dataViewerSetData,
} from './actions.js';
import {
  dataViewerSettingsInitialState,
  dataViewerSettingsReducer,
} from './settingsReducer.js';

/** Pure reducer tests for the persisted track-viewer settings slice. */

const emptyFc: FeatureCollection = { type: 'FeatureCollection', features: [] };

describe('dataViewerSettingsReducer — colorize', () => {
  it('colorizeTrackBy stores the mode', () => {
    const next = dataViewerSettingsReducer(
      dataViewerSettingsInitialState,
      dataViewerColorizeTrackBy('elevation'),
    );

    expect(next.colorizeTrackBy).toBe('elevation');
  });

  it('setColorizeLegend flips with no payload, honors an explicit value', () => {
    const flipped = dataViewerSettingsReducer(
      dataViewerSettingsInitialState,
      dataViewerSetColorizeLegend(undefined),
    );
    expect(flipped.colorizeLegend).toBe(
      !dataViewerSettingsInitialState.colorizeLegend,
    );

    const explicit = dataViewerSettingsReducer(
      dataViewerSettingsInitialState,
      dataViewerSetColorizeLegend(false),
    );
    expect(explicit.colorizeLegend).toBe(false);
  });
});

describe('dataViewerSettingsReducer — new-track elevation guard', () => {
  it('drops an elevation-derived mode when the new track lacks full elevation', () => {
    const state = {
      ...dataViewerSettingsInitialState,
      colorizeTrackBy: 'elevation' as const,
    };

    const next = dataViewerSettingsReducer(
      state,
      dataViewerSetData({ trackGeojson: emptyFc }),
    );

    expect(next.colorizeTrackBy).toBeNull();
  });

  it('leaves the mode untouched when the payload omits the track', () => {
    const state = {
      ...dataViewerSettingsInitialState,
      colorizeTrackBy: 'elevation' as const,
    };

    const next = dataViewerSettingsReducer(
      state,
      dataViewerSetData({ focus: true }),
    );

    expect(next.colorizeTrackBy).toBe('elevation');
  });
});
