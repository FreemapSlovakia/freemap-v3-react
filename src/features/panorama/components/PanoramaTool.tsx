import { requestCompassPermission } from '@features/location/compass.js';
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
        // iOS hands out the magnetometer only from a gesture, and on a phone
        // the view is set to follow it before anyone has pressed anything — so
        // this click, the one every panorama begins with, is where to ask.
        // Nothing is done with the answer: a refusal leaves the view turning by
        // itself, which is what it does on a device with no compass either.
        // Deliberately not `ensureCompassPermission`, which would take a
        // refusal here out on the located heading beam's own preference.
        void requestCompassPermission();

        dispatch(panoramaPick({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  return null;
}
