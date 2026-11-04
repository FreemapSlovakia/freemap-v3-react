import type { UnknownAction } from '@reduxjs/toolkit';
import { RichMarker } from '@shared/components/RichMarker.js';
import type { LatLon } from '@shared/types/common.js';
import type { DragEndEvent, LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

type Props = {
  position: LatLon | null;
  /** Stages a place; dispatched on a map click and at the end of a drag. */
  pickAction: (position: LatLon) => UnknownAction;
  faIcon: ReactElement;
  color?: string;
};

/**
 * A picking mode's pending answer: a map click puts the marker there, dragging
 * moves it, and the mode's `PickingMenu` confirms it. Mount it only while the
 * mode picks — it takes the map's clicks.
 */
export function PickMarker({
  position,
  pickAction,
  faIcon,
  color,
}: Props): ReactElement | null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(pickAction({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch, pickAction],
    ),
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { lat, lng } = e.target.getLatLng();

      dispatch(pickAction({ lat, lon: lng }));
    },
    [dispatch, pickAction],
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
