import {
  clearMapFeatures,
  closeTool,
  openTool,
  selectFeature,
} from '@app/store/actions.js';
import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  dataViewerDelete,
  dataViewerDeleteFeature,
  dataViewerExplodeTrack,
  dataViewerGpxLoad,
  dataViewerJoinTracks,
  dataViewerSetData,
  dataViewerSetJoining,
  dataViewerSetSplitting,
  dataViewerSetTrackUID,
  dataViewerSplitTrack,
} from './actions.js';
import { dataViewerInitialState, dataViewerReducer } from './reducer.js';

/** Pure reducer tests for the track-viewer slice. */

const fc: FeatureCollection = { type: 'FeatureCollection', features: [] };

describe('dataViewerReducer — setData', () => {
  it('stores the geojson', () => {
    const next = dataViewerReducer(
      dataViewerInitialState,
      dataViewerSetData({ trackGeojson: fc }),
    );

    expect(next.trackGeojson).toBe(fc);
  });

  it('keeps the existing geojson when the payload omits it', () => {
    const state = { ...dataViewerInitialState, trackGeojson: fc };

    const next = dataViewerReducer(state, dataViewerSetData({ focus: true }));

    expect(next.trackGeojson).toBe(fc); // not clobbered by an omitted field
  });
});

describe('dataViewerReducer — simple setters', () => {
  it('setTrackUID stores the uid', () => {
    const next = dataViewerReducer(
      dataViewerInitialState,
      dataViewerSetTrackUID('abc'),
    );

    expect(next.trackUID).toBe('abc');
  });

  it('gpxLoad stores the url', () => {
    const next = dataViewerReducer(
      dataViewerInitialState,
      dataViewerGpxLoad('https://x/y.gpx'),
    );

    expect(next.gpxUrl).toBe('https://x/y.gpx');
  });
});

describe('dataViewerReducer — reset actions', () => {
  it('delete clears the track', () => {
    const state = {
      ...dataViewerInitialState,
      trackGeojson: fc,
      trackUID: 'u',
    };

    const next = dataViewerReducer(state, dataViewerDelete());

    expect(next.trackGeojson).toBeNull();
    expect(next.trackUID).toBeNull();
  });

  it('clearMapFeatures resets everything to initial', () => {
    const state = { ...dataViewerInitialState, trackGeojson: fc };

    expect(dataViewerReducer(state, clearMapFeatures())).toEqual(
      dataViewerInitialState,
    );
  });
});

describe('dataViewerReducer — deleteFeature', () => {
  const line = (name: string): Feature => ({
    type: 'Feature',
    properties: { name },
    geometry: { type: 'LineString', coordinates: [] },
  });

  const three: FeatureCollection = {
    type: 'FeatureCollection',
    features: [line('a'), line('b'), line('c')],
  };

  const stateOf = (activeTrackIndex: number | null) => ({
    ...dataViewerInitialState,
    trackGeojson: three,
    activeTrackIndex,
    trackUID: 'u',
    gpxUrl: 'https://x/y.gpx',
  });

  it('removes the feature and forgets where the data came from', () => {
    const next = dataViewerReducer(stateOf(null), dataViewerDeleteFeature(1));

    expect(
      next.trackGeojson?.features.map((f) => f.properties?.['name']),
    ).toEqual(['a', 'c']);

    expect(next.trackUID).toBeNull();
    expect(next.gpxUrl).toBeNull();
  });

  it('renumbers an active track that sat after the removed one', () => {
    expect(
      dataViewerReducer(stateOf(2), dataViewerDeleteFeature(0))
        .activeTrackIndex,
    ).toBe(1);
  });

  it('drops the active track when it is the one removed', () => {
    expect(
      dataViewerReducer(stateOf(1), dataViewerDeleteFeature(1))
        .activeTrackIndex,
    ).toBeNull();
  });

  it('leaves an active track that sat before the removed one', () => {
    expect(
      dataViewerReducer(stateOf(0), dataViewerDeleteFeature(2))
        .activeTrackIndex,
    ).toBe(0);
  });

  it('clears the view with the last feature', () => {
    const state = {
      ...dataViewerInitialState,
      trackGeojson: {
        type: 'FeatureCollection',
        features: [line('a')],
      } as FeatureCollection,
    };

    expect(dataViewerReducer(state, dataViewerDeleteFeature(0))).toEqual(
      dataViewerInitialState,
    );
  });

  it('ignores an index that names no feature', () => {
    const state = stateOf(null);

    expect(dataViewerReducer(state, dataViewerDeleteFeature(9))).toBe(state);
  });
});

const track = (name: string, segments: number[][][]): Feature => ({
  type: 'Feature',
  properties: { name },
  geometry:
    segments.length === 1
      ? { type: 'LineString', coordinates: segments[0]! }
      : { type: 'MultiLineString', coordinates: segments },
});

const straight = (n: number) =>
  Array.from({ length: n }, (_, i): number[] => [i, 0]);

const loaded = (features: Feature[]) => ({
  ...dataViewerInitialState,
  trackGeojson: { type: 'FeatureCollection', features } as FeatureCollection,
  trackUID: 'abc',
  gpxUrl: 'https://x/y.gpx',
  splitting: true,
});

const cutInTwo = (features: Feature[], pointIndex = 2) =>
  dataViewerReducer(
    loaded(features),
    dataViewerSplitTrack({ featureIndex: 0, segmentIndex: 0, pointIndex }),
  );

