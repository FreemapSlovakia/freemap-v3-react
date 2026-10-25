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
  const line = (
    coordinates: number[][],
    properties: Record<string, unknown> = {},
  ): FeatureCollection => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties,
        geometry: { type: 'LineString', coordinates },
      },
    ],
  });

  const state = {
    ...dataViewerSettingsInitialState,
    colorizeTrackBy: 'elevation' as const,
  };

  it('drops an elevation-derived mode when a new recording lacks full elevation', () => {
    const next = dataViewerSettingsReducer(
      state,
      dataViewerSetData({
        trackGeojson: line(
          [
            [17, 48, 500],
            [17.1, 48],
          ],
          {
            coordinateProperties: {
              times: ['2026-01-01T00:00:00Z', '2026-01-01T00:01:00Z'],
            },
          },
        ),
      }),
    );

    expect(next.colorizeTrackBy).toBeNull();
  });

  it('keeps it for a line without per-point data, drawn from the terrain', () => {
    const next = dataViewerSettingsReducer(
      state,
      dataViewerSetData({
        trackGeojson: line([
          [17, 48],
          [17.1, 48],
        ]),
      }),
    );

    expect(next.colorizeTrackBy).toBe('elevation');

    expect(
      dataViewerSettingsReducer(
        state,
        dataViewerSetData({ trackGeojson: emptyFc }),
      ).colorizeTrackBy,
    ).toBe('elevation');
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
