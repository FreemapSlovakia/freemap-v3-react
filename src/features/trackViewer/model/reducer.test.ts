import { clearMapFeatures } from '@app/store/actions.js';
import { osmClear } from '@features/osm/model/osmActions.js';
import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  trackViewerColorizeTrackBy,
  trackViewerDelete,
  trackViewerGpxLoad,
  trackViewerSetData,
  trackViewerSetTrackUID,
} from './actions.js';
import { trackViewerInitialState, trackViewerReducer } from './reducer.js';

/** Pure reducer tests for the track-viewer slice. */

const fc: FeatureCollection = { type: 'FeatureCollection', features: [] };

describe('trackViewerReducer — setData', () => {
  it('sets gpx and geojson', () => {
    const next = trackViewerReducer(
      trackViewerInitialState,
      trackViewerSetData({ trackGpx: '<gpx/>', trackGeojson: fc }),
    );

    expect(next.trackGpx).toBe('<gpx/>');
    expect(next.trackGeojson).toBe(fc);
  });

  it('keeps the existing value for fields omitted from the payload', () => {
    const state = { ...trackViewerInitialState, trackGpx: 'old' };

    const next = trackViewerReducer(
      state,
      trackViewerSetData({ trackGeojson: fc }),
    );

    expect(next.trackGpx).toBe('old'); // not clobbered by undefined
    expect(next.trackGeojson).toBe(fc);
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

  it('colorizeTrackBy stores the mode', () => {
    const next = trackViewerReducer(
      trackViewerInitialState,
      trackViewerColorizeTrackBy('elevation'),
    );

    expect(next.colorizeTrackBy).toBe('elevation');
  });
});

describe('trackViewerReducer — reset actions', () => {
  it('delete clears the track but preserves the colorize mode', () => {
    const state = {
      ...trackViewerInitialState,
      trackGpx: 'g',
      trackUID: 'u',
      colorizeTrackBy: 'elevation' as const,
    };

    const next = trackViewerReducer(state, trackViewerDelete());

    expect(next.trackGpx).toBeNull();
    expect(next.trackUID).toBeNull();
    expect(next.colorizeTrackBy).toBe('elevation');
  });

  it('clearMapFeatures resets everything to initial', () => {
    const state = { ...trackViewerInitialState, trackGpx: 'g' };

    expect(trackViewerReducer(state, clearMapFeatures())).toEqual(
      trackViewerInitialState,
    );
  });

  it('osmClear resets everything to initial (including colorize mode)', () => {
    const state = {
      ...trackViewerInitialState,
      trackGpx: 'g',
      colorizeTrackBy: 'elevation' as const,
    };

    expect(trackViewerReducer(state, osmClear())).toEqual(
      trackViewerInitialState,
    );
  });
});
