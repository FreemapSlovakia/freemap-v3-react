import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { DragEndEvent, LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { FaFlag, FaMapMarkerAlt } from 'react-icons/fa';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { eventsSetPickPosition } from '../model/actions.js';

const COLOR = '#6f42c1';

/**
 * Places the event's start point, or the place to filter by with its radius
 * drawn: a click puts it there, dragging moves it.
 */
export default function EventStartPicking(): ReactElement | null {
  const dispatch = useDispatch();

  const position = useAppSelector((state) => state.events.pickPosition);

  const radius = useAppSelector((state) => state.events.pickRadius);

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
      <>
        {radius !== null && (
          <Circle
            center={{ lat: position.lat, lng: position.lon }}
            radius={radius * 1000}
            interactive={false}
            pathOptions={{ color: COLOR, weight: 2, fillOpacity: 0.1 }}
          />
        )}

        <RichMarker
          draggable
          pane="fm-active-overlay"
          position={{ lat: position.lat, lng: position.lon }}
          color={COLOR}
          faIcon={radius === null ? <FaFlag /> : <FaMapMarkerAlt />}
          eventHandlers={{ dragend: handleDragEnd }}
        />
      </>
    )
  );
}