describe('dataViewerReducer — splitting', () => {
  it('puts the two halves in the place of the track', () => {
    const next = cutInTwo([track('a', [straight(5)])]);

    expect(next.trackGeojson?.features).toHaveLength(2);
    expect(
      next.trackGeojson?.features.map(
        (f) => (f.geometry as { coordinates: unknown[] }).coordinates.length,
      ),
    ).toEqual([3, 3]);

    // The edit makes it this browser own copy, and drops what derived from it.
    expect(next.trackUID).toBeNull();
    expect(next.gpxUrl).toBeNull();
    expect(next.renderTrackGeojson).toBeNull();
    expect(next.splitting).toBe(false);
  });

  it('shifts an active track that came after the one cut', () => {
    const next = dataViewerReducer(
      {
        ...loaded([track('a', [straight(5)]), track('b', [straight(5)])]),
        activeTrackIndex: 1,
      },
      dataViewerSplitTrack({ featureIndex: 0, segmentIndex: 0, pointIndex: 2 }),
    );

    expect(next.activeTrackIndex).toBe(2);
    expect(next.trackGeojson?.features.at(-1)?.properties?.['name']).toBe('b');
  });

  it('leaves the collection alone when the cut is at an end', () => {
    const next = cutInTwo([track('a', [straight(5)])], 0);

    expect(next.trackGeojson?.features).toHaveLength(1);
    expect(next.trackUID).toBe('abc');
  });

  it('explodes a paused recording into a feature per segment', () => {
    const next = dataViewerReducer(
      loaded([track('a', [straight(3), straight(4)])]),
      dataViewerExplodeTrack(0),
    );

    expect(next.trackGeojson?.features).toHaveLength(2);
    expect(next.trackGeojson?.features.map((f) => f.geometry.type)).toEqual([
      'LineString',
      'LineString',
    ]);
  });

  it('disarms a join when the split cursor is armed', () => {
    const state = dataViewerReducer(
      dataViewerInitialState,
      dataViewerSetJoining({ featureIndex: 0, mode: 'line' }),
    );

    expect(
      dataViewerReducer(state, dataViewerSetSplitting(true)).joinWith,
    ).toBe(null);
  });

  it('disarms when the selection moves on', () => {
    const state = dataViewerReducer(
      dataViewerInitialState,
      dataViewerSetSplitting(true),
    );

    expect(state.splitting).toBe(true);
    expect(dataViewerReducer(state, selectFeature(null)).splitting).toBe(false);
  });

  // Reaching for a tool drops the selection without a `selectFeature`, and the
  // armed click would otherwise stay live with its toolbar gone.
  it.each([
    ['a tool opening', openTool('draw-points')],
    ['the panel closing', closeTool('import-file')],
  ])('disarms on %s', (_what, action) => {
    const state = dataViewerReducer(
      dataViewerInitialState,
      dataViewerSetSplitting(true),
    );

    expect(dataViewerReducer(state, action).splitting).toBe(false);
  });
});

describe('dataViewerReducer — joining', () => {
  const armed = (features: Feature[], featureIndex = 0) => ({
    ...loaded(features),
    splitting: false,
    joinWith: { featureIndex, mode: 'line' as const },
  });

  it('puts the join where the armed track was and takes the other away', () => {
    const next = dataViewerReducer(
      armed([track('a', [straight(3)]), track('b', [straight(3)])]),
      dataViewerJoinTracks(1),
    );

    expect(next.trackGeojson?.features).toHaveLength(1);
    expect(next.trackGeojson?.features[0]?.properties?.['name']).toBe('a, b');

    // The edit makes it this browser's own copy, and disarms the mode.
    expect(next.trackUID).toBeNull();
    expect(next.renderTrackGeojson).toBeNull();
    expect(next.joinWith).toBeNull();
  });

  it('reopens the elevation decision, which was one track’s', () => {
    const next = dataViewerReducer(
      {
        ...armed([track('a', [straight(3)]), track('b', [straight(3)])]),
        elevationDecision: 'all',
        elevationSources: ['dmr5'],
      },
      dataViewerJoinTracks(1),
    );

    expect(next.elevationDecision).toBe('undecided');
    expect(next.elevationSources).toEqual([]);
  });

  it('moves an active track that came after the one joined in', () => {
    const next = dataViewerReducer(
      {
        ...armed(
          [
            track('a', [straight(3)]),
            track('b', [straight(3)]),
            track('c', [straight(3)]),
          ],
          0,
        ),
        activeTrackIndex: 2,
      },
      dataViewerJoinTracks(1),
    );

    expect(next.activeTrackIndex).toBe(1);
    expect(next.trackGeojson?.features[1]?.properties?.['name']).toBe('c');
  });

  it('follows the join with an active track that was either half', () => {
    const next = dataViewerReducer(
      {
        ...armed([track('a', [straight(3)]), track('b', [straight(3)])], 1),
        activeTrackIndex: 1,
      },
      dataViewerJoinTracks(0),
    );

    expect(next.activeTrackIndex).toBe(0);
  });

  it('declines a track that is not a line, and its own track', () => {
    const point: Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] },
    };

    const state = armed([track('a', [straight(3)]), point]);

    expect(
      dataViewerReducer(state, dataViewerJoinTracks(1)).trackGeojson?.features,
    ).toHaveLength(2);

    expect(
      dataViewerReducer(state, dataViewerJoinTracks(0)).trackGeojson?.features,
    ).toHaveLength(2);
  });
});
