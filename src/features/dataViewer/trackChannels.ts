import { lineSegments } from '@shared/geoutils.js';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { TrackLine } from './trackSelection.js';

/** Per-point channels live under this property, one array per channel. */
const COORD_PROPERTIES = 'coordinateProperties';

/** Live tracking writes its times here instead. */
export const COORD_TIMES = 'coordTimes';

/** The times channel under {@link COORD_PROPERTIES}, which readers prefer. */
export const TIMES = 'times';

/** One per-point array, laid out per segment alongside the coordinates. */
export interface Channel {
  key: string;
  segments: unknown[][];
}

/**
 * Channels whose value belongs to its own vertex rather than to the stretch
 * around it: a time has to keep matching the place it was recorded at, and an
 * arithmetic mean of 350° and 10° is 180°.
 */
const PER_VERTEX = new Set([TIMES, 'courses', 'bearings']);

/**
 * The mean of a run of samples, or `undefined` where they are not all numbers —
 * which is what says the run has to fall back to its own vertex's value. Whole
 * numbers stay whole: heart rate and cadence have no fractional form to export.
 */
export function meanSample(values: unknown[]): number | undefined {
  let sum = 0;

  let whole = true;

  for (const value of values) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return undefined;
    }

    whole &&= Number.isInteger(value);

    sum += value;
  }

  if (values.length === 0) {
    return undefined;
  }

  const mean = sum / values.length;

  return whole ? Math.round(mean) : mean;
}

/** Whether this channel may be averaged over the points a vertex stands for. */
export function isAveragable(channel: Channel): boolean {
  return !PER_VERTEX.has(channel.key);
}

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/**
 * A per-point array laid out per segment, or `null` where it does not line up
 * with the coordinates — togeojson nests it per segment for a `MultiLineString`
 * and keeps it flat for a `LineString`. A misfit is carried over untouched.
 */
function alignToSegments(raw: unknown, lengths: number[]): unknown[][] | null {
  if (!Array.isArray(raw)) {
    return null;
  }

  if (
    raw.length === lengths.length &&
    raw.every((s, i) => Array.isArray(s) && s.length === lengths[i])
  ) {
    return raw as unknown[][];
  }

  if (raw.length === lengths.reduce((a, b) => a + b, 0)) {
    let at = 0;

    return lengths.map((len) => {
      const from = at;

      at += len;

      return raw.slice(from, at);
    });
  }

  return null;
}

/**
 * The feature with its times where every reader looks. Some writers put them at
 * the root as `coordTimes`; both spellings are read across the app, but only
 * `coordinateProperties` is ever written back, so a root-spelled track would
 * export without its `<time>`s. A `coordTimes` that is not a per-point array is
 * somebody's own data column and stays where it is.
 */
export function withCanonicalTimes<G extends Geometry | null>(
  feature: Feature<G>,
): Feature<G> {
  const props = feature.properties;

  const times = props?.[COORD_TIMES];

  if (!props || !Array.isArray(times)) {
    return feature;
  }

  const cp = asRecord(props[COORD_PROPERTIES]);

  // Not a shape we can add to, so nothing here is safe to move.
  if (cp === undefined && props[COORD_PROPERTIES] !== undefined) {
    return feature;
  }

  const { [COORD_TIMES]: _root, ...rest } = props;

  return {
    ...feature,
    // The nested spelling wins where a feature carries both, as readers take it.
    properties: { ...rest, [COORD_PROPERTIES]: { [TIMES]: times, ...cp } },
  };
}

/** The collection's features, all of them, with the canonical times spelling. */
export function withCanonicalTimesAll<T extends FeatureCollection>(fc: T): T {
  const features = fc.features.map(withCanonicalTimes);

  return features.every((feature, i) => feature === fc.features[i])
    ? fc
    : { ...fc, features };
}

/**
 * The feature's per-point channels, laid out per segment alongside its own
 * coordinates. Anything that does not line up with them is left out — which is
 * why the lengths are taken from the geometry here rather than by each caller.
 */
export function readChannels(feature: TrackLine): Channel[] {
  const lengths = lineSegments(feature.geometry).map(
    (segment) => segment.length,
  );

  const props = feature.properties;

  const cp = asRecord(props?.[COORD_PROPERTIES]) ?? {};

  // A file can spell the times at the root instead. It is the same channel, and
  // `coordinateProperties` is where every reader looks first.
  const candidates =
    TIMES in cp ? cp : { ...cp, [TIMES]: props?.[COORD_TIMES] };

  return Object.entries(candidates).flatMap(([key, value]) => {
    const segments = alignToSegments(value, lengths);

    return segments ? [{ key, segments }] : [];
  });
}

/**
 * Writes the channels back, `take` picking the points each output segment
 * keeps. `flat` must say what the geometry being written does: togeojson nests
 * the arrays per segment for a `MultiLineString` and keeps them flat for a
 * `LineString`, and a mismatch silently loses every per-point value on export.
 */
export function writeChannels(
  properties: Record<string, unknown>,
  channels: Channel[],
  flat: boolean,
  take: (channel: Channel) => unknown[][],
): void {
  const cp = { ...asRecord(properties[COORD_PROPERTIES]) };

  for (const channel of channels) {
    const taken = take(channel);

    cp[channel.key] = flat ? (taken[0] ?? []) : taken;
  }

  if (Object.keys(cp).length > 0) {
    properties[COORD_PROPERTIES] = cp;
  }

  // Times read out of the root spelling are written back under
  // `coordinateProperties`, so the root one would be left standing and stale.
  if (channels.some((channel) => channel.key === TIMES)) {
    delete properties[COORD_TIMES];
  }
}
