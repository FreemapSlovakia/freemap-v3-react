import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  drawingMeasure,
  drawingPointAdd,
} from '../model/actions/drawingPointActions.js';

export function DrawingPointsTool(): null {
  const color = useAppSelector((state) => state.drawingSettings.style.color);

  const markerType = useAppSelector(
    (state) => state.drawingSettings.style.markerType,
  );

  const length = useAppSelector((state) => state.drawingPoints.points.length);

  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(
          drawingPointAdd({
            coords: {
              lat: latlng.lat,
              lon: latlng.lng,
            },
            color,
            markerType,
            id: length,
          }),
        );

        dispatch(drawingMeasure({}));
      },
      [dispatch, color, markerType, length],
    ),
  );

  return null;
}
