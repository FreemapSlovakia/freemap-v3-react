import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { processGeoipResult } from '@features/geoip/model/actions.js';
import { mapLibraryCatalogMapsLoaded } from '@features/mapLibrary/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  mapCustomLayerDelete,
  mapCustomLayerSave,
  mapLayerSettingsChange,
  mapLayerSetupChange,
  mapLayerSetupReset,
  mapLayersSettingsReset,
  mapNamedMapCreate,
  mapOverlayMove,
  mapPresetChange,
  mapPresetDelete,
  mapPresetLayerAdd,
  mapPresetLayerRemove,
  mapPresetSave,
  mapPresetToggle,
  mapRefocus,
  mapReplaceLayer,
  mapSetCountries,
  mapSetEsriAttribution,
  mapSetLocalPrefs,
  mapSuppressLegacyMapWarning,
  mapToggleLayer,
} from './actions.js';
import { DEFAULT_SHADING } from './layerSetup.js';
import { mapInitialState, mapReducer } from './reducer.js';

/**
 * Pure reducer tests for the map slice. They drive the reducer directly with
 * dispatched actions and assert the resulting state — no store, middleware, or
 * processors involved. `'X'` / `'O'` / `'S'` are integrated BASE layers and
 * `'w'` is an OVERLAY (see `src/shared/mapLibrary/mapIndex.tsx`); `'i'`, the
 * data layer, stands for an overlay only where nothing toggles it.
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

  it('saves a custom map with its settings, and deletes both with its setup', () => {
    const def = {
      type: '.1',
      layer: 'base' as const,
      technology: 'tile' as const,
      url: 'https://example.com/{z}/{x}/{y}.png',
    };

    const saved = mapReducer(
      {
        ...mapInitialState,
        layersSettings: { '.1': { showInToolbar: true } },
        layerSetups: { '.1': { opacity: 0.5 } },
      },
      mapCustomLayerSave({ def, settings: { showInMenu: false } }),
    );

    expect(saved.customLayers).toEqual([def]);

    expect(saved.layersSettings['.1']).toEqual({
      showInToolbar: true,
      showInMenu: false,
    });

    const deleted = mapReducer(saved, mapCustomLayerDelete({ type: '.1' }));

    expect(deleted.customLayers).toEqual([]);

    expect(deleted.layersSettings['.1']).toBeUndefined();

    expect(deleted.layerSetups['.1']).toBeUndefined();
  });

  it('deleting a custom map takes it off the map and out of presets', () => {
    const def = {
      type: '.1',
      layer: 'base' as const,
      technology: 'tile' as const,
      url: 'https://example.com/{z}/{x}/{y}.png',
    };

    const deleted = mapReducer(
      {
        ...mapInitialState,
        layers: ['.1', 'i'],
        customLayers: [def],
        presets: [
          {
            id: 'p',
            name: 'P',
            layers: [
              { type: '.1', setup: {} },
              { type: 'w', setup: {} },
            ],
          },
        ],
      },
      mapCustomLayerDelete({ type: '.1' }),
    );

    // The only base went, and none takes its place.
    expect(deleted.layers).toEqual(['i']);

    expect(deleted.presets[0]?.layers).toEqual([{ type: 'w', setup: {} }]);
  });

  it('resets every map but what is installed, setups included', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layersSettings: {
          X: { showInMenu: false },
          O: { installed: false, showInToolbar: true },
        },
        layerSetups: { w: { opacity: 0.5 } },
      },
      mapLayersSettingsReset(),
    );

    expect(next.layersSettings).toEqual({ O: { installed: false } });

    expect(next.layerSetups).toEqual({});
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

describe('mapReducer — presets', () => {
  const withBase = {
    id: 'p1',
    name: 'P',
    layers: [
      { type: 'O', setup: {} },
      { type: 'h', setup: { opacity: 0.4 } },
    ],
  };

  const overlayOnly = {
    id: 'p2',
    name: 'Q',
    layers: [{ type: 'xh', setup: { opacity: 0.3 } }],
  };

  const state = {
    ...mapInitialState,
    layers: ['X', 'i', 'xb'],
    presets: [withBase, overlayOnly],
  };

  it('one with a base map takes the base map’s place, setups untouched', () => {
    const next = mapReducer(state, mapPresetToggle({ id: 'p1' }));

    expect(next.layers).toEqual(['@p1', 'i', 'xb']);

    expect(next.layerSetups).toEqual({});

    // Picking a base map takes it off again, with all its layers.
    expect(mapReducer(next, mapToggleLayer({ type: 'S' })).layers).toEqual([
      'S',
      'i',
      'xb',
    ]);
  });

  it('one without goes on top, and off again', () => {
    const on = mapReducer(state, mapPresetToggle({ id: 'p2' }));

    expect(on.layers).toEqual(['X', 'i', 'xb', '@p2']);

    expect(mapReducer(on, mapPresetToggle({ id: 'p2' })).layers).toEqual(
      state.layers,
    );
  });

  it('keeps its own copy of a map, apart from the map on its own', () => {
    const next = mapReducer(
      {
        ...state,
        layers: ['X', 'xh', '@p2'],
        layerSetups: { xh: { opacity: 1 } },
      },
      mapLayerSetupChange({
        type: 'xh',
        preset: 'p2',
        setup: { opacity: 0.7 },
      }),
    );

    expect(next.presets[1].layers).toEqual([
      { type: 'xh', setup: { opacity: 0.7 } },
    ]);

    expect(next.layerSetups).toEqual({ xh: { opacity: 1 } });
  });

  it('takes maps in and out; a base map makes it a base', () => {
    const on = { ...state, layers: ['X', '@p2'] };

    const added = mapReducer(on, mapPresetLayerAdd({ id: 'p2', type: 'xb' }));

    expect(added.presets[1].layers.map((l) => l.type)).toEqual(['xh', 'xb']);

    const based = mapReducer(added, mapPresetLayerAdd({ id: 'p2', type: 'S' }));

    expect(based.presets[1].layers.map((l) => l.type)).toEqual([
      'S',
      'xh',
      'xb',
    ]);

    expect(based.layers).toEqual(['@p2']);

    const moved = mapReducer(
      based,
      mapOverlayMove({ type: 'xb', to: 'xh', preset: 'p2' }),
    );

    expect(moved.presets[1].layers.map((l) => l.type)).toEqual([
      'S',
      'xb',
      'xh',
    ]);

    const removed = mapReducer(
      moved,
      mapPresetLayerRemove({ id: 'p2', type: 'S' }),
    );

    // An overlay preset again; no base map is put under it.
    expect(removed.layers).toEqual(['@p2']);
  });

  it('a base layer switched to an overlay leaves no base map', () => {
    const based = {
      ...state,
      layers: ['@p3'],
      presets: [
        {
          id: 'p3',
          name: 'R',
          layers: [
            { type: 'l2', setup: { kind: 'base' as const } },
            { type: 'xh', setup: {} },
          ],
        },
      ],
    };

    const next = mapReducer(
      based,
      mapLayerSetupChange({
        type: 'l2',
        preset: 'p3',
        setup: { kind: 'overlay' },
      }),
    );

    expect(next.layers).toEqual(['@p3']);

    // Nor does a later reset, the switch being on purpose.
    expect(mapReducer(next, mapLayersSettingsReset()).layers).toEqual(['@p3']);
  });

  it('a new one of the map replaces what it was made of', () => {
    const next = mapReducer(
      state,
      mapPresetSave({
        preset: { id: 'n', name: 'N', layers: [{ type: 'X', setup: {} }] },
        onMap: true,
      }),
    );

    expect(next.layers).toEqual(['@n', 'i']);
  });

  it('a new one of the map leaves an offline map, which it can’t hold, on', () => {
    const next = mapReducer(
      {
        ...state,
        layers: ['off1', 'xh'],
        cachedMaps: [
          { type: 'off1', layer: 'base' },
        ] as unknown as typeof state.cachedMaps,
      },
      mapPresetSave({
        preset: { id: 'n', name: 'N', layers: [{ type: 'xh', setup: {} }] },
        onMap: true,
      }),
    );

    expect(next.layers).toEqual(['off1', '@n']);
  });

  it('a link’s, saved as one’s own, takes its place', () => {
    const next = mapReducer(
      {
        ...state,
        layers: ['X', '@~1'],
        linkPresets: [{ ...overlayOnly, id: '~1' }],
      },
      mapPresetSave({ preset: { ...overlayOnly, id: 'n' }, replacing: '~1' }),
    );

    expect(next.layers).toEqual(['X', '@n']);

    expect(next.linkPresets).toEqual([]);
  });

  it('changes its own opacity', () => {
    const next = mapReducer(
      state,
      mapPresetChange({ id: 'p2', change: { opacity: 0.5 } }),
    );

    expect(next.presets[1].opacity).toBe(0.5);
  });

  it('replaces one in place, and deletes it from the map with its settings', () => {
    const renamed = mapReducer(
      state,
      mapPresetSave({ preset: { ...withBase, name: 'P2' } }),
    );

    expect(renamed.presets.map((p) => p.name)).toEqual(['P2', 'Q']);

    const deleted = mapReducer(
      {
        ...renamed,
        layers: ['@p1', 'xb'],
        layersSettings: { p1: { showInToolbar: true } },
      },
      mapPresetDelete({ id: 'p1' }),
    );

    expect(deleted.presets).toEqual([overlayOnly]);

    expect(deleted.layersSettings['p1']).toBeUndefined();

    expect(deleted.layers).toEqual(['xb']);
  });
});

describe('mapReducer — layer setups', () => {
  it('a preset copy’s layers are the map’s own, its opacity the copy’s', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layerSetups: { WKA: { opacity: 0.9 } },
        presets: [{ id: 'p', name: 'P', layers: [{ type: 'WKA', setup: {} }] }],
      },
      mapLayerSetupChange({
        type: 'WKA',
        preset: 'p',
        setup: { wmsLayers: ['1'], opacity: 0.4 },
      }),
    );

    expect(next.layerSetups['WKA']).toEqual({ opacity: 0.9, wmsLayers: ['1'] });

    expect(next.presets[0]?.layers[0]?.setup).toEqual({ opacity: 0.4 });
  });

  it('merges a change, and drops a setup left empty', () => {
    const changed = mapReducer(
      { ...mapInitialState, layerSetups: { w: { opacity: 0.5 } } },
      mapLayerSetupChange({ type: 'w', setup: { wmsLayers: ['a'] } }),
    );

    expect(changed.layerSetups['w']).toEqual({
      opacity: 0.5,
      wmsLayers: ['a'],
    });

    const emptied = mapReducer(
      changed,
      mapLayerSetupChange({
        type: 'w',
        setup: { opacity: undefined, wmsLayers: undefined },
      }),
    );

    expect(emptied.layerSetups['w']).toBeUndefined();
  });

  it('keeps a shading draft through an opacity change', () => {
    const shading = { backgroundColor: [0, 0, 0, 1], components: [] } as never;

    const next = mapReducer(
      {
        ...mapInitialState,
        layerSetups: { h: { opacity: 0.5 } },
        shadingDrafts: { h: shading },
      },
      mapLayerSetupChange({ type: 'h', setup: { opacity: 0.7 } }),
    );

    expect(next.shadingDrafts['h']).toBe(shading);
  });

  it('a reset drops the setup', () => {
    const next = mapReducer(
      { ...mapInitialState, layerSetups: { w: { opacity: 0.5 } } },
      mapLayerSetupReset({ type: 'w' }),
    );

    expect(next.layerSetups).toEqual({});
  });

  it('moves an overlay to the place of another', () => {
    const next = mapReducer(
      { ...mapInitialState, layers: ['X', 'h', 'w', 'I'] },
      mapOverlayMove({ type: 'I', to: 'h' }),
    );

    expect(next.layers).toEqual(['X', 'I', 'h', 'w']);
  });

  it('a link loads the setups it carries', () => {
    const next = mapReducer(
      { ...mapInitialState, layerSetups: { w: { opacity: 0.2 } } },
      mapRefocus({ layers: ['X', 'w'], setups: { w: {} } }),
    );

    expect(next.layerSetups).toEqual({});
  });
});

describe('mapReducer — mapToggleLayer (overlays)', () => {
  it('toggles an overlay on when absent', () => {
    const state = { ...mapInitialState, layers: ['X'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'w' }));

    expect(next.layers).toEqual(['X', 'w']);
  });

  it('toggles an overlay off when present', () => {
    const state = { ...mapInitialState, layers: ['X', 'w'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'w' }));

    expect(next.layers).toEqual(['X']);
  });

  it('enable:true keeps an already-present overlay on', () => {
    const state = { ...mapInitialState, layers: ['X', 'w'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'w', enable: true }));

    expect(next.layers).toEqual(['X', 'w']);
  });

  it('enable:false on an absent overlay leaves layers unchanged', () => {
    const state = { ...mapInitialState, layers: ['X'] };

    const next = mapReducer(
      state,
      mapToggleLayer({ type: 'w', enable: false }),
    );

    expect(next.layers).toEqual(['X']);
  });
});

describe('mapReducer — the data layer', () => {
  it('hides the features rather than joining the layers', () => {
    const state = { ...mapInitialState, layers: ['X'] };

    const next = mapReducer(state, mapToggleLayer({ type: 'i' }));

    expect(next.featuresHidden).toBe(true);
    expect(next.layers).toEqual(['X']);
  });

  it('shows them again on a second toggle', () => {
    const state = { ...mapInitialState, featuresHidden: true };

    const next = mapReducer(state, mapToggleLayer({ type: 'i' }));

    expect(next.featuresHidden).toBe(false);
  });

  it('drops a data layer a link still names', () => {
    const next = mapReducer(
      mapInitialState,
      mapRefocus({ layers: ['O', 'i'] }),
    );

    expect(next.layers).toEqual(['O']);
    expect(next.featuresHidden).toBe(false);
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

  it('drops the old one where the new one is on already', () => {
    const state = { ...mapInitialState, layers: ['X', 'i', 'w'] };

    const next = mapReducer(state, mapReplaceLayer({ from: 'i', to: 'w' }));

    expect(next.layers).toEqual(['X', 'w']);
  });

  it('a base map used as an overlay is replaced by one used so too', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layers: ['X', 'O'],
        layerSetups: { O: { kind: 'overlay', opacity: 0.4 } },
      },
      mapReplaceLayer({ from: 'O', to: 'S' }),
    );

    expect(next.layers).toEqual(['X', 'S']);

    expect(next.layerSetups['S']).toEqual({ kind: 'overlay', opacity: 0.4 });
  });

  it('replaces a preset’s layer, keeping only its opacity', () => {
    const state = {
      ...mapInitialState,
      presets: [
        {
          id: 'p',
          name: 'P',
          layers: [{ type: 'i', setup: { opacity: 0.5, wmsLayers: ['a'] } }],
        },
      ],
    };

    const next = mapReducer(state, mapReplaceLayer({ from: 'i', to: 'w' }));

    expect(next.presets[0]?.layers).toEqual([
      { type: 'w', setup: { opacity: 0.5 } },
    ]);
  });
});

describe('mapReducer — presets across sign-in', () => {
  const mine = { id: 'm', name: 'M', layers: [] };

  const theirs = { id: 't', name: 'T', layers: [] };

  const local = { ...mapInitialState, presets: [mine] };

  // The map slice only reads `payload.settings`; a minimal cast user is enough.
  const signIn = (settings: object) => authSetUser({ settings } as never);

  it("takes the account's list once it has one, even empty", () => {
    expect(mapReducer(local, signIn({ presets: [theirs] })).presets).toEqual([
      theirs,
    ]);

    expect(mapReducer(local, signIn({ presets: [] })).presets).toEqual([]);
  });

  it('keeps the signed-out ones for an account that never had any', () => {
    expect(mapReducer(local, signIn({})).presets).toEqual([mine]);
  });

  it("resets the account's settings on sign-out and on a session found to be over", () => {
    const signedIn = {
      ...local,
      customLayers: [
        { type: '.1', layer: 'base', technology: 'tile', url: 'u' },
      ],
      layersSettings: { X: { showInToolbar: false } },
      layerSetups: { w: { opacity: 0.5 } },
      maxZoom: 16,
    } as typeof local;

    for (const next of [
      mapReducer(signedIn, authLogout()),
      mapReducer(signedIn, authSetUser(null)),
    ]) {
      expect(next.presets).toEqual([]);
      expect(next.customLayers).toEqual([]);
      expect(next.layersSettings).toEqual({});
      expect(next.layerSetups).toEqual({});
      expect(next.maxZoom).toBe(mapInitialState.maxZoom);
    }
  });

  it('puts the default base under where signing out took the only one', () => {
    const signedIn = {
      ...local,
      layers: ['.1', 'i'],
      customLayers: [
        { type: '.1', layer: 'base', technology: 'tile', url: 'u' },
      ],
    } as typeof local;

    for (const next of [
      mapReducer(signedIn, authLogout()),
      mapReducer(signedIn, authSetUser(null)),
    ]) {
      expect(next.layers[0]).toBe('X');
    }
  });

  it("puts the default base under where the account's presets took the only one", () => {
    const base = { id: 'b', name: 'B', layers: [{ type: 'O', setup: {} }] };

    const next = mapReducer(
      { ...local, presets: [base], layers: ['@b', 'i'] },
      signIn({ presets: [] }),
    );

    expect(next.layers).toEqual(['X', 'i']);

    // Not where the account has it as an overlay.
    expect(
      mapReducer(
        { ...local, presets: [base], layers: ['@b', 'i'] },
        signIn({ presets: [], layerSetups: { X: { kind: 'overlay' } } }),
      ).layers,
    ).toEqual(['i']);
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
      { ...mapInitialState, layers: ['X', 'xh'] },
      mapLayerSetupChange({ type: 'xh', setup: { kind: 'base' } }),
    );

    expect(next.layers).toEqual(['xh']);

    expect(next.layerSetups['xh']?.kind).toBe('base');
  });

  it('switching a map back to its own kind drops the setting', () => {
    const next = mapReducer(
      { ...mapInitialState, layerSetups: { xh: { kind: 'base' } } },
      mapLayerSetupChange({ type: 'xh', setup: { kind: 'overlay' } }),
    );

    expect(next.layerSetups['xh']).toBeUndefined();
  });

  it('a reset leaving no base puts none under', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layers: ['h'],
        layerSetups: { h: { kind: 'base' } },
      },
      mapLayerSetupReset({ type: 'h' }),
    );

    expect(next.layers).toEqual(['h']);
  });

  it('resetting every setting puts the default base under the one it took', () => {
    const switched = {
      ...mapInitialState,
      layerSetups: { xh: { kind: 'base' as const } },
    };

    expect(
      mapReducer({ ...switched, layers: ['xh'] }, mapLayersSettingsReset())
        .layers,
    ).toEqual(['X', 'xh']);

    // None before, none after.
    expect(
      mapReducer(
        { ...mapInitialState, layers: ['xh'] },
        mapLayersSettingsReset(),
      ).layers,
    ).toEqual(['xh']);
  });

  it('a reset back to a base map makes it the only base', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layers: ['X', 'O', 'i'],
        layerSetups: { O: { kind: 'overlay' } },
      },
      mapLayerSetupReset({ type: 'O' }),
    );

    expect(next.layers).toEqual(['O', 'i']);
  });
});

describe('mapReducer — named maps', () => {
  const named = {
    type: 'n1',
    name: 'Parcels',
    layer: 'overlay' as const,
    source: 'WKA',
  };

  it('takes a map’s layers and kind, and its place on the map', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layers: ['X', 'WKA'],
        layerSetups: {
          WKA: { kind: 'overlay', opacity: 0.6, wmsLayers: ['1'] },
        },
      },
      mapNamedMapCreate({ def: named, from: { type: 'WKA' } }),
    );

    expect(next.layers).toEqual(['X', 'n1']);

    expect(next.customLayers).toEqual([named]);

    // The kind is the named map's own now, so no switch is left.
    expect(next.layerSetups['n1']).toEqual({ opacity: 0.6, wmsLayers: ['1'] });
  });

  it('takes a preset copy’s place, the copy keeping its opacity', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        layerSetups: { h: { opacity: 0.3, shading: DEFAULT_SHADING } },
        presets: [
          {
            id: 'p',
            name: 'P',
            layers: [{ type: 'h', setup: { opacity: 0.5 } }],
          },
        ],
      },
      mapNamedMapCreate({
        def: { ...named, source: 'h' },
        from: { type: 'h', preset: 'p' },
      }),
    );

    expect(next.presets[0]?.layers).toEqual([
      { type: 'n1', setup: { opacity: 0.5 } },
    ]);

    expect(next.layerSetups['n1']).toEqual({ shading: DEFAULT_SHADING });

    // The unnamed map keeps its own.
    expect(next.layerSetups['h']?.shading).toBe(DEFAULT_SHADING);
  });

  it('takes a shading draft along, and the copy drops its kind', () => {
    const next = mapReducer(
      {
        ...mapInitialState,
        shadingDrafts: { h: DEFAULT_SHADING },
        presets: [
          {
            id: 'p',
            name: 'P',
            layers: [{ type: 'h', setup: { kind: 'base' } }],
          },
        ],
      },
      mapNamedMapCreate({
        def: { ...named, source: 'h' },
        from: { type: 'h', preset: 'p' },
      }),
    );

    expect(next.shadingDrafts).toEqual({ n1: DEFAULT_SHADING });

    expect(next.customLayers[0]?.layer).toBe('base');

    expect(next.presets[0]?.layers).toEqual([{ type: 'n1', setup: {} }]);
  });
});
