import type { Feature } from 'geojson';

// What a feature actually was in its source file, decided deterministically at
// parse time (never re-derived from density/timestamps):
//   track    — a recorded GPS log (GPX <trk>, any TCX line)
//   route    — a planned route (GPX <rte>)
//   waypoint — a standalone point (GPX <wpt>, any Point/MultiPoint)
//   feature  — generic imported geometry (KML/GeoJSON lines, polygons, …)
export const FM_KINDS = ['track', 'route', 'waypoint', 'feature'] as const;

export type FmKind = (typeof FM_KINDS)[number];

/** Property key under which {@link FmKind} is stamped by `parseTrackFile`. */
export const FM_KIND = 'fm:kind';

export function isFmKind(value: unknown): value is FmKind {
  return (FM_KINDS as readonly unknown[]).includes(value);
}

/**
 * Reads the provenance kind stamped on a parsed feature, defaulting to
 * `'feature'` for anything unstamped or unrecognized.
 */
export function featureKind(feature: Feature): FmKind {
  const kind = feature.properties?.[FM_KIND];

  return isFmKind(kind) ? kind : 'feature';
}

/**
 * True for a recorded track or a planned route — the line-like kinds that earn
 * start/finish markers and a distance label. Generic imported geometry
 * (`'feature'`) and waypoints don't.
 */
export function isTrackOrRoute(feature: Feature): boolean {
  const kind = featureKind(feature);

  return kind === 'track' || kind === 'route';
}
