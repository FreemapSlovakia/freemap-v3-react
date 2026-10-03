import type { LayerSettings } from './actions.js';

export type LayerKind = 'base' | 'overlay';

/**
 * Whether a library map may be switched between base map and overlay: a WMS is
 * asked for transparent or not, shading draws its background or none, and
 * opaque tiles blend by opacity. A vector map has no opacity to blend by.
 */
export const canSwitchKind = (technology: string | undefined): boolean =>
  technology === 'wms' ||
  technology === 'parametricShading' ||
  technology === 'tile';

/** Kinds set by a link, then by the user, by map; the link's win. */
export function kindOverrides(
  layersSettings: Readonly<Record<string, LayerSettings>>,
  linkKinds: Readonly<Record<string, LayerKind>>,
): Record<string, LayerKind> {
  const overrides: Record<string, LayerKind> = {};

  for (const [type, settings] of Object.entries(layersSettings)) {
    if (settings.layer) {
      overrides[type] = settings.layer;
    }
  }

  return { ...overrides, ...linkKinds };
}

/** A library map with the kind it is switched to, if it may be. */
export function withKind<
  T extends { type: string; layer: LayerKind; technology?: string },
>(def: T, overrides: Readonly<Record<string, LayerKind>>): T {
  const kind = overrides[def.type];

  if (!kind || kind === def.layer || !canSwitchKind(def.technology)) {
    return def;
  }

  // Opaque tiles at full opacity would hide every layer beneath. A base map's
  // body has no `defaultOpacity` to override this.
  return def.technology === 'tile' && kind === 'overlay'
    ? { ...def, layer: kind, defaultOpacity: 0.5 }
    : { ...def, layer: kind };
}
