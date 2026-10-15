import type { ExportPrices } from '@shared/exportPrices.js';
import type { IntegratedLayerDef } from '@shared/mapDefinitions.js';

type TileLayerDef = Extract<IntegratedLayerDef, { technology: 'tile' }>;

export type ExportedLayerDef = TileLayerDef & {
  /** The API's map `type`. */
  exportType: string;
  coverageUrl?: string;
};

/**
 * A tile layer as the offline export and the offline maps take it: itself, or
 * the stand-in its `offlineExport` names.
 */
export function exportedAs(
  def: IntegratedLayerDef | undefined,
): ExportedLayerDef | undefined {
  if (def?.technology !== 'tile') {
    return undefined;
  }

  const { detail: _detail, offlineExport, ...rest } = def;

  if (!offlineExport) {
    return { ...rest, exportType: def.type };
  }

  const { type, ...standIn } = offlineExport;

  return { ...rest, subdomains: undefined, ...standIn, exportType: type };
}

/**
 * {@link exportedAs}, priced — `undefined` for a layer the API makes no
 * packages of, whose tiles aren't ours to hand out.
 */
export function exportedLayer(
  def: IntegratedLayerDef | undefined,
  prices: ExportPrices | null,
): (ExportedLayerDef & { creditsPerMTile: number }) | undefined {
  const exported = exportedAs(def);

  const creditsPerMTile = exported && prices?.[exported.exportType];

  return exported && creditsPerMTile !== undefined
    ? { ...exported, creditsPerMTile }
    : undefined;
}

/**
 * What an offline map was downloaded from: its source layer, or that layer's
 * stand-in where the map recorded the stand-in's `exportType`. A map without
 * one holds the layer's own tiles.
 */
export function cachedMapSource(
  cm: { exportType?: string },
  sourceDef: IntegratedLayerDef | undefined,
): ExportedLayerDef | IntegratedLayerDef | undefined {
  return sourceDef?.technology === 'tile' &&
    sourceDef.offlineExport &&
    cm.exportType === sourceDef.offlineExport.type
    ? exportedAs(sourceDef)
    : sourceDef;
}
