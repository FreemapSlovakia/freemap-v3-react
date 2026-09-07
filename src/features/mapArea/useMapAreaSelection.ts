import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hasVisibleHandle } from './hasVisibleHandle.js';
import { insetBbox } from './insetBbox.js';
import { type Bbox, mapAreaSelectStart } from './model/actions.js';

export type MapAreaMode = 'visible' | 'area';

/**
 * Shared state for modals that let the user export/cache either the visible map
 * or a rectangle drawn on the map (see {@link mapAreaSelectStart}). Returns the
 * current mode, the drawn rectangle, whether drawing is in progress (used to
 * hide the host modal), a handler to (re)start drawing, and the effective bbox
 * to export/cache.
 *
 * `initialBbox` — an area the form already has (a cached map being edited) —
 * owns the selection until the user confirms a rectangle of their own, so
 * neither a leftover from an earlier export gets picked up instead, nor does
 * merely opening this form overwrite the one those other forms remember.
 */
export function useMapAreaSelection(initialBbox?: Bbox) {
  const dispatch = useDispatch();

  const areaBbox = useAppSelector((state) => state.mapArea.bbox);

  const selecting = useAppSelector((state) => state.mapArea.selecting !== null);

  const bounds = useAppSelector((state) => state.map.bounds);

  // the shared rectangle as it stood on mount; confirming a drawing replaces it
  // with a fresh array, which is what tells us the initial one has been left
  // behind — cancelling one leaves it untouched
  const [bboxOnMount] = useState(areaBbox);

  const pendingInitial = areaBbox === bboxOnMount ? initialBbox : undefined;

  const [area, setArea] = useState<MapAreaMode>(
    initialBbox || areaBbox ? 'area' : 'visible',
  );

  // revert to the visible area if the user cancelled the very first selection
  useEffect(() => {
    if (area === 'area' && !areaBbox && !pendingInitial && !selecting) {
      setArea('visible');
    }
  }, [area, areaBbox, pendingInitial, selecting]);

  const startSelecting = useCallback(() => {
    if (!bounds) {
      return;
    }

    setArea('area');

    const seed = pendingInitial ?? areaBbox;

    // the remembered rectangle can sit outside the map the user has panned to
    // meanwhile, leaving drawing mode with no handle to grab — bring it in view
    // instead of dropping the selection
    if (seed && !hasVisibleHandle(seed, bounds)) {
      fitMapToBbox(dispatch, seed, { padding: 40 });
    }

    dispatch(mapAreaSelectStart(seed ?? insetBbox(bounds)));
  }, [dispatch, bounds, areaBbox, pendingInitial]);

  // the bbox to actually export/cache: the drawn rectangle in area mode,
  // otherwise the visible map bounds
  const bbox: Bbox | undefined =
    area === 'area' ? (pendingInitial ?? areaBbox ?? bounds) : bounds;

  return {
    area,
    setArea,
    areaBbox,
    selecting,
    bounds,
    bbox,
    startSelecting,
  };
}
