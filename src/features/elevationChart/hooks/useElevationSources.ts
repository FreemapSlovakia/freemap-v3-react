import { SONNY_ATTR } from '@shared/elevationSources.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import { useMemo } from 'react';
import type { ElevationProvenance } from '../model/actions.js';

/**
 * The terrain models to credit for the elevation shown: the credits the
 * elevation API resolved for the very points that were sampled.
 *
 * Empty when there's nothing to credit — a recorded measurement, or a read that
 * named nothing (an API without `?sources=1`) — since a guess from where the map
 * happens to be looking would credit models that never answered.
 */
export function useElevationSources(
  provenance: ElevationProvenance,
  reported: AttributionDef[] = [],
): AttributionDef[] {
  return useMemo(() => {
    if (provenance === 'recorded') {
      return [];
    }

    // GraphHopper's own elevation never went through our API, so nothing
    // reported it — it is credited here instead.
    return provenance === 'sonny' ? [...reported, SONNY_ATTR] : reported;
  }, [provenance, reported]);
}

/** The sources' names in one comma-separated string, for a tooltip. */
export function elevationSourceNames(sources: AttributionDef[]): string {
  return sources
    .map((attr) => attr.name)
    .filter(Boolean)
    .join(', ');
}
