import { galleryRequestImages } from 'fm3/actions/galleryActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { isEventOnMap } from 'fm3/mapUtils';
import { LatLon } from 'fm3/types/common';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback, useState } from 'react';
import { Circle, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function GalleryPicker(): ReactElement | null {
  const zoom = useAppSelector((state) => state.map.zoom);

  const dispatch = useDispatch();

  const [latLon, setLatLon] = useState<LatLon>();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(galleryRequestImages({ lat: latlng.lat, lon: latlng.lng }));
      },
      [dispatch],
    ),
  );

  useMapEvent(
    'mousemove',
    useCallback(({ latlng, originalEvent }: LeafletMouseEvent) => {
      if (isEventOnMap(originalEvent)) {
        setLatLon({ lat: latlng.lat, lon: latlng.lng });
      } else {
        setLatLon(undefined);
      }
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
      radius={(5000 / 2 ** zoom) * 1000}
      stroke={false}
    />
  );
}
