import type { LayerSetup } from './layerSetup.js';

export type LayerKind = 'base' | 'overlay';

/**
 * Whether a library map may be switched between base map and overlay: a WMS is
 * asked for transparent or not, shading and a solid colour draw a background or
 * none, and opaque tiles and vector maps blend by opacity. The data layers can't.
 */
export const canSwitchKind = (technology: string | undefined): boolean =>
  technology === 'wms' ||
  technology === 'parametricShading' ||
  technology === 'tile' ||
  technology === 'maplibre' ||
  technology === 'color';

/** The kinds the setups switch maps to, by map. */
export function kindOverrides(
  layerSetups: Readonly<Record<string, LayerSetup>>,
): Record<string, LayerKind> {
  const overrides: Record<string, LayerKind> = {};

  for (const [type, setup] of Object.entries(layerSetups)) {
    if (setup.kind) {
      overrides[type] = setup.kind;
    }
  }

  return overrides;
}

/** A library map with the kind it is switched to, if it may be. */
export function withKind<
  T extends { type: string; layer: LayerKind; technology?: string },
>(def: T, overrides: Readonly<Record<string, LayerKind>>): T {
  const kind = overrides[def.type];

  if (!kind || kind === def.layer || !canSwitchKind(def.technology)) {
    return def;
  }

  // Opaque tiles or a vector map's background at full opacity would hide every
  // layer beneath. A base map's body has no `defaultOpacity` to override this.
  return (def.technology === 'tile' || def.technology === 'maplibre') &&
    kind === 'overlay'
    ? { ...def, layer: kind, defaultOpacity: 0.5 }
    : { ...def, layer: kind };
}
