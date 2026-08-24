import type { Peak } from '../api.js';
import type { PanoramaLabel } from './types.js';

/**
 * Everything the user sets about the ranking: how far a name has to carry, what
 * the rank measures against distance — `0` for a summit's own metres, `1` for
 * the angle it subtends — and what a metre of prominence is worth beside a
 * metre of dominance. See `doc/panorama.md`.
 */
export interface LabelWeighting {
  hazeKm: number;
  distanceWeight: number;
  /** What a metre of prominence is worth; see {@link PROMINENCE_WEIGHT}. */
  prominenceWeight: number;
}

/** Multiples of the haze distance past which a summit goes unnamed outright. */
const HAZE_CUTOFF = 3;

/**
 * What a summit's rank is worth when only the depth lift brought it into view.
 * Where names compete for room, the one that can actually be seen takes it.
 */
const REVEALED_RANK_PENALTY = 0.5;

/**
 * What a metre of prominence is worth beside a metre of dominance. Tuned over
 * four viewpoints: below this the Tatra viewpoint still fails to name Rysy,
 * whose neighbours flatten its dominance; above it the effect saturates and
 * distant giants start taking the near field's names.
 */
export const PROMINENCE_WEIGHT = 0.3;

/** Where the service's own figures stop calling a match comfortable. */
export const PROM_TRUSTED_M = 50;

/** What a match past that is worth — provisional; see `doc/panorama.md`. */
export const PROM_DOUBTED_TRUST = 0.7;

/**
 * How much of a prominence to believe. The step is at 50 m because that is
 * where the service's own figures turn: 1.7% of matches inside it disagree
 * badly with the OSM elevation against 5.4% past 100 m.
 *
 * A step and not a ramp to zero, which is a different point: the service
 * matches two ways — position alone inside 150 m, position *and* elevation
 * agreeing out to 400 m — so the farthest matches are the corroborated ones,
 * and fading them out would discard the better evidence for being far.
 */
function matchTrust({ prominence, promDistM }: PanoramaLabel): number {
  return prominence === undefined
    ? 0
    : (promDistM ?? Infinity) <= PROM_TRUSTED_M
      ? 1
      : PROM_DOUBTED_TRUST;
}

/**
 * Metres past which the haze says not to name a summit at all, or `Infinity`
 * where the air is clear.
 *
 * The weighting alone cannot do this: it demotes, and the thinning keeps the
 * best name per stretch of horizon, so a giant alone in its stretch is named
 * however far its rank has fallen — pointing at empty sky.
 */
export function hazeCutoffM({ hazeKm }: LabelWeighting): number {
  return hazeKm > 0 ? hazeKm * 1000 * HAZE_CUTOFF : Infinity;
}

/**
 * What a label is worth naming for, weighing how much its subject stands above
 * its surroundings against how far away it is.
 *
 * Neither term alone will do, which is what `distanceWeight` picks between:
 * metres alone put a distant massif over a nearby hill that fills far more of
 * the frame, the angle it subtends puts a roadside knoll over the High Tatras.
 * The haze term then says a summit has to be seeable, not merely big — and one
 * that is only seeable because the lift raised it is demoted outright.
 *
 * Prominence answers what none of that can: dominance is measured from the
 * viewpoint, so a summit hemmed in by taller neighbours reads as unremarkable
 * however famous it is. Weighed in rather than swapped for, since it is missing
 * for half the peaks and rough for the small ones. Why those shapes, and what
 * the tuning is worth, is in `doc/panorama.md`.
 */
