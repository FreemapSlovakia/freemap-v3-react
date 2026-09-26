import {
  type Shading,
  ShadingSchema,
} from '@features/parameterizedShading/model/Shading.js';
import {
  type CustomLayerDef,
  hasShadingLayer,
  integratedLayerDefMap,
} from '@shared/mapDefinitions.js';
import z from 'zod';

export const MapCombinationOverlaySchema = z.object({
  type: z.string(),
  opacity: z.number().optional(),
});

export type MapCombinationOverlay = z.infer<typeof MapCombinationOverlaySchema>;

/**
 * A saved set of layers, acting as a base map when it has one (active until
 * another is picked) and as an overlay otherwise; its opacities apply while active.
 */
export const MapCombinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconSpec: z.string().optional(),
  base: z.string().optional(),
  overlays: z.array(MapCombinationOverlaySchema),
  shading: ShadingSchema.optional(),
});

export type MapCombination = z.infer<typeof MapCombinationSchema>;

/** Drops invalid items rather than failing the whole settings object. */
export const MapCombinationArrayCompatSchema = z
  .array(z.unknown())
  .transform((items) =>
    items.flatMap((item) => {
      const ok = MapCombinationSchema.safeParse(item);

      return ok.success ? [ok.data] : [];
    }),
  );

/**
 * An active combination is marked in `map.layers` (and so in `layers=`) beside
 * its real layers; the prefix lets the URL parser keep it without knowing the
 * account's combinations.
 */
export const combinationMarker = (id: string) => `_${id}`;

// Layer types are alphanumeric, and `encodeURIComponent` leaves `_` alone.
export const isCombinationMarker = (type: string) => type.startsWith('_');

/** The layers alone, for whatever reports or counts them. */
export const withoutMarkers = (layers: readonly string[]) =>
  layers.filter((type) => !isCombinationMarker(type));

/** `i` hides the interactive layer rather than showing one: a combination leaves it to the user. */
export const isCombinable = (type: string) => type !== 'i';

/** Each known layer type and whether it is a base map or an overlay. */
export type LayerKinds = ReadonlyMap<string, 'base' | 'overlay'>;

export const layerKinds = (
  defs: readonly { type: string; layer: 'base' | 'overlay' }[],
): LayerKinds => new Map(defs.map((def) => [def.type, def.layer]));

/**
 * The combination as it can be shown now: retired layers swapped for their
 * successors, unknown ones and ones no longer of their kind (a custom map can
 * be edited from base to overlay) dropped. `undefined` when its base is.
 */
export function resolveCombination(
  combination: MapCombination,
  kinds: LayerKinds,
): MapCombination | undefined {
  const resolve = (type: string, kind: 'base' | 'overlay') => {
    const to = integratedLayerDefMap[type]?.superseededBy ?? type;

    return kinds.get(to) === kind && isCombinable(to) ? to : undefined;
  };

  const base =
    combination.base === undefined
      ? undefined
      : resolve(combination.base, 'base');

  if (combination.base !== undefined && base === undefined) {
    return undefined;
  }

  const overlays: MapCombinationOverlay[] = [];

  for (const overlay of combination.overlays) {
    const type = resolve(overlay.type, 'overlay');

    if (type && !overlays.some((o) => o.type === type)) {
      overlays.push({ ...overlay, type });
    }
  }

  return { ...combination, base, overlays };
}

/** The combination's layers, base map first. */
export const combinationLayers = (
  combination: Pick<MapCombination, 'base' | 'overlays'>,
): string[] => [
  ...(combination.base === undefined ? [] : [combination.base]),
  ...combination.overlays.map((o) => o.type),
];

/**
 * Whether it combines anything: two layers at least, or a single parametric
 * shading one, which carries its shading settings.
 */
export const isWorthSaving = (
  combination: MapCombination,
  customLayers: readonly CustomLayerDef[],
): boolean => {
  const layers = combinationLayers(combination);

  return (
    layers.length > 1 ||
    (layers.length === 1 && hasShadingLayer(layers, customLayers))
  );
};

