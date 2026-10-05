import { applySettings } from '@app/store/actions.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import {
  cachedMapDeleted,
  cachedMapEdited,
  cachedMapsLoaded,
  cacheTilesProgress,
  cacheTilesStart,
} from '@features/cachedMaps/model/actions.js';
import { gallerySetFilter } from '@features/gallery/model/actions.js';
import { processGeoipResult } from '@features/geoip/model/actions.js';
import { mapLibraryCatalogMapsLoaded } from '@features/mapLibrary/model/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import type { Shading } from '@features/parameterizedShading/model/Shading.js';
import { createReducer } from '@reduxjs/toolkit';
import type { CatalogMap } from '@shared/mapLibrary/catalogMap.js';
import { isUninstalledByDefault } from '@shared/mapLibrary/installed.js';
import {
  type LayerSettings,
  type MapStateBase,
  mapCustomLayerDelete,
  mapCustomLayerSave,
  mapLayerRemove,
  mapLayerSettingsChange,
  mapLayerSetupChange,
  mapLayerSetupReset,
  mapLayersSettingsReset,
  mapOverlayMove,
  mapPresetChange,
  mapPresetDelete,
  mapPresetLayerAdd,
  mapPresetLayerRemove,
  mapPresetSave,
  mapPresetToggle,
  mapRefocus,
  mapReplaceLayer,
  mapSetBounds,
  mapSetCountries,
  mapSetCustomLayers,
  mapSetEsriAttribution,
  mapSetLocalPrefs,
  mapSetShadingDraft,
  mapSetShadingOnServer,
  mapSuppressLegacyMapWarning,
  mapToggleLayer,
  type SetupTarget,
} from './actions.js';
import { kindOverrides } from './layerKind.js';
import {
  isEmptySetup,
  type LayerSetup,
  setupKey,
  targetOfKey,
} from './layerSetup.js';
import {
  adoptPresets,
  isPresettable,
  layerKinds,
  type MapPreset,
  memberKind,
  presetIdOf,
  presetItem,
  presetKind,
} from './mapPreset.js';
import { allLayerEntries } from './selectors.js';

export interface MapState extends MapStateBase {
  removeGalleryOverlayOnGalleryToolQuit: boolean;
  gpsTracked: boolean;
  legacyMapWarningSuppressions: string[];
  tempLegacyMapWarningSuppressions: string[];
  esriAttribution: string[];
  maxZoom: number;
  resolutionScale: number | null;
  featureScale: number;
  zoomSnap: number;
  /** Behind every layer, showing wherever none draws. */
  backgroundColor: string;
  /** Edits of shading maps' setups not applied yet, while the server renders them. */
  shadingDrafts: Record<string, Shading>;
  shadingOnServer: boolean;
  presets: MapPreset[];
  /** Presets a link or a document brought, until saved as the account's own. */
  linkPresets: MapPreset[];
  /** The catalog maps wanted so far: installed, on the map or an offline map's source. */
  catalogMaps: CatalogMap[];
}

const LAT = 48.70714112;
const LON = 19.49950112;

export const mapInitialState: MapState = {
  layers: ['X'],
  lat: LAT,
  lon: LON,
  zoom: 8,
  layersSettings: {},
  layerSetups: {},
  removeGalleryOverlayOnGalleryToolQuit: false,
  gpsTracked: false,
  customLayers: [],
  cachedMaps: [],
  legacyMapWarningSuppressions: [],
  tempLegacyMapWarningSuppressions: [],
  esriAttribution: [],
  maxZoom: 20,
  resolutionScale: null,
  featureScale: 1,
  zoomSnap: 1,
  // Leaflet's own.
  backgroundColor: '#dddddd',
  shadingDrafts: {},
  shadingOnServer: true,
  presets: [],
  linkPresets: [],
  catalogMaps: [],
  // undefined = not yet fetched (unknown coverage); [] would wrongly mean
  // "covers no country" and flash out-of-coverage warnings during initial load
  countries: undefined,
};

