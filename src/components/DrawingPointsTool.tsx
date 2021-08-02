import {
  drawingMeasure,
  drawingPointAdd,
} from 'fm3/actions/drawingPointActions';
import { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function DrawingPointsTool(): null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(
          drawingPointAdd({ lat: latlng.lat, lon: latlng.lng, label: '' }),
        );

        dispatch(drawingMeasure({}));
        return;
      },
      [dispatch],
    ),
  );
  return null;
}
