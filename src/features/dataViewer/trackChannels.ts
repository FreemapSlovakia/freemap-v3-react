import { lineSegments } from '@shared/geoutils.js';
import type { TrackLine } from './trackSelection.js';

/** Per-point channels live under this property, one array per channel. */
const COORD_PROPERTIES = 'coordinateProperties';

/** Live tracking writes its times here instead. */
const COORD_TIMES = 'coordTimes';

/** One per-point array, laid out per segment alongside the coordinates. */
export interface Channel {
  root: boolean;
  key: string;
  segments: unknown[][];
}

/**
 * Channels whose value belongs to its own vertex rather than to the stretch
 * around it: a time has to keep matching the place it was recorded at, and an
 * arithmetic mean of 350° and 10° is 180°.
 */
const PER_VERTEX = new Set(['coordTimes', 'times', 'courses', 'bearings']);

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
 * The feature's per-point channels, laid out per segment alongside its own
 * coordinates. Anything that does not line up with them is left out — which is
 * why the lengths are taken from the geometry here rather than by each caller.
 */
export function readChannels(feature: TrackLine): Channel[] {
  const lengths = lineSegments(feature.geometry).map(
    (segment) => segment.length,
  );

  const props = feature.properties;

  const candidates = [
    ...Object.entries(asRecord(props?.[COORD_PROPERTIES]) ?? {}).map(
      ([key, value]) => ({ root: false, key, value }),
    ),
    { root: true, key: COORD_TIMES, value: props?.[COORD_TIMES] },
  ];

  return candidates.flatMap(({ root, key, value }) => {
    const segments = alignToSegments(value, lengths);

    return segments ? [{ root, key, segments }] : [];
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

    const value = flat ? (taken[0] ?? []) : taken;

    if (channel.root) {
      properties[channel.key] = value;
    } else {
      cp[channel.key] = value;
    }
  }

  if (Object.keys(cp).length > 0) {
    properties[COORD_PROPERTIES] = cp;
  }
}