/**
 * A zoom on its way into the store, pulled onto the grid the `zoomSnap`
 * preference defines (0 = no grid). Same arithmetic Leaflet's own `_limitZoom`
 * uses, so the two agree on where a zoom belongs.
 *
 * Needed because a zoom can arrive off-grid from outside — a link written under
 * a finer setting, or a saved map. Leaflet would snap the view to the same
 * place, but the `setView` doing so counts as a programmatic move and is
 * therefore not synced back, which would otherwise leave the store and the URL
 * off what is on screen until the next time the user touched the map.
 */
function acceptZoom(state: MapState, zoom: number): number {
  const { zoomSnap } = state;

  return zoomSnap ? Math.round(zoom / zoomSnap) * zoomSnap : zoom;
}

type AccountSettings = Pick<
  MapState,
  'layersSettings' | 'layerSetups' | 'customLayers' | 'presets' | 'maxZoom'
>;

/**
 * The account's settings, of which this slice is the only copy: a save sends
 * them all, the API storing them whole.
 */
export const accountSettingsOf = (map: MapState): AccountSettings => ({
  layersSettings: map.layersSettings,
  layerSetups: map.layerSetups,
  customLayers: map.customLayers,
  presets: map.presets,
  maxZoom: map.maxZoom,
});

/** Replaces the item with the same key in place, or appends it. */
function upsert<T>(items: T[], item: T, same: (a: T) => boolean) {
  const i = items.findIndex(same);

  if (i === -1) {
    items.push(item);
  } else {
    items[i] = item;
  }
}

/** Each layer's kind, as its setup switches it. */
const kindsOf = (state: MapState) =>
  layerKinds(
    allLayerEntries(
      state.customLayers,
      state.cachedMaps,
      state.catalogMaps,
      kindOverrides(state.layerSetups),
    ),
  );

/** Each layer's own kind, before any switch. */
const nativeKindsOf = (state: MapState) =>
  layerKinds(
    allLayerEntries(
      state.customLayers,
      state.cachedMaps,
      state.catalogMaps,
      {},
    ),
  );

/** One of the account's presets, or one a link brought. */
const findPreset = (state: MapState, id: string) =>
  state.presets.find((p) => p.id === id) ??
  state.linkPresets.find((p) => p.id === id);

/** An item of the stack's kind: a map's as its setup switches it, a preset's by its layers. */
function itemKindsOf(state: MapState) {
  const kinds = kindsOf(state);

  const nativeKinds = nativeKindsOf(state);

  return (item: string) => {
    const id = presetIdOf(item);

    if (id === undefined) {
      return kinds.get(item);
    }

    const preset = findPreset(state, id);

    return preset && presetKind(preset, nativeKinds);
  };
}

/** Puts a base item first and takes any other off, as picking one does. */
function makeSoleBase(state: MapState, item: string) {
  const kindOf = itemKindsOf(state);

  state.layers = [
    item,
    ...state.layers.filter((t) => t !== item && kindOf(t) !== 'base'),
  ];
}

/** Whether a base item is on. */
const hasBase = (state: MapState) => {
  const kindOf = itemKindsOf(state);

  return state.layers.some((t) => kindOf(t) === 'base');
};

/**
 * Leaves one base item on, first, once a change not made on the map itself (a
 * reset, another device's settings, a deletion) may have made an overlay a
 * base or a base an overlay: the first of several, or Outdoor where `hadBase`
 * says that change took the only one away. A map left without one on purpose
 * (a switch to overlay) stays so.
 */
function settleBase(state: MapState, hadBase: boolean) {
  const kindOf = itemKindsOf(state);

  const overrides = kindOverrides(state.layerSetups);

  const [first, ...extra] = state.layers.filter((t) => kindOf(t) === 'base');

  if (first !== undefined) {
    state.layers = [
      first,
      ...state.layers.filter((t) => t !== first && !extra.includes(t)),
    ];
  } else if (
    hadBase &&
    !state.layers.includes('X') &&
    !state.layers.some((t) => overrides[t] === 'overlay')
  ) {
    state.layers.unshift('X');
  }
}

