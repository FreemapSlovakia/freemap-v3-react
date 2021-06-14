import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { LatLon } from 'fm3/types/common';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function MapDetailsTool(): ReactElement | null {
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

  const [latLon, setLatLon] = useState<LatLon>();

  const handleMouseMove = useCallback(
    ({ latlng, originalEvent }: LeafletMouseEvent) => {
      if (
        originalEvent.target &&
        (originalEvent.target as HTMLElement).classList.contains(
          'leaflet-container',
        )
      ) {
        setLatLon({ lat: latlng.lat, lon: latlng.lng });
      } else {
        setLatLon(undefined);
      }
    },
    [],
  );

  useMapEvent('mousemove', handleMouseMove);

  return !latLon ? null : (
    <Circle
      interactive={false}
      center={[latLon.lat, latLon.lon]}
      radius={33}
      stroke={false}
    />
  );
}
