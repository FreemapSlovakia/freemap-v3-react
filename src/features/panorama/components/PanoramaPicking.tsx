import { requestCompassPermission } from '@features/location/compass.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { panoramaLookAt, panoramaPick } from '../model/actions.js';

/**
 * Takes the click the map is waiting for: where to stand, which also starts the
 * render — a panorama costs the server seconds of work, so it wants an explicit
 * action, and asking for the click and then giving one is exactly that — or
 * what to look at, which only turns the picture already in hand.
 *
 * Both actions end the picking mode themselves, so nothing here has to.
 */
export default function PanoramaPicking(): null {
  const dispatch = useDispatch();

  const picking = useAppSelector((state) => state.panorama.picking);

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        const at = { lat: latlng.lat, lon: latlng.lng };

        if (picking === 'target') {
          dispatch(panoramaLookAt(at));

          return;
        }

        // iOS hands out the magnetometer only from a gesture, and on a phone
        // the view follows it before anyone has pressed anything. Nothing is
        // done with the answer; a refusal leaves the view turning by itself.
        // Not `ensureCompassPermission`, which would take a refusal here out on
        // the located heading beam's own preference.
        void requestCompassPermission();

        dispatch(panoramaPick(at));
      },
      [dispatch, picking],
    ),
  );

  return null;
}
