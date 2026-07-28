import type { Track, TrackPoint } from './model/types.js';

/**
 * The track the elevation chart shows: it needs one that actually carries
 * elevation, preferring the selected device, else the first that has it.
 */
export function resolveChartTrack(
  tracks: Track[],
  selectedToken: string | number | undefined,
): Track | undefined {
  const withElevation = tracks.filter((t) => hasElevation(t.trackPoints));

  return (
    withElevation.find((t) => t.token === selectedToken) ?? withElevation[0]
  );
}

export function hasElevation(points: TrackPoint[]): boolean {
  let n = 0;

  for (const p of points) {
    if (
      typeof p.altitude === 'number' &&
      Number.isFinite(p.altitude) &&
      ++n >= 2
    ) {
      return true;
    }
  }

  return false;
}
