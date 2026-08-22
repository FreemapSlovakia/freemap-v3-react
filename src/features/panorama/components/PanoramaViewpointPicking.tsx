import { requestCompassPermission } from '@features/location/compass.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { panoramaPick } from '../model/actions.js';

/**
 * Takes the click that says where to stand, and with it starts the render: a
 * panorama costs the server seconds of work, so it wants an explicit action,
 * and asking for the click and then giving one is exactly that.
 *
 * `panoramaPick` ends the picking mode itself, so nothing here has to.
 */
export default function PanoramaViewpointPicking(): null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        // iOS hands out the magnetometer only from a gesture, and on a phone
        // the view follows it before anyone has pressed anything. Nothing is
        // done with the answer; a refusal leaves the view turning by itself.
        // Not `ensureCompassPermission`, which would take a refusal here out on
        // the located heading beam's own preference.
        void requestCompassPermission();

        dispatch(panoramaPick({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  return null;
}
