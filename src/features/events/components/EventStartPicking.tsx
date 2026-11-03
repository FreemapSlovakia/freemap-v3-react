import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { DragEndEvent, LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { FaFlag } from 'react-icons/fa';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { eventsSetPickPosition } from '../model/actions.js';

/** Places the event's start point: a click puts it there, dragging moves it. */
export default function EventStartPicking(): ReactElement | null {
  const dispatch = useDispatch();

  const position = useAppSelector((state) => state.events.pickPosition);

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(eventsSetPickPosition({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { lat, lng } = e.target.getLatLng();

      dispatch(eventsSetPickPosition({ lat, lon: lng }));
    },
    [dispatch],
  );

  return (
    position && (
      <RichMarker
        draggable
        pane="fm-active-overlay"
        position={{ lat: position.lat, lng: position.lon }}
        color="#6f42c1"
        faIcon={<FaFlag />}
        eventHandlers={{ dragend: handleDragEnd }}
      />
    )
  );
}