/** A setup as stored: no field left undefined, no kind that is the map's own. */
function normalizeSetup(
  setup: LayerSetup,
  nativeKind: string | undefined,
): LayerSetup {
  // Its own kind is no switch, and kept as one it would read as a choice.
  const kind = setup.kind === nativeKind ? undefined : setup.kind;

  return Object.fromEntries(
    Object.entries({ ...setup, kind }).filter(([, v]) => v !== undefined),
  ) as LayerSetup;
}

/** Puts a map's own setup in, dropping an empty one; a new shading drops its draft. */
function setSetup(state: MapState, type: string, setup: LayerSetup) {
  // An opacity or kind change carries the same shading, and keeps the draft.
  if (setup.shading !== state.layerSetups[type]?.shading) {
    delete state.shadingDrafts[type];
  }

  const next = normalizeSetup(setup, nativeKindsOf(state).get(type));

  if (isEmptySetup(next)) {
    delete state.layerSetups[type];
  } else {
    state.layerSetups[type] = next;
  }
}

/**
 * Puts a preset's layer's setup in. A layer switched to a base map goes to
 * the bottom, in place of the preset's base map, and a preset so become a base
 * takes the base map's place. One that stops being a base leaves none, on
 * purpose, as a map switched to an overlay does.
 */
function setPresetSetup(
  state: MapState,
  id: string,
  type: string,
  setup: LayerSetup,
) {
  const preset = findPreset(state, id);

  const layer = preset?.layers.find((l) => l.type === type);

  if (!preset || !layer) {
    return;
  }

  const key = setupKey({ type, preset: id });

  if (setup.shading !== layer.setup.shading) {
    delete state.shadingDrafts[key];
  }

  const nativeKinds = nativeKindsOf(state);

  layer.setup = normalizeSetup(setup, nativeKinds.get(type));

  if (memberKind(layer, nativeKinds) === 'base') {
    preset.layers = [
      layer,
      ...preset.layers.filter(
        (l) => l !== layer && memberKind(l, nativeKinds) !== 'base',
      ),
    ];
  }

  const item = presetItem(id);

  if (
    state.layers.includes(item) &&
    presetKind(preset, nativeKinds) === 'base'
  ) {
    makeSoleBase(state, item);
  }
}

function setTargetSetup(
  state: MapState,
  { type, preset }: SetupTarget,
  setup: LayerSetup,
) {
  if (preset === undefined) {
    setSetup(state, type, setup);
  } else {
    setPresetSetup(state, preset, type, setup);
  }
}

/** A target's setup as stored. */
function targetSetup(state: MapState, { type, preset }: SetupTarget) {
  return preset === undefined
    ? state.layerSetups[type]
    : findPreset(state, preset)?.layers.find((l) => l.type === type)?.setup;
}

/**
 * Takes a map that is going away off the map and out of every preset, its
 * drafts with it; Outdoor goes under where it was the only base. Call before
 * removing its def, which decides its kind.
 */
function dropMap(state: MapState, type: string) {
  const hadBase = hasBase(state);

  state.layers = state.layers.filter((t) => t !== type);

  for (const preset of [...state.presets, ...state.linkPresets]) {
    preset.layers = preset.layers.filter((l) => l.type !== type);

    delete state.shadingDrafts[setupKey({ type, preset: preset.id })];
  }

  delete state.shadingDrafts[type];

  settleBase(state, hadBase);
}

/** Moves `item` to where `to` is in `items`. */
function moveTo(items: string[], item: string, to: string) {
  const from = items.indexOf(item);

  const at = items.indexOf(to);

  if (from !== -1 && at !== -1) {
    items.splice(from, 1);

    items.splice(at, 0, item);
  }
}

