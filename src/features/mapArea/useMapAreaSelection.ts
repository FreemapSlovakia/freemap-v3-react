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
 */
export function useMapAreaSelection() {
  const dispatch = useDispatch();

  const areaBbox = useAppSelector((state) => state.mapArea.bbox);

  const selecting = useAppSelector((state) => state.mapArea.selecting !== null);

  const bounds = useAppSelector((state) => state.map.bounds);

  const [area, setArea] = useState<MapAreaMode>(areaBbox ? 'area' : 'visible');

  // revert to the visible area if the user cancelled the very first selection
  useEffect(() => {
    if (area === 'area' && !areaBbox && !selecting) {
      setArea('visible');
    }
  }, [area, areaBbox, selecting]);

  const startSelecting = useCallback(() => {
    if (!bounds) {
      return;
    }

    setArea('area');

    // the remembered rectangle can sit outside the map the user has panned to
    // meanwhile, leaving drawing mode with no handle to grab — bring it in view
    // instead of dropping the selection
    if (areaBbox && !hasVisibleHandle(areaBbox, bounds)) {
      fitMapToBbox(areaBbox, { padding: [40, 40] });
    }

    dispatch(mapAreaSelectStart(areaBbox ?? insetBbox(bounds)));
  }, [dispatch, bounds, areaBbox]);

  // the bbox to actually export/cache: the drawn rectangle in area mode,
  // otherwise the visible map bounds
  const bbox: Bbox | undefined =
    area === 'area' && areaBbox ? areaBbox : bounds;

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
