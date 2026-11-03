import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { eventsStartPicked } from '../model/actions.js';

/** Takes the click that says where the event starts; picking then ends. */
export default function EventStartPicking(): null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(eventsStartPicked({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  return null;
}
