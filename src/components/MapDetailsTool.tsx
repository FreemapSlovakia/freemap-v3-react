import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { isEventOnMap } from 'fm3/mapUtils';
import { LatLon } from 'fm3/types/common';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function MapDetailsTool(): ReactElement | null {
  const dispatch = useDispatch();

  const [latLon, setLatLon] = useState<LatLon>();

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

  useMapEvent(
    'mousemove',
    useCallback(({ latlng, originalEvent }: LeafletMouseEvent) => {
      setLatLon(
        isEventOnMap(originalEvent)
          ? { lat: latlng.lat, lon: latlng.lng }
          : undefined,
      );
    }, []),
  );

  useMapEvent(
    'mouseout',
    useCallback(() => {
      setLatLon(undefined);
    }, []),
  );

  if (!latLon) {
    return null;
  }

  return (
    <Circle
      interactive={false}
      center={[latLon.lat, latLon.lon]}
      radius={33}
      stroke={false}
    />
  );
}
