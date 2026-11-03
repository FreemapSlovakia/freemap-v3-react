import { dtmAreaCountry, useDtmCountries } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { TraceKind } from '../traceServices.js';

/**
 * Which traces the selection menu offers for a polygon, gated by the countries
 * in view rather than by the polygon, which is usually within it.
 */
export function useTraceKinds(polygon: boolean): Record<TraceKind, boolean> {
  const dtmCountries = useDtmCountries();

  const streams = useAppSelector(
    (state) =>
      polygon &&
      (state.map.countries?.some((country) =>
        dtmCountries?.some((token) => dtmAreaCountry(token) === country),
      ) ??
        false),
  );

  // Its LiDAR point classes are Slovak only.
  const forests = useAppSelector(
    (state) => polygon && (state.map.countries?.includes('sk') ?? false),
  );

  return { streams, forests };
}
