import type { ElevationCredit } from '@features/elevationChart/model/actions.js';
import { readElevationSources } from '@shared/elevation.js';
import type { Feature } from 'geojson';
import type { TrackViewerState } from './reducer.js';

/**
 * What the chart may credit a loaded track's elevation to. Only an override
 * replaces every value with our terrain model's; a track kept as recorded — or
 * one where the server merely filled the gaps — draws measurements no terrain
 * model answered for, so it names no source at all.
 *
 * The models come from the write that put them there (`elevationSources`) plus
 * whatever densifying the drawn line sampled on top: a dense recording needs no
 * densifying, so the render copy alone would name nothing.
 */
export function elevationCredit(
  { elevationDecision, elevationSources }: TrackViewerState,
  drawn: Feature,
): ElevationCredit {
  return elevationDecision === 'all'
    ? {
        provenance: 'terrain-model',
        sources: [
          ...new Set([...elevationSources, ...readElevationSources(drawn)]),
        ],
      }
    : { provenance: 'recorded' };
}
