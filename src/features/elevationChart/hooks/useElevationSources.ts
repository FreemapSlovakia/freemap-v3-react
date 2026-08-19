import {
  elevationSourcesFromTokens,
  SONNY_TOKEN,
} from '@shared/elevationSources.js';
import { useRegionNames } from '@shared/hooks/useRegionNames.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import { useMemo } from 'react';
import type { ElevationProvenance } from '../model/actions.js';

/**
 * The terrain models to credit for the elevation shown: what the elevation API
 * named for the very points that were sampled, resolved to attribution entries.
 *
 * Empty when there's nothing to credit — a recorded measurement, or a read that
 * named nothing (an API without `?sources=1`) — since a guess from where the map
 * happens to be looking would credit models that never answered.
 */
export function useElevationSources(
  provenance: ElevationProvenance,
  reported: string[] = [],
): AttributionDef[] {
  const regionNames = useRegionNames();

  return useMemo(() => {
    if (provenance === 'recorded') {
      return [];
    }

    // The router's own elevation joins the reported tokens rather than being
    // credited separately, so both resolve through one table.
    const tokens =
      provenance === 'sonny' ? [...reported, SONNY_TOKEN] : reported;

    return elevationSourcesFromTokens(tokens, (country) =>
      regionNames.of(country.toUpperCase()),
    );
  }, [provenance, reported, regionNames]);
}

/** The sources' names in one comma-separated string, for a tooltip. */
export function elevationSourceNames(sources: AttributionDef[]): string {
  return sources
    .map((attr) => attr.name)
    .filter(Boolean)
    .join(', ');
}
