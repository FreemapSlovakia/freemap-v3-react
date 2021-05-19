import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function MapDetailsTool(): null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(
          mapDetailsSetUserSelectedPosition({
            lat: latlng.lat,
            lon: latlng.lng,
          }),
        );
      },
      [dispatch],
    ),
  );

  return null;
}
