import {
  type CustomLayerDef,
  type IsWmsLayerDef,
  integratedLayerDefs,
  type LayerDef,
  RENDERER_ROUTES,
} from '@shared/mapDefinitions.js';

/** Every WMS layer, the user's own among them — each one describes itself. */
export function getWmsLayerDefs(
  customLayers: CustomLayerDef[],
): LayerDef<IsWmsLayerDef, IsWmsLayerDef>[] {
  return [...customLayers, ...integratedLayerDefs].filter(
    (def): def is LayerDef<IsWmsLayerDef, IsWmsLayerDef> =>
      def.technology === 'wms',
  );
}

/** Layers whose legend lives on an external page. */
export const EXTERNAL_LEGENDS: Record<string, string> = {
  O: 'https://wiki.openstreetmap.org/wiki/Standard_tile_layer/Key',
};

/** The layers the legend has something to say about; it shows nothing for the rest. */
export function getLegendLayers(customLayers: CustomLayerDef[]): Set<string> {
  return new Set([
    ...Object.keys(RENDERER_ROUTES),
    ...Object.keys(EXTERNAL_LEGENDS),
    ...getWmsLayerDefs(customLayers).map((def) => def.type),
  ]);
}

/** The shown layers that have a legend, in their own order. */
export function getActiveLegendLayers(
  layers: readonly string[],
  customLayers: CustomLayerDef[],
): string[] {
  const legendLayers = getLegendLayers(customLayers);

  return layers.filter((layer) => legendLayers.has(layer));
}

/** Whether any of the shown layers has a legend to open. */
export function hasLegend(
  layers: readonly string[],
  customLayers: CustomLayerDef[],
): boolean {
  return getActiveLegendLayers(layers, customLayers).length > 0;
}