function mergeLayerSettings(
  state: MapState,
  type: string,
  settings: LayerSettings | undefined,
) {
  if (settings) {
    state.layersSettings[type] = { ...state.layersSettings[type], ...settings };
  }
}

/** Each key given replaces the slice's, even when empty. */
function assignAccountSettings(
  state: MapState,
  settings: Partial<AccountSettings>,
) {
  const hadBase = hasBase(state);

  if (settings.layersSettings) {
    state.layersSettings = settings.layersSettings;
  }

  if (settings.layerSetups) {
    state.layerSetups = settings.layerSetups;

    state.shadingDrafts = {};
  }

  if (settings.customLayers) {
    state.customLayers = settings.customLayers;
  }

  if (settings.presets) {
    state.presets = settings.presets;

    state.layers = state.layers.filter((t) => {
      const id = presetIdOf(t);

      return id === undefined || findPreset(state, id) !== undefined;
    });
  }

  // With all in, as each decides a kind.
  if (settings.layerSetups || settings.customLayers || settings.presets) {
    settleBase(state, hadBase);
  }

  if (settings.maxZoom !== undefined) {
    state.maxZoom = settings.maxZoom;
  }
}

// Not passed to whoever signs in next.
const resetAccountSettings = (state: MapState) =>
  assignAccountSettings(state, accountSettingsOf(mapInitialState));

