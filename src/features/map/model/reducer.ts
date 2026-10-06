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
import { isNamedMapDef } from '@shared/mapDefinitions.js';
import type { CatalogMap } from '@shared/mapLibrary/catalogMap.js';
import { isUninstalledByDefault } from '@shared/mapLibrary/installed.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';
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
import { kindOverrides, type LayerKind } from './layerKind.js';
import {
  compactSetup,
  configOf,
  copySetup,
  isEmptySetup,
  type LayerSetup,
  usageOf,
  withLoadedConfig,
} from './layerSetup.js';
import {
  adoptPresets,
  canJoinPreset,
  type LayerKinds,
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
 * The account's map settings, of which this slice is the only copy. The API
 * replaces each key it gets; one left out stays, and `null` deletes it.
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

/** One layer's own kind, without building every layer's. */
const nativeKindOf = (state: MapState, type: string): LayerKind | undefined =>
  mapIndexById[type]?.layer ??
  [...state.catalogMaps, ...state.customLayers, ...state.cachedMaps].find(
    (def) => def.type === type,
  )?.layer;

// A new array only for a new order: every slider tick in a base preset ends here.
function setLayers(state: MapState, layers: string[]) {
  if (
    layers.length !== state.layers.length ||
    layers.some((item, i) => item !== state.layers[i])
  ) {
    state.layers = layers;
  }
}

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
function makeSoleBase(
  state: MapState,
  item: string,
  kindOf = itemKindsOf(state),
) {
  setLayers(state, [
    item,
    ...state.layers.filter((t) => t !== item && kindOf(t) !== 'base'),
  ]);
}

/**
 * Turns a map or preset on or off, or `enable` says which. A base item is
 * replaced rather than turned off; an overlay goes on top, where
 * `overlayPlacementProcessor` moves a map to its own place.
 */
function toggleItem(
  state: MapState,
  item: string,
  isBase: boolean,
  enable: boolean | undefined,
) {
  if (isBase && enable !== false) {
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
}

/**
 * Runs a change the user didn't make on the map (signing in or out, a reset of
 * every setting); where it took the only base away, Outdoor goes under.
 */
function keepingBase(state: MapState, change: () => void) {
  const hasBase = (kindOf: ReturnType<typeof itemKindsOf>) =>
    state.layers.some((t) => kindOf(t) === 'base');

  const hadBase = hasBase(itemKindsOf(state));

  change();

  const kindOf = itemKindsOf(state);

  // Not where the account switched Outdoor itself to overlay.
  if (
    hadBase &&
    !hasBase(kindOf) &&
    state.layerSetups['X']?.kind !== 'overlay'
  ) {
    makeSoleBase(state, 'X', kindOf);
  }
}

/**
 * After a change that may switch kinds off the map (a reset, a sync, a
 * replace): at most one base item, first. One that took the base away leaves none.
 */
function settleBase(state: MapState) {
  const kindOf = itemKindsOf(state);

  const first = state.layers.find((t) => kindOf(t) === 'base');

  if (first !== undefined) {
    makeSoleBase(state, first, kindOf);
  }
}

/** A setup as stored: no field left undefined, no kind that is the map's own. */
function normalizeSetup(
  setup: LayerSetup,
  nativeKind: string | undefined,
): LayerSetup {
  // Its own kind is no switch, and kept as one it would read as a choice.
  const kind = setup.kind === nativeKind ? undefined : setup.kind;

  return compactSetup({ ...setup, kind });
}

/** Puts a map's own setup in, dropping an empty one; a new shading drops its draft. */
function setSetup(state: MapState, type: string, setup: LayerSetup) {
  // An opacity or kind change carries the same shading, and keeps the draft.
  if (setup.shading !== state.layerSetups[type]?.shading) {
    delete state.shadingDrafts[type];
  }

  const next = normalizeSetup(setup, nativeKindOf(state, type));

  if (isEmptySetup(next)) {
    delete state.layerSetups[type];
  } else {
    state.layerSetups[type] = next;
  }
}

/**
 * Puts a preset's layer's setup in. A layer switched to base replaces the
 * preset's base map, and a preset so become a base replaces the map's; one
 * that stops being a base leaves none, as a map switched to overlay does.
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

  // The shading, WMS layers and colour are the map's, shared with every
  // drawing of it; the copy keeps its opacity and kind.
  setSetup(state, type, {
    ...state.layerSetups[type],
    ...configOf(setup),
  });

  const nativeKinds: LayerKinds = new Map(
    preset.layers.flatMap((l) => {
      const kind = nativeKindOf(state, l.type);

      return kind ? [[l.type, kind]] : [];
    }),
  );

  layer.setup = normalizeSetup(usageOf(setup), nativeKinds.get(type));

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

/** A target's setup as drawn: a preset's copy with the map's own shading and layers. */
function targetSetup(state: MapState, { type, preset }: SetupTarget) {
  if (preset === undefined) {
    return state.layerSetups[type];
  }

  const layer = findPreset(state, preset)?.layers.find((l) => l.type === type);

  return layer && copySetup(state.layerSetups[type], layer.setup);
}

/**
 * Takes a map that is going away off the map and out of every preset, its
 * draft with it.
 */
function dropMap(state: MapState, type: string) {
  state.layers = state.layers.filter((t) => t !== type);

  for (const preset of [...state.presets, ...state.linkPresets]) {
    preset.layers = preset.layers.filter((l) => l.type !== type);
  }

  delete state.shadingDrafts[type];
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
    settleBase(state);
  }

  if (settings.maxZoom !== undefined) {
    state.maxZoom = settings.maxZoom;
  }
}

// Not passed to whoever signs in next.
const resetAccountSettings = (state: MapState) =>
  keepingBase(state, () =>
    assignAccountSettings(state, accountSettingsOf(mapInitialState)),
  );

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
      delete state.shadingDrafts[payload.type];

      if (payload.preset === undefined) {
        delete state.layerSetups[payload.type];

        // Back to a base map, it takes the base map's place, as a switch does.
        if (
          state.layers.includes(payload.type) &&
          kindsOf(state).get(payload.type) === 'base'
        ) {
          makeSoleBase(state, payload.type);
        }
      } else {
        setPresetSetup(state, payload.preset, payload.type, {});
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

      // The layers and kind saved with the map replace any set on the map; a
      // named map's form changes neither.
      if (!isNamedMapDef(def) && state.layerSetups[def.type]) {
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
    .addCase(
      mapNamedMapCreate,
      (state, { payload: { def, settings, from } }) => {
        const drawn = targetSetup(state, from);

        const member =
          from.preset === undefined
            ? undefined
            : findPreset(state, from.preset)?.layers.find(
                (l) => l.type === from.type,
              );

        const kind = member
          ? memberKind(member, nativeKindsOf(state))
          : kindsOf(state).get(from.type);

        // A named map named again is a copy built on the same library map.
        const named = state.customLayers.find((d) => d.type === from.type);

        state.customLayers.push({
          ...def,
          layer: kind ?? def.layer,
          source: named && isNamedMapDef(named) ? named.source : from.type,
        });

        mergeLayerSettings(state, def.type, settings);

        // Its kind is now the named map's own; the opacity stays the drawing's.
        setSetup(state, def.type, {
          ...configOf(drawn),
          opacity: member ? undefined : drawn?.opacity,
        });

        // A shading edit waiting for Apply goes with the shading it edits.
        const draft = state.shadingDrafts[from.type];

        if (draft) {
          state.shadingDrafts[def.type] = draft;

          delete state.shadingDrafts[from.type];
        }

        if (member) {
          member.type = def.type;

          // The named map's own kind now.
          delete member.setup.kind;
        } else {
          const i = state.layers.indexOf(from.type);

          if (i !== -1) {
            state.layers[i] = def.type;
          }
        }
      },
    )
    .addCase(mapCustomLayerDelete, (state, { payload: { type } }) => {
      // The named maps built on it go with it: they can't draw without it.
      const gone = [
        type,
        ...state.customLayers
          .filter((d) => d.source === type)
          .map((d) => d.type),
      ];

      for (const t of gone) {
        dropMap(state, t);

        delete state.layersSettings[t];

        delete state.layerSetups[t];
      }

      state.customLayers = state.customLayers.filter(
        (d) => !gone.includes(d.type),
      );
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
          // It is a copy of every layer a preset can hold; the rest stay.
          state.layers = [
            item,
            ...state.layers.filter(
              (t) =>
                presetIdOf(t) === undefined &&
                !canJoinPreset(t, state.cachedMaps),
            ),
          ];

          settleBase(state);
        }
      },
    )
    .addCase(mapPresetDelete, (state, { payload: { id } }) => {
      state.presets = state.presets.filter((p) => p.id !== id);

      delete state.layersSettings[id];

      state.layers = state.layers.filter((t) => t !== presetItem(id));
    })
    .addCase(mapPresetToggle, (state, { payload: { id, enable } }) => {
      const preset = findPreset(state, id);

      if (!preset) {
        return;
      }

      toggleItem(
        state,
        presetItem(id),
        presetKind(preset, nativeKindsOf(state)) === 'base',
        enable,
      );
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
        !canJoinPreset(type, state.cachedMaps) ||
        preset.layers.some((l) => l.type === type)
      ) {
        return;
      }

      // At the opacity and kind it has on its own.
      preset.layers.push({ type, setup: {} });

      setPresetSetup(state, id, type, { ...state.layerSetups[type] });
    })
    .addCase(mapPresetLayerRemove, (state, { payload: { id, type } }) => {
      const preset = findPreset(state, id);

      if (!preset) {
        return;
      }

      preset.layers = preset.layers.filter((l) => l.type !== type);
    })
    .addCase(mapLayersSettingsReset, (state) =>
      keepingBase(state, () => {
        // A map installed only by having settings stays installed without them.
        state.layersSettings = Object.fromEntries(
          Object.entries(state.layersSettings).flatMap(
            ([type, { installed }]) =>
              installed !== undefined
                ? [[type, { installed }]]
                : isUninstalledByDefault(type)
                  ? [[type, { installed: true }]]
                  : [],
          ),
        );

        state.layerSetups = {};

        state.shadingDrafts = {};

        settleBase(state);
      }),
    )
    .addCase(gallerySetFilter, (state) => {
      if (!state.layers.includes('I')) {
        state.layers.push('I');
      }
    })
    .addCase(mapLayerRemove, (state, { payload: { item } }) => {
      state.layers = state.layers.filter((t) => t !== item);
    })
    .addCase(mapReplaceLayer, (state, { payload: { from, to } }) => {
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

      settleBase(state);
    })
    .addCase(mapToggleLayer, (state, { payload: { type, enable } }) => {
      toggleItem(state, type, kindsOf(state).get(type) === 'base', enable);
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
      const { settings } = action.payload;

      if (settings) {
        keepingBase(state, () => assignAccountSettings(state, settings));
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

        // A map only in its presets: its shading and layers, one's own
        // drawing of it keeping its opacity and kind.
        for (const [type, setup] of Object.entries(map.layerSetups ?? {})) {
          if (!layers.includes(type)) {
            setSetup(
              state,
              type,
              withLoadedConfig(state.layerSetups[type], setup),
            );
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
      if (payload.shading) {
        state.shadingDrafts[payload.type] = payload.shading;
      } else {
        delete state.shadingDrafts[payload.type];
      }
    })
    .addCase(mapSetShadingOnServer, (state, action) => {
      state.shadingOnServer = action.payload;

      // The browser draws every edit as it is made, so the drafts are simply taken.
      if (!action.payload) {
        for (const [type, shading] of Object.entries(state.shadingDrafts)) {
          setSetup(state, type, { ...state.layerSetups[type], shading });
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
