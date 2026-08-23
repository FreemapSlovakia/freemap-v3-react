import type { Peak } from '../api.js';
import type { PanoramaLabel } from './types.js';

/**
 * How the two halves of the haze are set: how far a name has to carry, in
 * kilometres, and what the rank measures — `0` for a summit's own metres, `1`
 * for the angle it subtends. See `doc/panorama.md`.
 */
export interface LabelWeighting {
  hazeKm: number;
  distanceWeight: number;
}

/** Multiples of the haze distance past which a summit goes unnamed outright. */
const HAZE_CUTOFF = 3;

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
 * The haze term then says a summit has to be seeable, not merely big. Why those
 * shapes, and what the tuning is worth, is in `doc/panorama.md`.
 */
function labelRank(
  label: PanoramaLabel,
  { hazeKm, distanceWeight }: LabelWeighting,
): number {
  const distance = Math.max(label.distance, 1);

  /** How much a subject's own metres are worth at that distance: falls with it. */
  const worth =
    (hazeKm > 0 ? Math.exp(-distance / (hazeKm * 1000)) : 1) /
    distance ** distanceWeight;

  // Ranks a source that measures no dominance below every real summit, while
  // the dominance filter passes it. A trap for the next source; see `TODO.md`.
  const dominance = label.dominance ?? 1;

  // Divided rather than multiplied where the dominance is negative. It is
  // signed by design — a top that never rises clear of its own ridge says by
  // how much the ridge stands over it — and scaling a negative number *down*
  // raises it, so multiplying would have made a subordinate top rank better the
  // further off it was, which is precisely backwards.
  return dominance >= 0 ? dominance * worth : dominance / worth;
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
    }));
}

/**
 * The labels worth naming at all, best first: ranked by the weighting, then cut
 * by how much a summit stands out and how far the air carries a name. What
 * survives this is what the layout thins down to what fits.
 *
 * The far cut is ours rather than the service's: its own `range` bounds the
 * terrain the render sees, so asking it for one would take the far ridges out
 * of the picture and cost a render.
 */
export function candidateLabels(
  labels: PanoramaLabel[],
  weighting: LabelWeighting,
  minDominance: number,
): PanoramaLabel[] {
  const ceiling = hazeCutoffM(weighting);

  // `NO_DOMINANCE_FILTER` is below every real figure, so the "Any" stop needs
  // no case of its own.
  return rankLabels(labels, weighting).filter(
    (label) =>
      (label.dominance ?? Infinity) >= minDominance &&
      label.distance <= ceiling,
  );
}
