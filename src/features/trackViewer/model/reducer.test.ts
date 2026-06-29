import { clearMapFeatures } from '@app/store/actions.js';
import { osmClear } from '@features/osm/model/osmActions.js';
import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  trackViewerDelete,
  trackViewerGpxLoad,
  trackViewerSetData,
  trackViewerSetTrackUID,
} from './actions.js';
import { trackViewerInitialState, trackViewerReducer } from './reducer.js';

/** Pure reducer tests for the track-viewer slice. */

const fc: FeatureCollection = { type: 'FeatureCollection', features: [] };

describe('trackViewerReducer — setData', () => {
  it('stores the geojson', () => {
    const next = trackViewerReducer(
      trackViewerInitialState,
      trackViewerSetData({ trackGeojson: fc }),
    );

    expect(next.trackGeojson).toBe(fc);
  });

  it('keeps the existing geojson when the payload omits it', () => {
    const state = { ...trackViewerInitialState, trackGeojson: fc };

    const next = trackViewerReducer(state, trackViewerSetData({ focus: true }));

    expect(next.trackGeojson).toBe(fc); // not clobbered by an omitted field
  });
});

describe('trackViewerReducer — simple setters', () => {
  it('setTrackUID stores the uid', () => {
    const next = trackViewerReducer(
      trackViewerInitialState,
      trackViewerSetTrackUID('abc'),
    );

    expect(next.trackUID).toBe('abc');
  });

  it('gpxLoad stores the url', () => {
    const next = trackViewerReducer(
      trackViewerInitialState,
      trackViewerGpxLoad('https://x/y.gpx'),
    );

    expect(next.gpxUrl).toBe('https://x/y.gpx');
  });
});

describe('trackViewerReducer — reset actions', () => {
  it('delete clears the track', () => {
    const state = {
      ...trackViewerInitialState,
      trackGeojson: fc,
      trackUID: 'u',
    };

    const next = trackViewerReducer(state, trackViewerDelete());

    expect(next.trackGeojson).toBeNull();
    expect(next.trackUID).toBeNull();
  });

  it('clearMapFeatures resets everything to initial', () => {
    const state = { ...trackViewerInitialState, trackGeojson: fc };

    expect(trackViewerReducer(state, clearMapFeatures())).toEqual(
      trackViewerInitialState,
    );
  });

  it('osmClear resets everything to initial', () => {
    const state = {
      ...trackViewerInitialState,
      trackGeojson: fc,
    };

    expect(trackViewerReducer(state, osmClear())).toEqual(
      trackViewerInitialState,
    );
  });
});
