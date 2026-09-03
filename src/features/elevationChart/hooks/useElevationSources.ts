import type { Toast } from '@features/toasts/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { SONNY_ATTR } from '@shared/elevationSources.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { ElevationProvenance } from '../model/actions.js';
import { loadElevationChartMessages } from '../translations/loadElevationChartMessages.js';

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

/**
 * Above this many credits none are written out — only their count, which opens
 * the list. A read the API answers from a Sonny-derived dataset carries every
 * national agency behind it (18 for a point in Germany, whichever one it falls
 * in), and no footer or tooltip has room for that. Naming a few of them would be
 * the wrong shortening: each is listed because a licence asks for it, and the
 * API states no order of importance, so any subset both under-credits the rest
 * and implies a ranking the wire format doesn't carry.
 */
const MAX_INLINE_SOURCES = 2;

/** Whether the credits have to move into the toast rather than be written out. */
export function tooManyElevationSources(sources: AttributionDef[]): boolean {
  return sources.length > MAX_INLINE_SOURCES;
}

/**
 * Opens the whole credit list in a toast, for when it doesn't fit inline. The
 * list is a snapshot, so `cancel` has to say what invalidates it — otherwise it
 * outlives the reading it credits and stands beside a different one.
 */
export function useShowElevationSources(
  sources: AttributionDef[],
  cancel: Pick<Toast, 'cancelType' | 'stateChangePredicate'>,
): () => void {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(
      toastsAdd({
        id: 'elevationChart.sources',
        messageKey: 'elevationSourceList',
        messageLoader: loadElevationChartMessages,
        messageParams: { sources },
        style: 'info',
        ...cancel,
      }),
    );
  }, [dispatch, sources, cancel]);
}
