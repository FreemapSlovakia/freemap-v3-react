import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { panoramaPick } from '../model/actions.js';

/**
 * Takes the click that says where to stand. It also starts the render: a
 * panorama costs the server seconds of work, so it wants an explicit action,
 * and picking the place is exactly that.
 */
export function PanoramaTool(): null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(panoramaPick({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  return null;
}