/** Carried only with a shading layer; `current` is the map's own when none was taken yet. */
export const combinationShading = (
  combination: Pick<MapCombination, 'base' | 'overlays' | 'shading'>,
  customLayers: readonly CustomLayerDef[],
  current: Shading,
): Shading | undefined =>
  hasShadingLayer(combinationLayers(combination), customLayers)
    ? (combination.shading ?? current)
    : undefined;

// Shared, so a selector's result keeps its identity in the common case.
const NONE: MapCombination[] = [];

/**
 * The active combinations, resolved, in the order they were activated. One with
 * a base map counts only while that base map is on.
 */
export function activeCombinations(
  combinations: readonly MapCombination[],
  layers: readonly string[],
  kinds: LayerKinds,
): MapCombination[] {
  if (!layers.some(isCombinationMarker)) {
    return NONE;
  }

  return layers.flatMap((type) => {
    if (!isCombinationMarker(type)) {
      return [];
    }

    const combination = combinations.find(
      (c) => combinationMarker(c.id) === type,
    );

    const resolved = combination && resolveCombination(combination, kinds);

    return resolved &&
      (resolved.base === undefined || layers.includes(resolved.base))
      ? [resolved]
      : [];
  });
}

/** The opacity an active combination sets for a layer; the last activated wins. */
export function combinationOpacity(
  active: readonly MapCombination[],
  type: string,
): number | undefined {
  for (let i = active.length - 1; i >= 0; i--) {
    const overlay = active[i]!.overlays.find((o) => o.type === type);

    if (overlay?.opacity !== undefined) {
      return overlay.opacity;
    }
  }

  return undefined;
}

/**
 * `layers` with the given active combinations taken off: their markers and
 * their overlays, except those another remaining active one also holds.
 */
export function withoutCombinations(
  layers: readonly string[],
  leaving: readonly MapCombination[],
  active: readonly MapCombination[],
): string[] {
  const staying = active.filter((c) => !leaving.some((l) => l.id === c.id));

  const held = new Set(staying.flatMap((c) => c.overlays.map((o) => o.type)));

  const dropped = new Set(
    leaving.flatMap((c) => [
      combinationMarker(c.id),
      ...c.overlays.map((o) => o.type).filter((type) => !held.has(type)),
    ]),
  );

  return layers.filter((type) => !dropped.has(type));
}

/**
 * The layers once `combination` (resolved) is applied, first taking off the
 * previous version it `replaces`; `off` when `toggle` took an active
 * overlay-only one off instead.
 */
export function applyCombinationToLayers(
  layers: readonly string[],
  combination: MapCombination,
  active: readonly MapCombination[],
  { toggle, replaces }: { toggle?: boolean; replaces?: MapCombination } = {},
): { layers: string[]; off: boolean } {
  const current = replaces
    ? withoutCombinations(layers, [replaces], active)
    : layers;

  const marker = combinationMarker(combination.id);

  const own = combination.overlays.map((o) => o.type);

  const others = active.filter((c) => c.id !== combination.id);

  // The map has one shading, so a combination carrying one takes off any
  // other active combination that does.
  const rivals = combination.shading ? others.filter((c) => c.shading) : [];

  if (combination.base === undefined) {
    // Overlay-only: toggled like any overlay.
    if (toggle && current.includes(marker)) {
      return {
        layers: withoutCombinations(current, [combination], active),
        off: true,
      };
    }

    const rest = withoutCombinations(current, rivals, active);

    return {
      layers: [
        ...rest.filter((type) => type !== marker),
        ...own.filter((type) => !rest.includes(type)),
        marker,
      ],
      off: false,
    };
  }

  // Replaces the overlays on the map, except those of the overlay-only
  // combinations that are on and the user's own `i`; picked again, it
  // restores its own set.
  const keptCombinations = others.filter(
    (c) => c.base === undefined && !rivals.includes(c),
  );

  const kept = current.filter(
    (type) =>
      !isCombinable(type) ||
      keptCombinations.some(
        (c) =>
          combinationMarker(c.id) === type ||
          c.overlays.some((o) => o.type === type),
      ),
  );

  return {
    layers: [
      combination.base,
      ...own,
      ...kept.filter((type) => !own.includes(type)),
      marker,
    ],
    off: false,
  };
}
