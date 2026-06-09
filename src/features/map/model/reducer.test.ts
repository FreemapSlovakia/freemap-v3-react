import { processGeoipResult } from '@features/geoip/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  mapRefocus,
  mapReplaceLayer,
  mapSetCountries,
  mapSetEsriAttribution,
  mapSuppressLegacyMapWarning,
  mapToggleLayer,
} from './actions.js';
import { mapInitialState, mapReducer } from './reducer.js';

/**
 * Pure reducer tests for the map slice. They drive the reducer directly with
 * dispatched actions and assert the resulting state — no store, middleware, or
 * processors involved. `'X'` / `'O'` / `'S'` are integrated BASE layers and
 * `'i'` / `'w'` are OVERLAYS (see `src/shared/mapDefinitions.tsx`).
 */

describe('mapReducer — mapToggleLayer (base layers)', () => {
  it('switching base layer replaces the current base, keeping overlays', () => {
    const state = {
      ...mapInitialState,
      layers: ['X', 'i'], // base X + overlay i
    };

    const next = mapReducer(state, mapToggleLayer({ type: 'O' }));

    // New base goes first; overlay survives; old base dropped.
    expect(next.layers).toEqual(['O', 'i']);
  });

  it('toggling the already-active base layer is a no-op', () => {
    const state = { ...mapInitialState, layers: ['X', 'i'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'X' }));

    expect(next.layers).toEqual(['X', 'i']);
  });

  it('enable:false on a base layer does not remove it', () => {
    const state = { ...mapInitialState, layers: ['X'] };

    // Base layers can't be disabled — there must always be exactly one.
    const next = mapReducer(
      state,
      mapToggleLayer({ type: 'O', enable: false }),
    );

    expect(next.layers).toEqual(['X']);
  });
});

describe('mapReducer — mapToggleLayer (overlays)', () => {
  it('toggles an overlay on when absent', () => {
    const state = { ...mapInitialState, layers: ['X'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'i' }));

    expect(next.layers).toEqual(['X', 'i']);
  });

  it('toggles an overlay off when present', () => {
    const state = { ...mapInitialState, layers: ['X', 'i'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'i' }));

    expect(next.layers).toEqual(['X']);
  });

  it('enable:true keeps an already-present overlay on', () => {
    const state = { ...mapInitialState, layers: ['X', 'i'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'i', enable: true }));

    expect(next.layers).toEqual(['X', 'i']);
  });

  it('enable:false on an absent overlay leaves layers unchanged', () => {
    const state = { ...mapInitialState, layers: ['X'] };

    const next = mapReducer(
      state,
      mapToggleLayer({ type: 'i', enable: false }),
    );

    expect(next.layers).toEqual(['X']);
  });
});

describe('mapReducer — mapReplaceLayer', () => {
  it('replaces a present layer in place', () => {
    const state = { ...mapInitialState, layers: ['X', 'i'] };

    const next = mapReducer(state, mapReplaceLayer({ from: 'X', to: 'O' }));

    expect(next.layers).toEqual(['O', 'i']);
  });

  it('is a no-op when the `from` layer is absent', () => {
    const state = { ...mapInitialState, layers: ['X'] };

    const next = mapReducer(state, mapReplaceLayer({ from: 'Z', to: 'O' }));

    expect(next.layers).toEqual(['X']);
  });
});

describe('mapReducer — mapRefocus', () => {
  it('updates only the provided view fields', () => {
    const next = mapReducer(
      mapInitialState,
      mapRefocus({ lat: 10, lon: 20, zoom: 12 }),
    );

    expect(next.lat).toBe(10);
    expect(next.lon).toBe(20);
    expect(next.zoom).toBe(12);
    expect(next.layers).toEqual(mapInitialState.layers);
  });

  it('ignores zoom 0 (falsy guard) but accepts lat/lon 0', () => {
    const state = { ...mapInitialState, zoom: 8 };

    const next = mapReducer(state, mapRefocus({ lat: 0, lon: 0, zoom: 0 }));

    expect(next.zoom).toBe(8); // zoom 0 skipped by `if (zoom)`
    expect(next.lat).toBe(0); // lat/lon use `!== undefined`
    expect(next.lon).toBe(0);
  });

  it('coerces gpsTracked to false when lat+lon are given without the flag', () => {
    const state = { ...mapInitialState, gpsTracked: true };

    // Any coordinate refocus that doesn't explicitly pass gpsTracked turns GPS
    // follow mode OFF — this is how panning/zooming or jumping to a feature
    // stops the map from chasing the user's location. Only the locate processor
    // re-asserts gpsTracked:true on each fix.
    const next = mapReducer(state, mapRefocus({ lat: 1, lon: 2 }));

    expect(next.gpsTracked).toBe(false);
  });

  it('honors an explicit gpsTracked flag', () => {
    const state = { ...mapInitialState, gpsTracked: true };

    const next = mapReducer(state, mapRefocus({ gpsTracked: false }));

    expect(next.gpsTracked).toBe(false);
  });
});

describe('mapReducer — processGeoipResult', () => {
  it('relocates only while still at the default position', () => {
    // mapInitialState lat/lon are the hard-coded defaults the guard checks.
    const next = mapReducer(
      mapInitialState,
      processGeoipResult({ latitude: 50, longitude: 14 }),
    );

    expect(next.lat).toBe(50);
    expect(next.lon).toBe(14);
    expect(next.zoom).toBe(9);
  });

  it('does NOT relocate once the user has moved the map', () => {
    const state = { ...mapInitialState, lat: 10, lon: 20 };

    const next = mapReducer(
      state,
      processGeoipResult({ latitude: 50, longitude: 14 }),
    );

    expect(next.lat).toBe(10);
    expect(next.lon).toBe(20);
  });
});

describe('mapReducer — misc setters', () => {
  it('mapSuppressLegacyMapWarning(forever) pushes to the persistent list', () => {
    const next = mapReducer(
      mapInitialState,
      mapSuppressLegacyMapWarning({ type: 'A', forever: true }),
    );

    expect(next.legacyMapWarningSuppressions).toEqual(['A']);
    expect(next.tempLegacyMapWarningSuppressions).toEqual([]);
  });

  it('mapSuppressLegacyMapWarning(temporary) pushes to the temp list', () => {
    const next = mapReducer(
      mapInitialState,
      mapSuppressLegacyMapWarning({ type: 'A', forever: false }),
    );

    expect(next.tempLegacyMapWarningSuppressions).toEqual(['A']);
    expect(next.legacyMapWarningSuppressions).toEqual([]);
  });

  it('mapSetEsriAttribution / mapSetCountries replace their arrays', () => {
    const a = mapReducer(mapInitialState, mapSetEsriAttribution(['x', 'y']));
    expect(a.esriAttribution).toEqual(['x', 'y']);

    const c = mapReducer(mapInitialState, mapSetCountries(['sk', 'cz']));
    expect(c.countries).toEqual(['sk', 'cz']);
  });
});
