import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { RootState } from 'fm3/storeCreator';
import { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

export function MapDetailsTool(): null {
  const dispatch = useDispatch();

  const subtool = useSelector((state: RootState) => state.mapDetails.subtool);

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        if (subtool !== null) {
          dispatch(
            mapDetailsSetUserSelectedPosition({
              lat: latlng.lat,
              lon: latlng.lng,
            }),
          );
        }
      },
      [dispatch, subtool],
    ),
  );

  return null;
}
