import type { ElevationCredit } from '@features/elevationChart/model/actions.js';
import {
  mergeAttributions,
  readElevationAttributions,
} from '@shared/elevation.js';
import type { Feature } from 'geojson';
import type { DataViewerState } from './reducer.js';

/**
 * What the chart may credit a loaded track's elevation to: our terrain model
 * where an override replaced every value, or where the drawn line was sampled
 * from it; a track kept as recorded draws measurements no terrain model
 * answered for, so it names no source at all.
 *
 * The credits come from the write that put them there
 * (`elevationAttributions`) plus whatever densifying the drawn line sampled on
 * top: a dense recording needs no densifying, so the render copy alone would
 * credit nobody.
 */
export function elevationCredit(
  { elevationDecision, elevationAttributions }: DataViewerState,
  drawn: Feature,
): ElevationCredit {
  const sampled = readElevationAttributions(drawn);

  // A line drawn from the terrain is credited for its own sampling (every model
  // that answered it), not the slice's, which may be another feature's update.
  return elevationDecision === 'all'
    ? {
        provenance: 'terrain-model',
        attributions: mergeAttributions(elevationAttributions, sampled),
      }
    : sampled.length > 0
      ? { provenance: 'terrain-model', attributions: sampled }
      : { provenance: 'recorded' };
}