export const mapReducer = createReducer(mapInitialState, (builder) =>
  builder
    .addCase(mapSuppressLegacyMapWarning, (state, action) => {
      state[
        action.payload.forever
          ? 'legacyMapWarningSuppressions'
          : 'tempLegacyMapWarningSuppressions'
      ].push(action.payload.type);
    })
    .addCase(applySettings, (state, { payload }) => {
      assignAccountSettings(state, payload);
    })
    .addCase(mapLibraryCatalogMapsLoaded, (state, { payload }) => {
      for (const map of payload) {
        if (!state.catalogMaps.some((known) => known.type === map.type)) {
          state.catalogMaps.push(map);
        }
      }
    })
    .addCase(mapLayerSettingsChange, (state, { payload }) => {
      mergeLayerSettings(state, payload.type, payload.settings);
    })
    .addCase(mapLayerSetupChange, (state, { payload }) => {
      const { type, preset, setup } = payload;

      setTargetSetup(state, payload, {
        ...targetSetup(state, payload),
        ...setup,
      });

      // On as a base map, it takes the place of the one there.
      if (
        preset === undefined &&
        setup.kind === 'base' &&
        state.layers.includes(type) &&
        kindsOf(state).get(type) === 'base'
      ) {
        makeSoleBase(state, type);
      }
    })
    .addCase(mapLayerSetupReset, (state, { payload }) => {
      delete state.shadingDrafts[setupKey(payload)];

      if (payload.preset === undefined) {
        const hadBase = hasBase(state);

        delete state.layerSetups[payload.type];

        // Back to a base map, it takes the base map's place, as a switch does.
        if (
          state.layers.includes(payload.type) &&
          kindsOf(state).get(payload.type) === 'base'
        ) {
          makeSoleBase(state, payload.type);
        } else {
          settleBase(state, hadBase);
        }
      } else {
        const hadBase = hasBase(state);

        setPresetSetup(state, payload.preset, payload.type, {});

        settleBase(state, hadBase);
      }
    })
    .addCase(mapOverlayMove, (state, { payload: { type, to, preset } }) => {
      if (preset === undefined) {
        moveTo(state.layers, type, to);

        return;
      }

      const found = findPreset(state, preset);

      if (found) {
        const types = found.layers.map((l) => l.type);

        moveTo(types, type, to);

        found.layers = types.map(
          (t) => found.layers.find((l) => l.type === t)!,
        );
      }
    })
    .addCase(mapCustomLayerSave, (state, { payload: { def, settings } }) => {
      upsert(state.customLayers, def, (d) => d.type === def.type);

      // The layers and kind saved with the map replace any set on the map.
      if (state.layerSetups[def.type]) {
        setSetup(state, def.type, {
          ...state.layerSetups[def.type],
          wmsLayers: undefined,
          kind: undefined,
        });
      }

      // Saved as a base map while on, it takes the base map's place, as a
      // switch on the map does.
      if (def.layer === 'base' && state.layers.includes(def.type)) {
        makeSoleBase(state, def.type);
      }

      mergeLayerSettings(state, def.type, settings);
    })
    .addCase(mapCustomLayerDelete, (state, { payload: { type } }) => {
      dropMap(state, type);

      state.customLayers = state.customLayers.filter((d) => d.type !== type);

      delete state.layersSettings[type];

      delete state.layerSetups[type];
    })
    .addCase(
      mapPresetSave,
      (state, { payload: { preset, settings, onMap, replacing } }) => {
        upsert(state.presets, preset, (p) => p.id === preset.id);

        mergeLayerSettings(state, preset.id, settings);

        const item = presetItem(preset.id);

        if (replacing !== undefined) {
          state.layers = state.layers.map((t) =>
            t === presetItem(replacing) ? item : t,
          );

          state.linkPresets = state.linkPresets.filter(
            (p) => p.id !== replacing,
          );
        } else if (onMap) {
          const hadBase = hasBase(state);

          // It is a copy of every picture layer; the data layers stay over it.
          state.layers = [
            item,
            ...state.layers.filter(
              (t) => presetIdOf(t) === undefined && !isPresettable(t),
            ),
          ];

          settleBase(state, hadBase);
        }
      },
    )
    .addCase(mapPresetDelete, (state, { payload: { id } }) => {
      const hadBase = hasBase(state);

      state.presets = state.presets.filter((p) => p.id !== id);

      delete state.layersSettings[id];

      state.layers = state.layers.filter((t) => t !== presetItem(id));

      settleBase(state, hadBase);
    })
    .addCase(mapPresetToggle, (state, { payload: { id, enable } }) => {
      const preset = findPreset(state, id);

      if (!preset) {
        return;
      }

      const item = presetItem(id);

      const base = presetKind(preset, nativeKindsOf(state)) === 'base';

      // As with a base map, one with a base map is replaced, not turned off.
      if (base && enable !== false) {
        if (!state.layers.includes(item)) {
          makeSoleBase(state, item);
        }
      } else if (state.layers.includes(item)) {
        if (enable !== true) {
          state.layers = state.layers.filter((t) => t !== item);
        }
      } else if (enable !== false) {
        state.layers.push(item);
      }
    })
    .addCase(mapPresetChange, (state, { payload: { id, change } }) => {
      const preset = findPreset(state, id);

      if (preset) {
        Object.assign(preset, change);

        if (preset.opacity === undefined) {
          delete preset.opacity;
        }
      }
    })
    .addCase(mapPresetLayerAdd, (state, { payload: { id, type } }) => {
      const preset = findPreset(state, id);

      if (
        !preset ||
        !isPresettable(type) ||
        // An offline map is this device's alone, a preset the account's.
        state.cachedMaps.some((cm) => cm.type === type) ||
        preset.layers.some((l) => l.type === type)
      ) {
        return;
      }

      // Starting as the map is drawn on its own.
      preset.layers.push({ type, setup: { ...state.layerSetups[type] } });

      setPresetSetup(state, id, type, preset.layers.at(-1)!.setup);
    })
    .addCase(mapPresetLayerRemove, (state, { payload: { id, type } }) => {
      const preset = findPreset(state, id);

      if (!preset) {
        return;
      }

      // Taking its base map out leaves the map without one, as above.
      preset.layers = preset.layers.filter((l) => l.type !== type);

      delete state.shadingDrafts[setupKey({ type, preset: id })];
    })
    .addCase(mapLayersSettingsReset, (state) => {
      const hadBase = hasBase(state);

      // A map installed only by having settings stays installed without them.
      state.layersSettings = Object.fromEntries(
        Object.entries(state.layersSettings).flatMap(([type, { installed }]) =>
          installed !== undefined
            ? [[type, { installed }]]
            : isUninstalledByDefault(type)
              ? [[type, { installed: true }]]
              : [],
        ),
      );

      state.layerSetups = {};

      state.shadingDrafts = {};

      settleBase(state, hadBase);
    })
    .addCase(gallerySetFilter, (state) => {
      if (!state.layers.includes('I')) {
        state.layers.push('I');
      }
    })
    .addCase(mapLayerRemove, (state, { payload: { item } }) => {
      state.layers = state.layers.filter((t) => t !== item);
    })
    .addCase(mapReplaceLayer, (state, { payload: { from, to } }) => {
      const hadBase = hasBase(state);

      // Only the opacity and kind carry over: other setup fields are the old map's.
      const carried = ({ opacity, kind }: LayerSetup): LayerSetup => ({
        opacity,
        kind,
      });

      const idx = state.layers.indexOf(from);

      if (idx > -1) {
        state.layers[idx] = to;

        state.layers = state.layers.filter(
          (item, i) => item !== to || i === idx,
        );

        // The new map's own setup, where it has one, is the user's choice.
        if (!state.layerSetups[to]) {
          setSetup(state, to, carried(state.layerSetups[from] ?? {}));
        }
      }

      for (const preset of [...state.presets, ...state.linkPresets]) {
        const member = preset.layers.find((layer) => layer.type === from);

        if (!member) {
          continue;
        }

        if (preset.layers.some((layer) => layer.type === to)) {
          preset.layers = preset.layers.filter((layer) => layer !== member);
        } else {
          const setup = carried(member.setup);

          member.type = to;

          member.setup = {};

          setPresetSetup(state, preset.id, to, setup);
        }
      }

      settleBase(state, hadBase);
    })
    .addCase(mapToggleLayer, (state, { payload: { type, enable } }) => {
      const kinds = kindsOf(state);

      if (kinds.get(type) === 'base' && enable !== false) {
        if (!state.layers.includes(type)) {
          makeSoleBase(state, type);
        }
      } else if (state.layers.includes(type)) {
        if (enable !== true) {
          state.layers = state.layers.filter((t) => t !== type);
        }
      } else if (enable !== false) {
        // On top; `overlayPlacementProcessor` moves it to its own place.
        state.layers.push(type);
      }
    })
    .addCase(
      mapRefocus,
      (
        state,
        {
          payload: { zoom, lat, lon, layers, gpsTracked, setups, linkPresets },
        },
      ) => {
        if (linkPresets) {
          state.linkPresets = linkPresets;
        }

        // Zoom 0 is a zoom like any other — the world layers go down to it, so
        // the `-` button, the `-` key and a fit to a world-spanning extent all
        // ask for it. Finite, because one caller reads its zoom off a DOM
        // dataset attribute.
        if (zoom !== undefined && Number.isFinite(zoom)) {
          state.zoom = acceptZoom(state, zoom);
        }

        if (lat !== undefined) {
          state.lat = lat;
        }

        if (lon !== undefined) {
          state.lon = lon;
        }

        for (const [type, setup] of Object.entries(setups ?? {})) {
          setSetup(state, type, setup);
        }

        if (layers) {
          state.layers = layers;
        }

        if (
          gpsTracked !== undefined ||
          (lat !== undefined && lon !== undefined)
        ) {
          state.gpsTracked = Boolean(gpsTracked);
        }
      },
    )
    .addCase(authSetUser, (state, action) => {
      // A session that turned out to be over, as signing out.
      if (!action.payload) {
        resetAccountSettings(state);

        return;
      }

      // Each key the account has wins, even empty, so a deletion elsewhere
      // holds; one it lacks keeps what was set signed out.
      if (action.payload.settings) {
        assignAccountSettings(state, action.payload.settings);
      }
    })
    .addCase(authLogout, resetAccountSettings)
    .addCase(mapsLoaded, (state, { payload: { data } }) => {
      const { map } = data;

      if (!map) {
        return;
      }

      state.lat = map.lat ?? state.lat;

      state.lon = map.lon ?? state.lon;

      if (map.zoom !== undefined) {
        state.zoom = acceptZoom(state, map.zoom);
      }

      // Added to the account's own, never replacing them: they are the
      // account's settings, saved with it.
      for (const def of map.customLayers ?? []) {
        if (!state.customLayers.some((d) => d.type === def.type)) {
          state.customLayers.push(def);
        }
      }

      // A document is a snapshot: its layers as they were drawn, its presets
      // copies — the account's own where one is the same.
      if (map.layers) {
        const { layers, linkPresets } = adoptPresets(
          map.layers,
          map.presets ?? [],
          state.presets,
          'd',
        );

        for (const type of layers) {
          if (presetIdOf(type) === undefined) {
            setSetup(state, type, map.layerSetups?.[type] ?? {});
          }
        }

        state.linkPresets = linkPresets;

        state.layers = layers;
      }
    })
    .addCase(mapSetCustomLayers, (state, action) => {
      state.customLayers = action.payload;
    })
    .addCase(mapSetEsriAttribution, (state, action) => {
      state.esriAttribution = action.payload;
    })
    .addCase(mapSetBounds, (state, action) => {
      state.bounds = action.payload;
    })
    .addCase(mapSetCountries, (state, action) => {
      state.countries = action.payload;
    })
    .addCase(mapSetShadingDraft, (state, { payload }) => {
      const key = setupKey(payload);

      if (payload.shading) {
        state.shadingDrafts[key] = payload.shading;
      } else {
        delete state.shadingDrafts[key];
      }
    })
    .addCase(mapSetShadingOnServer, (state, action) => {
      state.shadingOnServer = action.payload;

      // The browser draws every edit as it is made, so the drafts are simply taken.
      if (!action.payload) {
        for (const [key, shading] of Object.entries(state.shadingDrafts)) {
          const target = targetOfKey(key);

          setTargetSetup(state, target, {
            ...targetSetup(state, target),
            shading,
          });
        }
      }
    })
    .addCase(mapSetLocalPrefs, (state, { payload }) => {
      if (payload.resolutionScale !== undefined) {
        state.resolutionScale = payload.resolutionScale;
      }

      if (payload.featureScale !== undefined) {
        state.featureScale = payload.featureScale;
      }

      if (payload.zoomSnap !== undefined) {
        state.zoomSnap = payload.zoomSnap;

        // A coarser grid leaves the map between two of its levels, which the
        // store may no longer hold.
        state.zoom = acceptZoom(state, state.zoom);
      }

      if (payload.backgroundColor !== undefined) {
        state.backgroundColor = payload.backgroundColor;
      }
    })
    .addCase(processGeoipResult, (state, { payload }) => {
      if (state.lat !== LAT || state.lon !== LON) {
        return;
      }

      if (payload.latitude !== undefined && payload.longitude !== undefined) {
        state.lat = payload.latitude;
        state.lon = payload.longitude;
        state.zoom = 9;
      }
    })
    .addCase(cachedMapsLoaded, (state, action) => {
      state.cachedMaps = action.payload;
    })
    .addCase(cacheTilesStart, (state, { payload }) => {
      state.cachedMaps.push(payload);
    })
    .addCase(cacheTilesProgress, (state, { payload }) => {
      const i = state.cachedMaps.findIndex((m) => m.type === payload.type);

      if (i >= 0) {
        state.cachedMaps[i] = payload;
      }
    })
    .addCase(cachedMapDeleted, (state, { payload }) => {
      dropMap(state, payload.id);

      state.cachedMaps = state.cachedMaps.filter((m) => m.type !== payload.id);
    })
    .addCase(cachedMapEdited, (state, { payload }) => {
      const i = state.cachedMaps.findIndex((m) => m.type === payload.next.type);

      if (i >= 0) {
        state.cachedMaps[i] = payload.next;
      }
    }),
);