function labelRank(
  label: PanoramaLabel,
  { hazeKm, distanceWeight, prominenceWeight }: LabelWeighting,
): number {
  const distance = Math.max(label.distance, 1);

  /** How much a subject's own metres are worth at that distance: falls with it. */
  const worth =
    (hazeKm > 0 ? Math.exp(-distance / (hazeKm * 1000)) : 1) /
    distance ** distanceWeight;

  // A source measuring no dominance scores as a 1 m bump, which ranks it below
  // every real summit while the dominance filter still passes it. The trap for
  // the next source is now two-sided: supply a prominence without a dominance
  // and the fallback puts it *above* real summits instead. See `TODO.md`.
  const dominance = label.dominance ?? 1;

  // Both are metres of standing above the surroundings, so they are summed
  // *before* distance is applied, not after. Adding afterwards is the same
  // arithmetic wherever the total is positive, and wrong where it is not: the
  // negative branch divides, so a hemmed-in summit's dominance would be
  // multiplied by `√distance` while its prominence was divided by it, and no
  // prominence could ever lift it. That case is the whole point of the term —
  // "hemmed in by taller neighbours" is exactly what negative dominance says.
  //
  // Prominence is added and never thresholded: the service's figure is reliable
  // for ordering above ~300 m and noise below ~150 m, so a term proportional to
  // it discounts its own unreliable end.
  const stature =
    dominance + prominenceWeight * (label.prominence ?? 0) * matchTrust(label);

  // Divided rather than multiplied where that total is negative. It is signed
  // by design — a top that never rises clear of its own ridge says by how much
  // the ridge stands over it — and scaling a negative number *down* raises it,
  // so multiplying would have made a subordinate top rank better the further
  // off it was, which is precisely backwards.
  const rank = stature >= 0 ? stature * worth : stature / worth;

  if (!label.revealed) {
    return rank;
  }

  // Demoted rather than tiered below every seeable top: what the lift reveals
  // is usually the range the user unfolded the picture to see, and a strict
  // tier would give its name away to the near ridge hiding it. Signed the same
  // way, for the same reason.
  return rank >= 0
    ? rank * REVEALED_RANK_PENALTY
    : rank / REVEALED_RANK_PENALTY;
}

/**
 * The labels in the order the layout takes them, best first. The viewer's to
 * run rather than the render's, since the weighting is the user's: once per
 * render and per change of it, never per frame.
 */
export function rankLabels(
  labels: PanoramaLabel[],
  weighting: LabelWeighting,
): PanoramaLabel[] {
  return labels
    .map((label) => ({ label, rank: labelRank(label, weighting) }))
    .sort((a, b) => b.rank - a.rank)
    .map(({ label }) => label);
}

/** The renderer's peaks as labels, in no particular order; see {@link rankLabels}. */
export function labelsFromPeaks(peaks: Peak[]): PanoramaLabel[] {
  return peaks
    .filter((peak) => peak.visible && peak.name)
    .map((peak) => ({
      // The type too: an OSM id is unique per element kind, not across them, so
      // a node and a way could otherwise share a label id — and the id is what
      // says which name is picked and which React row is which.
      id: `peak/${peak.type}/${peak.osm_id}`,
      name: peak.name,
      lat: peak.lat,
      lon: peak.lon,
      ele: peak.ele ?? null,
      distance: peak.distance,
      azimuth: peak.azimuth,
      y: peak.y,
      dominance: peak.dominance,
      // Left out rather than zeroed where the service knows none: absent is
      // "unknown", and a mountain nobody could match is not a flat one.
      ...(peak.prominence == null ? {} : { prominence: peak.prominence }),
      ...(peak.prom_dist_m == null ? {} : { promDistM: peak.prom_dist_m }),
      revealed: peak.revealed,
    }));
}

/** Which of the ranked labels are worth naming at all; see {@link candidateLabels}. */
export interface LabelFilters {
  /** Metres a summit must stand above its surroundings; see `DOMINANCE_STEPS_M`. */
  minDominance: number;
  /** Whether summits only the depth lift brings into view are named. */
  showRevealed: boolean;
}

/**
 * The labels worth naming at all, best first: ranked by the weighting, then cut
 * by how much a summit stands out, how far the air carries a name, and whether
 * one the eye cannot actually see may carry one. What survives this is what the
 * layout thins down to what fits.
 *
 * The far cut is ours rather than the service's: narrowing its `range` to make
 * it would take the far ridges out of the picture as well as out of the names,
 * and cost a render.
 */
export function candidateLabels(
  labels: PanoramaLabel[],
  weighting: LabelWeighting,
  { minDominance, showRevealed }: LabelFilters,
): PanoramaLabel[] {
  const ceiling = hazeCutoffM(weighting);

  // `NO_DOMINANCE_FILTER` is below every real figure, so the "Any" stop needs
  // no case of its own.
  return rankLabels(labels, weighting).filter(
    (label) =>
      (label.dominance ?? Infinity) >= minDominance &&
      label.distance <= ceiling &&
      (showRevealed || !label.revealed),
  );
}
