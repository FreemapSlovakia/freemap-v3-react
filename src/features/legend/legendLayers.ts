import {
  type CustomLayerDef,
  type IsWmsLayerDef,
  integratedLayerDefs,
  type LayerDef,
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

/** The layers the legend has something to say about; it shows nothing for the rest. */
export function getLegendLayers(customLayers: CustomLayerDef[]): Set<string> {
  return new Set([
    'A',
    'T',
    'C',
    'K',
    'X',
    ...getWmsLayerDefs(customLayers).map((def) => def.type),
  ]);
}
