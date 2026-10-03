import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { processGeoipResult } from '@features/geoip/model/actions.js';
import { mapLibraryCatalogMapsLoaded } from '@features/mapLibrary/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  mapCombinationDelete,
  mapCombinationSave,
  mapCustomLayerDelete,
  mapCustomLayerSave,
  mapLayerSettingsChange,
  mapLayersSettingsReset,
  mapRefocus,
  mapReplaceLayer,
  mapSetCountries,
  mapSetEsriAttribution,
  mapSetLayerKind,
  mapSetLocalPrefs,
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

  it('a known catalog base map replaces the base too', () => {
    const state = mapReducer(
      { ...mapInitialState, layers: ['X', 'i'] },
      mapLibraryCatalogMapsLoaded([
        {
          type: 'Z0001',
          layer: 'base',
          name: 'Test',
          body: { url: 'https://example.com/{z}/{x}/{y}.png', attribution: [] },
        },
      ]),
    );

    const next = mapReducer(state, mapToggleLayer({ type: 'Z0001' }));

    expect(next.layers).toEqual(['Z0001', 'i']);
  });

  it('changes only the settings named', () => {
    const next = mapReducer(
      { ...mapInitialState, layersSettings: { Z0001: { showInMenu: false } } },
      mapLayerSettingsChange({ type: 'Z0001', settings: { installed: true } }),
    );

    expect(next.layersSettings['Z0001']).toEqual({
      showInMenu: false,
      installed: true,
    });
  });

  it('saves a custom map with its settings, and deletes both', () => {
    const def = {
      type: '.1',
      layer: 'base' as const,
      technology: 'tile' as const,
      url: 'https://example.com/{z}/{x}/{y}.png',
    };

    const saved = mapReducer(
      { ...mapInitialState, layersSettings: { '.1': { opacity: 0.5 } } },
      mapCustomLayerSave({ def, settings: { showInMenu: false } }),
    );

    expect(saved.customLayers).toEqual([def]);

    expect(saved.layersSettings['.1']).toEqual({
      opacity: 0.5,
      showInMenu: false,
    });

    const deleted = mapReducer(saved, mapCustomLayerDelete({ type: '.1' }));

    expect(deleted.customLayers).toEqual([]);

    expect(deleted.layersSettings['.1']).toBeUndefined();
  });

  it('replaces a combination in place, and deletes it with its settings', () => {
    const a = { id: 'a', name: 'A', overlays: [] };

    const b = { id: 'b', name: 'B', overlays: [] };

    const state = {
      ...mapInitialState,
      mapCombinations: [a, b],
      layersSettings: { a: { showInToolbar: true } },
    };

    const renamed = mapReducer(
      state,
      mapCombinationSave({ combination: { ...a, name: 'A2' } }),
    );

    expect(renamed.mapCombinations.map((c) => c.name)).toEqual(['A2', 'B']);

    const deleted = mapReducer(state, mapCombinationDelete({ id: 'a' }));

    expect(deleted.mapCombinations).toEqual([b]);

    expect(deleted.layersSettings['a']).toBeUndefined();
  });

  it('resets every map but what is installed', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layersSettings: {
          X: { showInMenu: false, opacity: 0.5 },
          O: { installed: false, showInToolbar: true },
        },
      },
      mapLayersSettingsReset(),
    );

    expect(next.layersSettings).toEqual({ O: { installed: false } });
  });

  it('keeps installed a map that was installed only by its settings', () => {
    // VT starts uninstalled; its toolbar setting is what installed it.
    const next = mapReducer(
      { ...mapInitialState, layersSettings: { VT: { showInToolbar: true } } },
      mapLayersSettingsReset(),
    );

    expect(next.layersSettings).toEqual({ VT: { installed: true } });
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

describe('mapReducer — mapToggleLayer (combinations)', () => {
  const withBase = {
    id: 'c1',
    name: 'C',
    base: 'X',
    overlays: [{ type: 'w' }, { type: 'I' }],
  };

  const overlayOnly = {
    id: 'c2',
    name: 'D',
    overlays: [{ type: 'I' }, { type: 'xh' }],
  };

  const combined = {
    ...mapInitialState,
    layers: ['X', 'w', 'I', '_c1'],
    mapCombinations: [withBase, overlayOnly],
  };

  it("another base map takes the combination's overlays off, keeping added ones", () => {
    const withAdded = mapReducer(combined, mapToggleLayer({ type: 'i' }));

    expect(withAdded.layers).toEqual(['X', 'w', 'I', '_c1', 'i']);

    expect(mapReducer(withAdded, mapToggleLayer({ type: 'O' })).layers).toEqual(
      ['O', 'i'],
    );
  });

  it('its own base map leaves it too', () => {
    const next = mapReducer(combined, mapToggleLayer({ type: 'X' }));

    expect(next.layers).toEqual(['X']);
  });

  it('stays active while its own overlays are switched off', () => {
    const next = mapReducer(combined, mapToggleLayer({ type: 'w' }));

    expect(next.layers).toEqual(['X', 'I', '_c1']);
  });

  it('keeps an overlay-only combination through a base map change', () => {
    const next = mapReducer(
      { ...combined, layers: ['S', 'I', 'xh', '_c2'] },
      mapToggleLayer({ type: 'O' }),
    );

    expect(next.layers).toEqual(['O', 'I', 'xh', '_c2']);
  });

  it('keeps an overlay the leaving one shares with an overlay-only one', () => {
    const next = mapReducer(
      { ...combined, layers: ['X', 'w', 'I', '_c1', 'xh', '_c2'] },
      mapToggleLayer({ type: 'O' }),
    );

    expect(next.layers).toEqual(['O', 'I', 'xh', '_c2']);
  });

  it('picking the base map already on leaves the layers untouched', () => {
    const state = { ...mapInitialState, layers: ['X', 'w'] };

    expect(mapReducer(state, mapToggleLayer({ type: 'X' })).layers).toBe(
      state.layers,
    );
  });

  it('"make sure its base is on" keeps it', () => {
    const next = mapReducer(
      combined,
      mapToggleLayer({ type: 'X', enable: true }),
    );

    expect(next.layers).toBe(combined.layers);
  });

  it('a move of the map keeps it', () => {
    const next = mapReducer(combined, mapRefocus({ lat: 49, lon: 20 }));

    expect(next.layers).toEqual(combined.layers);
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

describe('mapReducer — combinations across sign-in', () => {
  const mine = { id: 'm', name: 'M', base: 'X', overlays: [] };

  const theirs = { id: 't', name: 'T', base: 'O', overlays: [] };

  const local = { ...mapInitialState, mapCombinations: [mine] };

  // The map slice only reads `payload.settings`; a minimal cast user is enough.
  const signIn = (settings: object) => authSetUser({ settings } as never);

  it("takes the account's list once it has one, even empty", () => {
    expect(
      mapReducer(local, signIn({ mapCombinations: [theirs] })).mapCombinations,
    ).toEqual([theirs]);

    expect(
      mapReducer(local, signIn({ mapCombinations: [] })).mapCombinations,
    ).toEqual([]);
  });

  it('keeps the signed-out ones for an account that never had any', () => {
    expect(mapReducer(local, signIn({})).mapCombinations).toEqual([mine]);
  });

  it("resets the account's settings on sign-out and on a session found to be over", () => {
    const signedIn = {
      ...local,
      customLayers: [
        { type: 'c', layer: 'base', technology: 'tile', url: 'u' },
      ],
      layersSettings: { X: { showInToolbar: false } },
      maxZoom: 16,
    } as typeof local;

    for (const next of [
      mapReducer(signedIn, authLogout()),
      mapReducer(signedIn, authSetUser(null)),
    ]) {
      expect(next.mapCombinations).toEqual([]);
      expect(next.customLayers).toEqual([]);
      expect(next.layersSettings).toEqual({});
      expect(next.maxZoom).toBe(mapInitialState.maxZoom);
    }
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

  it('accepts zoom 0 along with lat/lon 0', () => {
    const state = { ...mapInitialState, zoom: 8 };

    const next = mapReducer(state, mapRefocus({ lat: 0, lon: 0, zoom: 0 }));

    // The whole world at once: layers that go down to zoom 0 make it a view
    // the `-` button and a fit to a world-spanning extent can both land on.
    expect(next.zoom).toBe(0);
    expect(next.lat).toBe(0);
    expect(next.lon).toBe(0);
  });

  it('pulls an off-grid zoom onto the zoomSnap grid', () => {
    // What a link shared from a browser set to a finer step carries.
    const snapped = (zoomSnap: number, zoom: number) =>
      mapReducer({ ...mapInitialState, zoomSnap }, mapRefocus({ zoom })).zoom;

    expect(snapped(1, 13.75)).toBe(14);
    expect(snapped(0.5, 13.75)).toBe(14);
    expect(snapped(0.5, 13.7)).toBe(13.5);
    expect(snapped(0.25, 13.7)).toBe(13.75);

    // No grid: taken as it comes.
    expect(snapped(0, 13.7)).toBe(13.7);
  });

  it('keeps the zoom when asked for one that is not a number', () => {
    const state = { ...mapInitialState, zoom: 8 };

    // What a missing or malformed `data-refocus-zoom` reads back as.
    const next = mapReducer(state, mapRefocus({ zoom: Number(undefined) }));

    expect(next.zoom).toBe(8);
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

  it('mapSetLocalPrefs pulls the standing zoom onto a coarser grid', () => {
    const state = { ...mapInitialState, zoomSnap: 0.25, zoom: 13.75 };

    expect(mapReducer(state, mapSetLocalPrefs({ zoomSnap: 1 })).zoom).toBe(14);

    expect(mapReducer(state, mapSetLocalPrefs({ zoomSnap: 0.5 })).zoom).toBe(
      14,
    );

    // A finer grid, or none, leaves the view exactly where it is.
    expect(mapReducer(state, mapSetLocalPrefs({ zoomSnap: 0 })).zoom).toBe(
      13.75,
    );
  });
});

describe('mapReducer — switched kind', () => {
  it('a map switched to base takes the place of the base on', () => {
    const next = mapReducer(
      { ...mapInitialState, layers: ['X', 'h'] },
      mapSetLayerKind({ type: 'h', kind: 'base' }),
    );

    expect(next.layers).toEqual(['h']);

    expect(next.layersSettings['h']?.layer).toBe('base');
  });

  it('switching a map back to its own kind drops the setting', () => {
    const next = mapReducer(
      { ...mapInitialState, layersSettings: { h: { layer: 'base' } } },
      mapSetLayerKind({ type: 'h', kind: 'overlay' }),
    );

    expect(next.layersSettings['h']?.layer).toBeUndefined();
  });

  it('a reset leaving no base puts the default one under', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layers: ['h'],
        layersSettings: { h: { layer: 'base' } },
      },
      mapLayersSettingsReset(),
    );

    expect(next.layers).toEqual(['X', 'h']);
  });
});
