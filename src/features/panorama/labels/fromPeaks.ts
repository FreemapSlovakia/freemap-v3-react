import type { Peak } from '../api.js';
import type { PanoramaLabel } from './types.js';

/**
 * How far away a summit has to be before haze is more of the story than the
 * summit is. Not a cutoff — the falloff is gradual, and a giant far past it
 * still outranks a nearby bump — but by two or three times this the name is
 * for something that is a smudge on a good day and nothing on most.
 */
const HAZE_M = 120_000;

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
 * The square root alone still flattered the horizon, though: it is a slow
 * falloff, and the far field is *wide* — a ring at 150 km holds far more
 * mountains than one at 15 — so distant giants crowded out the near hills a
 * viewer can actually make out, and thinning the names took the near ones
 * first. The haze term is what says a summit has to be seeable, not just big:
 * it barely touches anything close and falls away hard past `HAZE_M`.
 *
 * A heuristic, and the one thing here worth re-tuning against real views.
 */
function labelRank(peak: Peak): number {
  const distance = Math.max(peak.distance, 1);

  /** How much a summit's own metres are worth at that distance: falls with it. */
  const worth = Math.exp(-distance / HAZE_M) / Math.sqrt(distance);

  // Divided rather than multiplied where the dominance is negative. It is
  // signed by design — a top that never rises clear of its own ridge says by
  // how much the ridge stands over it — and scaling a negative number *down*
  // raises it, so multiplying would have made a subordinate top rank better the
  // further off it was, which is precisely backwards and covers most of the
  // near field this weighting exists to protect. Either way the rank falls with
  // distance, and every top that stands clear outranks every one that doesn't.
  return peak.dominance >= 0 ? peak.dominance * worth : peak.dominance / worth;
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
