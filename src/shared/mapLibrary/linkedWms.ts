import type { LayerSettings } from '@features/map/model/actions.js';
import type {
  CustomLayerDef,
  IntegratedLayerDef,
  IsWmsLayerDef,
} from '@shared/mapDefinitions.js';

/** A WMS map with the layers picked in the layers panel, as it is drawn. */
export const withPickedLayers = <T extends IsWmsLayerDef & { type: string }>(
  def: T,
  layersSettings: Readonly<Record<string, LayerSettings>>,
): T => {
  const picked = layersSettings[def.type]?.wmsLayers;

  return picked ? { ...def, layers: picked } : def;
};

/** The library maps custom WMS maps are linked to. */
export const wmsSources = (customLayers: readonly CustomLayerDef[]): string[] =>
  customLayers.flatMap((def) =>
    def.technology === 'wms' && def.source ? [def.source] : [],
  );

/**
 * A custom WMS map linked to a library one as drawn: the source's server,
 * zooms, tiling and coverage, with its own name, icon and layers. Until the
 * source is loaded the map is left as stored.
 */
export function withWmsSource<T extends CustomLayerDef>(
  def: T,
  defs: Readonly<Record<string, IntegratedLayerDef>>,
): T {
  if (def.technology !== 'wms' || !def.source) {
    return def;
  }

  const source = defs[def.source];

  if (source?.technology !== 'wms') {
    return def;
  }

  return {
    ...def,
    url: source.url,
    minZoom: source.minZoom,
    maxNativeZoom: source.maxNativeZoom,
    tiled: source.tiled,
    bbox: source.bbox,
  };
}
