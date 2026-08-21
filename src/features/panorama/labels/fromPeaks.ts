import type { Peak } from '../api.js';
import type { PanoramaLabel } from './types.js';

/**
 * What a summit is worth naming for, weighing how much it stands above its
 * surroundings against how far away it is.
 *
 * Neither term alone will do. Metres put a big distant massif over a nearby
 * hill that fills far more of the frame; metres over distance is the angle it
 * subtends, which puts a roadside knoll over the whole High Tatra range. The
 * square root sits between the two, so a summit has to be either close or
 * genuinely large to outrank one that is both a little.
 *
 * A heuristic, and the one thing here worth re-tuning against real views.
 */
function labelRank(peak: Peak): number {
  // Signed, and taken as it comes: a top that never rises clear of its own
  // ridge says by how much the ridge stands over it, which orders the near
  // field instead of tying it all at zero.
  return peak.dominance / Math.sqrt(Math.max(peak.distance, 1));
}

/**
 * The renderer's peaks as labels, **in rank order** — which is what the layout
 * takes them in, and doing it once per render rather than once per frame
 * matters: a rich view answers with the better part of a thousand summits.
 */
export function labelsFromPeaks(peaks: Peak[]): PanoramaLabel[] {
  return peaks
    .filter((peak) => peak.visible && peak.name)
    .map((peak) => ({
      id: `peak/${peak.osm_id}`,
      name: peak.name,
      lat: peak.lat,
      lon: peak.lon,
      ele: peak.ele ?? null,
      distance: peak.distance,
      azimuth: peak.azimuth,
      y: peak.y,
      rank: labelRank(peak),
      dominance: peak.dominance,
    }))
    .sort((a, b) => b.rank - a.rank);
}
