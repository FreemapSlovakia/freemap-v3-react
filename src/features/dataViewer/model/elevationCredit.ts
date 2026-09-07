import type { ElevationCredit } from '@features/elevationChart/model/actions.js';
import {
  mergeAttributions,
  readElevationAttributions,
} from '@shared/elevation.js';
import type { Feature } from 'geojson';
import type { DataViewerState } from './reducer.js';

/**
 * What the chart may credit a loaded track's elevation to. Only an override
 * replaces every value with our terrain model's; a track kept as recorded — or
 * one where the server merely filled the gaps — draws measurements no terrain
 * model answered for, so it names no source at all.
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
  return elevationDecision === 'all'
    ? {
        provenance: 'terrain-model',
        attributions: mergeAttributions(
          elevationAttributions,
          readElevationAttributions(drawn),
        ),
      }
    : { provenance: 'recorded' };
}
