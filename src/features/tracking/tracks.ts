import { distance } from '@turf/distance';
import type { Track, TrackedDevice, TrackPoint } from './model/types.js';

/** What a watched device is drawn with when it names no color/width of its own. */
export const DEFAULT_TRACK_COLOR = '#7239a8';

export const DEFAULT_TRACK_WIDTH = 4;

/**
 * The live tracks with the settings of the watched device they belong to —
 * label, color, width, the split thresholds. The feed itself carries nothing
 * but points and a token.
 */
export function resolveTracks(
  tracks: Track[],
  trackedDevices: TrackedDevice[],
): Track[] {
  const byToken = new Map(trackedDevices.map((td) => [td.token, td]));

  return tracks.map((track) => ({ ...track, ...byToken.get(track.token) }));
}

/**
 * A track as the continuous runs it is made of: the device's split
 * distance/duration break the points wherever the feed jumped, so each run is
 * drawn, colorized and copied on its own.
 */
export function splitTrackSegments(
  track: Pick<Track, 'trackPoints' | 'splitDistance' | 'splitDuration'>,
): TrackPoint[][] {
  const segments: TrackPoint[][] = [];

  let curSegment: TrackPoint[] | null = null;

  let prevTp: TrackPoint | undefined;

  for (const tp of track.trackPoints) {
    if (
      prevTp &&
      ((typeof track.splitDistance === 'number' &&
        distance([tp.lon, tp.lat], [prevTp.lon, prevTp.lat], {
          units: 'meters',
        }) > track.splitDistance) ||
        (typeof track.splitDuration === 'number' &&
          tp.ts.getTime() - prevTp.ts.getTime() > track.splitDuration * 60000))
    ) {
      curSegment = null;
    }

    if (!curSegment) {
      curSegment = [];

      segments.push(curSegment);
    }

    curSegment.push(tp);

    prevTp = tp;
  }

  return segments;
}

/** Segments a line can be made of — a single point is neither drawn nor copied. */
export function trackLineSegments(
  track: Pick<Track, 'trackPoints' | 'splitDistance' | 'splitDuration'>,
): TrackPoint[][] {
  return splitTrackSegments(track).filter((segment) => segment.length >= 2);
}

/**
 * Whether there is anything the two copies can make a line of. Asked of the
 * segments rather than of the point count: a device that splits often can
 * report plenty of positions and still leave every run a single one.
 */
export function hasDrawableSegment(
  tracks: Track[],
  trackedDevices: TrackedDevice[],
  token?: string,
): boolean {
  return resolveTracks(tracks, trackedDevices).some(
    (track) =>
      (token === undefined || track.token === token) &&
      trackLineSegments(track).length > 0,
  );
}
