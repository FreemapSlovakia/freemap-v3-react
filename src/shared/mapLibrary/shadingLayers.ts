import {
  type CustomLayerDef,
  type IntegratedLayerDef,
  SHADING_SOURCE,
} from '@shared/mapDefinitions.js';
import { mapIndexById } from './mapIndex.js';

const shadingLayerDefOf = (
  type: string,
  customLayers: readonly CustomLayerDef[],
) => {
  const def =
    mapIndexById[type] ?? customLayers.find((def) => def.type === type);

  return def?.technology === 'parametricShading' ? def : undefined;
};

/** Whether any layer on the map is shaded by parameters. */
export const hasShadingLayer = (
  layers: readonly string[],
  customLayers: readonly CustomLayerDef[],
): boolean => layers.some((type) => shadingLayerDefOf(type, customLayers));

/**
 * Whether any layer on the map draws with the shared `map.shading` rather than
 * its own: a built-in shading layer, or a custom one that has none.
 */
export const hasSharedShadingLayer = (
  layers: readonly string[],
  customLayers: readonly CustomLayerDef[],
): boolean =>
  layers.some((type) => {
    const def = shadingLayerDefOf(type, customLayers);

    return def && !('shading' in def && def.shading);
  });

/**
 * A custom shading map as drawn: the shading source's tiles, zooms and premium
 * limit, with its own kind, name, icon and shading. A stored URL or source is
 * ignored; until the source is loaded the map is left as stored.
 */
export function withShadingSource<T extends CustomLayerDef>(
  def: T,
  source: IntegratedLayerDef | undefined,
): T {
  if (
    def.technology !== 'parametricShading' ||
    source?.technology !== 'parametricShading'
  ) {
    return def;
  }

  return {
    ...def,
    source: SHADING_SOURCE,
    url: source.url,
    maxNativeZoom: source.maxNativeZoom,
    scaleWithDpi: source.scaleWithDpi,
    minZoom: source.minZoom,
    premiumFromZoom: source.premiumFromZoom,
    zIndex: def.zIndex ?? (def.layer === 'overlay' ? source.zIndex : undefined),
  };
}
