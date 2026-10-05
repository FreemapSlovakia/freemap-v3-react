import type { RootState } from '@app/store/store.js';
import {
  integratedLayerDefMapSelector,
  kindOverridesSelector,
  nativeKindsSelector,
  presetByIdSelector,
} from '@features/mapLibrary/model/selectors.js';
import { resolveLayerOpacity } from '@shared/mapDefinitions.js';
import { mapIndex } from '@shared/mapLibrary/mapIndex.js';
import { createSelector } from 'reselect';
import { type LayerKind, withKind, withMemberKind } from './layerKind.js';
import { isEmptySetup, type LayerSetup, setupKey } from './layerSetup.js';
import {
  canJoinPreset,
  layerKinds,
  memberKind,
  mergeLayers,
  type PresetLayer,
  presetIdOf,
} from './mapPreset.js';

/**
 * Every layer, enough to tell its kind: library and custom maps as switched,
 * offline maps as saved.
 */
export const allLayerEntries = (
  customLayers: RootState['map']['customLayers'],
  cachedMaps: RootState['map']['cachedMaps'],
  catalogMaps: RootState['map']['catalogMaps'],
  overrides: Readonly<Record<string, LayerKind>>,
) => [
  ...mapIndex.map((entry) => withKind(entry, overrides)),
  // A tile map's technology is left out of the catalog's data.
  ...catalogMaps.map((map) =>
    withKind({ ...map, technology: map.technology ?? 'tile' }, overrides),
  ),
  ...customLayers.map((def) => withKind(def, overrides)),
  ...cachedMaps,
];

export {
  drawnTypesSelector,
  presetByIdSelector,
  resolvedCustomLayersSelector,
} from '@features/mapLibrary/model/selectors.js';

/** Each map's kind as its own setup switches it. */
export const layerKindsSelector = createSelector(
  (state: RootState) => state.map.customLayers,
  (state: RootState) => state.map.cachedMaps,
  (state: RootState) => state.map.catalogMaps,
  kindOverridesSelector,
  (customLayers, cachedMaps, catalogMaps, overrides) =>
    layerKinds(
      allLayerEntries(customLayers, cachedMaps, catalogMaps, overrides),
    ),
);

/** One drawing of a map: on its own, or as a preset's layer. */
export type LayerInstance = {
  /** Unique on the map; see `setupKey`. */
  key: string;
  type: string;
  setup: LayerSetup;
  /** The preset it is a layer of. */
  preset?: string;
  /** A preset's layer's kind, from its own setup. */
  kind?: LayerKind;
};

/** Everything drawn, bottom first, a preset by its layers. */
export const layerInstancesSelector = createSelector(
  (state: RootState) => state.map.layers,
  (state: RootState) => state.map.layerSetups,
  presetByIdSelector,
  nativeKindsSelector,
  (layers, layerSetups, presetById, nativeKinds): LayerInstance[] =>
    layers.flatMap((item): LayerInstance[] => {
      const id = presetIdOf(item);

      if (id === undefined) {
        return [{ key: item, type: item, setup: layerSetups[item] ?? {} }];
      }

      return (presetById[id]?.layers ?? []).map((layer) => ({
        key: setupKey({ type: layer.type, preset: id }),
        type: layer.type,
        setup: layer.setup,
        preset: id,
        kind: memberKind(layer, nativeKinds),
      }));
    }),
);

/**
 * Each drawn map's setup, the upper drawing's where it is drawn twice: what
 * its legend and feature info go by.
 */
export const drawnSetupsSelector = createSelector(
  layerInstancesSelector,
  (instances): Readonly<Record<string, LayerSetup>> =>
    Object.fromEntries(instances.map(({ type, setup }) => [type, setup])),
);

/**
 * Everything on the map as a preset's layers, bottom first: presets taken
 * apart, a map drawn twice merged (see `mergeLayers`), the data layers left out.
 */
export function capturePreset(state: RootState): PresetLayer[] {
  const nativeKinds = nativeKindsSelector(state);

  const defs = integratedLayerDefMapSelector(state);

  const customLayers = state.map.customLayers;

  const presetById = presetByIdSelector(state);

  const defOf = (type: string) =>
    defs[type] ?? customLayers.find((d) => d.type === type);

  return mergeLayers(
    layerInstancesSelector(state)
      .filter(({ type }) => canJoinPreset(type, state.map.cachedMaps))
      .map(({ type, setup, preset, kind }) => {
        const presetOpacity =
          preset === undefined ? undefined : presetById[preset]?.opacity;

        const def = defOf(type);

        // Taken apart, a preset's own opacity goes into each of its layers,
        // each of the kind it has in the preset, as `Layers` draws it.
        const opacity =
          presetOpacity === undefined
            ? setup.opacity
            : resolveLayerOpacity(
                def && withMemberKind(def, kind, nativeKinds.get(type)),
                setup.opacity,
              ) * presetOpacity;

        const taken = { ...setup, opacity };

        return { type, setup: isEmptySetup(taken) ? {} : taken };
      }),
    {
      kind: (type) => nativeKinds.get(type),
      wmsLayers: (type) => {
        const def = defOf(type);

        return def?.technology === 'wms' ? def.layers : [];
      },
    },
  );
}
