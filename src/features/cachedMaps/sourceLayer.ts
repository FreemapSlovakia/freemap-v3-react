import type { User } from '@features/auth/model/types.js';
import { isPremium } from '@features/premium/premium.js';
import {
  type CustomLayerDef,
  type IntegratedLayerDef,
  RETIRED_SOURCE_LAYERS,
} from '@shared/mapDefinitions.js';

/** The loaded library maps by id; see `integratedLayerDefMapSelector`. */
type SourceDefs = Readonly<Record<string, IntegratedLayerDef>>;

/** What a cached map takes from the layer it was made from while online. */
export type SourceLayerEnvelope = {
  minZoom: number | undefined;
  maxNativeZoom: number | undefined;
  premiumFromZoom: number | undefined;
};

function findSourceLayerDef(
  sourceType: string,
  customLayers: CustomLayerDef[],
  sourceDefs: SourceDefs,
) {
  return (
    sourceDefs[sourceType] ??
    customLayers.find((def) => def.type === sourceType) ??
    RETIRED_SOURCE_LAYERS[sourceType]
  );
}

/**
 * The zoom range and premium gate a cached map wears while it can reach the
 * network: those of its source layer, so that browsing past what was downloaded
 * behaves exactly as the layer itself would — deeper zooms and a checkerboard
 * where they are premium. `undefined` when the layer is no longer in the
 * registry (a deleted custom layer), leaving the map to stand on its own range.
 *
 * Every key is present, `undefined` included: the result is spread over the
 * map's own metadata, where a missing key would let the downloaded range through
 * instead of lifting it.
 */
export function sourceLayerEnvelope(
  sourceType: string,
  customLayers: CustomLayerDef[],
  sourceDefs: SourceDefs,
): SourceLayerEnvelope | undefined {
  const def = findSourceLayerDef(sourceType, customLayers, sourceDefs);

  if (!def) {
    return undefined;
  }

  return {
    minZoom: def.minZoom,
    maxNativeZoom: 'maxNativeZoom' in def ? def.maxNativeZoom : undefined,
    premiumFromZoom: 'premiumFromZoom' in def ? def.premiumFromZoom : undefined,
  };
}

/**
 * The deepest zoom a cached map of `sourceType` may be given for this user, or
 * `undefined` when the source layer gates nothing.
 *
 * Premium zooms are kept out of the download itself, not merely out of the view:
 * tiles on disk are shown offline whatever the layer says, so downloading them
 * would hand out a permanent copy of what the checkerboard is there to sell.
 */
export function premiumZoomLimit(
  sourceType: string,
  user: Pick<User, 'premiumExpiration'> | null,
  sourceDef: IntegratedLayerDef | undefined,
): number | undefined {
  if (isPremium(user)) {
    return undefined;
  }

  const def = sourceDef ?? RETIRED_SOURCE_LAYERS[sourceType];

  if (!def?.premiumFromZoom) {
    return undefined;
  }

  // a layer that renders a zoom deeper than it is asked for reaches its premium
  // tiles a zoom earlier, as Layers.tsx accounts for
  return (
    def.premiumFromZoom -
    ('scaleWithDpi' in def && def.scaleWithDpi ? 1 : 0) -
    1
  );
}
