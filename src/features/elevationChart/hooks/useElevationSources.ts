import {
  elevationSourcesFromTokens,
  SRTM_TOKEN,
} from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
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
  const language = useAppSelector((state) => state.l10n.language);

  return useMemo(() => {
    if (provenance === 'recorded') {
      return [];
    }

    // The router's own elevation is the same SRTM data the API falls back to, so
    // it joins the reported tokens rather than being credited separately — and
    // collapses into one entry where the API reported it too.
    const tokens = provenance === 'srtm' ? [...reported, SRTM_TOKEN] : reported;

    const regionNames = new Intl.DisplayNames(language, { type: 'region' });

    return elevationSourcesFromTokens(tokens, (country) =>
      regionNames.of(country.toUpperCase()),
    );
  }, [provenance, reported, language]);
}

/** The sources' names in one comma-separated string, for a tooltip. */
export function elevationSourceNames(sources: AttributionDef[]): string {
  return sources
    .map((attr) => attr.name)
    .filter(Boolean)
    .join(', ');
}
