import {
  type CustomLayerDef,
  type IntegratedLayerDef,
  type IsWmsLayerDef,
  type LayerDef,
  type MapIndexEntry,
  RENDERER_ROUTES,
} from '@shared/mapDefinitions.js';

/**
 * The ids of every WMS layer — built-in, from the catalog (`libraryIndexSelector`)
 * or the user's own — loaded or not.
 */
const wmsLayerTypes = (
  libraryIndex: readonly MapIndexEntry[],
  customLayers: CustomLayerDef[],
): string[] =>
  [...libraryIndex, ...customLayers]
    .filter((def) => def.technology === 'wms')
    .map((def) => def.type);

/**
 * Every WMS layer, the user's own among them — each one describes itself. A
 * library map is left out until its body is in `loaded`.
 */
export function getWmsLayerDefs(
  libraryIndex: readonly MapIndexEntry[],
  customLayers: CustomLayerDef[],
  loaded: Readonly<Record<string, IntegratedLayerDef>>,
): LayerDef<IsWmsLayerDef, IsWmsLayerDef>[] {
  return wmsLayerTypes(libraryIndex, customLayers).flatMap((type) => {
    const def = loaded[type] ?? customLayers.find((d) => d.type === type);

    return def?.technology === 'wms'
      ? [def as LayerDef<IsWmsLayerDef, IsWmsLayerDef>]
      : [];
  });
}

/** Layers whose legend lives on an external page. */
export const EXTERNAL_LEGENDS: Record<string, string> = {
  O: 'https://wiki.openstreetmap.org/wiki/Standard_tile_layer/Key',
};

/** The layers the legend has something to say about; it shows nothing for the rest. */
export function getLegendLayers(
  libraryIndex: readonly MapIndexEntry[],
  customLayers: CustomLayerDef[],
): Set<string> {
  return new Set([
    ...Object.keys(RENDERER_ROUTES),
    ...Object.keys(EXTERNAL_LEGENDS),
    ...wmsLayerTypes(libraryIndex, customLayers),
  ]);
}

/** The shown layers that have a legend, in their own order. */
export function getActiveLegendLayers(
  layers: readonly string[],
  libraryIndex: readonly MapIndexEntry[],
  customLayers: CustomLayerDef[],
): string[] {
  const legendLayers = getLegendLayers(libraryIndex, customLayers);

  return layers.filter((layer) => legendLayers.has(layer));
}

/** Whether any of the shown layers has a legend to open. */
export function hasLegend(
  layers: readonly string[],
  libraryIndex: readonly MapIndexEntry[],
  customLayers: CustomLayerDef[],
): boolean {
  return getActiveLegendLayers(layers, libraryIndex, customLayers).length > 0;
}
