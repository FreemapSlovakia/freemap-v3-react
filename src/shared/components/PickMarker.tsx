import { RichMarker } from '@shared/components/RichMarker.js';
import type { LatLon } from '@shared/types/common.js';
import type { DragEndEvent, LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';

type Props = {
  position: LatLon | null;
  onPick: (position: LatLon) => void;
  faIcon: ReactElement;
  color?: string;
};

/**
 * A picking mode's pending answer: a map click puts the marker there, dragging
 * moves it, and the mode's `PickingMenu` confirms it.
 */
export function PickMarker({
  position,
  onPick,
  faIcon,
  color,
}: Props): ReactElement | null {
  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        onPick({ lat: latlng.lat, lon: latlng.lng });
      },
      [onPick],
    ),
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { lat, lng } = e.target.getLatLng();

      onPick({ lat, lon: lng });
    },
    [onPick],
  );

  return (
    position && (
      <RichMarker
        draggable
        pane="fm-active-overlay"
        position={{ lat: position.lat, lng: position.lon }}
        color={color}
        faIcon={faIcon}
        eventHandlers={{ dragend: handleDragEnd }}
      />
    )
  );
}
