import { PickMarker } from '@shared/components/PickMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaFlag, FaMapMarkerAlt } from 'react-icons/fa';
import { Circle } from 'react-leaflet';
import { eventsSetPickPosition } from '../model/actions.js';

const COLOR = '#6f42c1';

/**
 * Places the event's start point, or the place to filter by with its radius
 * drawn: a click puts it there, dragging moves it.
 */
export default function EventStartPicking(): ReactElement | null {
  const position = useAppSelector((state) => state.events.pickPosition);

  const radius = useAppSelector((state) => state.events.pickRadius);

  return (
    <>
      {position && radius !== null && (
        <Circle
          center={{ lat: position.lat, lng: position.lon }}
          radius={radius * 1000}
          interactive={false}
          pathOptions={{ color: COLOR, weight: 2, fillOpacity: 0.1 }}
        />
      )}

      <PickMarker
        position={position}
        pickAction={eventsSetPickPosition}
        color={COLOR}
        faIcon={radius === null ? <FaFlag /> : <FaMapMarkerAlt />}
      />
    </>
  );
}
