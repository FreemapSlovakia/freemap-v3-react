import { clearMapFeatures } from '@app/store/actions.js';
import { osmClear } from '@features/osm/model/osmActions.js';
import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  dataViewerDelete,
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

  it('osmClear resets everything to initial', () => {
    const state = {
      ...dataViewerInitialState,
      trackGeojson: fc,
    };

    expect(dataViewerReducer(state, osmClear())).toEqual(
      dataViewerInitialState,
    );
  });
});
