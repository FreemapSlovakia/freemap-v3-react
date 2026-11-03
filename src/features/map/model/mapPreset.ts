import { resolveLayerAlias } from '@shared/mapDefinitions.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import z from 'zod';
import { DATA_TECHNOLOGIES, type LayerKind } from './layerKind.js';
import {
  compactSetup,
  type LayerSetup,
  LayerSetupSchema,
  usageOf,
} from './layerSetup.js';

const PresetLayerSchema = z.object({
  type: z.string(),
  setup: LayerSetupSchema,
});

export type PresetLayer = z.infer<typeof PresetLayerSchema>;

/**
 * A named composite layer: its own copies of maps and their setups, bottom
 * first, each map at most once. On the map it is one item of the stack; it
 * never contains another preset.
 */
export const MapPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconSpec: z.string().optional(),
  /** The whole preset's, over what its layers set. */
  opacity: z.number().optional(),
  layers: z.array(PresetLayerSchema),
});

export type MapPreset = z.infer<typeof MapPresetSchema>;

/**
 * Drops invalid items rather than failing the whole settings object; a
 * removed map's layer becomes its successor's, a data layer is dropped.
 */
export const MapPresetArrayCompatSchema = z
  .array(z.unknown())
  .transform((items) =>
    items.flatMap((item) => {
      const ok = MapPresetSchema.safeParse(item);

      return ok.success ? [{ ...ok.data, layers: presetLayers(ok.data) }] : [];
    }),
  );

/** Each layer's kind, as far as known; see `layerKinds`. */
export type LayerKinds = ReadonlyMap<string, LayerKind>;

export const layerKinds = (
  defs: readonly { type: string; layer: LayerKind }[],
): LayerKinds => new Map(defs.map((def) => [def.type, def.layer]));

/** How a preset stands in `map.layers`, which otherwise holds map ids. */
export const presetItem = (id: string) => `@${id}`;

/** The preset an item of `map.layers` stands for, if it is one. */
export const presetIdOf = (item: string): string | undefined =>
  item.startsWith('@') ? item.slice(1) : undefined;

/** A preset a link or a document brought, not one of the account's. */
const LINK_PRESET_PREFIX = '~';

export const isLinkPreset = (id: string) => id.startsWith(LINK_PRESET_PREFIX);

/** Whether a map may be a preset's layer by its kind: any but the data layers. */
export const isPresettable = (type: string): boolean =>
  !DATA_TECHNOLOGIES.has(mapIndexById[type]?.technology ?? '');

/**
 * Whether a preset may hold this map here: neither a data layer nor an offline
 * map, which is this device's alone while a preset is the account's.
 */
export const canJoinPreset = (
  type: string,
  cachedMaps: readonly { type: string }[],
): boolean => isPresettable(type) && !cachedMaps.some((cm) => cm.type === type);

/** The preset's layers with removed ones mapped to their successors, deduplicated. */
export function presetLayers(preset: {
  layers: readonly PresetLayer[];
}): PresetLayer[] {
  const seen = new Set<string>();

  return preset.layers.flatMap((layer) =>
    resolveLayerAlias(layer.type).flatMap((type) => {
      if (seen.has(type) || !isPresettable(type)) {
        return [];
      }

      seen.add(type);

      // Its shading, layers and colour are the map's own, not the copy's.
      return [{ type, setup: compactSetup(usageOf(layer.setup)) }];
    }),
  );
}

/**
 * Layers as a preset holds them, one of each map: a map drawn twice keeps its
 * upper drawing's opacity, in its place, and is a base map if either is.
 * Base maps go to the bottom.
 */
export function mergeLayers(
  layers: readonly PresetLayer[],
  nativeKind: (type: string) => LayerKind | undefined,
): PresetLayer[] {
  const merged: PresetLayer[] = [];

  const kindOf = (l: PresetLayer) => l.setup.kind ?? nativeKind(l.type);

  for (const layer of layers) {
    const i = merged.findIndex((l) => l.type === layer.type);

    if (i === -1) {
      merged.push(layer);
    } else {
      const [lower] = merged.splice(i, 1);

      merged.push(
        kindOf(lower!) === 'base' && kindOf(layer) !== 'base'
          ? { type: layer.type, setup: { ...layer.setup, kind: 'base' } }
          : layer,
      );
    }
  }

  const isBase = (l: PresetLayer) => kindOf(l) === 'base';

  return [...merged.filter(isBase), ...merged.filter((l) => !isBase(l))];
}

/** A layer's kind in a preset: its setup's switch, else the map's own. */
export const memberKind = (
  layer: { type: string; setup: LayerSetup },
  nativeKinds: LayerKinds,
) => layer.setup.kind ?? nativeKinds.get(layer.type);

/** A preset with a base map takes the base map's place; one without lies over it. */
export const presetKind = (
  preset: MapPreset,
  nativeKinds: LayerKinds,
): LayerKind =>
  preset.layers.some((layer) => memberKind(layer, nativeKinds) === 'base')
    ? 'base'
    : 'overlay';

/** What a preset holds, as compared to tell a copy of it; parsed for a fixed key order. */
const presetContent = (preset: MapPreset) =>
  JSON.stringify(MapPresetSchema.parse({ ...preset, id: '' }));

/**
 * The stack with its presets copied out, as a link or a document carries
 * them: each numbered from 1 in stack order, its item `@<n>`. One not found
 * is left out.
 */
export function inlinePresets(
  layers: readonly string[],
  find: (id: string) => MapPreset | undefined,
): { layers: string[]; presets: MapPreset[] } {
  const presets: MapPreset[] = [];

  return {
    layers: layers.flatMap((item) => {
      const id = presetIdOf(item);

      const preset = id === undefined ? undefined : find(id);

      if (id === undefined) {
        return [item];
      }

      if (!preset) {
        return [];
      }

      const n = String(presets.length + 1);

      presets.push({ ...preset, id: n });

      return [presetItem(n)];
    }),
    presets,
  };
}

/**
 * The presets a link or a document carries inline, each named in `layers` by
 * its own id: one the same as one of the account's stands for it, so a link
 * of one's own map turns its presets back on; the rest become link presets.
 */
export function adoptPresets(
  layers: readonly string[],
  inline: readonly MapPreset[],
  own: readonly MapPreset[],
  tag: string,
  same: (a: MapPreset, b: MapPreset) => boolean = (a, b) =>
    presetContent(a) === presetContent(b),
): { layers: string[]; linkPresets: MapPreset[] } {
  const ids = new Map<string, string>();

  const linkPresets: MapPreset[] = [];

  for (const preset of inline) {
    const match = own.find((o) => same(o, preset));

    if (match) {
      ids.set(preset.id, match.id);
    } else {
      const id = `${LINK_PRESET_PREFIX}${tag}${preset.id}`;

      ids.set(preset.id, id);

      linkPresets.push({ ...preset, id });
    }
  }

  return {
    layers: layers.flatMap((item) => {
      const id = presetIdOf(item);

      if (id === undefined) {
        return [item];
      }

      const to = ids.get(id);

      return to === undefined ? [] : [presetItem(to)];
    }),
    linkPresets,
  };
}
