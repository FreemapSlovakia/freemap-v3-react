import { LeafletMouseEvent } from 'leaflet';
import { type ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { mapDetailsSetUserSelectedPosition } from '../actions/mapDetailsActions.js';
import { isEventOnMap } from '../mapUtils.js';
import type { LatLon } from '../types/common.js';

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

  return !latLon ? null : (
    <Circle
      interactive={false}
      center={[latLon.lat, latLon.lon]}
      radius={33}
      stroke={false}
    />
  );
}
