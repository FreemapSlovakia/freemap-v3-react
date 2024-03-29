import {
  drawingMeasure,
  drawingPointAdd,
} from 'fm3/actions/drawingPointActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function DrawingPointsTool(): null {
  const color = useAppSelector((state) => state.main.drawingColor);

  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(
          drawingPointAdd({
            lat: latlng.lat,
            lon: latlng.lng,
            color,
          }),
        );

        dispatch(drawingMeasure({}));
      },
      [dispatch, color],
    ),
  );

  return null;
}
