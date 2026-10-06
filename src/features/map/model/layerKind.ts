import type { LayerSetup } from './layerSetup.js';

export type LayerKind = 'base' | 'overlay';

/** Drawn by the app itself, partly above every map; not part of a picture. */
export const DATA_TECHNOLOGIES: ReadonlySet<string> = new Set([
  'gallery',
  'wikipedia',
  'interactive',
  'radar',
  'viewshed',
]);

/**
 * Whether a map may be switched between base map and overlay: a WMS is asked
 * for transparent or not, shading and a solid colour draw a background or
 * none, and opaque tiles and vector maps blend by the opacity the user sets.
 * The data layers can't.
 */
export const canSwitchKind = (technology: string | undefined): boolean =>
  technology !== undefined && !DATA_TECHNOLOGIES.has(technology);

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

/** A map with the kind it is switched to, if it may be; its opacity is untouched. */
export function withKind<
  T extends { type: string; layer: LayerKind; technology?: string },
>(def: T, overrides: Readonly<Record<string, LayerKind>>): T {
  const kind = overrides[def.type];

  return !kind || kind === def.layer || !canSwitchKind(def.technology)
    ? def
    : { ...def, layer: kind };
}

/**
 * A def, possibly switched already by the map's own setup, with the kind a
 * preset's copy of it has instead.
 */
export const withMemberKind = <
  T extends { type: string; layer: LayerKind; technology?: string },
>(
  def: T,
  kind: LayerKind | undefined,
  nativeKind: LayerKind | undefined,
): T =>
  kind === undefined
    ? def
    : withKind(
        { ...def, layer: nativeKind ?? def.layer },
        { [def.type]: kind },
      );
