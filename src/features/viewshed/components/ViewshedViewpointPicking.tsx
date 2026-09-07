import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { viewshedPick } from '../model/actions.js';

/**
 * Takes the click that says where to stand, and with it starts the render.
 * `viewshedPick` ends the picking mode itself, so nothing here has to.
 */
export default function ViewshedViewpointPicking(): null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(viewshedPick({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  return null;
}
