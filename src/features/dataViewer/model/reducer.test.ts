import { clearMapFeatures } from '@app/store/actions.js';
import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  dataViewerDelete,
  dataViewerDeleteFeature,
  dataViewerGpxLoad,
  dataViewerSetData,
  dataViewerSetTrackUID,
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
